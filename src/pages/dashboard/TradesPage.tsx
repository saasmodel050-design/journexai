import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTrades } from '@/hooks/useTrades';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const TradesPage = () => {
  const { trades, isLoading, deleteTrade } = useTrades();
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [filterStrategy, setFilterStrategy] = useState('all');

  const strategies = [...new Set(trades.map(t => t.strategy).filter(Boolean))];

  const filtered = trades.filter(t => {
    if (search && !t.pair.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterResult !== 'all' && t.result !== filterResult) return false;
    if (filterStrategy !== 'all' && t.strategy !== filterStrategy) return false;
    return true;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trade History</h1>
          <p className="text-muted-foreground text-sm">{trades.length} total trades</p>
        </div>
        <Link to="/dashboard/add-trade">
          <Button>+ Add Trade</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search pair..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
        </div>
        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger className="w-[130px] bg-secondary/50 border-border">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="win">Win</SelectItem>
            <SelectItem value="loss">Loss</SelectItem>
            <SelectItem value="breakeven">Breakeven</SelectItem>
          </SelectContent>
        </Select>
        {strategies.length > 0 && (
          <Select value={filterStrategy} onValueChange={setFilterStrategy}>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              {strategies.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trades found</h3>
          <p className="text-muted-foreground text-sm">Start adding trades to build your history.</p>
        </motion.div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs">Pair</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Entry</TableHead>
                  <TableHead className="text-xs">Target</TableHead>
                  <TableHead className="text-xs">Stop Loss</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Session</TableHead>
                  <TableHead className="text-xs">Result</TableHead>
                  <TableHead className="text-xs">P&L</TableHead>
                  <TableHead className="text-xs">Emotion</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((trade) => (
                  <TableRow key={trade.id} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell className="font-mono font-medium text-sm">{trade.pair}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trade.trade_type === 'buy' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-red/10 text-neon-red'}`}>
                        {trade.trade_type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{trade.entry_price}</TableCell>
                    <TableCell className="font-mono text-sm">{trade.target_price ?? '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{trade.stop_loss ?? '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{trade.position_size ?? '-'}</TableCell>
                    <TableCell className="text-xs capitalize">{trade.trading_session?.replace('_', ' ') ?? '-'}</TableCell>
                    <TableCell>
                      {trade.result && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          trade.result === 'win' ? 'bg-neon-green/10 text-neon-green' :
                          trade.result === 'loss' ? 'bg-neon-red/10 text-neon-red' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {trade.result.toUpperCase()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={`font-mono text-sm font-medium ${trade.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs capitalize">{trade.emotion ?? '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(trade.trade_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-neon-red"
                        onClick={() => deleteTrade.mutate(trade.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradesPage;
