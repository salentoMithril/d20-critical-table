"use client";

import { useSceneState } from "@/app/lib/sceneState";
import { PALETTE } from "@/app/lib/palette";

export default function SectionNav() {
  const active = useSceneState((s) => s.active);
  const count = useSceneState((s) => s.count);
  const setActive = useSceneState((s) => s.setActive);

  const goTo = (i: number) => setActive(i);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 pointer-events-auto"
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to section ${i + 1}`}
            className="group relative grid place-items-center w-6 h-6"
          >
            <span
              className="block rounded-full transition-all duration-500 ease-out"
              style={{
                width: isActive ? "10px" : "5px",
                height: isActive ? "10px" : "5px",
                backgroundColor: isActive ? PALETTE.Crimson : "#3A4150",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
