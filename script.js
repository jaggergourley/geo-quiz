document.addEventListener("DOMContentLoaded", (event) => {
  const flag = document.getElementById("flag");
  const globe = document.getElementById("globe");

  flag.addEventListener("click", () => {
    console.log("flag quiz");
  });

  globe.addEventListener("click", () => {
    console.log("globe quiz");
  });
});
