"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "@/app/lib/palette";
import { useSceneState } from "@/app/lib/sceneState";
import {
  DICE_VARIANTS,
  type DiceVariant,
  type SlotKey,
  getVariant,
} from "@/app/lib/diceVariants";
// I builder vivono nella sandbox `app/cards/`: stessa firma per le 3 carte
// (magic/pokemon/yugioh), aliasata qui per montarle come trio.
import { buildCardTextures as buildMagicTextures } from "@/app/cards/src/magicCard.js";
import { buildCardTextures as buildPokemonTextures } from "@/app/cards/src/pokemonCard.js";
import { buildCardTextures as buildYugiohTextures } from "@/app/cards/src/yugiohCard.js";

const SLOT_KEYS: readonly SlotKey[] = ["Iron", "Onyx", "Crimson", "Steel"];

// Clona la scena GLB E i suoi material. `Object3D.clone(true)` deep-clona
// solo i nodi: i material restano condivisi tra i cloni, quindi ogni dado
// (main + 4 satelliti) finirebbe con la stessa palette. Cloniamo qui i
// material — uno per istanza — per poter dipingere ciascun dado
// indipendentemente.
function cloneSceneWithMaterials(source: THREE.Object3D): THREE.Object3D {
  const cloned = source.clone(true);
  cloned.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      mesh.material = mat.map((m) => m.clone());
    } else if (mat) {
      mesh.material = (mat as THREE.Material).clone();
    }
  });
  return cloned;
}

function applyPalette(root: THREE.Object3D, variant: DiceVariant) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const slotKey = SLOT_KEYS.find((k) => mat.name.includes(k));
    if (!slotKey) return;
    const cfg = variant.slots[slotKey];
    mat.color.set(cfg.color);
    mat.roughness = cfg.roughness;
    mat.metalness = cfg.metalness;
    if (cfg.emissive) {
      mat.emissive = new THREE.Color(cfg.color);
      mat.emissiveIntensity = cfg.emissive;
    } else {
      // Pulisci eventuali emissive ereditati dalla variante precedente.
      mat.emissive = new THREE.Color(0, 0, 0);
      mat.emissiveIntensity = 0;
    }
    mat.needsUpdate = true;
  });
}

// Pose per sezione.
//   offX  shift orizzontale del viewport (+ destra, − sinistra, 0 centro)
//   camZ  distanza camera (più piccolo = più zoom)
//   rx/ry/rz  rotazione target del dado (Y cumulativa per la storia visiva)
type Pose = { offX: number; camZ: number; rx: number; ry: number; rz: number };

const CAM_FAR = 5.2;   // distanza standard
const CAM_NEAR = 3.4;  // zoom-in ravvicinato

const POSES: Pose[] = [
  { offX:  0.22, camZ: CAM_FAR,  rx:  0.18, ry: 0.0,            rz:  0.0  }, // 1 — Open  (dx)
  { offX: -0.22, camZ: CAM_FAR,  rx: -0.22, ry: Math.PI * 0.55, rz:  0.18 }, // 2 — Form  (sx)
  { offX:  0.0,  camZ: CAM_NEAR, rx:  0.32, ry: Math.PI * 1.10, rz: -0.20 }, // 3 — Edge  (centro + zoom)
  { offX:  0.24, camZ: CAM_FAR,  rx: -0.10, ry: Math.PI * 1.70, rz:  0.18 }, // 4 — Tag explainer (dx, drift)
  { offX: -0.22, camZ: CAM_FAR,  rx:  0.40, ry: Math.PI * 2.30, rz: -0.18 }, // 5 — Download CTA (sx)
  { offX:  0.0,  camZ: 6.6,      rx:  0.15, ry: Math.PI * 3.00, rz:  0.0  }, // 6 — Party (centro, zoom out)
];

// Scale del dado principale per sezione (default 0.85). In sezione 5 si
// rimpicciolisce per fare spazio ai dadi-satellite del party. Nelle
// "card phases" (1 e 3) il dado si annulla completamente per lasciare
// il posto al ventaglio di carte (vedi CardFan).
const MAIN_SCALE_DEFAULT = 0.85;
const MAIN_SCALE_PARTY = 0.42;

// Le fasi in cui le carte sono in scena (e quindi il dado si nasconde
// con scale + fade). Centralizzate qui così opacity, scale, gate del
// click e shuffle della mano restano allineate.
const CARD_PHASES: ReadonlySet<number> = new Set([1, 3]);
const isCardPhase = (active: number) => CARD_PHASES.has(active);

const mainScaleFor = (active: number) => {
  if (isCardPhase(active)) return 0;
  if (active === 5) return MAIN_SCALE_PARTY;
  return MAIN_SCALE_DEFAULT;
};

