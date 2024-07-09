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
      .polygonAltitude(0.001)
      .polygonCapColor(() => "rgba(0, 0, 0, 0.01)")
      .polygonSideColor(() => "rgba(0, 0, 0, 0.01)")
      .polygonStrokeColor(() => "#111");

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
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
    camera.position.z = 300;

    // Setup trackball controls
    const tbControls = new TrackballControls(camera, renderer.domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 5;
    tbControls.zoomSpeed = 0.99;

    // function animate() {
    //   Globe.rotation.y += 0.005;
    //   renderer.render(scene, camera);
    // }

    (function animate() {
      tbControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    })();

    // Function to select and focus on random country
    function selectRandomCountry() {
      //console.log(countries.features.length);
      let randIndex = Math.floor(Math.random() * countries.features.length); // number of countries in dataset
      countries.features[randIndex].geometry.coordinates;

      let longitude = countries.features[randIndex].properties.label_x;
      let latitude = countries.features[randIndex].properties.label_y;

      let maxLongitude = longitude;
      let minLongitude = longitude;
      let maxLatitude = latitude;
      let minLatitude = latitude;

      // MultiPolygon arrays have an extra layer of depth, so we set if statement
      if (countries.features[randIndex].geometry.type == "Polygon") {
        for (
          let i = 0;
          i < countries.features[randIndex].geometry.coordinates[0].length;
          i++
        ) {
          maxLongitude = Math.max(
            maxLongitude,
            countries.features[randIndex].geometry.coordinates[0][i][0]
          );
          minLongitude = Math.min(
            minLongitude,
            countries.features[randIndex].geometry.coordinates[0][i][0]
          );
          maxLatitude = Math.max(
            maxLatitude,
            countries.features[randIndex].geometry.coordinates[0][i][1]
          );
          minLatitude = Math.min(
            minLatitude,
            countries.features[randIndex].geometry.coordinates[0][i][1]
          );
        }
      } else {
        for (
          let i = 0;
          i < countries.features[randIndex].geometry.coordinates.length;
          i++
        ) {
          for (
            let j = 0;
            j < countries.features[randIndex].geometry.coordinates[i][0].length;
            j++
          ) {
            maxLongitude = Math.max(
              maxLongitude,
              countries.features[randIndex].geometry.coordinates[i][0][j][0]
            );
            minLongitude = Math.min(
              minLongitude,
              countries.features[randIndex].geometry.coordinates[i][0][j][0]
            );
            maxLatitude = Math.max(
              maxLatitude,
              countries.features[randIndex].geometry.coordinates[i][0][j][1]
            );
            minLatitude = Math.min(
              minLatitude,
              countries.features[randIndex].geometry.coordinates[i][0][j][1]
            );
          }
        }
      }

      let countryName = countries.features[randIndex].properties.name;

      console.log(countryName);
      console.log(countries.features[randIndex].geometry.type);
      console.log("latitude: " + latitude + " longitude: " + longitude);
      console.log(
        "maxLat: " +
          maxLatitude +
          " minLat: " +
          minLatitude +
          " maxLong: " +
          maxLongitude +
          " minLong: " +
          minLongitude
      );

      Globe.rotation.set(
        THREE.MathUtils.degToRad(latitude),
        THREE.MathUtils.degToRad(-longitude),
        0,
        "XYZ"
      );

      Globe.polygonCapColor(({ properties }) => {
        return properties.name === countryName
          ? "rgba(0, 200, 0, 1.0)"
          : "rgba(0, 0, 0, 0.01)";
      });
      Globe.polygonAltitude(({ properties }) => {
        return properties.name === countryName ? 0.01 : 0.001;
      });

      // Thinking we could set zoom based on high & low lat/long to have basically a
      // square that defines the scale of our zoom. We could find area of that
      // square then define zoom pos as proportional to that square

      // height would be abs(maxLat) - abs(minLat)
      // width would be abs(maxLong) - abs(minLong)
      // except when it crosses

      let areaHeight = maxLatitude - minLatitude;
      let areaWidth = maxLongitude - minLongitude;
      let area = areaHeight * areaWidth;
      console.log("Area: " + area);

      if (area >= 1000) {
        camera.position.z = 250;
      } else if (area >= 50) {
        camera.position.z = 200;
      } else if (area >= 20) {
        camera.position.z = 175;
      } else if (area >= 5) {
        camera.position.z = 150;
      } else {
        camera.position.z = 135;
      }
    }

    const next = document.getElementById("btn-next");
    next.addEventListener("click", selectRandomCountry);
  });
