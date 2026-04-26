"use client";

import type { CSSProperties, ReactNode } from "react";
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
    <div className="h-full flex items-center pl-8 sm:pl-14 md:pl-24 lg:pl-32">
      <h1
        style={{
          fontFamily: "var(--font-exo2), system-ui, sans-serif",
          color: SMOKE,
        }}
      >
        <span
          className="block"
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
          className="block"
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
          className="block"
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
          Ti aiuteremo ad organizzare il tuo prossimo tavolo di gioco!
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

  return (
    <>
      {/* TOP-LEFT */}
      <div className="absolute top-12 md:top-20 left-8 sm:left-14 md:left-24 lg:left-32 max-w-[36ch]">
        <span aria-hidden style={accentBar("left")} />
        <p style={body}>
          Crea e cerca eventi{" "}
          <span style={{ ...exo800, color: SMOKE }}>privati e pubblici</span>{" "}
          nei tuoi paraggi, allarga la tua cerchia di amici e rappresenta una{" "}
          <span
            style={{
              ...exo800,
              ...gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61")),
            }}
          >
            community sana e speciale
          </span>
          !
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
          È il miglior luogo dove trovare{" "}
          <span
            style={{
              ...exo800,
              ...gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61")),
            }}
          >
            tanti altri appassionati come te
          </span>{" "}
          e creare{" "}
          <span style={{ ...exo800, color: SMOKE }}>esperienze indimenticabili</span>!
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
    <div className="h-full flex items-center justify-end pl-8 pr-10 sm:pr-16 md:pr-24 lg:pr-32">
      <div className="max-w-[44ch]">
        <p style={questionStyle}>
          Nessuno dei tuoi amici gioca ai tuoi TGC preferiti?
        </p>
        <p style={{ ...questionStyle, marginTop: "1.05em" }}>
          Il tuo party di D&amp;D non fa una sessione da 7 mesi?
        </p>
        <p style={{ ...questionStyle, marginTop: "1.05em" }}>
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
          è la soluzione.
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
    <div className="h-full flex items-center justify-start pl-8 sm:pl-14 md:pl-24 lg:pl-32 pr-8">
      <div className="max-w-[42ch]">
        <span style={eyebrowStyle}>Come funziona qui</span>
        <h2 style={headlineStyle}>
          Gli altri{" "}
          <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
            ti raccontano
          </span>{" "}
          com'è andata.
        </h2>

        <p style={{ ...bodyStyle, marginTop: "1.5rem" }}>
          Dopo ogni evento, chi era al tuo tavolo ti lascia un tag o due. Frasi corte, mai cattive — una specie di{" "}
          <span style={strongInline}>pacca sulla spalla digitale</span>.
        </p>

        <ul
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
          <li style={exampleStyle}>«Ha portato gli snack»</li>
          <li style={exampleStyle}>«Sa perdere con stile»</li>
          <li style={exampleStyle}>«Si è ricordato del mio nickname»</li>
        </ul>

        <p style={bodyStyle}>
          Niente classifiche di vittorie, niente ego trip. Si premia{" "}
          <span style={strongInline}>come ti porti al tavolo</span> — e a quanto pare contano più le pizze portate dei dadi tirati.
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
    <div className="h-full flex items-center justify-end pl-8 pr-10 sm:pr-16 md:pr-24 lg:pr-32">
      <div style={{ textAlign: "right" }}>
        <span
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

function PartyTitle() {
  // Dado principale rimpicciolito al centro (gestito in D20Scene), 4 dadi
  // satellite agli angoli. Titolo in alto-centro per non collidere con i dadi.
  return (
    <div className="h-full flex flex-col items-center px-8 pt-16 sm:pt-20 md:pt-24">
      <h2
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
        Allarga{" "}
        <span style={gradientText(CRIMSON_GRADIENT, wordmarkShadow("236,79,61"))}>
          il party!
        </span>
      </h2>
      <p
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
    </div>
  );
}
