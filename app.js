// Revenue exposure proxies, not measured losses. FY2024 figures are linked per carrier.
const defaults = {
  start: '2026-11-13T20:53:00Z',
  // FAA cancellation advisory 005, signed 01:19 UTC on November 14.
  end: '2026-11-14T01:19:00Z',
  airlines: [
    { name: 'American Airlines', detail: 'FY2024 group revenue proxy', annual: 54.2e9, source: 'https://news.aa.com/news/news-details/2025/American-Airlines-reports-fourth-quarter-and-full-year-2024-financial-results-CORP-FI-01/default.aspx' },
    { name: 'Delta Air Lines', detail: 'FY2024 group revenue proxy', annual: 61.643e9, source: 'https://ir.delta.com/news/news-details/2025/Delta-Air-Lines-Announces-December-Quarter-and-Full-Year-2024-Financial-Results' },
    { name: 'United Airlines', detail: 'FY2024 group revenue proxy', annual: 57.063e9, source: 'https://united.mediaroom.com/2025-01-21-United-Airlines-Achieves-Record-Fourth-Quarter-Profit-Well-Ahead-Of-Expectations-Reiterates-Path-To-Double-Digit-Pre-Tax-Margin' },
    { name: 'Southwest Airlines', detail: 'FY2024 group revenue proxy', annual: 27.5e9, source: 'https://www.sec.gov/Archives/edgar/data/92380/000009238025000007/er-12312024xerdoc.htm' },
    { name: 'Alaska Airlines', detail: 'FY2024 Alaska Air Group · includes Hawaiian since Sept', annual: 11.7e9, source: 'https://news.alaskaair.com/company/alaska-air-group-fourth-quarter-and-full-year-2024-results/' },
    { name: 'JetBlue Airways', detail: 'FY2024 group revenue proxy', annual: 9.28e9, source: 'https://s202.q4cdn.com/853609783/files/doc_financials/2025/ar/2024-Annual-Report.pdf' },
    { name: 'Hawaiian Airlines', detail: 'Included in Alaska Air Group · no double count', rate: 0, inactive: true },
    { name: 'Frontier Airlines', detail: 'FY2024 group revenue proxy', annual: 3.775e9, source: 'https://ir.flyfrontier.com/node/9291/pdf' },
    { name: 'Allegiant Air', detail: 'FY2024 group revenue proxy', annual: 2.513e9, source: 'https://ir.allegiantair.com/news/news-details/2025/ALLEGIANT-TRAVEL-COMPANY-FOURTH-QUARTER-AND-FULL-YEAR-2024-FINANCIAL-RESULTS/default.aspx' },
    { name: 'Sun Country Airlines', detail: 'FY2024 group revenue proxy', annual: 1.076e9, source: 'https://www.barchart.com/story/news/30752246/sun-country-airlines-reports-fourth-quarter-and-full-year-2024-results' },
    { name: 'Breeze Airways', detail: 'Illustrative input · no comparable cited revenue', rate: 1000 },
    { name: 'Avelo Airlines', detail: 'Illustrative input · no comparable cited revenue', rate: 800 },
    { name: 'FedEx Express', detail: 'FY2024 Express segment · includes international & ground legs', annual: 40.857e9, source: 'https://www.sec.gov/Archives/edgar/data/1048911/000095017024077290/fdx-ex99_1.htm' },
    { name: 'UPS Airlines', detail: 'FY2024 U.S. Next Day Air product only · partial proxy', annual: 9.703e9, source: 'https://investors.ups.com/sec-filings/annual-filings/xbrl_doc_only/4564' },
    { name: 'Atlas Air', detail: 'Illustrative input · no comparable cited revenue', rate: 1500 },
    { name: 'Spirit Airlines', detail: 'Ceased operations May 2026 · excluded', rate: 0, inactive: true }
  ]
};

defaults.airlines.forEach(airline => { if (airline.annual) airline.rate = airline.annual / 365 / 24; });
const storageKey = 'grounded-scenario-v5';
const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);

function loadScenario() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Number.isFinite(Date.parse(saved.start)) && Date.parse(saved.start) <= Date.parse(defaults.end) &&
        Array.isArray(saved.rates) && saved.rates.length === defaults.airlines.length &&
        saved.rates.every((rate, index) => Number.isFinite(rate) && rate >= 0 && rate <= 1000000000 && (!defaults.airlines[index].inactive || rate === 0))) {
      return { start: saved.start, end: defaults.end, airlines: defaults.airlines.map((airline, index) => ({ ...airline, rate: saved.rates[index] })) };
    }
  } catch (_) { /* Ignore invalid or disabled local storage. */ }
  return structuredClone(defaults);
}

let scenario = loadScenario();
function exposure(rate) {
  return rate * Math.max(0, Date.parse(scenario.end) - Date.parse(scenario.start)) / 3600000;
}

