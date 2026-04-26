export type SectionMeta = readonly [label: string, value: string];

export type SectionData = {
  eyebrow: string;
  title: string;
  body: string;
  meta?: readonly SectionMeta[];
};

export const SECTIONS: readonly SectionData[] = [
  {
    eyebrow: "Open",
    title: "Roll the\noutcome.",
    body:
      "An object made for chance. Twenty equal faces, one final number, a single moment of decision.",
    meta: [
      ["Edition", "01 — Crimson"],
      ["Format", "glTF · 192 KB"],
    ],
  },
  {
    eyebrow: "Form",
    title: "Twenty\nequal faces.",
    body:
      "An icosahedron — the densest of the regular polyhedra. Each face an equilateral triangle, each vertex shared by five.",
    meta: [
      ["Faces", "20"],
      ["Vertices", "12 + bevels"],
      ["Geometry", "1.9k tris"],
      ["Symmetry", "Icosahedral"],
    ],
  },
  {
    eyebrow: "Edge",
    title: "Smoothed at\nevery vertex.",
    body:
      "Edges receive a 0.025 bevel in two segments. Enough to catch a highlight, not enough to soften the silhouette.",
    meta: [
      ["Bevel", "0.025"],
      ["Segments", "2"],
      ["Auto-smooth", "30°"],
      ["Material", "Onyx"],
    ],
  },
  {
    eyebrow: "Mark",
    title: "Numerals in\nlow relief.",
    body:
      "Each numeral is extruded a fraction of a millimetre — readable in raking light, invisible in silhouette.",
    meta: [
      ["Relief", "0.018"],
      ["Pairing", "Σ = 21"],
      ["Typeface", "Bfont"],
      ["Material", "Crimson"],
    ],
  },
  {
    eyebrow: "Cast",
    title: "Iron, Onyx,\nSteel, Crimson.",
    body:
      "Four materials, four roles. Each face of the die is mapped to one slot — swap the palette in code without touching the geometry.",
    meta: [
      ["Onyx", "#111318"],
      ["Iron", "#1C2028"],
      ["Steel", "#3A4150"],
      ["Crimson", "#C0392B"],
    ],
  },
  {
    eyebrow: "Throw",
    title: "Yours\nto roll.",
    body:
      "Drop the die into your scene. Three lines of three.js — colour, light, and a verdict between one and twenty.",
    meta: [
      ["Loader", "GLTFLoader"],
      ["Renderer", "WebGL · R3F"],
      ["License", "MIT"],
    ],
  },
] as const;
