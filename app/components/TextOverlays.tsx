"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useSceneState } from "@/app/lib/sceneState";

const FADE_MS = 520;

export default function TextOverlays() {
  const active = useSceneState((s) => s.active);
  const rollResult = useSceneState((s) => s.rollResult);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      <FadeSlot active={active === 0}>
        <WelcomeTitle />
      </FadeSlot>
      <FadeSlot active={active === 1}>
        <PitchText />
      </FadeSlot>
      {/* In fase 2 il dado torna centrato e zoomato: i marketing-copy
          presidiano gli angoli alti per non coprirlo. Dopo il lancio
          spariscono per lasciare la scena al risultato. */}
      <FadeSlot active={active === 2 && rollResult === null}>
        <RollSection />
      </FadeSlot>
      {/* Sezione 3: dado a destra che gira piano, spiegazione dei tag a
          sinistra con tono giocoso. */}
      <FadeSlot active={active === 3}>
        <TagsExplainer />
      </FadeSlot>
      {/* Sezione 4: titolone CTA download col cliffhanger "e..." che si
          risolve in sezione 5. */}
      <FadeSlot active={active === 4}>
        <DownloadCTA />
      </FadeSlot>
      {/* Sezione 5: il party. Dado principale rimpicciolito + 4 satelliti. */}
      <FadeSlot active={active === 5}>
        <PartyTitle />
      </FadeSlot>
    </div>
  );
}

function FadeSlot({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: active ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
        // Solo lo slot attivo riceve pointer events: i link dei badge/footer
        // della sezione 5 funzionano, e niente click fantasma durante il fade.
        pointerEvents: active ? "auto" : "none",
      }}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

// --- Tipografia condivisa ----------------------------------------------------

const SMOKE = "#E6E8EE";
const SMOKE_DIM = "rgba(230,232,238,0.62)";

// Gradient "metallo inciso": lift in alto + colore di marca in basso. Coerente
// con i materiali del dado, leggibile anche su Onyx.
const STEEL_GRADIENT = "linear-gradient(180deg, #8C9AC0 0%, #4A5366 60%, #3A4150 100%)";
// Crimson piu' caldo in alto per separarsi dall'Onyx; il fondo resta su brand
// per il legame col materiale del dado.
const CRIMSON_GRADIENT = "linear-gradient(180deg, #FF7A66 0%, #EC4F3D 50%, #B83422 100%)";

// Ombre stratificate. La vecchia versione poggiava su un offset duro grigio
// scuro (2px 4px 0 #000) che spegneva il rosso; ora: micro-highlight in alto,
// drop morbido, alone colorato attorno al glifo per stacco su Onyx.
const HERO_SHADOW = [
  "0 1px 0 rgba(255,255,255,0.16)",
  "0 2px 6px rgba(0,0,0,0.45)",
  "0 18px 38px rgba(0,0,0,0.45)",
].join(",");

const wordmarkShadow = (rgb: string) =>
  [
    "0 1px 0 rgba(255,255,255,0.22)",
    "0 2px 4px rgba(0,0,0,0.42)",
    `0 0 22px rgba(${rgb},0.55)`,
    `0 14px 32px rgba(${rgb},0.32)`,
  ].join(",");

const gradientText = (gradient: string, shadow: string): CSSProperties => ({
  backgroundImage: gradient,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  textShadow: shadow,
});

const accentBar = (direction: "left" | "right"): CSSProperties => ({
  display: "block",
  width: "2.6rem",
  height: "2px",
  marginBottom: "1.15rem",
  marginLeft: direction === "right" ? "auto" : 0,
  background:
    direction === "right"
      ? "linear-gradient(270deg, rgba(236,79,61,0.95) 0%, rgba(236,79,61,0) 100%)"
      : "linear-gradient(90deg, rgba(236,79,61,0.95) 0%, rgba(236,79,61,0) 100%)",
  boxShadow: "0 0 14px rgba(236,79,61,0.5)",
});

// --- Sezione 0 ---------------------------------------------------------------

