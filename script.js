import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

$("#checkbox-all").click(function (event) {
  if (this.checked) {
    $(":checkbox").each(function () {
      this.checked = true;
    });
  } else {
    $(":checkbox").each(function () {
      this.checked = false;
    });
  }
});

// Append numbers in range start-end to array
function appendNumbers(arr, start, end) {
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}

// Shuffle array using Fisher-Yates
function shuffle(arr) {
  let curIndex = arr.length;

  // While there are elements to shuffle
  while (curIndex != 0) {
    // Pick random element
    let randIndex = Math.floor(Math.random() * curIndex);
    curIndex--;

    // Swap with current element
    [arr[curIndex], arr[randIndex]] = [arr[randIndex], arr[curIndex]];
  }

  return arr;
}

function getCountryNumbers() {
  let checkboxAll = document.getElementById("checkbox-all");
  let checkboxAfrica = document.getElementById("checkbox-africa");
  let checkboxAsia = document.getElementById("checkbox-asia");
  let checkboxEurope = document.getElementById("checkbox-europe");
  let checkboxNorth = document.getElementById("checkbox-north");
  let checkboxSouth = document.getElementById("checkbox-south");
  let checkboxOceania = document.getElementById("checkbox-oceania");

  countryNums = [];

  if (checkboxAll.checked) {
    // 0-199
    appendNumbers(countryNums, 0, 199);
    // return, don't need to check others
    countryNums = shuffle(countryNums);
    return countryNums;
  }
  // Otherwise, check each box and add specific numbers
  if (checkboxAfrica.checked) {
    // 83-136
    appendNumbers(countryNums, 83, 136);
  }
  if (checkboxAsia.checked) {
    // 23-70
    appendNumbers(countryNums, 23, 70);
  }
  if (checkboxEurope.checked) {
    // 137-182
    appendNumbers(countryNums, 137, 182);
  }
  if (checkboxNorth.checked) {
    // 0-22
    appendNumbers(countryNums, 0, 22);
  }
  if (checkboxSouth.checked) {
    // 71-82
    appendNumbers(countryNums, 71, 82);
  }
  if (checkboxOceania) {
    // 183-198
    appendNumbers(countryNums, 183, 198);
  }

  countryNums = shuffle(countryNums);
  return countryNums;
}

// let input = document.getElementById("input-text");
// let awesomplete = new Awesomplete(input, {
//   minChars: 1,
//   maxItems: 10,
//   autoFirst: true,
// });
// awesomplete.list = [];

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

    let countryNums = getCountryNumbers();
    let i = -1;

    // Function to select and focus on random country
    function selectRandomCountry(countryNums, i) {
      //console.log(countries.features.length);
      //let randIndex = Math.floor(Math.random() * countries.features.length); // number of countries in dataset

      // want to iterate through countries 1 by one, on click
      countries.features[countryNums[i]].geometry.coordinates;

      let longitude = countries.features[countryNums[i]].properties.label_x;
      let latitude = countries.features[countryNums[i]].properties.label_y;

      let countryName = countries.features[countryNums[i]].properties.name;

      console.log(countryName);

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

      let area = area(countryNums[i]);

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

    function area(index) {
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

      let areaHeight = maxLatitude - minLatitude;
      let areaWidth = maxLongitude - minLongitude;
      let area = areaHeight * areaWidth;
      console.log("Area: " + area);
    }

    const start = document.getElementById("btn-start");
    start.addEventListener("click");

    const next = document.getElementById("btn-next");
    next.addEventListener("click");
  });
