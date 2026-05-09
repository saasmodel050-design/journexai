// Referral cookie / localStorage helpers — 30 day attribution window
const KEY = "journex_ref";
const TTL_DAYS = 30;

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("ref");
  if (!code) return;
  setReferral(code);
}

export function setReferral(code: string) {
  const expires = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ code, expires });
  try {
    localStorage.setItem(KEY, payload);
  } catch {}
  // cookie too
  const d = new Date(expires);
  document.cookie = `${KEY}=${encodeURIComponent(code)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const { code, expires } = JSON.parse(raw);
      if (expires > Date.now()) return code;
      localStorage.removeItem(KEY);
    }
  } catch {}
  const m = document.cookie.match(new RegExp(`(?:^|; )${KEY}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function clearReferral() {
  try { localStorage.removeItem(KEY); } catch {}
  document.cookie = `${KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function affiliateUrl(code: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://journexai.com";
  return `${origin}/signup?ref=${code}`;
}
