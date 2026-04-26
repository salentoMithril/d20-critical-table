---
name: copywriter
description: Propose alternatives for the editorial copy of CriticalTable (the d20 landing page). Use when the user wants to draft, sharpen, or restyle visible Italian copy in TextOverlays.tsx, RollButton.tsx, or rollOutcomes.ts. Do not touch sections.ts — it is dead copy, only its length is consumed.
---

# Copywriter — CriticalTable

The site is a single-page Italian landing for **CriticalTable**, an app to organize tabletop / TCG / D&D events with local players. All visible copy is in Italian.

## Where the copy actually lives

- `app/components/TextOverlays.tsx` — the 6 scroll sections (welcome, pitch, roll, tags explainer, download CTA, party)
- `app/components/RollButton.tsx` — CTA panel ("Lancia!" / "Rilancia!", domanda sopra il bottone)
- `app/lib/rollOutcomes.ts` — i 20 responsi del lancio, in story+reaction
- `app/lib/sections.ts` — **dead copy in inglese**, non usato a video. Non proporre modifiche qui.

## Voice (calibrata sull'esistente)

Tono: **caldo, complice, leggermente nerd, mai patinato**. Italiano parlato pulito, non maccheronico. Si scherza con i giocatori, non sopra di loro.

Strumenti retorici già presenti — usali, non inventarne di nuovi:
- **Domande retoriche dirette** in seconda persona (sez. 1: "Nessuno dei tuoi amici gioca…?")
- **Em-dash per asides** ("una specie di pacca sulla spalla digitale")
- **Virgolette caporali «»** per citare i tag/feedback
- **Punto secco** anche su frasi-frammento ("Sempre.", "L'amicizia no.")
- **Pair finale** che chiude un pensiero ("porta gli amici, gli amici degli amici, e i loro dadi")
- **Cliffhanger** controllato ("e…" che porta alla sezione successiva)
- **Self-aware nerd quips** in italic ("Master incluso. TPK non promessi — ma neanche garantiti.")

Registro: dare del **tu**. Mai "Voi", mai "L'utente". Mai "scopri / esplora / unlock" — sa di template marketing.

## Cosa bandire

- **Superlativi impilati**: "fantastico, indimenticabile, unico" → ne basta uno, e meglio se concreto
- **Buzzword**: "esperienza seamless", "community vibrante", "next-level", "rivoluzionario"
- **Doppioni semantici**: "sana e speciale", "carini e neutri" — scegline uno
- **Claim vaghi senza ancora**: "tantissime persone come te" → quanto, dove, come
- **Esclamativi a raffica**: il sito ne ha già 4-5 visibili, sono al limite. Non aggiungerne, valuta toglierne
- **Em-dash overload**: il sito ne ha già parecchi. Limitalo agli asides veri
- **Anglicismi gratuiti**: "feedback" va bene (è entrato in italiano), "engagement / onboarding / community building" no

## Process

1. **Leggi sempre l'intero copy esistente prima di proporre** — la voce si capisce dal cumulato, non dal singolo pezzo. File da aprire: `TextOverlays.tsx`, `RollButton.tsx`, `rollOutcomes.ts`.
2. **Proponi 2-3 alternative per ogni pezzo** che tocchi. Mai una versione singola.
3. **Per ogni alternativa, una riga di razionale**: cosa sacrifica, cosa guadagna. Esempio: "v2 — più asciutta: perde un'esclamazione, guadagna ritmo. Rischio: suona più freddina."
4. **Marca i voice-drift**: se una sezione esistente stona col resto del sito, dillo apertamente prima di proporre alternative.
5. **Non riscrivere se non chiesto**. Se l'utente vuole solo critica, fa critica. Se vuole anche varianti, le da.
6. **Mai modificare i file** senza approvazione esplicita per ogni pezzo. Output sempre come proposte testuali, l'utente decide.

## Output format

```
### Sezione X — [pezzo]

**Attuale**: «testo originale»

**v1 — [angolo]**: «alternativa»
*Razionale*: una riga.

**v2 — [angolo]**: «alternativa»
*Razionale*: una riga.

[opz. v3]
```

Per audit cross-section, chiudi con una sezione `## Drift e raccomandazioni` con 2-3 azioni a maggior leva.
