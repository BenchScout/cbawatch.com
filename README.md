# CBA Watch

**Baseball has a $400,000,000 problem.** A live countdown to the expiration of MLB's
collective bargaining agreement on **December 1, 2026** — and the case for a salary cap,
a salary floor, and a competitive integrity tax.

Precision dark design: near-black surfaces, hairline rules, a single signal-red accent,
and self-hosted Geist Sans / Geist Mono (latin subset, ~52KB). Plain HTML, CSS, and
vanilla JavaScript — no build step, no dependencies.

## Structure

- `index.html` — the page: hero with live countdown, position, the gap (payroll chart),
  deferrals (deferred-salary chart), remedy, timeline
- `styles.css` — theming, layout, chart styles, entrance/reveal motion
- `app.js` — countdown (hero + nav), hero figure count-up, scroll reveals, animated
  counters, chart rendering + tooltips
- `fonts/` — self-hosted WOFF2 (Geist variable, Geist Mono variable)
- `.github/workflows/deploy.yml` — deploys to GitHub Pages on every push to `main`

Charts have direct value labels, keyboard-focusable rows with tooltips, and a data-table
fallback. All motion respects `prefers-reduced-motion`.

## Deploying

1. Merge to `main` (the workflow triggers on pushes to `main`, or run it manually via the
   Actions tab with *workflow_dispatch*).
2. One-time setup: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. To serve at `cbawatch.com`, add the custom domain under **Settings → Pages** and point
   the domain's DNS at GitHub Pages.

## Disclaimer

Fan-made opinion site. Not affiliated with MLB, the MLBPA, or any club. Payroll and
deferral figures are approximations from public reporting.