// Dadi-satellite di sezione 5. Posizioni distribuite negli angoli del frame
// per non collidere con la headline centrata. Ogni dado ha velocita' di spin
// e ampiezza di bobbing diverse cosi' la scena non sembra coreografata.
const PARTY_DICE_CONFIG: ReadonlyArray<{
  basePos: [number, number, number];
  scale: number;
  spinX: number;
  spinY: number;
  bobAmp: number;
  bobPhase: number;
}> = [
  { basePos: [-1.95,  0.95, -0.30], scale: 0.42, spinX:  0.45, spinY:  0.65, bobAmp: 0.09, bobPhase: 0.0 },
  { basePos: [ 2.05,  0.70,  0.20], scale: 0.45, spinX: -0.55, spinY: -0.50, bobAmp: 0.07, bobPhase: 1.3 },
  { basePos: [-1.70, -1.05,  0.25], scale: 0.40, spinX:  0.60, spinY:  0.40, bobAmp: 0.10, bobPhase: 2.4 },
  { basePos: [ 1.85, -0.95, -0.20], scale: 0.43, spinX: -0.40, spinY:  0.55, bobAmp: 0.08, bobPhase: 3.7 },
];

// Sincronizzato con la transizione CSS del SnapPager (~720ms)
const DAMP_LAMBDA = 2.0;

// Fade dell'opacity più aggressivo dello scale: il dado deve sparire
// quasi del tutto a metà transizione, così non si vede una versione
// rimpicciolita-ma-ancora-presente che cozza con l'ingresso del ventaglio.
// λ=6 ⇒ ~95% in ~500ms, ~83% in 300ms.
const OPACITY_DAMP_LAMBDA = 6.0;

// Animazione di lancio: ~2.5s di spin, poi convergenza naturale sulla faccia.
// Si integra una velocità angolare composta da:
//   (a) spin attorno a un asse casuale, ease-out a 0 entro ROLL_DURATION;
//   (b) una "correzione" che punta a `resultQuat` con forza crescente.
// Niente blend frame-by-frame tra orientamenti in rotazione → nessuna
// discontinuità quando il dado attraversa l'antipode del target.
const ROLL_DURATION = 2.5;        // s, finestra in cui spin → 0
const SPIN_PEAK_SPEED = 10;       // rad/s, all'avvio (decay quadratico → 0)
const CORR_K_MIN = 0.4;           // forza correzione iniziale
const CORR_K_MAX = 6.0;           // forza correzione a regime (settle τ ≈ 0.17s)

// Pose dopo il lancio (su fase 2): dado leggermente più piccolo e a sinistra.
// La rotazione è gestita da `resultQuat` (faccia perpendicolare al viewport).
const POST_LAUNCH_POSE: Pose = {
  offX: -0.22,
  camZ: 6.0,
  rx: 0.0,
  ry: 0.0,
  rz: 0.0,
};

const smoothstep = (x: number) => x * x * (3 - 2 * x);

const isPostLaunch = (active: number, rollResult: number | null) =>
  active === 2 && rollResult !== null;

// Avvicina `target` a `current` modulo 2π così il damping prende
// la strada angolare più breve invece di "srotolarsi" indietro.
function nearestAngle(current: number, target: number): number {
  const TAU = Math.PI * 2;
  let diff = ((target - current) % TAU + TAU) % TAU;
  if (diff > Math.PI) diff -= TAU;
  return current + diff;
}

type FaceQuats = Record<string, [number, number, number, number]>;

// Q_target_N = Q_X90 · Q_N⁻¹ porta la faccia N esattamente perpendicolare
// alla camera (normale = +Z mondo) con il digit dritto (up = +Y mondo).
// Q_X90 = +90° attorno a X compensa il fatto che, dopo l'export Y-up,
// la "track axis" del placement è (0, 1, 0)_three e non (0, 0, 1)_three.
const Q_X90 = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  Math.PI / 2
);

// Desktop-only hover: il media query `(hover: hover) and (pointer: fine)`
// esclude touch e device dove l'hover è simulato/non affidabile.
// Aggiungiamo `(min-width: 640px)` (= breakpoint sm del layout) così su
// viewport mobile l'effetto resta off anche su device ibridi che
// riportano hover/pointer fine ma sono oggettivamente in form factor
// mobile (es. tablet con stylus, finestra browser ristretta).
function useDesktopHoverCapable(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 640px)"
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return enabled;
}

// Sezioni in cui l'hover sul dado è attivo (desktop).
const HOVER_ACTIVE_SECTIONS: ReadonlySet<number> = new Set([0, 1]);
const HOVER_EXTRA_SPIN = 1.2;     // rad/s aggiunti alla deriva Y mentre in hover
const HOVER_PULSE_HZ = 0.9;       // pulsazione scala ~0.9 Hz
const HOVER_PULSE_AMP = 0.025;    // ±2.5% sulla scala base — sussulto, non rimbalzo
const HOVER_ENV_LAMBDA = 4.0;     // ~250ms per entrare/uscire dall'hover

