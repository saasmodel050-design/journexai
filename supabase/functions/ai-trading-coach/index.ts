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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      }
    );

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(accessToken);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

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
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://journexai.lovable.app",
        "X-Title": "Journex AI",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + tradesContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      let message = errorText;
      try { message = JSON.parse(errorText)?.error?.message || errorText; } catch {}
      return new Response(JSON.stringify({ error: `OpenRouter ${response.status}: ${message}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-trading-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
