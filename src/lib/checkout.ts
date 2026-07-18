// Central Pro checkout helper — handles auth-gated redirect to Whop.
import { supabase } from "@/integrations/supabase/client";

const WHOP_URLS = {
  monthly: "https://whop.com/journex/journex-pro-plan",
  // Fallback to monthly link until a dedicated yearly Whop URL is provided.
  yearly: "https://whop.com/journex/journex-pro-plan",
} as const;

export type Billing = "monthly" | "yearly";

const INTENT_KEY = "journex.purchase_intent";

export function savePurchaseIntent(billing: Billing = "monthly") {
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify({ plan: "pro", billing, ts: Date.now() }));
  } catch {}
}

export function consumePurchaseIntent(): { plan: "pro"; billing: Billing } | null {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(INTENT_KEY);
    const parsed = JSON.parse(raw);
    if (parsed?.plan === "pro") return parsed;
  } catch {}
  return null;
}

export function peekPurchaseIntent(): { plan: "pro"; billing: Billing } | null {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function whopCheckoutUrl(billing: Billing = "monthly") {
  return WHOP_URLS[billing] ?? WHOP_URLS.monthly;
}

/**
 * Start Pro checkout. If user is authenticated, redirect straight to Whop.
 * Otherwise, save purchase intent and send them to signup, which will
 * auto-resume the checkout after authentication.
 */
export async function startProCheckout(
  billing: Billing = "monthly",
  navigate?: (path: string) => void,
) {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    window.location.href = whopCheckoutUrl(billing);
    return;
  }
  savePurchaseIntent(billing);
  const target = `/signup?next=checkout&billing=${billing}`;
  if (navigate) navigate(target);
  else window.location.href = target;
}
