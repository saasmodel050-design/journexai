export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  experience_level: string;
  market_type: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  trade_type: 'buy' | 'sell';
  entry_price: number;
  target_price: number | null;
  stop_loss: number | null;
  position_size: number | null;
  risk_percent: number | null;
  trade_time: string;
  trading_session: 'asia' | 'london' | 'new_york' | null;
  strategy: string | null;
  emotion: 'confident' | 'fomo' | 'fear' | 'revenge' | 'calm' | null;
  result: 'win' | 'loss' | 'breakeven' | null;
  pnl: number;
  notes: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
}
