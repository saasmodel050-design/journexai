// Expires Pro trials and queues reminder emails.
// Run via pg_cron every hour. No JWT verification (cron-driven).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const result = { expired: 0, day1_reminders: 0, day2_reminders: 0, day3_reminders: 0 };

  // 1) Expire any trial whose end has passed
  const { data: expiredRows } = await supabase
    .from('profiles')
    .select('user_id, trial_end_date')
    .eq('plan', 'pro_trial')
    .lte('trial_end_date', now.toISOString());

  if (expiredRows && expiredRows.length > 0) {
    const ids = expiredRows.map((r: any) => r.user_id);
    await supabase
      .from('profiles')
      .update({ plan: 'free', plan_status: 'trial_expired' })
      .in('user_id', ids);

    await supabase
      .from('trial_history')
      .update({ outcome: 'expired' })
      .in('user_id', ids)
      .eq('outcome', 'active');

    result.expired = ids.length;

    // Try to send "trial ended" email per user (best-effort; no-op if email infra is not set up)
    for (const row of expiredRows as any[]) {
      try {
        await sendIfPossible(supabase, row.user_id, 'trial-ended', 'trial_expired_email_sent_at');
      } catch (_) { /* ignore */ }
    }
  }

  // 2) Send reminders for active trials based on remaining time
  const { data: activeTrials } = await supabase
    .from('profiles')
    .select('user_id, trial_start_date, trial_end_date, trial_reminder_day1_sent_at, trial_reminder_day2_sent_at, trial_reminder_day3_sent_at')
    .eq('plan', 'pro_trial');

  for (const row of (activeTrials ?? []) as any[]) {
    if (!row.trial_start_date || !row.trial_end_date) continue;
    const start = new Date(row.trial_start_date).getTime();
    const end = new Date(row.trial_end_date).getTime();
    const ageHours = (now.getTime() - start) / 36e5;
    const remainingHours = (end - now.getTime()) / 36e5;

    // Day 1 welcome — within first hour of trial
    if (!row.trial_reminder_day1_sent_at && ageHours < 2) {
      const ok = await sendIfPossible(supabase, row.user_id, 'trial-welcome', 'trial_reminder_day1_sent_at');
      if (ok) result.day1_reminders++;
    }
    // Day 2 — ~24h remaining
    if (!row.trial_reminder_day2_sent_at && remainingHours <= 30 && remainingHours > 12) {
      const ok = await sendIfPossible(supabase, row.user_id, 'trial-ending-tomorrow', 'trial_reminder_day2_sent_at');
      if (ok) result.day2_reminders++;
    }
    // Day 3 — ~6h remaining
    if (!row.trial_reminder_day3_sent_at && remainingHours <= 12 && remainingHours > 0) {
      const ok = await sendIfPossible(supabase, row.user_id, 'trial-final-reminder', 'trial_reminder_day3_sent_at');
      if (ok) result.day3_reminders++;
    }
  }

  return new Response(JSON.stringify({ ok: true, ...result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

/** Best-effort email send via send-transactional-email if available. Marks the column when invoked. */
async function sendIfPossible(
  supabase: any,
  userId: string,
  templateName: string,
  markColumn: string,
): Promise<boolean> {
  // Look up user email via auth admin
  const { data: u } = await supabase.auth.admin.getUserById(userId);
  const email = u?.user?.email;
  if (!email) return false;

  try {
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName,
        recipientEmail: email,
        idempotencyKey: `${templateName}-${userId}`,
        templateData: {},
      },
    });
  } catch (_) {
    // Edge function may not be deployed yet; still mark to avoid spamming attempts.
  }

  await supabase
    .from('profiles')
    .update({ [markColumn]: new Date().toISOString() })
    .eq('user_id', userId);

  return true;
}
