import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import countries from "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const Globe = new ThreeGlobe()
  .globeImageUrl("./8k_earth_daymap.jpg")
  .polygonsData(countries.features);

scene.add(Globe);

const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

camera.position.z = 4;

function animate() {
  //  earth.rotation.x += 0.005;
  earth.rotation.y += 0.005;
  renderer.render(scene, camera);
}
