import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildCardTextures, CARD_ASPECT } from './cardTexture.js';

/* ---------- Renderer / scene / camera ---------- */
const canvas = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);

/* ---------- Lights ---------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const key = new THREE.DirectionalLight(0xffffff, 1.1);
key.position.set(3, 4, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x88aaff, 0.45);
rim.position.set(-4, 2, -3);
scene.add(rim);

const fill = new THREE.PointLight(0xffd28a, 0.5, 12);
fill.position.set(-2, -1, 4);
scene.add(fill);

/* ---------- Card mesh ---------- */
const { front, back } = buildCardTextures();

const frontTex = new THREE.CanvasTexture(front);
const backTex = new THREE.CanvasTexture(back);
frontTex.colorSpace = THREE.SRGBColorSpace;
backTex.colorSpace = THREE.SRGBColorSpace;
frontTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
backTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Card physical size (units roughly = inches; 2.5 x 3.5 is the real card ratio).
const CARD_W = 2.5;
const CARD_H = CARD_W / CARD_ASPECT; // matches texture aspect
const CARD_D = 0.035;

const geometry = new RoundedBoxGeometry(CARD_W, CARD_H, CARD_D, 6, 0.06);

// RoundedBoxGeometry has a single material slot, so build per-face materials
// using onBeforeCompile-free trick: assign material array based on face groups.
// Simpler: split into front/back planes + a thin edge box.
scene.remove(); // no-op

const edgeMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.7,
  metalness: 0.2,
});

const cardCore = new THREE.Mesh(geometry, edgeMaterial);

const faceMaterialFront = new THREE.MeshStandardMaterial({
  map: frontTex,
  roughness: 0.55,
  metalness: 0.15,
});
const faceMaterialBack = new THREE.MeshStandardMaterial({
  map: backTex,
  roughness: 0.55,
  metalness: 0.15,
});

const facePlane = new THREE.PlaneGeometry(CARD_W - 0.005, CARD_H - 0.005);
const frontFace = new THREE.Mesh(facePlane, faceMaterialFront);
frontFace.position.z = CARD_D / 2 + 0.0005;

const backFace = new THREE.Mesh(facePlane, faceMaterialBack);
backFace.position.z = -CARD_D / 2 - 0.0005;
backFace.rotation.y = Math.PI;

const card = new THREE.Group();
card.add(cardCore, frontFace, backFace);
scene.add(card);

/* ---------- Controls ---------- */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.enablePan = false;

// Double click flips the card.
let flipping = false;
let flipTarget = 0;
canvas.addEventListener('dblclick', () => {
  flipTarget += Math.PI;
  flipping = true;
});

/* ---------- Resize ---------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- Animation loop ---------- */
const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();

  if (flipping) {
    const diff = flipTarget - card.rotation.y;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), dt * 6);
    card.rotation.y += step;
    if (Math.abs(diff) < 0.001) {
      card.rotation.y = flipTarget;
      flipping = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
