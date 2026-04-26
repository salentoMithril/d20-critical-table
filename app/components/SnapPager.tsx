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
      // Sezione 2: scroll-back con un risultato a video → resetta e RESTA in
      // sezione 2. La sezione del lancio e' importante e non va abbandonata
      // dopo un singolo roll. Un secondo scroll-back, dopo il reset, navigherà
      // normalmente a sezione 1.
      if (dir === -1 && current === 2 && state.rollResult !== null) {
        state.resetRoll();
        cooldown.current = true;
        window.setTimeout(() => {
          cooldown.current = false;
        }, COOLDOWN_MS);
        return;
      }
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

    // Trova l'antenato più vicino marcato come scroll-interno *che ha
    // contenuto effettivamente scrollabile*. Su desktop il container
    // mobile non esiste o non scrolla → ritorna null → handler invariato.
    // Su mobile, quando il container ha overflow, ritorna l'elemento e
    // delegheremo lo scroll nativo finché l'utente non raggiunge un bordo.
    const findScrollableAncestor = (target: EventTarget | null): HTMLElement | null => {
      const el = (target as Element | null)?.closest?.("[data-internal-scroll]") as HTMLElement | null;
      if (!el) return null;
      return el.scrollHeight > el.clientHeight + 1 ? el : null;
    };

    let touchScroller: HTMLElement | null = null;

    // Anti-spillover: dopo un page-advance via wheel, blocca la rotta
    // verso lo scroll interno finché il gesto del trackpad/mouse non
    // si esaurisce. Una "scrollata lunga" emette molti wheel event in
    // sequenza: senza il lock, dopo che la cooldown del pager scade, i
    // wheel residui finirebbero a scorrere il contenuto della nuova
    // sezione. Il lock si rinfresca a ogni wheel event nella finestra,
    // così resta vivo per tutta la durata dell'inertia, e si chiude
    // naturalmente dopo POST_WHEEL_GAP_MS di silenzio.
    const POST_ADVANCE_LOCK_MS = COOLDOWN_MS;
    const POST_WHEEL_GAP_MS = 200;
    let scrollLockUntil = 0;
    const isLocked = (now: number) => now < scrollLockUntil;

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();

      if (isLocked(now)) {
        // Continuazione del gesto post-advance: divora l'evento, rinfresca
        // il lock, e lascia che la cooldown del pager gestisca eventuali
        // advance ulteriori (per chi vuole scrollare di più sezioni in fila).
        e.preventDefault();
        scrollLockUntil = Math.max(scrollLockUntil, now + POST_WHEEL_GAP_MS);
        if (Math.abs(e.deltaY) >= WHEEL_THRESHOLD) {
          advance(e.deltaY > 0 ? 1 : -1);
        }
        return;
      }

      const scroller = findScrollableAncestor(e.target);
      if (scroller) {
        const atTop = scroller.scrollTop <= 0;
        const atBottom =
          scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
        // Boundary forwarding: se non siamo al limite nella direzione del
        // wheel, lascia che lo scroll nativo se ne occupi.
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
          return;
        }
        // Al limite: caduta nel pager. preventDefault per simmetria col
        // ramo standard (evita doppio bounce su iOS).
      }
      e.preventDefault();
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;

      const before = useSceneState.getState().active;
      advance(e.deltaY > 0 ? 1 : -1);
      const after = useSceneState.getState().active;
      if (after !== before) {
        scrollLockUntil = now + POST_ADVANCE_LOCK_MS;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      // Se siamo nella finestra di lock post-advance, ignora lo scroller
      // anche se il dito atterra dentro la colonna: questo gesto è
      // spillover della transizione, non vera intent di scroll.
      touchScroller = isLocked(performance.now())
        ? null
        : findScrollableAncestor(e.target);
    };
    const onTouchMove = (e: TouchEvent) => {
      // Dentro a uno scroll interno: non bloccare il touchmove, così iOS
      // può fare il suo scroll nativo (incluso il momentum).
      if (touchScroller) return;
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const now = performance.now();
      const advanceAndLock = (dir: 1 | -1) => {
        const before = useSceneState.getState().active;
        advance(dir);
        const after = useSceneState.getState().active;
        if (after !== before) {
          scrollLockUntil = now + POST_ADVANCE_LOCK_MS;
        }
      };
      if (touchScroller) {
        const atTop = touchScroller.scrollTop <= 0;
        const atBottom =
          touchScroller.scrollTop + touchScroller.clientHeight >=
          touchScroller.scrollHeight - 1;
        const swipeUp = dy > TOUCH_THRESHOLD; // dito verso l'alto → next
        const swipeDown = dy < -TOUCH_THRESHOLD; // dito verso il basso → prev
        if (swipeUp && atBottom) advanceAndLock(1);
        else if (swipeDown && atTop) advanceAndLock(-1);
        touchScroller = null;
        return;
      }
      if (Math.abs(dy) > TOUCH_THRESHOLD) advanceAndLock(dy > 0 ? 1 : -1);
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
          transform: `translate3d(0, -${active * 100}dvh, 0)`,
          transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.7, 0, 0.2, 1)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
