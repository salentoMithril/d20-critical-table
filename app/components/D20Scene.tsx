"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PALETTE } from "@/app/lib/palette";
import { useSceneState } from "@/app/lib/sceneState";
import {
  DICE_VARIANTS,
  type DiceVariant,
  type SlotKey,
  getVariant,
} from "@/app/lib/diceVariants";

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
// rimpicciolisce per fare spazio ai dadi-satellite del party.
const MAIN_SCALE_DEFAULT = 0.85;
const MAIN_SCALE_PARTY = 0.42;
const mainScaleFor = (active: number) =>
  active === 5 ? MAIN_SCALE_PARTY : MAIN_SCALE_DEFAULT;

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

function D20() {
  const { scene } = useGLTF("/d20.glb");
  const cloned = useMemo(() => cloneSceneWithMaterials(scene), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  const rollResult = useSceneState((s) => s.rollResult);
  const variantId = useSceneState((s) => s.variantId);
  const [faceQuats, setFaceQuats] = useState<FaceQuats | null>(null);

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
      return;
    }

    const pose = POSES[active] ?? POSES[0];

    // Ambient drift: continua quando si è fermi su una sezione
    const targetX = pose.rx + Math.sin(t * 0.45) * 0.025;
    const targetY = pose.ry + t * 0.08;
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

    // Scale: si rimpicciolisce in sezione 5 per il "party shot".
    const targetScale = mainScaleFor(active);
    const newScale = THREE.MathUtils.damp(g.scale.x, targetScale, DAMP_LAMBDA, delta);
    g.scale.setScalar(newScale);
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

    refs.current.forEach((g, i) => {
      if (!g) return;
      const cfg = PARTY_DICE_CONFIG[i];
      // Spin continuo su due assi — varia per dado.
      g.rotation.y += cfg.spinY * delta;
      g.rotation.x += cfg.spinX * delta;
      // Bobbing: oscillazione verticale leggera attorno alla base.
      g.position.y = cfg.basePos[1] + Math.sin(t * 0.6 + cfg.bobPhase) * cfg.bobAmp;
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
      shadows
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
        <ContactShadows position={[0, -1.3, 0]} opacity={0.55} blur={2.2} far={3} />
        <Environment preset="warehouse" />
      </Suspense>
    </Canvas>
  );
}
