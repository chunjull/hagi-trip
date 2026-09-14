import type { KeyboardEvent } from "react";

/** Keep Tab inside the modal, including the wrap between its last and first controls. */
export const trapDialogFocus = (event: KeyboardEvent<HTMLDialogElement>): void => {
  if (event.key !== "Tab") return;

  const dialog = event.currentTarget;
  const controls = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]')]
    .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  const active = document.activeElement;

  if (!first || !last) {
    event.preventDefault();
    return;
  }

  if (!dialog.contains(active) || (event.shiftKey && active === first)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
};