function WelcomeTitle() {
  return (
    <div className="relative h-full flex items-center pl-8 sm:pl-14 md:pl-24 lg:pl-32">
      {/* Scrim mobile-only: invisibile su sm+, su mobile alza il
          contrasto del testo sopra al dado (vedi globals.css). */}
      <div
        aria-hidden
        className="welcome-scrim absolute inset-0 pointer-events-none"
      />
      <h1
        className="relative"
        style={{
          fontFamily: "var(--font-exo2), system-ui, sans-serif",
          color: SMOKE,
        }}
      >
        <span
          className="welcome-eyebrow block"
          style={{
            fontWeight: 300,
            letterSpacing: "0.02em",
            fontSize: "clamp(1.5rem, 2.6vw, 2.4rem)",
            lineHeight: 1,
            color: SMOKE_DIM,
            textShadow: "0 4px 14px rgba(0,0,0,0.55)",
            marginBottom: "0.18em",
          }}
        >
          Benvenuto su
        </span>
        <span
          className="welcome-wordmark block"
          style={{
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 0.92,
            fontSize: "clamp(3.75rem, 9.6vw, 8rem)",
          }}
        >
          <span style={gradientText(STEEL_GRADIENT, wordmarkShadow("74,83,102"))}>
            Critical
          </span>
          <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
            Table
          </span>
        </span>
        <span
          aria-hidden
          className="block"
          style={{
            marginTop: "1.1em",
            width: "3.5rem",
            height: "2px",
            background:
              "linear-gradient(90deg, rgba(236,79,61,0.9) 0%, rgba(236,79,61,0) 100%)",
            boxShadow: "0 0 18px rgba(236,79,61,0.5)",
          }}
        />
        <span
          className="welcome-body block"
          style={{
            marginTop: "0.95em",
            fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(1.1rem, 1.7vw, 1.55rem)",
            lineHeight: 1.35,
            letterSpacing: "0.005em",
            color: SMOKE,
            textShadow: "0 4px 16px rgba(0,0,0,0.6)",
            maxWidth: "32ch",
          }}
        >
          Trova un tavolo di gioco vicino a te. Anche stasera, se vuoi.
        </span>
      </h1>
    </div>
  );
}

// --- Sezione 2 (roll) --------------------------------------------------------

// TGC supportati — solo wordmark, nessuna icona.
const TCG_LIST = [
  "Magic",
  "One Piece",
  "Yu-Gi-Oh!",
  "Lorcana",
  "D&D",
] as const;

// Aside D&D-flavored sul lato destro: una battuta a riga, italic, voce off.
const DND_QUIPS = [
  "Iniziativa massima per la pizza. Sempre.",
  "Master incluso. TPK non promessi — ma neanche garantiti.",
  "Il manuale del giocatore è opzionale. L'amicizia no.",
] as const;