function render() {
  const start = Date.parse(scenario.start);
  const seconds = Math.floor(Math.max(0, Date.parse(scenario.end) - start) / 1000);
  const sum = scenario.airlines.reduce((total, airline) => total + exposure(airline.rate), 0);
  $('total').textContent = dollars.format(sum);
  const utcStart = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(start);
  const easternStart = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(start);
  $('start-display').textContent = `${utcStart} UTC / ${easternStart}`;
  $('elapsed-display').textContent = `${Math.floor(seconds / 3600)}h ${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`;
  $('rate-total').textContent = `${dollars.format(scenario.airlines.reduce((total, airline) => total + airline.rate, 0))} / hour modeled`;
  $('carrier-count').textContent = scenario.airlines.length;
  $('list-range').textContent = `01 — ${String(scenario.airlines.length).padStart(2, '0')}`;
  $('clock').textContent = 'STOP ENDED · FINAL ESTIMATE';
  scenario.airlines.forEach((airline, index) => {
    $(`value-${index}`).textContent = dollars.format(exposure(airline.rate));
    $(`hourly-${index}`).textContent = `${dollars.format(airline.rate)} / hour`;
    const maxRate = Math.max(...scenario.airlines.map(item => item.rate));
    $(`bar-${index}`).style.width = `${maxRate ? airline.rate / maxRate * 100 : 0}%`;
  });
}

function buildRows() {
  $('carrier-list').replaceChildren();
  scenario.airlines.forEach((airline, index) => {
    const row = document.createElement('article');
    row.className = 'carrier-row';
    const number = document.createElement('span'); number.className = 'carrier-number'; number.textContent = String(index + 1).padStart(2, '0');
    const info = document.createElement('div');
    const name = document.createElement('h3'); name.className = 'carrier-name'; name.textContent = airline.name;
    const detail = document.createElement('span'); detail.className = 'carrier-meta'; detail.textContent = airline.detail;
    info.append(name, detail);
    if (airline.source) {
      const source = document.createElement('a');
      source.className = 'carrier-source'; source.href = airline.source;
      source.target = '_blank'; source.rel = 'noopener noreferrer'; source.textContent = 'FY2024 source ↗';
      info.append(source);
    }
    const bar = document.createElement('div'); bar.className = 'carrier-bar'; bar.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span'); fill.id = `bar-${index}`; bar.append(fill);
    const amount = document.createElement('div'); amount.className = 'carrier-amount';
    const value = document.createElement('span'); value.id = `value-${index}`;
    const hourly = document.createElement('small'); hourly.id = `hourly-${index}`; amount.append(hourly);
    amount.prepend(value);
    row.append(number, info, bar, amount);
    $('carrier-list').append(row);
  });
}

function localInputValue(date) { return date ? new Date(date).toISOString().slice(0, 16) : ''; }
function populateSettings() {
  $('start-time').value = localInputValue(scenario.start);
  $('rate-settings').replaceChildren();
  scenario.airlines.forEach((airline, index) => {
    const label = document.createElement('label');
    label.textContent = `${airline.name} · ${airline.source ? 'FY2024 revenue / 8,760' : 'illustrative'} USD / hour`;
    const input = document.createElement('input');
    input.id = `rate-${index}`; input.type = 'number'; input.min = '0'; input.max = '1000000000'; input.step = '1'; input.required = true; input.value = airline.rate; input.disabled = Boolean(airline.inactive);
    label.append(input); $('rate-settings').append(label);
  });
}

$('save-settings').addEventListener('click', () => {
  const start = $('start-time').value;
  const rates = scenario.airlines.map((_, index) => Number($(`rate-${index}`).value));
  if (!start || start > localInputValue(defaults.end) || rates.some((rate, index) => !Number.isFinite(rate) || rate < 0 || rate > 1000000000 || $(`rate-${index}`).value === '')) {
    $('settings-message').textContent = 'Enter a start before the FAA cancellation and valid non-negative rates.';
    return;
  }
  scenario = { start: `${start}:00Z`, end: defaults.end, airlines: defaults.airlines.map((airline, index) => ({ ...airline, rate: rates[index] })) };
  try { localStorage.setItem(storageKey, JSON.stringify({ start: scenario.start, rates })); } catch (_) { /* Browser storage may be unavailable. */ }
  $('settings-message').textContent = 'Scenario updated in this browser.';
  render();
});
$('reset-settings').addEventListener('click', () => {
  scenario = structuredClone(defaults);
  try { localStorage.removeItem(storageKey); } catch (_) { /* Browser storage may be unavailable. */ }
  populateSettings(); render();
  $('settings-message').textContent = 'Example assumptions restored.';
});

buildRows(); populateSettings(); render();
