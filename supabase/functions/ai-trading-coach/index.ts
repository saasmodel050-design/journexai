import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert AI trading coach inside JournexAI, helping traders improve their performance.

When the user's recent trades are provided, analyze them deeply and provide honest, actionable feedback.

Focus on:
- **Risk management**: Position sizing, stop-loss discipline, risk-reward ratios
- **Overtrading**: Too many trades, revenge trading patterns
- **Win rate patterns**: Which pairs, sessions, or strategies perform best
- **Strategy performance**: Which strategies are working vs failing
- **Emotional trading**: Identifying FOMO, fear, revenge entries based on emotion tags
- **Session analysis**: Performance across Asia, London, New York sessions

Always give specific, actionable advice. Use the trader's actual data to back up your points.
Be professional, supportive, and intelligent. Format responses with markdown for readability.
Keep responses focused and under 500 words unless a detailed analysis is requested.`;

// Rate limits (server-side, per user)
const HOURLY_LIMIT = 10;
const DAILY_LIMIT = 50;
// Input caps
const MAX_MESSAGES = 30;
const MAX_TOTAL_CHARS = 24_000;
const MAX_MESSAGE_CHARS = 8_000;
// Upstream call budget
const UPSTREAM_TIMEOUT_MS = 90_000;
// "under 500 words" ≈ ~700 tokens; leave headroom for markdown
const MAX_TOKENS = 800;
const DEFAULT_MODEL = "google/gemini-2.5-flash";

const GENERIC_UPSTREAM_ERROR =
  "The AI coach is temporarily unavailable. Please try again shortly.";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) {
      return json(401, { error: "No authorization header" });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      }
    );

    // Service-role client for settings reads and usage accounting (bypasses RLS).
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: claimsData, error: claimsError } =
      await supabaseClient.auth.getClaims(accessToken);
    if (claimsError || !claimsData?.claims?.sub) {
      return json(401, { error: "Unauthorized" });
    }

    // Server-side Pro plan enforcement
    const userId = claimsData.claims.sub;
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("plan, plan_status, trial_end_date")
      .eq("user_id", userId)
      .maybeSingle();

    const isPro =
      profile?.plan === "pro" ||
      (profile?.plan === "pro_trial" &&
        profile?.trial_end_date &&
        new Date(profile.trial_end_date).getTime() > Date.now());

    if (!isPro) {
      return json(403, {
        error:
          "AI Trainer is available on the Pro plan. Please upgrade to continue.",
      });
    }

    // ---- Input validation (never trust the client) ----
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json(400, { error: "Request body must be valid JSON." });
    }

    const body = (raw ?? {}) as { messages?: unknown };
    if (!Array.isArray(body.messages)) {
      return json(400, { error: "messages must be an array." });
    }
    if (body.messages.length > MAX_MESSAGES) {
      return json(400, {
        error: `Conversation is too long (maximum ${MAX_MESSAGES} messages).`,
      });
    }

    const cleaned: { role: "user" | "assistant"; content: string }[] = [];
    let totalChars = 0;
    for (const m of body.messages) {
      if (!m || typeof m !== "object") {
        return json(400, { error: "Each message must be an object." });
      }
      const { role, content } = m as { role?: unknown; content?: unknown };
      // Silently strip client-supplied system messages so the system prompt cannot be overridden.
      if (role === "system") continue;
      if (role !== "user" && role !== "assistant") {
        return json(400, {
          error: "Each message role must be 'user' or 'assistant'.",
        });
      }
      if (typeof content !== "string" || content.trim().length === 0) {
        return json(400, { error: "Each message needs non-empty content." });
      }
      totalChars += content.length;
      if (totalChars > MAX_TOTAL_CHARS) {
        return json(400, {
          error: "Conversation is too long. Please start a new conversation.",
        });
      }
      cleaned.push({
        role,
        content: content.slice(0, MAX_MESSAGE_CHARS),
      });
    }
    if (cleaned.length === 0) {
      return json(400, { error: "No valid messages were provided." });
    }

    // ---- Rate limiting (per user, per hour and per day) ----
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const [{ count: hourCount }, { count: dayCount }] = await Promise.all([
      supabaseAdmin
        .from("ai_coach_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", hourAgo),
      supabaseAdmin
        .from("ai_coach_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", dayAgo),
    ]);

    const usedHour = hourCount ?? 0;
    const usedDay = dayCount ?? 0;
    const remainingHour = Math.max(0, HOURLY_LIMIT - usedHour);
    const remainingDay = Math.max(0, DAILY_LIMIT - usedDay);

    if (remainingHour === 0 || remainingDay === 0) {
      console.warn(
        `ai-trading-coach rate limited user ${userId}: hour=${usedHour}/${HOURLY_LIMIT} day=${usedDay}/${DAILY_LIMIT}`
      );
      const retryAfter = remainingHour === 0 ? 3600 : 86_400;
      return new Response(
        JSON.stringify({
          error:
            "You've reached your AI coach message limit for now. Your quota resets shortly — please try again soon.",
          quota: {
            remainingHour,
            remainingDay,
            hourlyLimit: HOURLY_LIMIT,
            dailyLimit: DAILY_LIMIT,
          },
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // Record usage before calling upstream so bursts are counted.
    await supabaseAdmin.from("ai_coach_messages").insert({ user_id: userId });

    // Fetch user's recent trades for context
    const { data: trades } = await supabaseClient
      .from("trades")
      .select("*")
      .order("trade_time", { ascending: false })
      .limit(50);

    let tradesContext = "";
    if (trades && trades.length > 0) {
      const summary = {
        totalTrades: trades.length,
        wins: trades.filter((t: any) => t.result === "win").length,
        losses: trades.filter((t: any) => t.result === "loss").length,
        breakeven: trades.filter((t: any) => t.result === "breakeven").length,
        totalPnl: trades.reduce((sum: number, t: any) => sum + (Number(t.pnl) || 0), 0),
        pairs: [...new Set(trades.map((t: any) => t.pair))],
        strategies: [...new Set(trades.filter((t: any) => t.strategy).map((t: any) => t.strategy))],
        emotions: trades.filter((t: any) => t.emotion).map((t: any) => t.emotion),
        sessions: trades.filter((t: any) => t.trading_session).map((t: any) => t.trading_session),
      };
      const winRate = summary.totalTrades > 0 ? ((summary.wins / summary.totalTrades) * 100).toFixed(1) : "0";

      tradesContext = `\n\n--- USER'S TRADING DATA (last ${trades.length} trades) ---
