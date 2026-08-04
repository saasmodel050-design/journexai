import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, Megaphone, AlertTriangle, Wrench, Sparkles } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Notification = {
  id: string;
  title: string;
  body: string | null;
  type: string | null;
  created_at: string;
};

const READ_KEY = 'journex_read_notifications';

const getRead = (): string[] => {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
};

const iconFor = (type: string | null) => {
  switch (type) {
    case 'warning': return AlertTriangle;
    case 'maintenance': return Wrench;
    case 'update': return Sparkles;
    default: return Megaphone;
  }
};

const NotificationsBell = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [read, setRead] = useState<string[]>(getRead);

  const load = async () => {
    const { data } = await (supabase as any)
      .from('platform_notifications')
      .select('id,title,body,type,created_at')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems((data ?? []) as Notification[]);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`platform-notifications-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_notifications' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const unread = items.filter((n) => !read.includes(n.id)).length;

  const markAllRead = () => {
    const ids = items.map((n) => n.id);
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
    setRead(ids);
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open && unread > 0) markAllRead(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          items.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <div key={n.id} className="flex gap-2 px-3 py-2.5 hover:bg-muted/50 rounded-sm">
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell;
