import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { rotate } from "three/examples/jsm/nodes/Nodes.js";

// JQuery for clickbox to check or uncheck all others
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

// Creates randomlized list of numbers representing each country in the quiz
function getCountryNumbers() {
  // Get DOM elements for checkboxes
  let checkboxAll = document.getElementById("checkbox-all");
  let checkboxAfrica = document.getElementById("checkbox-africa");
  let checkboxAsia = document.getElementById("checkbox-asia");
  let checkboxEurope = document.getElementById("checkbox-europe");
  let checkboxNorth = document.getElementById("checkbox-north");
  let checkboxSouth = document.getElementById("checkbox-south");
  let checkboxOceania = document.getElementById("checkbox-oceania");

  let countryNums = [];

  // Add numbers for each continent that is selected
  if (checkboxAll.checked) {
    // 0-199
    countryNums = appendNumbers(countryNums, 0, 199);
    // return, don't need to check others
    countryNums = shuffle(countryNums);
    return countryNums;
  }
  // Otherwise, check each box and add specific numbers
  if (checkboxAfrica.checked) {
    // 83-136
    countryNums = appendNumbers(countryNums, 83, 136);
  }
  if (checkboxAsia.checked) {
    // 23-70
    countryNums = appendNumbers(countryNums, 23, 70);
  }
  if (checkboxEurope.checked) {
    // 137-182
    countryNums = appendNumbers(countryNums, 137, 182);
  }
  if (checkboxNorth.checked) {
    // 0-22
    countryNums = appendNumbers(countryNums, 0, 22);
  }
  if (checkboxSouth.checked) {
    // 71-82
    countryNums = appendNumbers(countryNums, 71, 82);
  }
  if (checkboxOceania.checked) {
    // 183-198
    countryNums = appendNumbers(countryNums, 183, 198);
  }

  countryNums = shuffle(countryNums);
  return countryNums;
}

const start = document.getElementById("btn-start");
start.addEventListener("click", beginFetch);

// Within here, anything related to globe manipulation or reading from geojson datacan
function beginFetch() {
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
      document
        .getElementById("globe-container")
        .appendChild(renderer.domElement);

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

      (function animate() {
        tbControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      })();

      function getCountryNames() {
        let names = [];
        for (let i = 0; i < countries.features.length; i++) {
          names.push(countries.features[i].properties.name);
        }
        return names;
      }

      let score = 0;
      let index = 0;
      console.log("index: " + index);
      let countryNumbers = getCountryNumbers();
      console.log("countryNumbers: " + countryNumbers);

      let input = document.getElementById("input-text");
      let awesomplete = new Awesomplete(input, {
        minChars: 1,
        maxItems: 10,
        autoFirst: true,
      });
      awesomplete.list = getCountryNames();

      setTimeout(function () {
        selectNextCountry(index);
      }, 5000);

      // Button listeners
      const enter = document.getElementById("btn-enter");
      enter.addEventListener("click", () => {
        compareInput(index, input.value);
      });
      enter.addEventListener("click", () => {
        selectNextCountry(index);
      });

      function compareInput(i, input) {
        let countryName =
          countries.features[countryNumbers[i - 1]].properties.name;
        console.log("country from compare: " + countryName);
        console.log("input from compare: " + input);

        if (input == countryName) {
          console.log("correct");
          score += 1;
        } else {
          console.log("incorrect, it was " + countryName);
        }
        console.log("score: " + score);
      }

      // Rotate view and highlight country
      function rotateHighlight(latitude, longitude, countryName) {
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
      }

      function zoom(area) {
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

      function calcArea(latitude, longitude, index) {
        let maxLongitude = longitude;
        let minLongitude = longitude;
        let maxLatitude = latitude;
        let minLatitude = latitude;

        // MultiPolygon arrays have an extra layer of depth, so we set if statement
        if (countries.features[index].geometry.type == "Polygon") {
          for (
            let i = 0;
            i < countries.features[index].geometry.coordinates[0].length;
            i++
          ) {
            maxLongitude = Math.max(
              maxLongitude,
              countries.features[index].geometry.coordinates[0][i][0]
            );
            minLongitude = Math.min(
              minLongitude,
              countries.features[index].geometry.coordinates[0][i][0]
            );
            maxLatitude = Math.max(
              maxLatitude,
              countries.features[index].geometry.coordinates[0][i][1]
            );
            minLatitude = Math.min(
              minLatitude,
              countries.features[index].geometry.coordinates[0][i][1]
            );
          }
        } else {
          for (
            let i = 0;
            i < countries.features[index].geometry.coordinates.length;
            i++
          ) {
            for (
              let j = 0;
              j < countries.features[index].geometry.coordinates[i][0].length;
              j++
            ) {
              maxLongitude = Math.max(
                maxLongitude,
                countries.features[index].geometry.coordinates[i][0][j][0]
              );
              minLongitude = Math.min(
                minLongitude,
                countries.features[index].geometry.coordinates[i][0][j][0]
              );
              maxLatitude = Math.max(
                maxLatitude,
                countries.features[index].geometry.coordinates[i][0][j][1]
              );
              minLatitude = Math.min(
                minLatitude,
                countries.features[index].geometry.coordinates[i][0][j][1]
              );
            }
          }
        }

        // console.log(countries.features[index].geometry.type);
        // console.log("latitude: " + latitude + " longitude: " + longitude);
        // console.log(
        //   "maxLat: " +
        //     maxLatitude +
        //     " minLat: " +
        //     minLatitude +
        //     " maxLong: " +
        //     maxLongitude +
        //     " minLong: " +
        //     minLongitude
        // );

        let areaHeight = maxLatitude - minLatitude;
        let areaWidth = maxLongitude - minLongitude;
        let area = areaHeight * areaWidth;
        console.log("Area: " + area);

        return area;
      }

      // Function to select and focus on the next country
      function selectNextCountry(i) {
        let longitude =
          countries.features[countryNumbers[i]].properties.label_x;
        let latitude = countries.features[countryNumbers[i]].properties.label_y;

        let countryName = countries.features[countryNumbers[i]].properties.name;

        console.log("i: " + i + " name: " + countryName);

        let area = 0;
        area = calcArea(latitude, longitude, i);
        rotateHighlight(latitude, longitude, countryName);
        zoom(area);

        index = index + 1;
        console.log("index from select: " + index);
      }
    });
}
