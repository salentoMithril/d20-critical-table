"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useSceneState } from "@/app/lib/sceneState";
import { PALETTE } from "@/app/lib/palette";
import { outcomeFor, type TagTone } from "@/app/lib/rollOutcomes";

const CRIMSON_GRADIENT = "linear-gradient(180deg, #FF7A66 0%, #EC4F3D 50%, #B83422 100%)";

// Toni di enfasi inline per i frammenti-tag dentro il responso.
// Il body resta bianco-fumo; il tag si stacca col colore del tono.
const TONE_EMPHASIS: Record<TagTone, { color: string; shadow: string }> = {
  pos: {
    color: "#FFFFFF",
    shadow: "0 0 14px rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.55)",
  },
  fun: {
    color: "#F5D26A",
    shadow: "0 0 16px rgba(212,172,13,0.35), 0 2px 8px rgba(0,0,0,0.55)",
  },
  neu: {
    color: "#B7C0D9",
    shadow: "0 0 14px rgba(140,154,192,0.25), 0 2px 8px rgba(0,0,0,0.55)",
  },
  neg: {
    color: "#FF8A78",
    shadow: "0 0 16px rgba(236,79,61,0.40), 0 2px 8px rgba(0,0,0,0.55)",
  },
};

export default function RollButton() {
  const active = useSceneState((s) => s.active);
  const rollResult = useSceneState((s) => s.rollResult);
  const hasRolledOnce = useSceneState((s) => s.hasRolledOnce);
  const startRoll = useSceneState((s) => s.startRoll);

  const onPhase2 = active === 2;
  const showPanel = onPhase2 && rollResult === null;
  const showResult = onPhase2 && rollResult !== null;
  // Dopo il primo lancio (e successivo reset via scroll-back), il pannello
  // cambia voce: invita a ritentare la fortuna.
  const isRetry = hasRolledOnce;

  // Mobile post-roll: ogni nuovo lancio (o reset) deve riportare lo scroll
  // interno della result-card a 0. Su desktop il ref punta a un nodo
  // display:none → scrollTop = 0 è no-op.
  const mobileResultScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mobileResultScrollRef.current) {
      mobileResultScrollRef.current.scrollTop = 0;
    }
  }, [rollResult]);

  return (
    <>
      {/* Pannello CTA in glassmorphism: sta sopra la metà bassa del dado,
          quindi il backdrop-filter cattura colori e silhouette del d20. */}
      <div
        className={`fixed inset-x-0 bottom-10 md:bottom-16 z-20 flex justify-center px-6 transition-opacity duration-500 pointer-events-none ${
          showPanel ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="relative px-9 sm:px-12 md:px-16 pt-7 md:pt-9 pb-8 md:pb-9 overflow-hidden"
          style={{
            borderRadius: "26px",
            // Base scura affidabile: il pannello deve restare leggibile su
            // qualsiasi variante (Confetto rosa, Metallico argento, Tropicale
            // verde/mango). Highlight bianco residuo solo in alto-sinistra
            // come "rifrazione di vetro", il resto si appoggia su un fondo
            // scuro che maschera i colori vivaci sottostanti.
            background:
              "linear-gradient(140deg, rgba(255,255,255,0.10) 0%, rgba(15,18,25,0.45) 45%, rgba(8,10,14,0.60) 100%)",
            // Backdrop: blur generoso ma niente saturate>100% (amplificherebbe
            // i pastelli). Brightness <1 dima uniformemente la silhouette del
            // dado dietro, così pink/silver/mango non sfondano il pannello.
            backdropFilter: "blur(20px) saturate(105%) brightness(0.78)",
            WebkitBackdropFilter: "blur(20px) saturate(105%) brightness(0.78)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: [
              "0 30px 80px -22px rgba(0,0,0,0.7)",
              "inset 0 1px 0 rgba(255,255,255,0.22)",
              "inset 0 -1px 0 rgba(0,0,0,0.35)",
            ].join(", "),
          }}
        >
          {/* Riga di luce lungo il bordo superiore — finto "edge of glass" */}
          <span
            aria-hidden
            className="absolute inset-x-8 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
            }}
          />
          {/* Sheen radiale per simulare la rifrazione del dado dietro */}
          <span
            aria-hidden
            className="absolute -inset-px"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)",
              pointerEvents: "none",
            }}
          />

          <div className="relative text-center">
            <p
              style={{
                fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)",
                lineHeight: 1.35,
                color: "rgba(230,232,238,0.78)",
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              {isRetry ? "Una mano non basta mai." : "Che tipo di compagno di tavolo sei?"}
            </p>
            <p
              style={{
                marginTop: "0.35em",
                fontFamily: "var(--font-exo2), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.4rem, 2.05vw, 1.85rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.012em",
                color: "#E6E8EE",
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.55)",
              }}
            >
              {isRetry ? (
                <>
                  Vuoi{" "}
                  <span
                    style={{
                      backgroundImage: CRIMSON_GRADIENT,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                      textShadow: [
                        "0 1px 0 rgba(255,255,255,0.22)",
                        "0 2px 4px rgba(0,0,0,0.40)",
                        "0 0 22px rgba(236,79,61,0.55)",
                        "0 14px 32px rgba(236,79,61,0.32)",
                      ].join(", "),
                    }}
                  >
                    ritentare la fortuna
                  </span>
                  ?
                </>
              ) : (
                <>
                  <span
                    style={{
                      backgroundImage: CRIMSON_GRADIENT,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                      textShadow: [
                        "0 1px 0 rgba(255,255,255,0.22)",
                        "0 2px 4px rgba(0,0,0,0.40)",
                        "0 0 22px rgba(236,79,61,0.55)",
                        "0 14px 32px rgba(236,79,61,0.32)",
                      ].join(", "),
                    }}
                  >
                    Lancia il dado
                  </span>{" "}
                  e scopriamolo!
                </>
              )}
            </p>

            <button
              onClick={startRoll}
              disabled={!showPanel}
              aria-label="Lancia il dado"
              className="group relative mx-auto mt-6 md:mt-7 flex items-center justify-center px-10 sm:px-14 md:px-16 py-4 md:py-[1.05rem] rounded-full pointer-events-auto disabled:cursor-not-allowed transition-transform duration-300 hover:-translate-y-[1px] active:translate-y-[1px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, #EC4F3D 0%, #C0392B 55%, #9F2A1E 100%)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.30)",
                  "inset 0 -1px 0 rgba(0,0,0,0.35)",
                  "0 14px 28px -10px rgba(236,79,61,0.55)",
                  "0 0 0 0 rgba(236,79,61,0)",
                ].join(", "),
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,170,150,0.45) 0%, rgba(192,57,43,0) 60%)",
                }}
              />
              <span
                aria-hidden
                className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{
                  boxShadow: "0 0 0 6px rgba(236,79,61,0.18)",
                }}
              />
              <span
                className="relative z-10 uppercase"
                style={{
                  fontFamily: "var(--font-exo2), system-ui, sans-serif",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontSize: "clamp(0.78rem, 1.05vw, 0.92rem)",
                  letterSpacing: "0.42em",
                  // padding-left compensa il tracking finale per ottica.
                  paddingLeft: "0.42em",
                  textShadow: "0 1px 0 rgba(0,0,0,0.45)",
                }}
              >
                {isRetry ? "Rilancia!" : "Lancia!"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP — esito a fianco del dado. Il dado post-launch e' shiftato
          a sinistra (POST_LAUNCH_POSE.offX = -0.22), quindi il blocco vive
          nella meta' destra del viewport e si allinea verticalmente al
          centro. `hidden sm:flex`: su mobile non rendiamo questo layout. */}
      <div
        className={`hidden sm:flex fixed inset-y-0 right-0 z-20 items-center pointer-events-none transition-opacity duration-700 ${
          showResult ? "opacity-100" : "opacity-0"
        }`}
        style={{ width: "50%", paddingLeft: "1.25rem", paddingRight: "1.5rem" }}
      >
        <ResultCard rollResult={rollResult} visible={showResult} />
      </div>

      {/* MOBILE — esito sulla sponda destra, speculare al desktop ma con
          larghezza calibrata per portrait. Il dado post-launch è shiftato
          a sinistra (POST_LAUNCH_POSE.offX = -0.22) → resta visibile a
          sinistra del pannello.

          Lo scrim è il background dello stesso scroll container: gradient
          orizzontale "to left" (scuro sul bordo destro, trasparente verso
          il dado), così il dado non viene mai coperto. Backdrop-blur
          leggero solo nell'area del container.

          Tipografia calibrata su outcome 6 (~238 char) con larghezza
          interna ~190px: ~5 righe di story + ~4 di reaction = ~62% del
          viewport. Outcome 14/18 (~290 char) ~75%. Scroll interno come
          safety net per device molto piccoli o testo accessibilità. */}
      <div
        className={`sm:hidden fixed inset-y-0 right-0 z-20 transition-opacity duration-700 ${
          showResult ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ width: "62%" }}
      >
        <div
          ref={mobileResultScrollRef}
          data-internal-scroll
          className="absolute inset-0 overflow-y-auto overscroll-contain"
          style={{
            background:
              "linear-gradient(to left, rgba(17,19,24,0.80) 0%, rgba(17,19,24,0.65) 35%, rgba(17,19,24,0.22) 75%, rgba(17,19,24,0) 100%)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            WebkitOverflowScrolling: "touch",
          } as CSSProperties}
        >
          <div className="min-h-full flex flex-col justify-center px-4 py-10">
            <MobileResultCard rollResult={rollResult} visible={showResult} />
          </div>
        </div>
      </div>
    </>
  );
}

