#!/usr/bin/env node
/**
 * Fetches USD FX rates and updates chip-calculator.json for localized currencies.
 * 1 chip = 1 USD; locale fields show the equivalent in local currency.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(rootDir, 'apps/web/src/config/chip-calculator.json');
const RATES_URL = 'https://open.er-api.com/v6/latest/USD';

const localeCurrency = {
  ru: { currency: 'RUB', intlLocale: 'ru-RU', symbol: '₽' },
  en: { currency: 'USD', intlLocale: 'en-US', symbol: '$' },
  hy: { currency: 'AMD', intlLocale: 'hy-AM', symbol: '֏' },
  uz: { currency: 'UZS', intlLocale: 'uz-UZ', symbol: "so'm" },
  kz: { currency: 'KZT', intlLocale: 'kk-KZ', symbol: '₸' },
};

function roundRate(value, currency) {
  if (currency === 'USD') return 1;
  if (currency === 'RUB') return Math.round(value);
  if (currency === 'KZT' || currency === 'AMD') return Math.round(value);
  if (currency === 'UZS') return Math.round(value / 100) * 100;
  return Math.round(value * 100) / 100;
}

function formatRateAmount(value, currency) {
  const rounded = roundRate(value, currency);
  if (currency === 'UZS') {
    return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(rounded);
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(rounded);
}

function buildRateLabel(locale, currency, symbol, localPerUsd) {
  const amount = formatRateAmount(localPerUsd, currency);
  switch (locale) {
    case 'ru':
      return `1 фишка ≈ ${amount} ${symbol}`;
    case 'en':
      return '1 chip = $1';
    case 'hy':
      return `1 ֆիշկ ≈ ${amount} ${symbol}`;
    case 'uz':
      return `1 chip ≈ ${amount} ${symbol}`;
    case 'kz':
      return `1 фишка ≈ ${amount} ${symbol}`;
    default:
      return `1 chip ≈ ${amount} ${symbol}`;
  }
}

async function fetchRates() {
  const response = await fetch(RATES_URL);
  if (!response.ok) {
    throw new Error(`FX API failed: ${response.status} ${response.statusText}`);
  }
  const payload = await response.json();
  if (payload.result !== 'success' || !payload.rates) {
    throw new Error('FX API returned an unexpected payload');
  }
  return payload;
}

async function main() {
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  let fx;
  try {
    fx = await fetchRates();
  } catch (error) {
    console.warn(
      `chip-calculator rates: FX fetch failed (${error.message}) — keeping existing rates from ${config.ratesUpdatedAt ?? 'config'}`,
    );
    return;
  }
  const chipPresets = config.chipPresets ?? [10, 50, 100, 500, 1000];

  config.chipUsdValue = 1;
  config.ratesUpdatedAt = fx.time_last_update_utc ?? new Date().toISOString();
  config.rates = {
    USD: fx.rates.USD ?? 1,
    RUB: fx.rates.RUB,
    AMD: fx.rates.AMD,
    UZS: fx.rates.UZS,
    KZT: fx.rates.KZT,
  };

  for (const [locale, meta] of Object.entries(localeCurrency)) {
    const labels = config.labelsByLocale[locale];
    if (!labels) continue;

    const localPerUsd = fx.rates[meta.currency] ?? 1;
    labels.currency = meta.currency;
    labels.intlLocale = meta.intlLocale;
    labels.localPerUsd = localPerUsd;
    labels.rate = buildRateLabel(locale, meta.currency, meta.symbol, localPerUsd);
  }

  config.chipPresets = chipPresets;
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(
    `Updated chip-calculator rates (${config.ratesUpdatedAt}): RUB ${roundRate(config.rates.RUB, 'RUB')}, AMD ${roundRate(config.rates.AMD, 'AMD')}, UZS ${roundRate(config.rates.UZS, 'UZS')}, KZT ${roundRate(config.rates.KZT, 'KZT')}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
