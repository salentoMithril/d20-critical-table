// Varianti del dado: solo palette dei materiali. La geometria del .glb
// resta la stessa, e sfondo/fog/luci della scena restano sulla palette
// classica del sito (cfr. D20Scene `Canvas`). Cambia *solo* il dado.
//
// Slot logici (matching su mat.name.includes(...)):
//   Iron    → corpo principale del dado (la massa visibile)
//   Onyx    → smussi del bevel (sottile)
//   Crimson → numerali estrusi
//   Steel   → faccia 20 (singolo accento)

export type SlotKey = "Iron" | "Onyx" | "Crimson" | "Steel";

export type SlotConfig = {
  color: string;
  roughness: number;
  metalness: number;
  emissive?: number;
};

export type DiceVariant = {
  id: string;
  label: string;
  slots: Record<SlotKey, SlotConfig>;
};

export const DICE_VARIANTS: readonly DiceVariant[] = [
  {
    id: "classic",
    label: "Classico",
    slots: {
      Iron:    { color: "#1C2028", roughness: 0.5,  metalness: 0.0 },
      Onyx:    { color: "#111318", roughness: 0.6,  metalness: 0.0 },
      Crimson: { color: "#C0392B", roughness: 0.3,  metalness: 0.1, emissive: 0.08 },
      Steel:   { color: "#3A4150", roughness: 0.35, metalness: 0.4 },
    },
  },
  {
    id: "tropicale",
    label: "Tropicale",
    slots: {
      Iron:    { color: "#0E8C5A", roughness: 0.42, metalness: 0.05 },
      Onyx:    { color: "#074D33", roughness: 0.55, metalness: 0.0 },
      Crimson: { color: "#FFC247", roughness: 0.28, metalness: 0.15, emissive: 0.12 },
      Steel:   { color: "#FF7A5A", roughness: 0.32, metalness: 0.25 },
    },
  },
  {
    id: "confetto",
    label: "Confetto",
    slots: {
      Iron:    { color: "#9477D6", roughness: 0.7,  metalness: 0.0 },
      Onyx:    { color: "#6F52A8", roughness: 0.75, metalness: 0.0 },
      Crimson: { color: "#FFFFFF", roughness: 0.55, metalness: 0.0 },
      Steel:   { color: "#F5C9E0", roughness: 0.65, metalness: 0.0 },
    },
  },
  {
    id: "metallico",
    label: "Metallico",
    slots: {
      Iron:    { color: "#C9C9CE", roughness: 0.18, metalness: 0.85 },
      Onyx:    { color: "#8E8E96", roughness: 0.25, metalness: 0.80 },
      Crimson: { color: "#2A2A30", roughness: 0.40, metalness: 0.40 },
      Steel:   { color: "#B89860", roughness: 0.22, metalness: 0.90 },
    },
  },
  {
    id: "notturno",
    label: "Notturno",
    slots: {
      Iron:    { color: "#1A2557", roughness: 0.40, metalness: 0.15 },
      Onyx:    { color: "#0E1738", roughness: 0.50, metalness: 0.00 },
      Crimson: { color: "#E8E5FF", roughness: 0.30, metalness: 0.00, emissive: 0.15 },
      Steel:   { color: "#FFD27A", roughness: 0.30, metalness: 0.40 },
    },
  },
] as const;

export const DEFAULT_VARIANT_ID = "classic";

export function getVariant(id: string): DiceVariant {
  return DICE_VARIANTS.find((v) => v.id === id) ?? DICE_VARIANTS[0];
}
