import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'dat.gui';

// loader
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.close();
const debugObj = {
  envMapIntensity: 2,
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
const directionlLight = new THREE.DirectionalLight(0xffffff, 5);
directionlLight.position.set(0.25, 3, -2.25);
directionlLight.castShadow = true;
directionlLight.shadow.camera.far = 15;
directionlLight.shadow.mapSize.set(1024, 1024);
scene.add(directionlLight);

// gltf
gltfLoader.load(
  '../static//models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(0, -4, 0);
    gltf.scene.rotation.y = Math.PI * 0.5;
    scene.add(gltf.scene);

    updateAllMaterials();

    gui
      .add(gltf.scene.rotation, 'y')
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name('modelRotation');
  },
);

// utils
function updateAllMaterials() {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.envMapIntensity = debugObj.envMapIntensity;
      child.material.needsUpdate = true;
    }
  });
}

/**
 * cube texture
 */
const environmentMaps = cubeTextureLoader.load([
  '../static/textures/environmentMaps/1/px.jpg',
  '../static/textures/environmentMaps/1/nx.jpg',
  '../static/textures/environmentMaps/1/py.jpg',
  '../static/textures/environmentMaps/1/ny.jpg',
  '../static/textures/environmentMaps/1/pz.jpg',
  '../static/textures/environmentMaps/1/nz.jpg',
]);

scene.background = environmentMaps;
scene.environment = environmentMaps;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.toneMappingExposure = 2;

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Gui
 */
gui
  .add(directionlLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('light intensity');
gui
  .add(directionlLight.position, 'x')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightX');
gui
  .add(directionlLight.position, 'y')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightY');
gui
  .add(directionlLight.position, 'z')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightZ');

gui
  .add(debugObj, 'envMapIntensity')
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

gui
  .add(renderer, 'toneMapping', {
    NoTM: THREE.NoToneMapping,
    LinearTM: THREE.LinearToneMapping,
    ReinhardTM: THREE.ReinhardToneMapping,
    CineonTM: THREE.CineonToneMapping,
    'ACESF TM': THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping);
    updateAllMaterials();
  });
