<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — start Next.js dev server (port 3000)
- `npm run build` — production build
- `npm run start` — serve production build

There is no test runner, linter, or formatter wired up. Don't invent one.

## Architecture

A single-page scroll-driven D20 showcase. Three layers, each with a tight contract.

### 1. Asset pipeline — `/tmp/rebuild_d20.py` (Blender headless)

Outputs that **must** be regenerated together in a single deterministic pass:
- `public/d20.glb` — the icosphere mesh, beveled, decimated, with 4 material slots (`Iron`, `Onyx`, `Steel`, `Crimson`).
- `public/d20-faces.json` — map from digit `"1"`–`"20"` to a placement quaternion `[x, y, z, w]`.

The JSON entry for digit N is captured **at the exact moment** the digit's text mesh is placed onto its face, before the join + decimate steps that would scramble polygon indices. The script then applies a Z-up→Y-up similarity transform `q_yup = R · q · R⁻¹` (with R = -90° around X) so the quaternions are usable in three.js / glTF coordinate space.

Do not edit the `.glb` and the `.json` independently — the digit→face mapping in the runtime depends on them being produced from the same Blender session. If the model needs changes, rerun the script.

### 2. State — `app/lib/sceneState.ts` (Zustand)

Single source of truth shared by the canvas, the snap-pager, and the UI:
- `active` (0–5) — current section/phase, driven by `SnapPager`.
- `rollResult` (`null` or 1–20) — set instantly by `startRoll()`; cleared via `resetRoll()`.

`zustand` is pulled in as a transitive dep via `@react-three/fiber`. If you start importing it directly, add it explicitly to `package.json` rather than relying on transitive resolution.

### 3. Scene — `app/components/D20Scene.tsx`

- `POSES[active]` defines per-section camera offset (`offX`, applied via `PerspectiveCamera.setViewOffset` so geometry/lights/shadows stay put), zoom (`camZ`), and target rotation. `POST_LAUNCH_POSE` overrides this once a roll has happened.
- Ambient drift (sine on rx, continuous ry, vertical bob on position.y) runs only when *not* post-launch.
- Result alignment formula: `resultQuat = Q_X90 · Q_N⁻¹`, where `Q_N` is the digit's quaternion from the JSON and `Q_X90` is +90° around X. This places face N perpendicular to the camera with the digit upright. If you change the export's up-axis or the placement convention in the Blender script, this formula has to move with it.
- `SLOT_CONFIG` is the palette-swap hook: material-name substring → `{color, roughness, metalness, emissive?}`. Recolouring is done in code, not baked into the asset.
- Damping uses the frame-rate-independent form `1 - exp(-λ·dt)` with `DAMP_LAMBDA = 2.0`, tuned against the SnapPager's ~720 ms CSS transition.

### 4. Snap pager — `app/components/SnapPager.tsx`

Custom wheel/touch/keyboard handler with a cooldown. Advancing past phase 2 is gated on `rollResult !== null` — that gate is the reason the "Lancia!" button is mandatory. Sections are siblings of a `translate3d` container; do not introduce native scroll inside sections, it would fight the pager.

### Component boundary

`app/page.tsx` is a server component but composes client components (`D20Scene`, `SnapPager`, `RollButton`, `SectionNav`) that each declare `"use client"`. Don't wrap them in `next/dynamic({ ssr: false })` from a server component — that combination is rejected by this Next.js version. The `"use client"` directive on the leaf is sufficient.
