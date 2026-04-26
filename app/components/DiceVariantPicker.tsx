"use client";

import { useEffect, useRef, useState } from "react";
import { useSceneState } from "@/app/lib/sceneState";
import { DICE_VARIANTS, getVariant, type SlotKey } from "@/app/lib/diceVariants";

// Slot mostrati come pastiglie colorate (anteprima della variante).
// Iron = corpo, Crimson = numerali, Steel = faccia 20: i tre tocchi
// che meglio comunicano il "feel" del set senza esporre il bevel.
const SWATCH_SLOTS: readonly SlotKey[] = ["Iron", "Crimson", "Steel"];

export default function DiceVariantPicker() {
  const variantId = useSceneState((s) => s.variantId);
  const setVariant = useSceneState((s) => s.setVariant);
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Capture-phase: blocca il wheel sopra il popover prima che arrivi al
    // listener di SnapPager su window (bubble). Senza questo, scrollare con
    // il mouse sopra il pannello aperto avanzerebbe la storia.
    const onWheel = (e: WheelEvent) => {
      if (panelRef.current?.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [open]);

  const current = getVariant(variantId);

  return (
    <div
      ref={rootRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-3 pl-3 pr-3.5 py-2 rounded-full text-[13px] tracking-wide transition-colors hover:bg-white/[0.04]"
        style={{
          background:
            "linear-gradient(140deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(20,24,32,0.40) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 6px 22px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          color: "#E6E8EE",
        }}
      >
        <span className="flex items-center gap-1">
          {SWATCH_SLOTS.map((slot) => (
            <Swatch key={slot} color={current.slots[slot].color} size={9} />
          ))}
        </span>
        <span className="font-medium leading-none">{current.label}</span>
        <Caret open={open} />
      </button>

      <div
        ref={panelRef}
        role="listbox"
        aria-label="Varianti del dado"
        className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 min-w-[260px] rounded-2xl overflow-hidden transition-all duration-200 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
        style={{
          background:
            "linear-gradient(150deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 60%, rgba(20,24,32,0.55) 100%)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <ul className="py-1.5">
          {DICE_VARIANTS.map((v) => {
            const isActive = v.id === variantId;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setVariant(v.id);
                    setOpen(false);
                  }}
                  className="group/item w-full flex items-center gap-3 pl-3 pr-4 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.06]"
                  style={{ color: "#E6E8EE" }}
                >
                  {/* Barretta verticale: indicatore di "selezionato" */}
                  <span
                    className="block w-[3px] h-7 rounded-full transition-opacity duration-200"
                    style={{
                      background: v.slots.Crimson.color,
                      boxShadow: `0 0 10px ${v.slots.Crimson.color}66`,
                      opacity: isActive ? 1 : 0,
                    }}
                  />
                  <span className="flex items-center gap-1.5">
                    {SWATCH_SLOTS.map((slot) => (
                      <Swatch
                        key={slot}
                        color={v.slots[slot].color}
                        size={13}
                      />
                    ))}
                  </span>
                  <span
                    className={`flex-1 leading-none ${
                      isActive
                        ? "font-semibold"
                        : "font-medium opacity-75 group-hover/item:opacity-100"
                    }`}
                  >
                    {v.label}
                  </span>
                  {isActive && <Check />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Swatch({ color, size }: { color: string; size: number }) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    />
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      className={`transition-transform duration-300 ease-out ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="#E6E8EE"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      width="12"
      height="9"
      viewBox="0 0 12 9"
      fill="none"
      aria-hidden="true"
      className="opacity-90"
    >
      <path
        d="M1 4.5L4.5 8L11 1"
        stroke="#E6E8EE"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
