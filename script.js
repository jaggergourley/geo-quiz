import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

fetch("./custom1.geojson")
  .then((res) => res.json())
  .then((countries) => {
    // Setup Globe
    const Globe = new ThreeGlobe()
      .globeImageUrl("./8k_earth_daymap.jpg")
      .polygonsData(countries.features)
      .polygonAltitude(0.01)
      .polygonStrokeColor(() => "#111");

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    //renderer.setAnimationLoop(animate);
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

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // const onMouseMove = (event) => {
    //   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    //   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //   raycaster.setFromCamera(pointer, camera);
    //   const intersects = raycaster.intersectObjects(scene.children);

    //   if (intersects.length > 0) {
    //     intersects[0].object.material.color.set(0xff0000);
    //   }
    // };

    // window.addEventListener("mousemove", onMouseMove);

    const tbControls = new TrackballControls(camera, renderer.domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 5;
    tbControls.zoomSpeed = 0.8;

    // function animate() {
    //   Globe.rotation.y += 0.005;
    //   renderer.render(scene, camera);
    // }

    (function animate() {
      tbControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    })();

    function selectRandomCountry() {
      //console.log(countries.features.length);
      const randtest = Math.floor(Math.random() * 10);
      let randIndex = Math.floor(Math.random() * countries.features.length); // number of countries in dataset
      countries.features[randIndex].geometry.coordinates;

      let longitude = countries.features[randIndex].properties.label_x;
      let latitude = countries.features[randIndex].properties.label_y;

      // let numCoords = 0;

      // for (
      //   let i = 0;
      //   i < countries.features[randIndex].geometry.coordinates.length;
      //   i++
      // ) {
      //   for (
      //     let j = 0;
      //     j < countries.features[randIndex].geometry.coordinates[i].length;
      //     j++
      //   ) {
      //     numCoords += 1;
      //     longitude +=
      //       countries.features[randIndex].geometry.coordinates[i][j][0];
      //     latitude +=
      //       countries.features[randIndex].geometry.coordinates[i][j][1];
      //   }
      // }

      // longitude /= numCoords;
      // latitude /= numCoords;

      console.log(countries.features[randIndex].properties.name);
      console.log("latitude: " + latitude + " longitude: " + longitude);

      Globe.rotation.set(
        THREE.MathUtils.degToRad(latitude),
        THREE.MathUtils.degToRad(-longitude),
        0,
        "XYZ"
      );

      camera.position.z = 250;
    }

    const next = document.getElementById("btn-next");
    next.addEventListener("click", selectRandomCountry);
  });
