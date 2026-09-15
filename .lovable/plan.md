# Scroll-Synced Analytics Story

## Scope
- Link the hero trading chart to page scroll so its price line, candles, price marker, and insight overlays progressively advance as the hero leaves view.
- Replace the static dashboard preview section with a sticky scroll story that transitions through three focused states: performance overview, AI pattern detection, and strategy analytics.
- Keep the existing dashboard image and product language, adding clear active-step navigation and animated analytical overlays rather than changing any product functionality.
- Use a compact non-sticky sequence on smaller screens so scrolling remains comfortable.
- Respect reduced-motion preferences by showing stable completed states without scroll-linked movement.

## Technical details
- Use Framer Motion `useScroll`, `useTransform`, and motion values already available in the project.
- Keep chart rendering deterministic and avoid React state updates on every scroll frame.
- Use semantic design tokens and existing glass/chart styling.
- Verify the production build and inspect the homepage at desktop and mobile sizes, including intermediate scroll positions.
