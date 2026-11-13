# Grounded

**Live website:** https://loremafore.github.io/airlines-grounding-tracker/

A static, configurable **revenue-exposure scenario** for the [nationwide FAA ground stop on Nov 13, 2026](https://www.cnbc.com/2026/11/13/faa-ground-stop.html). The figures are *not verified airline losses*. The roster lists selected U.S. carriers, not every certificated airline. [Spirit ceased operations on May 2, 2026](https://www.prnewswire.com/news-releases/spirit-airlines-begins-orderly-wind-down-of-operations-302760586.html) and is excluded. Hawaiian is listed separately, but excluded because its revenue is already partly included in Alaska Air Group's group figure.

## Run locally

```sh
nix develop
python3 -m http.server 8000
```

Open http://localhost:8000. `nix build` produces the deployable static files in `result/`.

## Calculation

For nine publicly reporting carrier groups, the starting hourly rate = linked **FY2024 operating revenue / 365 / 24** (the links appear next to each carrier). Breeze, Avelo, FedEx Express, UPS Airlines, and Atlas Air still use **clearly marked, unsourced illustrative inputs**, because comparable stand-alone airline revenue figures are not included in this version. Alaska Air Group's figure includes Hawaiian only from September 2024, not the whole year. The page sums the carriers' hourly rates and multiplies by hours since **2026-11-13 20:53 UTC** (the reported ground-stop advisory window start), stopping at an optional end time. It recalculates each second and on refresh; it never adds an arbitrary amount per visit.

**These numbers are revenue-rate proxies, not lost revenue or profit.** Airline group revenue includes non-U.S., non-flight and unaffected activity; delays can be recovered. This method assumes every hour is identical and does not apply any measured disruption share. Set an end time when the stop lifts; no automatic FAA-status feed is connected. Adjust rates/timestamps locally in “Adjust scenario assumptions”; local changes only affect your browser. To change published defaults, edit `app.js` and redeploy.

### Why another website reports a much higher total

[Grounded Losses](https://tobincavanaugh.github.io/airlinelosses/) uses a similar 2024-revenue approach for its airline subtotal but also adds **$500m/day** assumed tourism spending, **$300m/day** assumed passenger productivity, **$150m/day** assumed cargo/supply chain effects, and estimated regional revenue (which may overlap group totals). That's **$950m/day, or about $10,995/second**, in non-airline categories before regional revenue. It starts at **21:06 UTC**, 13 minutes later than our reported advisory-window start. Our previous version used arbitrary small hourly rates and began on Nov 12, so the two sites were calculating different things. Neither website can determine actual airline losses from these inputs.

## Publish on GitHub Pages

Create a repository, push this directory to its `main` branch, then in repository **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The workflow at `.github/workflows/pages.yml` deploys on every push. The URL is `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`. No API keys are needed or embedded in the page.

**Important:** GitHub Pages from a private personal repository requires GitHub Pro (or an eligible organization plan). On GitHub Free, Pages cannot publish from a private repository. Even when the repository is private, the Pages **website is normally public**; private site access requires an eligible GitHub Enterprise Cloud organization. See [GitHub's Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
