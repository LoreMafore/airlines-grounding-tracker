// Example inputs only: none of these hourly amounts are published airline losses.
const defaults = {
  start: '2026-11-12T16:00:00Z',
  end: null,
  airlines: [
    { name: 'American Airlines', detail: 'U.S. passenger carrier · hypothetical', rate: 8000 },
    { name: 'Delta Air Lines', detail: 'U.S. passenger carrier · hypothetical', rate: 8000 },
    { name: 'United Airlines', detail: 'U.S. passenger carrier · hypothetical', rate: 8000 },
    { name: 'Southwest Airlines', detail: 'U.S. passenger carrier · hypothetical', rate: 6000 },
    { name: 'Alaska Airlines', detail: 'U.S. passenger carrier · hypothetical', rate: 4000 },
    { name: 'JetBlue Airways', detail: 'U.S. passenger carrier · hypothetical', rate: 3500 },
    { name: 'Hawaiian Airlines', detail: 'U.S. passenger brand · hypothetical', rate: 2500 },
    { name: 'Frontier Airlines', detail: 'U.S. budget carrier · hypothetical', rate: 2500 },
    { name: 'Allegiant Air', detail: 'U.S. budget carrier · hypothetical', rate: 2000 },
    { name: 'Sun Country Airlines', detail: 'U.S. budget carrier · hypothetical', rate: 1200 },
    { name: 'Breeze Airways', detail: 'U.S. budget carrier · hypothetical', rate: 1000 },
    { name: 'Avelo Airlines', detail: 'U.S. budget carrier · hypothetical', rate: 800 },
    { name: 'FedEx Express', detail: 'U.S. cargo carrier · hypothetical', rate: 4000 },
    { name: 'UPS Airlines', detail: 'U.S. cargo carrier · hypothetical', rate: 3500 },
    { name: 'Atlas Air', detail: 'U.S. cargo carrier · hypothetical', rate: 1500 },
    { name: 'Spirit Airlines', detail: 'Ceased operations May 2026 · not in scenario', rate: 0, inactive: true }
  ]
};

const storageKey = 'grounded-scenario-v2';
const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);

function loadScenario() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Number.isFinite(Date.parse(saved.start)) &&
        (saved.end === null || Number.isFinite(Date.parse(saved.end))) &&
        Array.isArray(saved.rates) && saved.rates.length === defaults.airlines.length &&
        saved.rates.every((rate, index) => Number.isFinite(rate) && rate >= 0 && rate <= 1000000000 && (!defaults.airlines[index].inactive || rate === 0))) {
      return { start: saved.start, end: saved.end, airlines: defaults.airlines.map((airline, index) => ({ ...airline, rate: saved.rates[index] })) };
    }
  } catch (_) { /* Ignore invalid or disabled local storage. */ }
  return structuredClone(defaults);
}

let scenario = loadScenario();
function exposure(rate, now) {
  const until = scenario.end ? Math.min(now, Date.parse(scenario.end)) : now;
  return rate * Math.max(0, until - Date.parse(scenario.start)) / 3600000;
}

function render() {
  const now = Date.now();
  const sum = scenario.airlines.reduce((total, airline) => total + exposure(airline.rate, now), 0);
  $('total').textContent = dollars.format(sum);
  $('rate-total').textContent = `${dollars.format(scenario.airlines.reduce((total, airline) => total + airline.rate, 0))} / hour modeled`;
  $('carrier-count').textContent = scenario.airlines.length;
  $('list-range').textContent = `01 — ${String(scenario.airlines.length).padStart(2, '0')}`;
  $('clock').textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(now) + ' UTC';
  scenario.airlines.forEach((airline, index) => {
    $(`value-${index}`).textContent = dollars.format(exposure(airline.rate, now));
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
  $('end-time').value = localInputValue(scenario.end);
  $('rate-settings').replaceChildren();
  scenario.airlines.forEach((airline, index) => {
    const label = document.createElement('label');
    label.textContent = `${airline.name} · hypothetical USD / hour`;
    const input = document.createElement('input');
    input.id = `rate-${index}`; input.type = 'number'; input.min = '0'; input.max = '1000000000'; input.step = '1'; input.required = true; input.value = airline.rate; input.disabled = Boolean(airline.inactive);
    label.append(input); $('rate-settings').append(label);
  });
}

$('save-settings').addEventListener('click', () => {
  const start = $('start-time').value;
  const end = $('end-time').value;
  const rates = scenario.airlines.map((_, index) => Number($(`rate-${index}`).value));
  if (!start || (end && end < start) || rates.some((rate, index) => !Number.isFinite(rate) || rate < 0 || rate > 1000000000 || $(`rate-${index}`).value === '')) {
    $('settings-message').textContent = 'Enter valid UTC dates and non-negative hourly rates.';
    return;
  }
  scenario = { start: `${start}:00Z`, end: end ? `${end}:00Z` : null, airlines: defaults.airlines.map((airline, index) => ({ ...airline, rate: rates[index] })) };
  try { localStorage.setItem(storageKey, JSON.stringify({ start: scenario.start, end: scenario.end, rates })); } catch (_) { /* Browser storage may be unavailable. */ }
  $('settings-message').textContent = 'Scenario updated in this browser.';
  render();
});
$('reset-settings').addEventListener('click', () => {
  scenario = structuredClone(defaults);
  try { localStorage.removeItem(storageKey); } catch (_) { /* Browser storage may be unavailable. */ }
  populateSettings(); render();
  $('settings-message').textContent = 'Example assumptions restored.';
});

buildRows(); populateSettings(); render(); setInterval(render, 1000);