function RollSection() {
  // Dado centrato + zoomato: i due copy occupano gli angoli alti, lasciando
  // libero l'asse verticale per il dado e il pannello CTA in basso.
  // Su mobile la colonna scrollabile mantiene il proprio scrollTop tra le
  // visite (FadeSlot toggla solo l'opacità, niente unmount). Resettiamo
  // ogni volta che l'utente atterra qui — anche al primo arrivo, dove a
  // volte il browser parte non a 0 dopo la composizione del fixed overlay.
  const active = useSceneState((s) => s.active);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active === 2 && mobileScrollRef.current) {
      mobileScrollRef.current.scrollTop = 0;
    }
  }, [active]);

  const body: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "clamp(1.05rem, 1.45vw, 1.35rem)",
    lineHeight: 1.5,
    letterSpacing: "0.005em",
    color: SMOKE,
    textShadow: "0 6px 22px rgba(0,0,0,0.7)",
  };

  const exo800: CSSProperties = {
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 800,
    letterSpacing: "-0.005em",
  };

  const eyebrow: CSSProperties = {
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "clamp(0.7rem, 0.85vw, 0.78rem)",
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: "rgba(230,232,238,0.55)",
    textShadow: "0 2px 8px rgba(0,0,0,0.55)",
  };

  // Stili compatti per la colonna mobile. Definiti qui (non come classi
  // globali) perché vivono solo dentro a RollSection mobile e non hanno
  // bisogno di overrideare nulla con !important.
  const mBody: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "0.95rem",
    lineHeight: 1.5,
    letterSpacing: "0.005em",
    color: SMOKE,
    textShadow: "0 4px 14px rgba(0,0,0,0.7)",
  };
  const mEyebrow: CSSProperties = {
    display: "block",
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "0.66rem",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "rgba(230,232,238,0.55)",
    textShadow: "0 2px 8px rgba(0,0,0,0.55)",
  };
  const mPill: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.32rem 0.78rem",
    borderRadius: "999px",
    background: "rgba(28,32,40,0.55)",
    border: "1px solid rgba(230,232,238,0.18)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 600,
    fontSize: "0.78rem",
    letterSpacing: "0.015em",
    color: SMOKE,
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
  };
  const mQuip: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: "0.86rem",
    lineHeight: 1.45,
    color: "rgba(230,232,238,0.82)",
    textShadow: "0 4px 14px rgba(0,0,0,0.6)",
  };

  return (
    <>
      {/* ── DESKTOP (≥ sm) ─────────────────────────────────────────────
          `display: contents` rimuove il wrapper dal box tree: i due
          assoluti continuano a posizionarsi rispetto al FadeSlot come
          prima, intatti al pixel. Su mobile il wrapper è display:none. */}
      <div className="hidden sm:contents">
        {/* TOP-LEFT */}
        <div className="absolute top-12 md:top-20 left-8 sm:left-14 md:left-24 lg:left-32 max-w-[36ch]">
          <span aria-hidden style={accentBar("left")} />
          <p style={body}>
            Eventi <span style={{ ...exo800, color: SMOKE }}>privati</span> per il tuo party.{" "}
            <span style={{ ...exo800, color: SMOKE }}>Pubblici</span> per allargarlo. Quello che non trovi nei tuoi paraggi,{" "}
            <span
              style={{
                ...exo800,
                ...gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61")),
              }}
            >
              lo organizzi tu
            </span>
            .
          </p>

          <div style={{ marginTop: "1.5rem" }}>
            <span style={eyebrow}>Si gioca a</span>
            <ul
              className="flex flex-wrap"
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0.55rem 0 0 0",
                gap: "0.5rem",
              }}
            >
              {TCG_LIST.map((name) => (
                <li
                  key={name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.4rem 0.95rem",
                    borderRadius: "999px",
                    background: "rgba(28,32,40,0.45)",
                    border: "1px solid rgba(230,232,238,0.18)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    fontFamily: "var(--font-exo2), system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: "clamp(0.78rem, 1vw, 0.92rem)",
                    letterSpacing: "0.015em",
                    color: SMOKE,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* TOP-RIGHT — sopra/affianco a SectionNav (right-6/10), lasciamo aria. */}
        <div className="absolute top-12 md:top-20 right-12 sm:right-20 md:right-28 lg:right-40 max-w-[36ch]">
          <span aria-hidden style={accentBar("right")} />
          <p style={{ ...body, textAlign: "right" }}>
            I giocatori della tua zona ci sono già.{" "}
            <span style={exo800}>
              <span style={gradientText(STEEL_GRADIENT, wordmarkShadow("74,83,102"))}>
                Critical
              </span>
              <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
                Table
              </span>
            </span>{" "}
            li mette in un posto solo.
          </p>

          <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
            <span style={eyebrow}>Disclaimer per nerd</span>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0.55rem 0 0 0",
                borderRight: "2px solid rgba(236,79,61,0.55)",
                paddingRight: "0.95rem",
                boxShadow: "12px 0 24px -16px rgba(236,79,61,0.4)",
              }}
            >
              {DND_QUIPS.map((quip, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "clamp(0.9rem, 1.15vw, 1.05rem)",
                    lineHeight: 1.45,
                    color: "rgba(230,232,238,0.78)",
                    textShadow: "0 4px 14px rgba(0,0,0,0.6)",
                    marginTop: i === 0 ? 0 : "0.35rem",
                  }}
                >
                  {quip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── MOBILE (< sm) ──────────────────────────────────────────────
          Colonna unica scrollabile: contiene tutto il copy desktop in
          flusso verticale. `data-internal-scroll` indica al SnapPager
          di lasciare lo scroll nativo (con boundary-forwarding ai
          bordi). pb generoso per non far finire l'ultimo quip dietro
          al pannello CTA fisso in basso. */}
      <div
        aria-hidden
        className="roll-mobile-scrim sm:hidden absolute inset-0 pointer-events-none"
      />
      <div
        ref={mobileScrollRef}
        data-internal-scroll
        className="sm:hidden absolute inset-0 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" } as CSSProperties}
      >
        <div className="relative px-6 pt-14 pb-[17rem] flex flex-col gap-6">
          {/* Blocco 1: body + TCG list */}
          <div>
            <span aria-hidden style={accentBar("left")} />
            <p style={mBody}>
              Eventi <span style={{ ...exo800, color: SMOKE }}>privati</span> per il tuo party.{" "}
              <span style={{ ...exo800, color: SMOKE }}>Pubblici</span> per allargarlo. Quello che non trovi nei tuoi paraggi,{" "}
              <span
                style={{
                  ...exo800,
                  ...gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61")),
                }}
              >
                lo organizzi tu
              </span>
              .
            </p>

            <div style={{ marginTop: "1rem" }}>
              <span style={mEyebrow}>Si gioca a</span>
              <ul
                className="flex flex-wrap"
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.5rem 0 0 0",
                  gap: "0.4rem",
                }}
              >
                {TCG_LIST.map((name) => (
                  <li key={name} style={mPill}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider crimson */}
          <span
            aria-hidden
            className="self-center"
            style={{
              display: "block",
              width: "3rem",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(236,79,61,0.55) 50%, transparent 100%)",
              boxShadow: "0 0 12px rgba(236,79,61,0.4)",
            }}
          />

          {/* Blocco 2: body + Disclaimer per nerd */}
          <div>
            <span aria-hidden style={accentBar("left")} />
            <p style={mBody}>
              I giocatori della tua zona ci sono già.{" "}
              <span style={exo800}>
                <span style={gradientText(STEEL_GRADIENT, wordmarkShadow("74,83,102"))}>
                  Critical
                </span>
                <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
                  Table
                </span>
              </span>{" "}
              li mette in un posto solo.
            </p>

            <div style={{ marginTop: "1rem" }}>
              <span style={mEyebrow}>Disclaimer per nerd</span>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0.55rem 0 0 0",
                  borderLeft: "2px solid rgba(236,79,61,0.55)",
                  paddingLeft: "0.85rem",
                  boxShadow: "-12px 0 24px -16px rgba(236,79,61,0.4)",
                }}
              >
                {DND_QUIPS.map((quip, i) => (
                  <li
                    key={i}
                    style={{
                      ...mQuip,
                      marginTop: i === 0 ? 0 : "0.4rem",
                    }}
                  >
                    {quip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Sezione 1 ---------------------------------------------------------------

function PitchText() {
  // Domanda → IBM Plex Sans italic 500, bianco pieno per peso visivo.
  // Risposta → IBM Plex Sans semi-bold + wordmark Exo 2 al peso del brand.
  const questionStyle: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontWeight: 500,
    fontStyle: "italic",
    fontSize: "clamp(1.3rem, 1.95vw, 1.8rem)",
    lineHeight: 1.35,
    letterSpacing: "0.005em",
    color: SMOKE,
    textShadow: "0 4px 16px rgba(0,0,0,0.65)",
  };

  return (
    <div className="relative h-full flex items-center justify-end pl-8 pr-10 sm:pr-16 md:pr-24 lg:pr-32">
      {/* Scrim mobile-only: invisibile su sm+, vedi globals.css. */}
      <div
        aria-hidden
        className="pitch-scrim absolute inset-0 pointer-events-none"
      />
      <div className="relative max-w-[44ch]">
        <p className="pitch-question" style={questionStyle}>
          Nessuno dei tuoi amici gioca ai tuoi TGC preferiti?
        </p>
        <p className="pitch-question" style={{ ...questionStyle, marginTop: "1.05em" }}>
          Il tuo party di D&amp;D non fa una sessione da 7 mesi?
        </p>
        <p className="pitch-question" style={{ ...questionStyle, marginTop: "1.05em" }}>
          Da quando ti sei trasferito il tuo mazzo è posato sulla scrivania a prendere polvere?
        </p>
        <div
          aria-hidden
          style={{
            marginTop: "1.9em",
            width: "2.8rem",
            height: "2px",
            background:
              "linear-gradient(90deg, rgba(236,79,61,0.9) 0%, rgba(236,79,61,0) 100%)",
            boxShadow: "0 0 18px rgba(236,79,61,0.45)",
          }}
        />

        <p
          className="pitch-resolution"
          style={{
            marginTop: "0.9em",
            fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(1.75rem, 2.95vw, 2.6rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.012em",
            color: SMOKE,
            textShadow: HERO_SHADOW,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-exo2), system-ui, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.025em",
            }}
          >
            <span style={gradientText(STEEL_GRADIENT, wordmarkShadow("74,83,102"))}>
              Critical
            </span>
            <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
              Table
            </span>
          </span>{" "}
          ti rimette al tavolo.
        </p>
      </div>
    </div>
  );
}

// --- Sezione 3 (tags) -------------------------------------------------------

function TagsExplainer() {
  // Dado a destra (POSES[3].offX > 0): copy a sinistra, allineato al margine,
  // con un blocco di esempi-tag che richiama lo stile dei responsi del lancio.
  const eyebrowStyle: CSSProperties = {
    display: "block",
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: "rgba(230,232,238,0.55)",
    textShadow: "0 2px 8px rgba(0,0,0,0.55)",
    marginBottom: "0.8rem",
  };

  const headlineStyle: CSSProperties = {
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 800,
    fontSize: "clamp(2rem, 3.9vw, 3.4rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.025em",
    color: SMOKE,
    textShadow: HERO_SHADOW,
  };

  const bodyStyle: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)",
    lineHeight: 1.55,
    letterSpacing: "0.005em",
    color: SMOKE,
    textShadow: "0 4px 16px rgba(0,0,0,0.65)",
  };

  const exampleStyle: CSSProperties = {
    fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
    lineHeight: 1.4,
    color: "rgba(230,232,238,0.88)",
    textShadow: "0 2px 10px rgba(0,0,0,0.6)",
    paddingLeft: "0.95rem",
    borderLeft: "2px solid rgba(236,79,61,0.55)",
  };

  const strongInline: CSSProperties = {
    fontFamily: "var(--font-exo2), system-ui, sans-serif",
    fontWeight: 800,
    letterSpacing: "-0.005em",
    color: SMOKE,
  };

  return (
    <div className="relative h-full flex items-center justify-start pl-8 sm:pl-14 md:pl-24 lg:pl-32 pr-8">
      {/* Scrim mobile-only: invisibile su sm+, vedi globals.css. */}
      <div
        aria-hidden
        className="tags-scrim absolute inset-0 pointer-events-none"
      />
      <div className="relative max-w-[30ch] sm:max-w-[42ch]">
        <span className="tags-eyebrow" style={eyebrowStyle}>Come funziona qui</span>
        <h2 className="tags-headline" style={headlineStyle}>
          Gli altri{" "}
          <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
            ti raccontano
          </span>{" "}
          com'è andata.
        </h2>

        <p className="tags-body" style={{ ...bodyStyle, marginTop: "1.5rem" }}>
          Dopo ogni evento, chi era al tuo tavolo ti lascia un tag o due. Frasi corte, mai cattive — una specie di{" "}
          <span style={strongInline}>pacca sulla spalla digitale</span>.
        </p>

        <ul
          className="tags-examples"
          style={{
            listStyle: "none",
            padding: 0,
            margin: "1.2rem 0",
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
            boxShadow: "-12px 0 24px -16px rgba(236,79,61,0.4)",
          }}
        >
          <li className="tags-example" style={exampleStyle}>«Ha portato gli snack»</li>
          <li className="tags-example" style={exampleStyle}>«Sa perdere con stile»</li>
          <li className="tags-example" style={exampleStyle}>«Si è ricordato del mio nickname»</li>
        </ul>

        <p className="tags-body" style={bodyStyle}>
          Niente classifiche di vittorie. Si premia{" "}
          <span style={strongInline}>come ti porgi al tavolo</span> — e a quanto pare contano più le pizze portate dei dadi tirati.
        </p>
      </div>
    </div>
  );
}

// --- Sezione 4 (download CTA) -----------------------------------------------

function DownloadCTA() {
  // Dado a sinistra (POSES[4]): titolone a destra con cliffhanger "e..."
  // che si risolve nella sezione 5. Niente max-width sul container: il
  // wordmark deve poter respirare e non andare a capo.
  return (
    <div className="relative h-full flex items-center justify-end pl-8 pr-10 sm:pr-16 md:pr-24 lg:pr-32">
      {/* Scrim mobile-only: invisibile su sm+, vedi globals.css. */}
      <div
        aria-hidden
        className="dl-scrim absolute inset-0 pointer-events-none"
      />
      <div className="relative" style={{ textAlign: "right" }}>
        <span
          className="dl-intro"
          style={{
            display: "block",
            fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: "clamp(1.25rem, 1.8vw, 1.7rem)",
            lineHeight: 1.35,
            letterSpacing: "0.005em",
            color: "rgba(230,232,238,0.88)",
            textShadow: "0 3px 14px rgba(0,0,0,0.7)",
            marginBottom: "1.1rem",
            maxWidth: "36ch",
            marginLeft: "auto",
          }}
        >
          Non è bastato a convincerti?{" "}
          <strong style={{ fontWeight: 700, fontStyle: "italic", color: SMOKE }}>
            Prova tu stesso!
          </strong>
        </span>
        <h2
          className="dl-scarica"
          style={{
            fontFamily: "var(--font-exo2), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: SMOKE,
            textShadow: HERO_SHADOW,
            marginBottom: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          Scarica
        </h2>
        <h2
          className="dl-wordmark"
          style={{
            fontFamily: "var(--font-exo2), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.8rem, 6.4vw, 5.4rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
          }}
        >
          <span style={gradientText(STEEL_GRADIENT, wordmarkShadow("74,83,102"))}>
            Critical
          </span>
          <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
            Table
          </span>
        </h2>
        <span
          aria-hidden
          style={{
            display: "block",
            marginTop: "0.85em",
            width: "3.2rem",
            height: "2px",
            marginLeft: "auto",
            background:
              "linear-gradient(270deg, rgba(236,79,61,0.95) 0%, rgba(236,79,61,0) 100%)",
            boxShadow: "0 0 14px rgba(236,79,61,0.5)",
          }}
        />
        <span
          className="dl-e"
          style={{
            display: "block",
            marginTop: "0.4em",
            fontFamily: "var(--font-exo2), system-ui, sans-serif",
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: "clamp(2rem, 4vw, 3.4rem)",
            letterSpacing: "0.04em",
            lineHeight: 1,
            color: SMOKE,
            textShadow:
              "0 1px 0 rgba(255,255,255,0.16), 0 4px 18px rgba(0,0,0,0.7)",
          }}
        >
          e…
        </span>
      </div>
    </div>
  );
}

// --- Sezione 5 (allarga il party) -------------------------------------------

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.523 12.073c-.026-2.586 2.107-3.83 2.205-3.892-1.205-1.762-3.078-2.003-3.747-2.027-1.594-.162-3.114.939-3.924.939-.81 0-2.06-.916-3.39-.892-1.745.026-3.353 1.013-4.252 2.575-1.812 3.142-.464 7.79 1.302 10.341.864 1.249 1.892 2.65 3.244 2.6 1.301-.052 1.793-.843 3.366-.843 1.572 0 2.018.843 3.392.815 1.4-.024 2.286-1.273 3.144-2.524 1.989-.59 1.371-2.873 1.405-2.96-.031-.014-2.703-1.038-2.732-4.114zm-2.594-7.555c.713-.866 1.196-2.066 1.064-3.265-1.029.042-2.275.685-3.012 1.547-.661.764-1.241 1.989-1.085 3.165 1.149.089 2.32-.583 3.033-1.447z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M3.5 2.5v19l16-9.5z" fill="#34A853" />
      <path d="M3.5 2.5l16 9.5L9 17.5z" fill="#FBBC04" />
      <path d="M3.5 21.5l16-9.5L9 6.5z" fill="#EA4335" />
      <path d="M3.5 2.5L9 6.5v11l-5.5 4z" fill="#4285F4" />
    </svg>
  );
}

// Badge "store-style": pill scura con icona, eyebrow piccolo + label grosso.
// Ricalca il layout dei badge ufficiali Apple/Google ma con palette del sito.
// `href` è placeholder ("#") finché non ci sono URL veri degli store.
function StoreBadge({
  icon,
  eyebrow,
  label,
  href,
  ariaLabel,
}: {
  icon: ReactNode;
  eyebrow: string;
  label: string;
  href: string;
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group inline-flex items-center gap-3 rounded-xl pl-3.5 pr-5 py-2.5 transition-all duration-300 hover:-translate-y-[2px]"
      style={{
        background: "linear-gradient(180deg, #1B1F27 0%, #0A0C12 100%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: [
          "0 10px 24px -10px rgba(0,0,0,0.6)",
          "inset 0 1px 0 rgba(255,255,255,0.08)",
        ].join(", "),
        color: SMOKE,
        textDecoration: "none",
      }}
    >
      <span className="grid place-items-center">{icon}</span>
      <span className="flex flex-col items-start leading-none">
        <span
          style={{
            fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
            fontSize: "0.62rem",
            letterSpacing: "0.06em",
            fontWeight: 400,
            opacity: 0.78,
            marginBottom: "0.22em",
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontFamily: "var(--font-exo2), system-ui, sans-serif",
            fontSize: "1.05rem",
            fontWeight: 600,
            letterSpacing: "-0.005em",
          }}
        >
          {label}
        </span>
      </span>
    </a>
  );
}

