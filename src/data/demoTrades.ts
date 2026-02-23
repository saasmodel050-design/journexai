export interface DemoTrade {
  id: string;
  pair: string;
  trade_type: string;
  entry_price: number;
  target_price: number | null;
  stop_loss: number | null;
  position_size: number | null;
  risk_percent: number | null;
  trade_time: string;
  trading_session: string | null;
  strategy: string | null;
  emotion: string | null;
  result: string | null;
  pnl: number;
  notes: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const demoTrades: DemoTrade[] = [
  {
    id: 'demo-1', pair: 'BTC/USDT', trade_type: 'buy', entry_price: 67450, target_price: 69800, stop_loss: 66200,
    position_size: 0.5, risk_percent: 1.5, trade_time: '2026-02-20T09:15:00Z', trading_session: 'london',
    strategy: 'Breakout', emotion: 'confident', result: 'win', pnl: 1175, notes: 'Clean breakout above resistance with volume confirmation.',
    screenshot_url: null, created_at: '2026-02-20T09:15:00Z', updated_at: '2026-02-20T09:15:00Z', user_id: 'demo',
  },
  {
    id: 'demo-2', pair: 'ETH/USDT', trade_type: 'buy', entry_price: 3420, target_price: 3580, stop_loss: 3350,
    position_size: 2, risk_percent: 2, trade_time: '2026-02-19T14:30:00Z', trading_session: 'new_york',
    strategy: 'Pullback', emotion: 'calm', result: 'win', pnl: 320, notes: 'Entered on pullback to 50 EMA.',
    screenshot_url: null, created_at: '2026-02-19T14:30:00Z', updated_at: '2026-02-19T14:30:00Z', user_id: 'demo',
  },
  {
    id: 'demo-3', pair: 'EUR/USD', trade_type: 'sell', entry_price: 1.0865, target_price: 1.0790, stop_loss: 1.0910,
    position_size: 10000, risk_percent: 1, trade_time: '2026-02-18T08:00:00Z', trading_session: 'london',
    strategy: 'Trend Follow', emotion: 'confident', result: 'win', pnl: 750, notes: 'Continuation pattern on daily downtrend.',
    screenshot_url: null, created_at: '2026-02-18T08:00:00Z', updated_at: '2026-02-18T08:00:00Z', user_id: 'demo',
  },
  {
    id: 'demo-4', pair: 'Gold', trade_type: 'buy', entry_price: 2045, target_price: 2085, stop_loss: 2025,
    position_size: 1, risk_percent: 1, trade_time: '2026-02-17T03:45:00Z', trading_session: 'asia',
    strategy: 'Support Bounce', emotion: 'calm', result: 'win', pnl: 400, notes: 'Bounced off key weekly support level.',
    screenshot_url: null, created_at: '2026-02-17T03:45:00Z', updated_at: '2026-02-17T03:45:00Z', user_id: 'demo',
  },
  {
    id: 'demo-5', pair: 'BTC/USDT', trade_type: 'sell', entry_price: 68900, target_price: 67000, stop_loss: 69500,
    position_size: 0.3, risk_percent: 2, trade_time: '2026-02-16T16:20:00Z', trading_session: 'new_york',
    strategy: 'Scalp', emotion: 'fomo', result: 'loss', pnl: -180, notes: 'Entered too early without confirmation. FOMO on the move.',
    screenshot_url: null, created_at: '2026-02-16T16:20:00Z', updated_at: '2026-02-16T16:20:00Z', user_id: 'demo',
  },
  {
    id: 'demo-6', pair: 'ETH/USDT', trade_type: 'sell', entry_price: 3510, target_price: 3400, stop_loss: 3560,
    position_size: 1.5, risk_percent: 1.5, trade_time: '2026-02-15T10:10:00Z', trading_session: 'london',
    strategy: 'Breakout', emotion: 'revenge', result: 'loss', pnl: -75, notes: 'Revenge trade after previous loss. Should have waited.',
    screenshot_url: null, created_at: '2026-02-15T10:10:00Z', updated_at: '2026-02-15T10:10:00Z', user_id: 'demo',
  },
  {
    id: 'demo-7', pair: 'Gold', trade_type: 'buy', entry_price: 2060, target_price: 2090, stop_loss: 2045,
    position_size: 2, risk_percent: 1, trade_time: '2026-02-14T07:30:00Z', trading_session: 'london',
    strategy: 'Trend Follow', emotion: 'confident', result: 'win', pnl: 600, notes: 'Strong uptrend continuation on gold.',
    screenshot_url: null, created_at: '2026-02-14T07:30:00Z', updated_at: '2026-02-14T07:30:00Z', user_id: 'demo',
  },
  {
    id: 'demo-8', pair: 'EUR/USD', trade_type: 'buy', entry_price: 1.0810, target_price: 1.0870, stop_loss: 1.0785,
    position_size: 5000, risk_percent: 1, trade_time: '2026-02-13T15:00:00Z', trading_session: 'new_york',
    strategy: 'Pullback', emotion: 'fear', result: 'loss', pnl: -125, notes: 'Hesitated on entry, got bad fill.',
    screenshot_url: null, created_at: '2026-02-13T15:00:00Z', updated_at: '2026-02-13T15:00:00Z', user_id: 'demo',
  },
  {
    id: 'demo-9', pair: 'BTC/USDT', trade_type: 'buy', entry_price: 66800, target_price: 68500, stop_loss: 66000,
    position_size: 0.4, risk_percent: 1.5, trade_time: '2026-02-12T04:00:00Z', trading_session: 'asia',
    strategy: 'Support Bounce', emotion: 'calm', result: 'win', pnl: 680, notes: 'Perfect bounce off daily support.',
    screenshot_url: null, created_at: '2026-02-12T04:00:00Z', updated_at: '2026-02-12T04:00:00Z', user_id: 'demo',
  },
  {
    id: 'demo-10', pair: 'Gold', trade_type: 'sell', entry_price: 2075, target_price: 2050, stop_loss: 2090,
    position_size: 1, risk_percent: 1, trade_time: '2026-02-11T12:45:00Z', trading_session: 'london',
    strategy: 'Scalp', emotion: 'fomo', result: 'loss', pnl: -150, notes: 'FOMO short near resistance. Bad timing.',
    screenshot_url: null, created_at: '2026-02-11T12:45:00Z', updated_at: '2026-02-11T12:45:00Z', user_id: 'demo',
  },
  {
    id: 'demo-11', pair: 'ETH/USDT', trade_type: 'buy', entry_price: 3380, target_price: 3500, stop_loss: 3340,
    position_size: 3, risk_percent: 1, trade_time: '2026-02-10T09:00:00Z', trading_session: 'london',
    strategy: 'Breakout', emotion: 'confident', result: 'win', pnl: 360, notes: 'Volume-confirmed breakout above range.',
    screenshot_url: null, created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-10T09:00:00Z', user_id: 'demo',
  },
  {
    id: 'demo-12', pair: 'EUR/USD', trade_type: 'sell', entry_price: 1.0900, target_price: 1.0830, stop_loss: 1.0935,
    position_size: 8000, risk_percent: 1, trade_time: '2026-02-09T14:15:00Z', trading_session: 'new_york',
    strategy: 'Trend Follow', emotion: 'calm', result: 'breakeven', pnl: 0, notes: 'Moved to breakeven after news event.',
    screenshot_url: null, created_at: '2026-02-09T14:15:00Z', updated_at: '2026-02-09T14:15:00Z', user_id: 'demo',
  },
];