function D20() {
  const { scene } = useGLTF("/d20.glb");
  const cloned = useMemo(() => cloneSceneWithMaterials(scene), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const rollResult = useSceneState((s) => s.rollResult);
  const variantId = useSceneState((s) => s.variantId);
  const [faceQuats, setFaceQuats] = useState<FaceQuats | null>(null);

  const isDesktopHover = useDesktopHoverCapable();
  const hoveredRef = useRef(false);
  const hoverEnvRef = useRef(0);
  const hoverYOffsetRef = useRef(0);
  const baseScaleRef = useRef(MAIN_SCALE_DEFAULT);
  // Fade material-level: in fase 1 il dado svanisce mentre lo scale collassa;
  // riappare con fade-in nelle altre fasi. transparent=true è settato una
  // sola volta al clone — applyPalette non lo tocca, quindi sopravvive ai
  // cambi di variante.
  const opacityRef = useRef(1);
  // Cursore in pixel; null se uscito dal viewport. Il raycast effettivo
  // avviene in useFrame (cap a frame-rate, niente lavoro per ogni mousemove).
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  // Listener su window perché il wrapper del Canvas è `pointer-events-none`
  // (gli overlay del SnapPager devono restare cliccabili sopra la scena).
  // pointermove arriva comunque a livello document, indipendentemente da
  // pointer-events sui sotto-alberi.
  useEffect(() => {
    if (!isDesktopHover) return;
    const onMove = (e: PointerEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      cursorRef.current = null;
      hoveredRef.current = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [isDesktopHover]);

  // Stato dell'animazione di lancio. Si arma sul fronte di rollResult
  // (transizione null→N o cambio di N) e si resetta su resetRoll().
  // `lastRollRef` evita di ri-animare se l'utente esce e rientra in fase 2.
  const rollStartRef = useRef<number | null>(null);
  const spinAxisRef = useRef<THREE.Vector3 | null>(null);
  const lastRollRef = useRef<number | null>(null);

  useEffect(() => {
    if (rollResult === null) {
      rollStartRef.current = null;
      spinAxisRef.current = null;
      lastRollRef.current = null;
    }
  }, [rollResult]);

  useEffect(() => {
    applyPalette(cloned, getVariant(variantId));
  }, [cloned, variantId]);

  // Abilita la transparency una volta sola sul clone del main D20.
  // Resta a opacity=1 a riposo, quindi visivamente è identico all'opaco;
  // serve solo perché il damping per-frame possa effettivamente fadare.
  useEffect(() => {
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        (m as THREE.Material).transparent = true;
      });
    });
  }, [cloned]);

  useEffect(() => {
    fetch("/d20-faces.json")
      .then((r) => r.json())
      .then((data: FaceQuats) => setFaceQuats(data))
      .catch(() => {});
  }, []);

  // Quaternione target: faccia N perpendicolare al viewport, digit dritto.
  const resultQuat = useMemo(() => {
    if (!faceQuats || rollResult === null) return null;
    const target = faceQuats[String(rollResult)];
    if (!target) return null;
    const Q_N = new THREE.Quaternion().fromArray(target);
    return Q_X90.clone().multiply(Q_N.invert());
  }, [faceQuats, rollResult]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const { active } = useSceneState.getState();
    const t = state.clock.elapsedTime;

    // Fade in/out del dado (entra/esce dalle card phases 1 e 3). Calcolato
    // prima dei rami così resta corretto anche in post-launch — altrimenti
    // l'early return del ramo post-launch congelerebbe l'opacity all'ultimo
    // valore della fase 1 (≈0) per chi entra in fase 2 e preme Lancia subito.
    const targetOpacity = isCardPhase(active) ? 0 : 1;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      targetOpacity,
      OPACITY_DAMP_LAMBDA,
      delta
    );
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        (m as THREE.Material).opacity = opacityRef.current;
      });
    });

    // Scale base sezione-per-sezione: damp prima dei rami così anche il
    // ramo post-launch (early return) lo apply al mesh — altrimenti,
    // tornando in fase 2 da fase 3 con rollResult≠null, la scala restava
    // congelata a 0 (mainScaleFor(3)=0) e il dado non riappariva.
    baseScaleRef.current = THREE.MathUtils.damp(
      baseScaleRef.current,
      mainScaleFor(active),
      DAMP_LAMBDA,
      delta
    );

    // Post-launch: integra ω = ω_spin + ω_corr.
    // Lo spin decade ease-out a 0 in ROLL_DURATION; la correzione cresce
    // smoothstep fino a CORR_K_MAX e converge il dado sulla faccia in modo
    // asintotico. L'orientamento è una funzione continua del tempo: nessun
    // salto neanche quando attraversa l'antipode del target.
    if (isPostLaunch(active, rollResult) && resultQuat) {
      const newRoll = lastRollRef.current !== rollResult;
      if (newRoll) {
        rollStartRef.current = t;
        lastRollRef.current = rollResult;
        spinAxisRef.current = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize();
      }
      const elapsed = t - (rollStartRef.current ?? t);
      const u = Math.min(1, elapsed / ROLL_DURATION);
      const oneMinusU = 1 - u;

      const spinSpeed = SPIN_PEAK_SPEED * oneMinusU * oneMinusU;

      // Q_delta = resultQuat · current⁻¹  →  applicato a sinistra ruota
      // l'orientamento attuale verso il target lungo l'arco minimo.
      const qInv = g.quaternion.clone().invert();
      const qDelta = new THREE.Quaternion().multiplyQuaternions(resultQuat, qInv);
      if (qDelta.w < 0) {
        qDelta.x = -qDelta.x;
        qDelta.y = -qDelta.y;
        qDelta.z = -qDelta.z;
        qDelta.w = -qDelta.w;
      }
      const corrAngle = 2 * Math.acos(THREE.MathUtils.clamp(qDelta.w, -1, 1));
      const corrAxis = new THREE.Vector3(0, 1, 0);
      if (corrAngle > 1e-6) {
        const s = Math.sqrt(Math.max(1 - qDelta.w * qDelta.w, 1e-12));
        corrAxis.set(qDelta.x / s, qDelta.y / s, qDelta.z / s);
      }
      const k = THREE.MathUtils.lerp(CORR_K_MIN, CORR_K_MAX, smoothstep(u));

      const omega = corrAxis.multiplyScalar(corrAngle * k);
      if (spinSpeed > 1e-4 && spinAxisRef.current) {
        omega.addScaledVector(spinAxisRef.current, spinSpeed);
      }
      const omegaMag = omega.length();
      if (omegaMag > 1e-8) {
        const angle = omegaMag * delta;
        const axis = omega.divideScalar(omegaMag);
        const dq = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        g.quaternion.premultiply(dq).normalize();
      }

      g.position.y = THREE.MathUtils.damp(g.position.y, 0, DAMP_LAMBDA, delta);
      // Apply scale dentro il post-launch (no pulse: hover non si applica
      // qui). Senza questa riga, la scala resta a quanto valeva al frame
      // precedente — bug visibile rientrando in fase 2 da fase 3.
      g.scale.setScalar(baseScaleRef.current);
      return;
    }

    const pose = POSES[active] ?? POSES[0];

    // Hover envelope: 0..1, sale solo se in sezione abilitata + desktop.
    // L'envelope è usato come moltiplicatore continuo per spin extra e pulsazione,
    // così entrata/uscita sono morbide e non c'è bisogno di stati discreti.
    const canHover = isDesktopHover && HOVER_ACTIVE_SECTIONS.has(active);
    if (canHover && cursorRef.current) {
      // Raycast manuale: il Canvas ha pointer-events:none → R3F non riceve
      // eventi di hover. Tracciamo noi un raggio dal cursore e contiamo come
      // hover qualsiasi intersezione col gruppo del dado.
      ndc.x = (cursorRef.current.x / window.innerWidth) * 2 - 1;
      ndc.y = -(cursorRef.current.y / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      hoveredRef.current = raycaster.intersectObject(g, true).length > 0;
    } else if (!canHover) {
      hoveredRef.current = false;
    }
    const targetEnv = canHover && hoveredRef.current ? 1 : 0;
    hoverEnvRef.current = THREE.MathUtils.damp(
      hoverEnvRef.current,
      targetEnv,
      HOVER_ENV_LAMBDA,
      delta
    );
    const env = hoverEnvRef.current;

    // Spin extra: si accumula in un offset cumulativo sommato a pose.ry, così
    // quando l'env decade non c'è uno scatto all'indietro — il dado mantiene
    // l'angolo guadagnato e la deriva normale riparte da lì.
    hoverYOffsetRef.current += HOVER_EXTRA_SPIN * env * delta;

    // Ambient drift: continua quando si è fermi su una sezione
    const targetX = pose.rx + Math.sin(t * 0.45) * 0.025;
    const targetY = pose.ry + t * 0.08 + hoverYOffsetRef.current;
    const targetZ = pose.rz;

    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, DAMP_LAMBDA, delta);
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      nearestAngle(g.rotation.y, targetY),
      DAMP_LAMBDA,
      delta
    );
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, targetZ, DAMP_LAMBDA, delta);

    g.position.y = Math.sin(t * 0.7) * 0.045;

    // Scale: la base è già stata dampata in cima al frame (necessario
    // perché anche il ramo post-launch la legga). Qui sovrapponiamo solo
    // la pulsazione hover, che è già modulata da `env` ⇒ niente ulteriori
    // filtri che la appiattirebbero.
    const pulse = Math.sin(t * Math.PI * 2 * HOVER_PULSE_HZ) * HOVER_PULSE_AMP * env;
    g.scale.setScalar(baseScaleRef.current * (1 + pulse));
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={MAIN_SCALE_DEFAULT}>
      <primitive object={cloned} />
    </group>
  );
}

