# Roadmap

- [ ] Make admin Free/Pro plan changes work through a super-admin-only database function.
- [x] Delete the public seed-admin function and remove its configuration.
- [x] Lock profile billing fields with column grants and a defense-in-depth trigger.
- [x] Remove browser-side plan mutation and add Whop subscription management.
- [x] Remove trial self-granting from new-user creation while preserving referrals.
- [x] Restrict site content writes to admins only.
- [x] Harden ai-trading-coach: per-user rate limits, input validation, generic upstream errors, max_tokens, timeout, admin-configurable model.
- [x] Remove dead trial code (TrialBanner, StartTrial, AdminTrials, expire-trials function + cron).
- [x] Retire the crypto payment flow and delete placeholder wallet addresses.
- [x] Protect the contact form (per-email rate limit) and notify admins of new support messages.
- [ ] Complete the approved scroll-synced hero and sticky dashboard animation work.
