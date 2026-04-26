"use client";

import { useSceneState } from "@/app/lib/sceneState";
import { PALETTE } from "@/app/lib/palette";

export default function RollButton() {
  const active = useSceneState((s) => s.active);
  const rollResult = useSceneState((s) => s.rollResult);
  const startRoll = useSceneState((s) => s.startRoll);

  const onPhase2 = active === 2;
  const showButton = onPhase2 && rollResult === null;
  const showResult = onPhase2 && rollResult !== null;

  return (
    <>
      {/* Tasto in basso al centro */}
      <div
        className={`fixed inset-x-0 bottom-20 md:bottom-28 z-20 flex justify-center transition-opacity duration-500 ${
          showButton ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={startRoll}
          disabled={!showButton}
          aria-label="Lancia il dado"
          className="group relative px-14 md:px-20 py-6 border transition-all duration-300 disabled:cursor-not-allowed overflow-hidden"
          style={{
            borderColor: PALETTE.Steel,
            backgroundColor: "rgba(28, 32, 40, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span
            className="relative z-10 font-mono text-sm md:text-base tracking-[0.5em] uppercase"
            style={{ color: "#E6E8EE" }}
          >
            Lancia!
          </span>
          <span
            aria-hidden
            className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${PALETTE.Crimson}33, transparent 70%)`,
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px transition-all duration-500"
            style={{
              width: "0%",
              backgroundColor: PALETTE.Crimson,
            }}
          />
        </button>
      </div>

      {/* Numero estratto a lato — confronto con la faccia */}
      <div
        className={`fixed top-1/2 right-20 md:right-32 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-700 ${
          showResult ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="font-bold leading-none tabular-nums"
          style={{
            fontSize: "clamp(4rem, 8vw, 7rem)",
            color: PALETTE.Crimson,
            textShadow: "0 0 40px rgba(192, 57, 43, 0.3)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {rollResult !== null ? String(rollResult).padStart(2, "0") : ""}
        </div>
      </div>
    </>
  );
}
