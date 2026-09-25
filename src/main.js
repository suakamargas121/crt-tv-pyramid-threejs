import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const app = document.getElementById('app');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060608);

// Camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.85, 0, 0);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
app.appendChild(renderer.domElement);

// Studio Lighting
const ambientLight = new THREE.AmbientLight(0x1a1a24, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.2);
keyLight.position.set(2.5, 3.0, 3.5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x4a6fa5, 0.8);
rimLight.position.set(-2.0, -2.5, 2.0);
scene.add(rimLight);

const frontFill = new THREE.DirectionalLight(0xd0d5e0, 0.6);
frontFill.position.set(3.0, 0.0, 1.0);
scene.add(frontFill);

// Screen & Chassis Materials
const textureLoader = new THREE.TextureLoader();
const logoTex = textureLoader.load('/assets/logo.jpg');
logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
logoTex.colorSpace = THREE.SRGBColorSpace;
logoTex.flipY = true;
// Flip X horizontally
logoTex.wrapS = THREE.RepeatWrapping;
logoTex.repeat.x = -1;
logoTex.offset.x = 1;

const screenMat = new THREE.MeshStandardMaterial({
  map: logoTex,
  emissive: new THREE.Color(0x3a3a3a),
  emissiveMap: logoTex,
  // emissiveIntensity: 0.55,
  // roughness: 0.35,
  // metalness: 0.0
});

// CRT scanline shader
// screenMat.onBeforeCompile = (shader) => {
//   shader.fragmentShader = shader.fragmentShader.replace(
//     '#include <dithering_fragment>',
//     `
//     #include <dithering_fragment>
//     float scanline = sin(vMapUv.y * 380.0) * 0.5 + 0.5;
//     scanline = clamp(0.72 + 0.28 * scanline, 0.0, 1.0);
//     gl_FragColor.rgb *= scanline;
//     `
//   );
// };

const plasticMat = new THREE.MeshStandardMaterial({
  color: 0x6e7075,
  roughness: 0.55,
  metalness: 0.05
});

const plasticDarkMat = new THREE.MeshStandardMaterial({
  color: 0x4a4c50,
  roughness: 0.65,
  metalness: 0.05
});

// Group for parallax rotation
const tvGroup = new THREE.Group();
scene.add(tvGroup);

// Model bounding box size for dynamic responsive framing
let modelWidth = 1.8;
let modelHeight = 1.6;

const loader = new GLTFLoader();
loader.load('/assets/tv_pyramid.glb', (gltf) => {
  const model = gltf.scene;

  // Accurately center model at origin (0, 0, 0)
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  modelWidth = size.y;  // Width across Y in Blender export
  modelHeight = size.z; // Height across Z in Blender export
  model.position.sub(center);

  model.traverse((child) => {
    if (child.isMesh) {
      const name = child.name.toLowerCase();
      if (name.includes('screen')) {
        child.material = screenMat;
      } else if (name.includes('glass')) {
        child.material = new THREE.MeshPhysicalMaterial({
          roughness: 0,
          transmission: 1,
          thickness: 0.00,
          transparent: true,
          opacity: 0
        });
      } else if (name.includes('back')) {
        child.material = plasticDarkMat;
      } else {
        child.material = plasticMat;
      }
    }
  });

  tvGroup.add(model);
  updateCameraDistance();
});

// Responsive auto-framing calculation
function updateCameraDistance() {
  const aspect = window.innerWidth / window.innerHeight;
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  
  // Calculate required camera distance along +X to encompass the model width (Y) and height (Z)
  // Horizontal FOV = 2 * atan(tan(fov/2) * aspect)
  const halfFovV = Math.tan(fovRad / 2);
  const halfFovH = halfFovV * aspect;

  const padding = 1.15; // 15% margin
  const distForHeight = (modelHeight * 0.5 * padding) / halfFovV;
  const distForWidth = (modelWidth * 0.5 * padding) / halfFovH;

  const targetDistance = Math.max(distForHeight, distForWidth, 5
  );
  camera.position.set(targetDistance, 0, 0);
  camera.lookAt(0, 0.5, 0);
}

// Parallax mouse 
const MAX_ROT = THREE.MathUtils.degToRad(5.0);
let targetRotY = 0;
let targetRotZ = 0;

function handlePointer(clientX, clientY) {
  const nx = (clientX / window.innerWidth) * 2 - 1;
  const ny = (clientY / window.innerHeight) * 2 - 1;
  targetRotY = -nx * MAX_ROT;
  targetRotZ = ny * MAX_ROT;
}

window.addEventListener('mousemove', (e) => {
  handlePointer(e.clientX, e.clientY);
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    handlePointer(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

// Window resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraDistance();
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  tvGroup.rotation.z += (targetRotZ - tvGroup.rotation.z) * 0.06;
  tvGroup.rotation.y += (targetRotY - tvGroup.rotation.y) * 0.06;
  renderer.render(scene, camera);
}
animate();