// Sezione 5: 4 dadi-satellite scattered che ruotano e ondeggiano.
// Spawn-in via scale 0 → cfg.scale quando active === 5; smaltimento simmetrico.
function PartyDice() {
  const { scene } = useGLTF("/d20.glb");
  // Ogni satellite ha la sua copia di mesh+material → palette indipendenti.
  const clones = useMemo(
    () => PARTY_DICE_CONFIG.map(() => cloneSceneWithMaterials(scene)),
    [scene]
  );
  const variantId = useSceneState((s) => s.variantId);

  // I satelliti rappresentano "le altre persone": le 4 varianti diverse
  // da quella scelta dal main D20. Mantenendo l'ordine di DICE_VARIANTS
  // l'assegnazione satellite→variante è deterministica e cambia solo
  // quando cambia la selezione (uno swap, non uno shuffle globale).
  const satelliteVariants = useMemo(
    () => DICE_VARIANTS.filter((v) => v.id !== variantId),
    [variantId]
  );

  useEffect(() => {
    clones.forEach((c, i) => {
      const v = satelliteVariants[i];
      if (v) applyPalette(c, v);
    });
  }, [clones, satelliteVariants]);

  const refs = useRef<Array<THREE.Group | null>>([]);

  useFrame((state, delta) => {
    const { active } = useSceneState.getState();
    const t = state.clock.elapsedTime;
    const partyOn = active === 5;

    // Adattamento per viewport stretti (portrait mobile/tablet). I satelliti
    // sono tarati per aspetto wide a x=±~2: con fov 30° e POSES[5].camZ=6.6
    // la metà altezza visibile a z=0 è ~1.77, quindi la metà larghezza è
    // 1.77 * aspect. Su 16:9 (1.78) → 3.15, satelliti a ±2 dentro. Su iPhone
    // portrait (~0.46) → 0.81, satelliti completamente fuori. Comprimo X
    // così che ogni satellite stia entro il 78% della metà-larghezza visibile.
    // Su desktop wide il calcolo restituisce xCompress = 1 → nessun cambio.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const halfFrustumX = 1.77 * aspect;
    const desiredHalfX = Math.min(2.05, halfFrustumX * 0.78);
    const xCompress = desiredHalfX / 2.05;

    refs.current.forEach((g, i) => {
      if (!g) return;
      const cfg = PARTY_DICE_CONFIG[i];
      // Spin continuo su due assi — varia per dado.
      g.rotation.y += cfg.spinY * delta;
      g.rotation.x += cfg.spinX * delta;
      // Posizione: X compressa per portrait; Y bobbing; Z fissa.
      g.position.x = cfg.basePos[0] * xCompress;
      g.position.y = cfg.basePos[1] + Math.sin(t * 0.6 + cfg.bobPhase) * cfg.bobAmp;
      g.position.z = cfg.basePos[2];
      // Pop-in / pop-out: scala da 0 al target con damping standard.
      const desired = partyOn ? cfg.scale : 0;
      const newScale = THREE.MathUtils.damp(g.scale.x, desired, DAMP_LAMBDA, delta);
      g.scale.setScalar(newScale);
    });
  });

  return (
    <>
      {PARTY_DICE_CONFIG.map((cfg, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={cfg.basePos}
          scale={0}
        >
          <primitive object={clones[i]} />
        </group>
      ))}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Card fan (sezione 1)
// ────────────────────────────────────────────────────────────────────────
//
// Tre carte (Magic / Pokémon / Yu-Gi-Oh!) montate sul world origin come
// "mano" a ventaglio. Vivono nello stesso punto del dado ⇒ il view-offset
// del CameraController le posiziona automaticamente come faceva con il
// D20 (in fase 1: a sinistra del viewport).
//
// Pop-in / pop-out gestito con damping standard sulla scala del root group:
// 0 → 1 quando active === 1, 1 → 0 altrove. Sincronizzato con lo
// scale-down del dado in mainScaleFor(1) === 0.
//
// I builder Canvas2D in `app/cards/src/*.js` sono pure DOM-side: si
// chiamano in useMemo lato client, una volta sola.

const CARD_TEX_W = 750;
const CARD_TEX_H = 1050;
const CARD_ASPECT = CARD_TEX_W / CARD_TEX_H; // ≈ 0.714
const CARD_W = 1.05;
const CARD_H = CARD_W / CARD_ASPECT;
const CARD_D = 0.025;
const CARD_RADIUS = 0.05;

const CARD_FAN_VISIBLE_SCALE = 1.0;

// Layout del ventaglio "mano di scopa": pivot sul bordo BASSO delle
// carte, fan che si apre verso l'alto. La rotazione attorno al pivot
// determina automaticamente x e y di ciascuna carta — non serve un
// dx/dy esplicito. La profondità di stacking (dz) NON è statica: viene
// guidata dalla selezione corrente (vedi CardFan) — la carta cliccata
// va davanti, le altre restano dietro con uno stagger stabile.
type FanSlot = {
  builder: () => { front: HTMLCanvasElement; back: HTMLCanvasElement };
  rotZ: number;
  // Offset Y permanente, sommato indipendentemente dalla posizione nello
  // stack. Lo slot centrale lo usa per "sporgere" sempre un po' sopra
  // le laterali — altrimenti, quando finisce in fondo allo stack, è
  // occluso dai bordi inferiori delle laterali (che convergono al pivot)
  // e diventa difficile colpirlo col raycast.
  slotYOffset: number;
};

// Ordine letto da sinistra a destra: Magic | Yu-Gi-Oh | Pokémon.
const CARD_FAN_LAYOUT: ReadonlyArray<FanSlot> = [
  { builder: buildMagicTextures,   rotZ: -0.32, slotYOffset: 0    },
  { builder: buildYugiohTextures,  rotZ:  0.00, slotYOffset: 0.08 },
  { builder: buildPokemonTextures, rotZ:  0.32, slotYOffset: 0    },
];

// Stack a tre livelli: top / middle / bottom. La posizione (non l'indice
// della carta) determina y-lift e z. Quando si clicca una carta:
//   - quella cliccata sale al livello top (lift massimo);
//   - tutte le altre scivolano di una posizione indietro nello stack.
// Niente più "casa fissa per indice" → niente più scatti delle carte
// sottostanti che tornano alla posizione originaria a ogni cambio.
//
// I delta tra livelli sono volutamente piccoli sull'asse Y (la mano
// resta compatta) e marcati sull'asse Z (l'occlusione resta chiara).
const STACK_Y_LIFT = [0.05, 0.022, 0.0];
const STACK_Z      = [0.10, 0.04,  0.0];
const SELECT_DAMP_LAMBDA = 5.0; // ~95% in 600ms — risposta al click reattiva

// Tinta sui material delle facce: l'illuminazione della scena (key
// directional 2.4 + warehouse env) stava lavando i fondi crema delle
// carte fino a schiacciare la leggibilità del testo. ~70% multiplier.
const CARD_FACE_TINT = 0xb0b0b0;

// Geometria face come rounded-rect (non un plane piatto): altrimenti i
// quattro angoli a 90° del PlaneGeometry sporgono fuori dalla curvatura
// del RoundedBoxGeometry sottostante e si vedono come "punte". UV
// rinormalizzate a [0,1] perché ShapeGeometry assegna UV = vertici raw.
function createRoundedFaceGeometry(
  w: number,
  h: number,
  r: number
): THREE.ShapeGeometry {
  const halfW = w / 2;
  const halfH = h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfW + r, -halfH);
  shape.lineTo(halfW - r, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
  shape.lineTo(halfW, halfH - r);
  shape.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
  shape.lineTo(-halfW + r, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
  shape.lineTo(-halfW, -halfH + r);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);

  const geom = new THREE.ShapeGeometry(shape, 12);
  const uvAttr = geom.attributes.uv;
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i);
    const v = uvAttr.getY(i);
    uvAttr.setXY(i, (u + halfW) / w, (v + halfH) / h);
  }
  uvAttr.needsUpdate = true;
  return geom;
}

