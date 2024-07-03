import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

fetch("./custom.geojson")
  .then((res) => res.json())
  .then((countries) => {
    // Setup Globe
    const Globe = new ThreeGlobe()
      .globeImageUrl("./8k_earth_daymap.jpg")
      .polygonsData(countries.features)
      .polygonStrokeColor(() => "#111");

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.getElementById("globe-container").appendChild(renderer.domElement);

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(Globe);
    scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

    // Setup camera
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;

    function animate() {
      renderer.render(scene, camera);
    }
  });
