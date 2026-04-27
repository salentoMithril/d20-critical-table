import D20Scene from "./components/D20Scene";
import SnapPager from "./components/SnapPager";
import SectionNav from "./components/SectionNav";
import RollButton from "./components/RollButton";
import TextOverlays from "./components/TextOverlays";
import DiceVariantPicker from "./components/DiceVariantPicker";
import Preloader from "./components/Preloader";
import { SECTIONS } from "./lib/sections";
import { PALETTE } from "./lib/palette";

export default function Home() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: PALETTE.Onyx }}
      >
        <D20Scene />
      </div>

      <TextOverlays />
      <SectionNav />
      <RollButton />
      <DiceVariantPicker />

      <SnapPager count={SECTIONS.length}>
        {SECTIONS.map((_, i) => (
          <section
            key={i}
            className="h-dvh w-full pointer-events-auto"
            aria-label={`Section ${i + 1}`}
          />
        ))}
      </SnapPager>

      {/* Preloader sopra a tutto: copre 2.5s perché GLB + env HDR + faces
          JSON + build Canvas2D delle carte montino dietro. Allo svanire,
          la scena è già nella sua pose di fase 0. */}
      <Preloader />
    </>
  );
}