// Una sola istanza condivisa fra tutte le carte: stessa shape, niente
// motivo di duplicare buffer geometry.
const CARD_FACE_GEOMETRY = createRoundedFaceGeometry(
  CARD_W,
  CARD_H,
  CARD_RADIUS
);

// Permutazione random di [0, 1, 2] (Fisher-Yates). Usato sia per lo
// stato iniziale che per il ri-shuffle ad ogni ingresso in card phase.
function shuffledStackOrder(): number[] {
  const arr = [0, 1, 2];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildCardMesh(
  builder: FanSlot["builder"],
  anisotropy: number
): THREE.Group {
  const { front, back } = builder();
  const frontTex = new THREE.CanvasTexture(front);
  const backTex = new THREE.CanvasTexture(back);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  backTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.anisotropy = anisotropy;
  backTex.anisotropy = anisotropy;

  const coreGeom = new RoundedBoxGeometry(CARD_W, CARD_H, CARD_D, 4, CARD_RADIUS);
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.7,
    metalness: 0.2,
  });
  const core = new THREE.Mesh(coreGeom, edgeMat);
  core.castShadow = true;
  core.receiveShadow = true;

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    color: CARD_FACE_TINT,
    roughness: 0.7,
    metalness: 0.1,
  });
  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    color: CARD_FACE_TINT,
    roughness: 0.7,
    metalness: 0.1,
  });
  const frontFace = new THREE.Mesh(CARD_FACE_GEOMETRY, frontMat);
  frontFace.position.z = CARD_D / 2 + 0.0008;
  const backFace = new THREE.Mesh(CARD_FACE_GEOMETRY, backMat);
  backFace.position.z = -CARD_D / 2 - 0.0008;
  backFace.rotation.y = Math.PI;

  const card = new THREE.Group();
  card.add(core, frontFace, backFace);
  return card;
}

