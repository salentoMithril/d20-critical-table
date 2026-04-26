"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PALETTE } from "@/app/lib/palette";
import { useSceneState } from "@/app/lib/sceneState";

const SLOT_CONFIG: Record<
  string,
  { color: string; roughness: number; metalness: number; emissive?: number }
> = {
  Iron: { color: PALETTE.Iron, roughness: 0.5, metalness: 0.0 },
  Onyx: { color: PALETTE.Onyx, roughness: 0.6, metalness: 0.0 },
  Crimson: { color: PALETTE.Crimson, roughness: 0.3, metalness: 0.1, emissive: 0.08 },
  Steel: { color: PALETTE.Steel, roughness: 0.35, metalness: 0.4 },
};

function applyPalette(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const slotKey = Object.keys(SLOT_CONFIG).find((k) => mat.name.includes(k));
    if (!slotKey) return;
    const cfg = SLOT_CONFIG[slotKey];
    mat.color.set(cfg.color);
    mat.roughness = cfg.roughness;
    mat.metalness = cfg.metalness;
    if (cfg.emissive) {
      mat.emissive = new THREE.Color(cfg.color);
      mat.emissiveIntensity = cfg.emissive;
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
  { offX: -0.22, camZ: CAM_FAR,  rx: -0.15, ry: Math.PI * 1.70, rz:  0.25 }, // 4 — Mark  (sx)
  { offX: -0.22, camZ: CAM_FAR,  rx:  0.40, ry: Math.PI * 2.30, rz: -0.18 }, // 5 — Cast  (sx)
  { offX: -0.22, camZ: CAM_FAR,  rx:  0.0,  ry: Math.PI * 3.00, rz:  0.0  }, // 6 — Throw (sx)
];

// Sincronizzato con la transizione CSS del SnapPager (~720ms)
const DAMP_LAMBDA = 2.0;

// Pose dopo il lancio (su fase 2): dado al centro, distanza standard, fermo.
// La rotazione è gestita da `resultQuat` (faccia perpendicolare al viewport).
const POST_LAUNCH_POSE: Pose = {
  offX: 0.0,
  camZ: CAM_FAR,
  rx: 0.0,
  ry: 0.0,
  rz: 0.0,
};

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
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  const rollResult = useSceneState((s) => s.rollResult);
  const [faceQuats, setFaceQuats] = useState<FaceQuats | null>(null);

  useEffect(() => {
    applyPalette(cloned);
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

    // Su fase 2 dopo il lancio: damp del quaternione verso la posa
    // della faccia estratta. Niente drift, breath o floating.
    if (isPostLaunch(active, rollResult) && resultQuat) {
      const factor = 1 - Math.exp(-DAMP_LAMBDA * delta);
      g.quaternion.slerp(resultQuat, factor);
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
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.85}>
      <primitive object={cloned} />
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

  useFrame((_, delta) => {
    const { active, rollResult } = useSceneState.getState();
    const pose = isPostLaunch(active, rollResult)
      ? POST_LAUNCH_POSE
      : POSES[active] ?? POSES[0];

    currentX.current = THREE.MathUtils.damp(currentX.current, pose.offX, DAMP_LAMBDA, delta);
    currentZ.current = THREE.MathUtils.damp(currentZ.current, pose.camZ, DAMP_LAMBDA, delta);

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
        <ContactShadows position={[0, -1.3, 0]} opacity={0.55} blur={2.2} far={3} />
        <Environment preset="warehouse" />
      </Suspense>
    </Canvas>
  );
}