Summary: ${summary.totalTrades} trades | Win Rate: ${winRate}% | Total PnL: $${summary.totalPnl.toFixed(2)}
Wins: ${summary.wins} | Losses: ${summary.losses} | Breakeven: ${summary.breakeven}
Pairs traded: ${summary.pairs.join(", ")}
Strategies used: ${summary.strategies.join(", ") || "None tagged"}
Emotions logged: ${summary.emotions.join(", ") || "None tagged"}
Sessions: ${summary.sessions.join(", ") || "None tagged"}

Recent trades (newest first):
${trades.slice(0, 20).map((t: any) => `- ${t.pair} ${t.trade_type} | Entry: ${t.entry_price} | PnL: $${t.pnl || 0} | Result: ${t.result || "open"} | Strategy: ${t.strategy || "none"} | Emotion: ${t.emotion || "none"} | Session: ${t.trading_session || "none"} | ${t.trade_time}`).join("\n")}
--- END TRADING DATA ---`;
    } else {
      tradesContext = "\n\n[User has no trades logged yet. Encourage them to start logging trades to get personalized insights.]";
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      console.error("ai-trading-coach: OPENROUTER_API_KEY not configured");
      return json(503, { error: GENERIC_UPSTREAM_ERROR });
    }

    // Model is admin-configurable via ai_settings (falls back to the default).
    const { data: aiSettings } = await supabaseAdmin
      .from("ai_settings")
      .select("model")
      .limit(1)
      .maybeSingle();
    const model =
      typeof aiSettings?.model === "string" && aiSettings.model.length > 0
        ? aiSettings.model
        : DEFAULT_MODEL;

    // Abort the upstream call if it hangs, so the user is never left waiting forever.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://journexai.vercel.app",
          "X-Title": "Journex AI",
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          messages: [
            { role: "system", content: SYSTEM_PROMPT + tradesContext },
            ...cleaned,
          ],
          stream: true,
        }),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      console.error(
        "ai-trading-coach upstream fetch failed:",
        e instanceof Error ? e.message : e
      );
      return json(503, { error: GENERIC_UPSTREAM_ERROR });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      // Log the real error server-side; never leak vendor details to the client.
      console.error(
        `ai-trading-coach upstream error [${response.status}]: ${errorText.slice(0, 1000)}`
      );
      return json(503, { error: GENERIC_UPSTREAM_ERROR });
    }

    clearTimeout(timeoutId);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error(
      "ai-trading-coach error:",
      e instanceof Error ? e.message : e
    );
    return json(500, {
      error: "Something went wrong. Please try again shortly.",
    });
  }
});
