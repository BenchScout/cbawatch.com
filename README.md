# CBA*WATCH

**Salary cap, or shut it down.** An opinionated, art-directed single-page site counting
down to the expiration of MLB's collective bargaining agreement on **December 1, 2026** —
and making the case for a salary cap, a salary floor, and a competitive integrity tax.

Editorial "case file" design: newsprint paper, ink, and stitch-red; Fraunces display
serif with Space Grotesk body and Space Mono scorecard labels (self-hosted, latin subset).
Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies.

## Structure

- `index.html` — the whole page: hero doom-clock, ticker marquee, the position, Exhibits A/B
  (payroll + deferral ledgers), the remedy, road to the lockout, closer
- `styles.css` — typography, film grain, scroll choreography, ledger chart styles
- `app.js` — live countdown (hero + topbar), scroll progress, reveal animations,
  animated counters, chart rendering + tooltips
- `fonts/` — self-hosted WOFF2 (Fraunces variable, Space Grotesk variable, Space Mono)
- `.github/workflows/deploy.yml` — deploys to GitHub Pages on every push to `main`

Charts carry direct value labels, keyboard-focusable rows with tooltips, and a
"view data as table" fallback. All animation respects `prefers-reduced-motion`.

## Deploying

1. Merge to `main` (the workflow triggers on pushes to `main`, or run it manually via
   the Actions tab with *workflow_dispatch*).
2. One-time setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. To serve at `cbawatch.com`, add the custom domain under **Settings → Pages** and point
   the domain's DNS at GitHub Pages.

## Disclaimer

Fan-made opinion site. Not affiliated with MLB, the MLBPA, or any club. Payroll and
deferral figures are approximations from public reporting.
