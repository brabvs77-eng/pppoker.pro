'use client';

import { useEffect } from 'react';

function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!normalized) return 0;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

/** Wires bidirectional chip ↔ dollar inputs (1 chip = $1) after React hydration. */
export function ChipCalculatorBoot() {
  useEffect(() => {
    const root = document.getElementById('native-chip-calculator');
    if (!root) return;

    const usdInput = root.querySelector<HTMLInputElement>('[data-chip-calculator-usd]');
    const chipsInput = root.querySelector<HTMLInputElement>('[data-chip-calculator-chips]');
    if (!usdInput || !chipsInput) return;

    let syncing = false;

    function setBoth(amount: number) {
      syncing = true;
      const formatted = formatAmount(amount);
      usdInput!.value = formatted;
      chipsInput!.value = formatted;
      syncing = false;
    }

    function onUsdInput() {
      if (syncing) return;
      syncing = true;
      chipsInput!.value = usdInput!.value;
      syncing = false;
    }

    function onChipsInput() {
      if (syncing) return;
      syncing = true;
      usdInput!.value = chipsInput!.value;
      syncing = false;
    }

    function onUsdBlur() {
      if (syncing) return;
      setBoth(parseAmount(usdInput!.value));
    }

    function onChipsBlur() {
      if (syncing) return;
      setBoth(parseAmount(chipsInput!.value));
    }

    function onPresetClick(event: Event) {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-chip-calculator-preset]');
      if (!button) return;
      const amount = Number.parseFloat(button.dataset.chipCalculatorPreset ?? '');
      if (!Number.isFinite(amount)) return;
      setBoth(amount);
    }

    usdInput.addEventListener('input', onUsdInput);
    chipsInput.addEventListener('input', onChipsInput);
    usdInput.addEventListener('blur', onUsdBlur);
    chipsInput.addEventListener('blur', onChipsBlur);
    root.addEventListener('click', onPresetClick);

    setBoth(parseAmount(usdInput.value) || 100);

    return () => {
      usdInput.removeEventListener('input', onUsdInput);
      chipsInput.removeEventListener('input', onChipsInput);
      usdInput.removeEventListener('blur', onUsdBlur);
      chipsInput.removeEventListener('blur', onChipsBlur);
      root.removeEventListener('click', onPresetClick);
    };
  }, []);

  return null;
}
