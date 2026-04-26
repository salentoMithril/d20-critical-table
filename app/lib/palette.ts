export const PALETTE = {
  Onyx: "#111318",
  Iron: "#1C2028",
  Steel: "#3A4150",
  Crimson: "#C0392B",
} as const;

export type PaletteKey = keyof typeof PALETTE;