function CardFan() {
  const { gl, camera } = useThree();
  // Costruisci i mesh una sola volta lato client. Le textures provengono
  // da builder Canvas2D ⇒ richiedono document, ma siamo in "use client".
  const cards = useMemo(
    () => {
      const aniso = gl.capabilities.getMaxAnisotropy();
      return CARD_FAN_LAYOUT.map((slot) => buildCardMesh(slot.builder, aniso));
    },
    // gl è stabile dopo il mount; rebuild non desiderato.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const rootRef = useRef<THREE.Group>(null);
  // Una ref per il group "innermost" di ogni carta — quello che porta la
  // posizione locale (0, CARD_H/2, dz). Il useFrame ne anima y e z in
  // base alla selezione.
  const cardSlotRefs = useRef<Array<THREE.Group | null>>([null, null, null]);

  // Ordine dello stack: indice 0 = top. L'ordine iniziale è quello
  // letto da CARD_FAN_LAYOUT, ma ogni volta che le carte tornano in
  // scena (entriamo in una card phase) viene rimescolato — vedi
  // l'effect più sotto. Niente Magic-on-top deterministico.
  const [stackOrder, setStackOrder] = useState<number[]>(() =>
    shuffledStackOrder()
  );

  // Reactive subscribe a `active` per: (a) gating del click handler,
  // (b) target di scale nel useFrame, (c) ri-shuffle quando entriamo
  // in una card phase. Il useFrame continua comunque a leggere `active`
  // via getState() per non dipendere dal closure stale tra render.
  const active = useSceneState((s) => s.active);

  useEffect(() => {
    if (isCardPhase(active)) {
      setStackOrder(shuffledStackOrder());
    }
  }, [active]);

  // Lookup: cardPositions[cardIndex] = posizione corrente nello stack.
  // Recalcolato solo quando lo stackOrder cambia → niente .indexOf in
  // useFrame.
  const cardPositions = useMemo(() => {
    const pos = [0, 0, 0];
    stackOrder.forEach((cardIdx, position) => {
      pos[cardIdx] = position;
    });
    return pos;
  }, [stackOrder]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  // Click handler: il canvas wrapper ha pointer-events:none (così gli
  // overlay del SnapPager restano cliccabili sopra), perciò R3F non
  // riceve gli onClick → ascolto window-level e raycast contro le carte.
  // Stesso approccio dell'hover del dado.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const { active } = useSceneState.getState();
      if (!isCardPhase(active)) return;
      // Solo click "primario": niente toggle accidentali su tasto destro
      // o pulsanti laterali del mouse.
      if (e.button !== undefined && e.button !== 0) return;

      ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);

      // intersectObject su ciascuna carta, separatamente: vince la più
      // vicina alla camera (gestisce automaticamente l'occlusione).
      let bestI = -1;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const hits = raycaster.intersectObject(c, true);
        if (hits.length > 0 && hits[0].distance < bestDist) {
          bestI = i;
          bestDist = hits[0].distance;
        }
      });
      if (bestI >= 0) {
        setStackOrder((prev) => {
          // Già in cima → nessuna mutazione, niente re-render inutile.
          if (prev[0] === bestI) return prev;
          // Promuove la cliccata a posizione 0; le altre conservano il
          // loro ordine relativo (chi era più sopra resta più sopra).
          return [bestI, ...prev.filter((c) => c !== bestI)];
        });
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [cards, camera, raycaster, ndc]);

  useFrame((state, delta) => {
    const g = rootRef.current;
    if (!g) return;
    const { active } = useSceneState.getState();
    const target = isCardPhase(active) ? CARD_FAN_VISIBLE_SCALE : 0;
    const next = THREE.MathUtils.damp(g.scale.x, target, DAMP_LAMBDA, delta);
    g.scale.setScalar(next);

    // Idle bob/sway leggero quando il ventaglio è visibile, così non
    // sembra incollato. Si attenua con la scala stessa per non far
    // ondeggiare un nulla durante il pop-out.
    const t = state.clock.elapsedTime;
    const env = next; // 0..1
    g.position.y = Math.sin(t * 0.6) * 0.05 * env;
    g.rotation.z = Math.sin(t * 0.4) * 0.025 * env;

    // Pop guidato dalla posizione nello stack (top/middle/bottom). La
    // top ha lift radiale (+y locale = "fuori dal ventaglio") e il z
    // più avanzato; middle ha valori intermedi; bottom resta a riposo.
    // Cambiando selezione cambia solo la posizione di stack di alcune
    // carte → nessuna torna a una "casa per indice" → niente scatti.
    cardSlotRefs.current.forEach((cg, i) => {
      if (!cg) return;
      const pos = cardPositions[i];
      const slot = CARD_FAN_LAYOUT[i];
      const targetY = CARD_H / 2 + STACK_Y_LIFT[pos] + slot.slotYOffset;
      const targetZ = STACK_Z[pos];
      cg.position.y = THREE.MathUtils.damp(cg.position.y, targetY, SELECT_DAMP_LAMBDA, delta);
      cg.position.z = THREE.MathUtils.damp(cg.position.z, targetZ, SELECT_DAMP_LAMBDA, delta);
    });
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]} scale={0}>
      {/* Pivot group: il bordo basso delle carte converge qui (y = -CARD_H/2
          rispetto al root). Ogni carta è ruotata attorno a questo punto e
          poi traslata di +CARD_H/2 sull'asse Y locale, così la sua base
          resta sul pivot e l'apertura va verso l'alto — mano di scopa. */}
      <group position={[0, -CARD_H / 2, 0]}>
        {CARD_FAN_LAYOUT.map((slot, i) => (
          <group key={i} rotation={[0, 0, slot.rotZ]}>
            <group
              ref={(el) => {
                cardSlotRefs.current[i] = el;
              }}
              position={[0, CARD_H / 2, 0]}
            >
              <primitive object={cards[i]} />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

useGLTF.preload("/d20.glb");

// Anima la projection matrix in base alla sezione attiva.
// `offX` positivo = dado a destra; negativo = sinistra.
// La geometria resta in (0,0,0): ombre, luci e collisioni non si spostano.
function CameraController() {
  const { camera, size } = useThree();
  const currentX = useRef(POSES[0].offX);
  const currentZ = useRef(POSES[0].camZ);

  // Stato della rampa post-launch (deterministica, allineata al D20).
  const rollStartRef = useRef<number | null>(null);
  const rollFromX = useRef(0);
  const rollFromZ = useRef(0);
  const lastRollRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    const { active, rollResult } = useSceneState.getState();
    const postLaunch = isPostLaunch(active, rollResult);

    if (postLaunch) {
      if (lastRollRef.current !== rollResult) {
        rollStartRef.current = state.clock.elapsedTime;
        lastRollRef.current = rollResult;
        rollFromX.current = currentX.current;
        rollFromZ.current = currentZ.current;
      }
      const elapsed = state.clock.elapsedTime - (rollStartRef.current ?? state.clock.elapsedTime);
      const u = Math.min(1, elapsed / ROLL_DURATION);
      const e = smoothstep(u);
      currentX.current = THREE.MathUtils.lerp(rollFromX.current, POST_LAUNCH_POSE.offX, e);
      currentZ.current = THREE.MathUtils.lerp(rollFromZ.current, POST_LAUNCH_POSE.camZ, e);
    } else {
      rollStartRef.current = null;
      lastRollRef.current = null;
      const pose = POSES[active] ?? POSES[0];
      currentX.current = THREE.MathUtils.damp(currentX.current, pose.offX, DAMP_LAMBDA, delta);
      currentZ.current = THREE.MathUtils.damp(currentZ.current, pose.camZ, DAMP_LAMBDA, delta);
    }

    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = currentZ.current;
    cam.setViewOffset(
      size.width,
      size.height,
      -currentX.current * size.width,
      0,
      size.width,
      size.height
    );
    cam.updateProjectionMatrix();
  });

  useEffect(() => {
    return () => {
      (camera as THREE.PerspectiveCamera).clearViewOffset();
      camera.updateProjectionMatrix();
    };
  }, [camera]);

  return null;
}

export default function D20Scene() {
  return (
    <Canvas
      // "percentage" = THREE.PCFShadowMap. Senza specificare il tipo, R3F
      // di default usa PCFSoftShadowMap che three.js ha deprecato (warn
      // a console + fallback automatico a PCFShadowMap, identico a
      // questo). Lo dichiariamo esplicitamente per zittire il warning.
      shadows="percentage"
      camera={{ position: [0, 0.4, 5.2], fov: 30 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[PALETTE.Onyx]} />
      <fog attach="fog" args={[PALETTE.Onyx, 6, 16]} />

      <CameraController />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-5, -1, -3]} intensity={0.6} color={PALETTE.Steel} />
      <pointLight position={[0, -2, 2]} intensity={0.6} color={PALETTE.Crimson} />

      <Suspense fallback={null}>
        <D20 />
        <PartyDice />
        <CardFan />
        <ContactShadows position={[0, -1.3, 0]} opacity={0.55} blur={2.2} far={3} />
        <Environment preset="warehouse" />
      </Suspense>
    </Canvas>
  );
}
