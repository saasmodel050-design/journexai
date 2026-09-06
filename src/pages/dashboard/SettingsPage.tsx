import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCursorPreference } from '@/hooks/useCursorPreference';


const SettingsPage = () => {
  const { user } = useAuth();
  const { enabled: cursorEnabled, setEnabled: setCursorEnabled } = useCursorPreference();
  const [fullName, setFullName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [marketType, setMarketType] = useState('crypto');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setFullName((data as any).full_name || '');
        setExperienceLevel((data as any).experience_level || 'beginner');
        setMarketType((data as any).market_type || 'crypto');
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      experience_level: experienceLevel,
      market_type: marketType,
    } as any).eq('user_id', user.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success('Profile updated');
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled className="bg-secondary/50 border-border opacity-60" />
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Market Type</Label>
            <Select value={marketType} onValueChange={setMarketType}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="futures">Futures</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Accessibility</h2>
          <p className="text-muted-foreground text-sm">Control motion and pointer effects</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="custom-cursor-toggle">Animated custom cursor</Label>
            <p className="text-xs text-muted-foreground">
              Turn off to use your system cursor. It is disabled automatically on touch devices and
              when your device requests reduced motion.
            </p>
          </div>
          <Switch
            id="custom-cursor-toggle"
            checked={cursorEnabled}
            onCheckedChange={setCursorEnabled}
            aria-label="Toggle animated custom cursor"
          />
        </div>
      </div>
    </div>
  );
};


export default SettingsPage;
