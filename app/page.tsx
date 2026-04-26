import D20Scene from "./components/D20Scene";
import SnapPager from "./components/SnapPager";
import SectionNav from "./components/SectionNav";
import RollButton from "./components/RollButton";
import TextOverlays from "./components/TextOverlays";
import DiceVariantPicker from "./components/DiceVariantPicker";
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
    </>
  );
}
