"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useSceneState } from "@/app/lib/sceneState";

const TRANSITION_MS = 720;
const COOLDOWN_MS = 880;
const WHEEL_THRESHOLD = 12;
const TOUCH_THRESHOLD = 36;

export default function SnapPager({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  const active = useSceneState((s) => s.active);
  const setActive = useSceneState((s) => s.setActive);
  const setCount = useSceneState((s) => s.setCount);
  const cooldown = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    setCount(count);
  }, [count, setCount]);

  useEffect(() => {
    const advance = (dir: 1 | -1) => {
      if (cooldown.current) return;
      const state = useSceneState.getState();
      const current = state.active;
      // Gate: avanzare oltre la fase 2 richiede un lancio.
      if (dir === 1 && current === 2 && state.rollResult === null) return;
      const next = Math.max(0, Math.min(count - 1, current + dir));
      if (next === current) return;
      setActive(next);
      cooldown.current = true;
      window.setTimeout(() => {
        cooldown.current = false;
      }, COOLDOWN_MS);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      advance(e.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > TOUCH_THRESHOLD) advance(dy > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || k === " ") {
        e.preventDefault();
        advance(1);
      } else if (k === "ArrowUp" || k === "PageUp") {
        e.preventDefault();
        advance(-1);
      } else if (k === "Home") {
        e.preventDefault();
        setActive(0);
      } else if (k === "End") {
        e.preventDefault();
        setActive(count - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [count, setActive]);

  return (
    <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
      <div
        className="will-change-transform h-full"
        style={{
          transform: `translate3d(0, -${active * 100}vh, 0)`,
          transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.7, 0, 0.2, 1)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
