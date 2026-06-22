import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Zap, BarChart3, Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrades } from "@/hooks/useTrades";
import { usePlan, FREE_AI_MESSAGE_LIMIT } from "@/hooks/usePlan";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "Analyze My Last Trades", icon: BarChart3 },
  { label: "Show My Biggest Mistake", icon: AlertTriangle },
  { label: "Improve My Win Rate", icon: Target },
  { label: "Risk Management Tips", icon: Zap },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-trading-coach`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) { onError("Please sign in again."); return; }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(body.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response stream"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial json, skip */ }
    }
  }
  onDone();
}

import ProFeatureGate from "@/components/dashboard/ProFeatureGate";

export default function AITrainerPage() {
  return (
    <ProFeatureGate
      featureName="AI Trainer"
      description="Personal AI trading coach trained on your data"
    >
      <AITrainerContent />
    </ProFeatureGate>
  );
}

function AITrainerContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { trades } = useTrades();
  const { isFree } = usePlan();
  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const remaining = Math.max(0, FREE_AI_MESSAGE_LIMIT - userMsgCount);
  const aiLocked = isFree && userMsgCount >= FREE_AI_MESSAGE_LIMIT;

  // Compute stats
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0";
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgRisk = trades.filter((t) => t.risk_percent).reduce((sum, t, _, arr) => sum + (t.risk_percent || 0) / arr.length, 0);

  // Find most common emotion (as "most common mistake" proxy)
  const emotionCounts: Record<string, number> = {};
  trades.forEach((t) => {
    if (t.emotion && t.emotion !== "confident" && t.emotion !== "calm") {
      emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1;
    }
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (aiLocked) {
      toast.error(`Free plan limit reached (${FREE_AI_MESSAGE_LIMIT} AI messages). Upgrade to Pro for unlimited coaching.`);
      return;
    }
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: newMessages,
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        upsert(`⚠️ ${err}`);
        setIsLoading(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_PROMPTS.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="glass-card border-border hover:border-primary/50 hover:neon-glow transition-all"
              onClick={() => sendMessage(p.label)}
              disabled={isLoading}
            >
              <p.icon className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {p.label}
            </Button>
          ))}
        </div>

        {/* Chat messages */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 neon-glow">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Trading Coach</h3>
                <p className="text-muted-foreground max-w-md text-sm">
                  Ask me anything about your trading performance. I'll analyze your trade history and provide personalized insights.
                </p>
              </motion.div>
            )}

            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-accent/20 border border-accent/30"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary/15 border border-primary/20 text-foreground"
                          : "bg-secondary/50 border border-border text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-primary">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                  <div className="bg-secondary/50 border border-border rounded-xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="w-2 h-2 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border space-y-2">
            {isFree && (
              <div className="flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-primary" />
                  Free plan: <span className="text-foreground font-medium">{remaining}</span> / {FREE_AI_MESSAGE_LIMIT} AI messages left
                </span>
                <Link to="/dashboard/upgrade" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Upgrade
                </Link>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={aiLocked ? "Upgrade to Pro to keep chatting..." : "Ask your AI trading coach..."}
                disabled={aiLocked}
                rows={1}
                className="flex-1 resize-none bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || aiLocked}
                size="icon"
                className="h-11 w-11 rounded-xl neon-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Insights Panel */}
      <div className="hidden lg:flex flex-col w-72 gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
          Trading Stats
        </h3>

        <StatCard label="Win Rate" value={`${winRate}%`} icon={Target} color="primary" />
        <StatCard label="Total Trades" value={String(totalTrades)} icon={BarChart3} color="accent" />
        <StatCard
          label="Profit / Loss"
          value={`$${totalPnl.toFixed(2)}`}
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          color={totalPnl >= 0 ? "neon-green" : "neon-red"}
        />
        <StatCard label="Avg Risk" value={avgRisk > 0 ? `${avgRisk.toFixed(1)}%` : "N/A"} icon={AlertTriangle} color="neon-blue" />

        <Card className="glass-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium">Common Issue</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm font-semibold capitalize text-accent">
              {topEmotion ? `${topEmotion[0]} trading (${topEmotion[1]}x)` : "No patterns yet"}
            </p>
          </CardContent>
        </Card>

        {/* Daily tip */}
        <Card className="glass-card border-primary/20 mt-auto">
          <CardContent className="p-4">
            <p className="text-xs text-primary font-medium mb-1">💡 Daily Tip</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Always define your risk before entering a trade. The best traders risk no more than 1-2% per trade.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className="glass-card border-border">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`w-9 h-9 rounded-lg bg-${color}/10 border border-${color}/20 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
