"use client";

import { useEffect, useState } from "react";
import { PALETTE } from "@/app/lib/palette";

// Durata della barra: nello stesso intervallo la scena 3D sotto monta
// e fa partire i fetch di GLB / env HDR / faces JSON e i build
// Canvas2D delle texture delle carte. Al fadeout il viewport sotto è
// già nello stato di partenza (fase 0, dado a destra), niente "pop-in"
// visibile dopo il preloader.
const DURATION_MS = 2500;
const FADE_MS = 700;

export default function Preloader() {
  // filled: la barra è stata istruita a riempirsi (transition CSS in
  // corso). Lo accendiamo dopo un RAF perché altrimenti il browser
  // collassa il rendering iniziale e l'animazione di width parte già
  // a 100% — il from→to ha bisogno di due frame distinti.
  const [filled, setFilled] = useState(false);
  // Percentuale intera 0..100 mostrata accanto alla barra. Aggiornata
  // via rAF e settata solo quando cambia il valore intero ⇒ ~100
  // re-render in 2.5s invece di 150 (uno per frame), niente jitter sul
  // testo perché tabular-nums tiene fisse le glifi.
  const [percent, setPercent] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFilled(true));

    const start = performance.now();
    let counterRaf = 0;
    const tickCounter = () => {
      const elapsed = performance.now() - start;
      const u = Math.min(1, elapsed / DURATION_MS);
      const next = Math.floor(u * 100);
      setPercent((prev) => (prev !== next ? next : prev));
      if (u < 1) counterRaf = requestAnimationFrame(tickCounter);
    };
    counterRaf = requestAnimationFrame(tickCounter);

    const tFade = window.setTimeout(() => setFadingOut(true), DURATION_MS);
    const tUnmount = window.setTimeout(
      () => setUnmounted(true),
      DURATION_MS + FADE_MS
    );
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(counterRaf);
      window.clearTimeout(tFade);
      window.clearTimeout(tUnmount);
    };
  }, []);

  if (unmounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: PALETTE.Onyx,
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        // Durante il fade lasciamo passare gli eventi così non blocchiamo
        // la prima interazione utente nei ~380ms finali.
        pointerEvents: fadingOut ? "none" : "auto",
      }}
      aria-hidden={fadingOut}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          style={{
            color: "rgba(255, 255, 255, 0.92)",
            fontSize: "14px",
            letterSpacing: "0.08em",
            // tabular-nums: glifi a larghezza fissa ⇒ il "0%→100%" non
            // shifta orizzontalmente sotto la barra.
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {percent}%
        </div>
        <div
          className="relative h-[3px] w-[58vw] max-w-[420px] overflow-hidden rounded-full"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: filled ? "100%" : "0%",
              background: "rgba(255, 255, 255, 0.92)",
              transition: `width ${DURATION_MS}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
