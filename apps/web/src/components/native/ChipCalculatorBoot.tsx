'use client';

import { useEffect } from 'react';

function parseAmount(value: string) {
  const normalized = value.replace(/[^\d.,-]/g, '').replace(/\s/g, '').replace(',', '.');
  if (!normalized) return 0;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function fractionDigitsFor(currency: string) {
  if (currency === 'USD' || currency === 'RUB') return 2;
  return 0;
}

function formatMoney(value: number, intlLocale: string, currency: string) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    maximumFractionDigits: fractionDigitsFor(currency),
    minimumFractionDigits: 0,
  }).format(value);
}

function formatChips(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Wires bidirectional chip ↔ local currency inputs (1 chip = $1 USD) after React hydration. */
export function ChipCalculatorBoot() {
  useEffect(() => {
    const root = document.getElementById('native-chip-calculator');
    if (!root) return;

    const moneyInput = root.querySelector<HTMLInputElement>('[data-chip-calculator-money]');
    const chipsInput = root.querySelector<HTMLInputElement>('[data-chip-calculator-chips]');
    if (!moneyInput || !chipsInput) return;

    const rate = Number.parseFloat(root.dataset.chipCalculatorRate ?? '1');
    const intlLocale = root.dataset.chipCalculatorLocale ?? 'en-US';
    const currency = root.dataset.chipCalculatorCurrency ?? 'USD';
    const localPerUsd = Number.isFinite(rate) && rate > 0 ? rate : 1;

    let syncing = false;

    function setFromChips(chips: number) {
      syncing = true;
      chipsInput!.value = formatChips(chips);
      moneyInput!.value = formatMoney(chips * localPerUsd, intlLocale, currency);
      syncing = false;
    }

    function setFromMoney(money: number) {
      syncing = true;
      moneyInput!.value = formatMoney(money, intlLocale, currency);
      chipsInput!.value = formatChips(money / localPerUsd);
      syncing = false;
    }

    function onMoneyInput() {
      if (syncing) return;
      const money = parseAmount(moneyInput!.value);
      if (!money) return;
      setFromMoney(money);
    }

    function onChipsInput() {
      if (syncing) return;
      const chips = parseAmount(chipsInput!.value);
      if (!chips) return;
      setFromChips(chips);
    }

    function onMoneyBlur() {
      if (syncing) return;
      setFromMoney(parseAmount(moneyInput!.value));
    }

    function onChipsBlur() {
      if (syncing) return;
      setFromChips(parseAmount(chipsInput!.value));
    }

    function onPresetClick(event: Event) {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-chip-calculator-preset]');
      if (!button) return;
      const chips = Number.parseFloat(button.dataset.chipCalculatorPreset ?? '');
      if (!Number.isFinite(chips)) return;
      setFromChips(chips);
    }

    moneyInput.addEventListener('input', onMoneyInput);
    chipsInput.addEventListener('input', onChipsInput);
    moneyInput.addEventListener('blur', onMoneyBlur);
    chipsInput.addEventListener('blur', onChipsBlur);
    root.addEventListener('click', onPresetClick);

    return () => {
      moneyInput.removeEventListener('input', onMoneyInput);
      chipsInput.removeEventListener('input', onChipsInput);
      moneyInput.removeEventListener('blur', onMoneyBlur);
      chipsInput.removeEventListener('blur', onChipsBlur);
      root.removeEventListener('click', onPresetClick);
    };
  }, []);

  return null;
}