function PartyTitle() {
  // Dado principale rimpicciolito al centro (gestito in D20Scene), 4 dadi
  // satellite agli angoli. Titolo in alto-centro per non collidere con i dadi.
  // mt-auto sul gruppo bottom spinge badge + footer in fondo allo schermo
  // lasciando i dadi liberi nello spazio centrale.
  return (
    <div className="relative h-full">
      {/* Scrim mobile-only a doppia banda: top per il titolo + body, bottom
          per badge + footer. La fascia centrale resta limpida così main +
          4 satelliti si vedono bene (vedi globals.css). */}
      <div
        aria-hidden
        className="party-top-scrim sm:hidden absolute inset-x-0 top-0 h-[34vh] pointer-events-none"
      />
      <div
        aria-hidden
        className="party-bottom-scrim sm:hidden absolute inset-x-0 bottom-0 h-[28vh] pointer-events-none"
      />

      <div className="relative z-10 h-full flex flex-col items-center px-8 pt-16 sm:pt-20 md:pt-24 pb-5">
        <h2
          className="party-title"
          style={{
            fontFamily: "var(--font-exo2), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.6rem, 6.5vw, 5.8rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            color: SMOKE,
            textShadow: HERO_SHADOW,
            textAlign: "center",
          }}
        >
          Allarga il tuo{" "}
          <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
            party!
          </span>
        </h2>
        <p
          className="party-body"
          style={{
            marginTop: "1.1rem",
            fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: "clamp(1rem, 1.4vw, 1.3rem)",
            lineHeight: 1.45,
            color: "rgba(230,232,238,0.82)",
            textShadow: "0 4px 16px rgba(0,0,0,0.6)",
            textAlign: "center",
            maxWidth: "42ch",
          }}
        >
          I migliori tavoli sono quelli pieni — porta gli amici, gli amici degli amici, e i loro dadi.
        </p>

        <div className="mt-auto w-full flex flex-col items-center gap-5 sm:gap-6">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          <StoreBadge
            icon={<AppleIcon />}
            eyebrow="Scarica su"
            label="App Store"
            href="#"
            ariaLabel="Scarica CriticalTable su App Store"
          />
          <StoreBadge
            icon={<PlayIcon />}
            eyebrow="Disponibile su"
            label="Google Play"
            href="#"
            ariaLabel="Scarica CriticalTable su Google Play"
          />
        </div>

        <footer className="flex flex-col items-center gap-2.5">
          <span
            aria-hidden
            style={{
              display: "block",
              width: "3rem",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(236,79,61,0.55) 50%, transparent 100%)",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif",
              fontSize: "clamp(0.72rem, 0.9vw, 0.82rem)",
              letterSpacing: "0.015em",
              textAlign: "center",
              color: "rgba(230,232,238,0.6)",
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
              margin: 0,
            }}
          >
            <span style={{ color: SMOKE, fontWeight: 600, opacity: 0.9 }}>
              CriticalTable
            </span>
            <span style={{ margin: "0 0.55rem", opacity: 0.45 }}>·</span>
            Made with a{" "}
            <span style={{ color: SMOKE, fontWeight: 700 }}>nat20</span> by{" "}
            <a
              href="#"
              rel="noopener noreferrer"
              style={{
                color: "#EC4F3D",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              DEV.ERU
            </a>
          </p>
        </footer>
      </div>
      </div>
    </div>
  );
}
