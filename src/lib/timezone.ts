// Timezone helpers. Day/month boundaries use the timezone saved on the user's profile,
// matching the enforce_trade_limits() database trigger.

export const browserTimezone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
};

export const listTimezones = (): string[] => {
  try {
    const v = (Intl as any).supportedValuesOf?.('timeZone') as string[] | undefined;
    if (v?.length) return v.includes('UTC') ? v : ['UTC', ...v];
  } catch { /* ignore */ }
  return ['UTC', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Karachi', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney'];
};

const safeTz = (tz: string) => {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch { return 'UTC'; }
};

/** Wall-clock parts of `date` in `tz`. */
export const partsInTz = (date: Date, tz: string) => {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz(tz), hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p: Record<string, number> = {};
  for (const x of f.formatToParts(date)) if (x.type !== 'literal') p[x.type] = Number(x.value);
  return { y: p.year, m: p.month, d: p.day, h: p.hour, min: p.minute, s: p.second };
};

/** Offset (ms) of tz from UTC at `date`. */
const offsetMs = (date: Date, tz: string) => {
  const p = partsInTz(date, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(date.getTime() / 1000) * 1000;
};

/** The UTC instant of a wall-clock time in tz. */
const zonedToUtc = (y: number, m: number, d: number, tz: string) => {
  const guess = Date.UTC(y, m - 1, d);
  const first = guess - offsetMs(new Date(guess), tz);
  return new Date(guess - offsetMs(new Date(first), tz));
};

export const startOfDayInTz = (tz: string, now = new Date()) => {
  const p = partsInTz(now, tz);
  return zonedToUtc(p.y, p.m, p.d, tz);
};

export const startOfMonthInTz = (tz: string, now = new Date()) => {
  const p = partsInTz(now, tz);
  return zonedToUtc(p.y, p.m, 1, tz);
};

/** YYYY-MM-DD key of a timestamp in tz, for consistent day grouping. */
export const dayKeyInTz = (iso: string | Date, tz: string) => {
  const p = partsInTz(new Date(iso), tz);
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
};
