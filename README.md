# Grounded

A static, configurable **scenario** for the November 2026 airline communications disruption. The counter and per-airline figures are *hypothetical*, not reported losses. [AIRLIVE's incident report](https://airlive.net/news/2026/11/13/global-microsoft-outage-disrupts-airline-communications-and-grounds-select-flights/) describes limited flight disruption at SpiceJet and communications issues at other airlines; it does **not** establish an industry-wide grounding or dollar losses.

## Run locally

```sh
nix develop
python3 -m http.server 8000
```

Open http://localhost:8000. `nix build` produces the deployable static files in `result/`.

## Calculation

Each carrier's amount = hypothetical USD/hour × max(0, min(current UTC time, optional end time) − scenario start UTC), measured in hours. The aggregate is the sum of the rows. The page recalculates each second and on refresh, with no random increment. Example start: **2026-11-12 16:00 UTC** (a modeling assumption, not a confirmed incident start). The default end is unset, so **set an end time when the incident resolves** to avoid implying continued losses. Adjust rates and timestamps in “Adjust scenario assumptions”; browser-local changes do not affect other visitors. To change the published defaults, edit `defaults` in `app.js` and redeploy.

## Publish on GitHub Pages

Create a **private** repository, push this directory to its `main` branch, then in repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The workflow at `.github/workflows/pages.yml` deploys on every push. The URL is `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. No API keys are needed or embedded in the page.

**Important:** GitHub Pages from a private personal repository requires GitHub Pro (or an eligible organization plan). On GitHub Free, Pages cannot publish from a private repository. Even when the repository is private, the Pages **website is normally public**; private site access requires an eligible GitHub Enterprise Cloud organization. See [GitHub's Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
