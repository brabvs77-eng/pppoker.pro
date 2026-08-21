'use client';

import { useEffect } from 'react';

function openModal(key: string) {
  const dialog = document.getElementById(`home-promo-modal-${key}`) as HTMLDialogElement | null;
  if (dialog && typeof dialog.showModal === 'function') {
    dialog.showModal();
  }
}

/** Wires bonus / events / jackpot promo modals after React hydration. */
export function HomePromoModalsBoot() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest('[data-home-promo-modal]');
      if (trigger) {
        event.preventDefault();
        openModal(trigger.getAttribute('data-home-promo-modal') ?? '');
        return;
      }

      const card = target.closest('[data-home-promo-card]');
      if (card) {
        event.preventDefault();
        openModal(card.getAttribute('data-home-promo-card') ?? '');
        return;
      }

      const closeBtn = target.closest('[data-home-promo-modal-close]');
      if (closeBtn) {
        event.preventDefault();
        closeBtn.closest('dialog')?.close();
      }
    }

    function onDialogClick(event: MouseEvent) {
      const dialog = event.currentTarget;
      if (dialog instanceof HTMLDialogElement && event.target === dialog) {
        dialog.close();
      }
    }

    document.addEventListener('click', onClick);

    const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog.home-promo-modal');
    dialogs.forEach((dialog) => {
      dialog.addEventListener('click', onDialogClick);
    });

    return () => {
      document.removeEventListener('click', onClick);
      dialogs.forEach((dialog) => {
        dialog.removeEventListener('click', onDialogClick);
      });
    };
  }, []);

  return null;
}
