# CBA Watch

An opinionated, animated single-page site counting down to the expiration of MLB's
collective bargaining agreement on **December 1, 2026** — and making the case for a
salary cap, a salary floor, and a competitive integrity tax.

Live opinion, static site: plain HTML, CSS, and vanilla JavaScript. No build step,
no dependencies.

## Structure

- `index.html` — the whole page (hero countdown, payroll charts, deferral breakdown, the fix, timeline)
- `styles.css` — theming (light + dark via `prefers-color-scheme`), animations, chart styles
- `app.js` — live countdown, scroll-reveal animations, animated counters, chart rendering + tooltips
- `.github/workflows/deploy.yml` — deploys to GitHub Pages on every push to `main`

Chart colors use validated same-hue ordinal ramps (light: `#86b6ef` → `#256abf`;
dark: `#184f95` → `#3987e5`) with direct value labels and a table view for accessibility.
Animations respect `prefers-reduced-motion`.

## Deploying

1. Merge to `main` (the workflow triggers on pushes to `main`, or run it manually via
   the Actions tab with *workflow_dispatch*).
2. In the repository settings, set **Settings → Pages → Build and deployment →
   Source** to **GitHub Actions** (one-time setup).
3. To serve at `cbawatch.com`, add the custom domain under **Settings → Pages** and
   point the domain's DNS at GitHub Pages.

## Disclaimer

Fan-made opinion site. Not affiliated with MLB, the MLBPA, or any club. Payroll and
deferral figures are approximations from public reporting.
