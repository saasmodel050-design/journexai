import { FREE_DAILY_TRADE_LIMIT, FREE_MONTHLY_TRADE_LIMIT, FREE_AI_MESSAGE_LIMIT } from '@/hooks/usePlan';

/** Single source of truth for Pro pricing (USD). Live admin prices override these when loaded. */
export const PRO_MONTHLY_PRICE = 19;
export const PRO_YEARLY_PRICE = 150;

export function yearlyDiscountPercent(monthly = PRO_MONTHLY_PRICE, yearly = PRO_YEARLY_PRICE): number {
  if (!monthly || monthly <= 0) return 0;
  return Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100));
}
export const PRO_YEARLY_DISCOUNT_PERCENT = yearlyDiscountPercent();

export { FREE_DAILY_TRADE_LIMIT, FREE_MONTHLY_TRADE_LIMIT, FREE_AI_MESSAGE_LIMIT };

export const FREE_FEATURES = [
  `Up to ${FREE_DAILY_TRADE_LIMIT} trades per day, ${FREE_MONTHLY_TRADE_LIMIT} per month`,
  'Manual trade logging',
  'Basic statistics',
  'No AI coach or AI analysis',
];

export function isProPlan(p: any) {
  return p?.slug === 'pro' || p?.slug === 'plan-pro' || p?.name?.toLowerCase() === 'pro';
}

export const FREE_LIMIT_SUMMARY = `Free plan: up to ${FREE_DAILY_TRADE_LIMIT} trades per day and ${FREE_MONTHLY_TRADE_LIMIT} trades per month. Pro is unlimited.`;