function ResultCard({
  rollResult,
  visible,
}: {
  rollResult: number | null;
  visible: boolean;
}) {
  const outcome = rollResult !== null ? outcomeFor(rollResult) : null;

  // Stagger: numero entra col wrapper, story dopo 240ms, reaction dopo 420ms.
  const fadeIn = (delay: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 600ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, transform 600ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms`,
  });

  const storyStyle: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "clamp(1rem, 1.3vw, 1.25rem)",
    lineHeight: 1.55,
    letterSpacing: "0.005em",
    color: "#E6E8EE",
    textShadow: "0 4px 18px rgba(0,0,0,0.7)",
    ...fadeIn(240),
  };

  // Blockquote-style: barra crimson a sinistra + italic per "voce esterna".
  const reactionStyle: CSSProperties = {
    marginTop: "1.1rem",
    paddingLeft: "0.95rem",
    borderLeft: "2px solid rgba(236,79,61,0.55)",
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontWeight: 400,
    fontStyle: "italic",
    fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)",
    lineHeight: 1.5,
    letterSpacing: "0.005em",
    color: "rgba(230,232,238,0.82)",
    textShadow: "0 4px 16px rgba(0,0,0,0.65)",
    boxShadow: "-12px 0 24px -16px rgba(236,79,61,0.4)",
    ...fadeIn(420),
  };

  return (
    <div className="max-w-[34rem] w-full">
      <div
        className="leading-none tabular-nums"
        style={{
          fontFamily: "var(--font-exo2), system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(4rem, 9vw, 8rem)",
          letterSpacing: "-0.045em",
          color: PALETTE.Crimson,
          backgroundImage: CRIMSON_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: [
            "0 1px 0 rgba(255,255,255,0.20)",
            "0 0 40px rgba(236,79,61,0.45)",
            "0 18px 48px rgba(0,0,0,0.55)",
          ].join(", "),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {rollResult !== null ? String(rollResult) : ""}
      </div>
      <div
        aria-hidden
        style={{
          marginTop: "0.85rem",
          marginBottom: "1.25rem",
          width: "3rem",
          height: "2px",
          background:
            "linear-gradient(90deg, rgba(236,79,61,0.95) 0%, rgba(236,79,61,0) 100%)",
          boxShadow: "0 0 14px rgba(236,79,61,0.5)",
        }}
      />
      <p style={storyStyle}>
        {outcome?.story.map((f, i) =>
          f.tone ? (
            <Emphasis key={i} tone={f.tone}>
              {f.text}
            </Emphasis>
          ) : (
            <span key={i}>{f.text}</span>
          )
        )}
      </p>
      <p style={reactionStyle}>
        {outcome?.reaction.map((f, i) =>
          f.tone ? (
            <Emphasis key={i} tone={f.tone}>
              {f.text}
            </Emphasis>
          ) : (
            <span key={i}>{f.text}</span>
          )
        )}
      </p>
    </div>
  );
}

// Variante mobile della ResultCard. Layout verticale a sponda destra
// (parent container la posiziona a destra), testo allineato a sinistra
// per coerenza con il desktop. Font dimensionato sulla larghezza interna
// ~190px (62% di 360px - padding): outcome 6 occupa ~62% del viewport
// portrait. Outcome 14/18/13 (~290 char) restano dentro; in casi estremi
// si scrolla grazie al `data-internal-scroll` del wrapper.
function MobileResultCard({
  rollResult,
  visible,
}: {
  rollResult: number | null;
  visible: boolean;
}) {
  const outcome = rollResult !== null ? outcomeFor(rollResult) : null;

  // Stesso stagger della desktop per coerenza percettiva: numero entra
  // col wrapper, story dopo 240ms, reaction dopo 420ms.
  const fadeIn = (delay: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 600ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, transform 600ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms`,
  });

  return (
    <div className="relative">
      <div
        className="leading-none tabular-nums"
        style={{
          fontFamily: "var(--font-exo2), system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "6rem",
          letterSpacing: "-0.045em",
          color: PALETTE.Crimson,
          backgroundImage: CRIMSON_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: [
            "0 1px 0 rgba(255,255,255,0.20)",
            "0 0 32px rgba(236,79,61,0.45)",
            "0 16px 40px rgba(0,0,0,0.55)",
          ].join(", "),
          fontVariantNumeric: "tabular-nums",
          ...fadeIn(0),
        }}
      >
        {rollResult !== null ? String(rollResult) : ""}
      </div>

      <div
        aria-hidden
        style={{
          marginTop: "0.55rem",
          marginBottom: "1.2rem",
          width: "2.5rem",
          height: "2px",
          background:
            "linear-gradient(90deg, rgba(236,79,61,0.95) 0%, rgba(236,79,61,0) 100%)",
          boxShadow: "0 0 14px rgba(236,79,61,0.5)",
          ...fadeIn(120),
        }}
      />

      <p
        style={{
          fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
          fontWeight: 500,
          fontSize: "0.98rem",
          lineHeight: 1.5,
          letterSpacing: "0.005em",
          color: "#E6E8EE",
          textShadow: "0 4px 16px rgba(0,0,0,0.7)",
          margin: 0,
          ...fadeIn(240),
        }}
      >
        {outcome?.story.map((f, i) =>
          f.tone ? (
            <Emphasis key={i} tone={f.tone}>
              {f.text}
            </Emphasis>
          ) : (
            <span key={i}>{f.text}</span>
          )
        )}
      </p>

      <p
        style={{
          marginTop: "1rem",
          paddingLeft: "0.85rem",
          borderLeft: "2px solid rgba(236,79,61,0.55)",
          fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "0.92rem",
          lineHeight: 1.45,
          letterSpacing: "0.005em",
          color: "rgba(230,232,238,0.86)",
          textShadow: "0 4px 14px rgba(0,0,0,0.6)",
          boxShadow: "-12px 0 24px -16px rgba(236,79,61,0.4)",
          ...fadeIn(420),
        }}
      >
        {outcome?.reaction.map((f, i) =>
          f.tone ? (
            <Emphasis key={i} tone={f.tone}>
              {f.text}
            </Emphasis>
          ) : (
            <span key={i}>{f.text}</span>
          )
        )}
      </p>
    </div>
  );
}

function Emphasis({
  tone,
  children,
}: {
  tone: TagTone;
  children: React.ReactNode;
}) {
  const t = TONE_EMPHASIS[tone];
  return (
    <strong
      style={{
        fontFamily: "var(--font-exo2), system-ui, sans-serif",
        fontWeight: 700,
        letterSpacing: "0.005em",
        color: t.color,
        textShadow: t.shadow,
      }}
    >
      {children}
    </strong>
  );
}
