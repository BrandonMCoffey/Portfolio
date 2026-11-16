/**
 * Minimal card spotlight cursor effect ("spotlight-only").
 * Updates --mx and --my CSS custom properties on the hovered .card-spotlight element
 * without replacing the native OS cursor.
 */

let initialized = false;

export function initCardSpotlight() {
  if (initialized) return;
  initialized = true;

  if (window.matchMedia("(pointer: coarse)").matches) return;

  window.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest(".card-spotlight") as HTMLElement | null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    { passive: true },
  );
}
