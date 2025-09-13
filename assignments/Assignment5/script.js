// Assignment 5 - Using arrow functions & constants

// Sunny Times: add Beatles lyrics when clicked
const sunnyCard = document.getElementById("sunny-times");
const lyrics = document.getElementById("lyrics");

sunnyCard.addEventListener("click", () => {
  lyrics.innerHTML = `
    Here comes the sun<br>
    Sun<br>
    Sun<br>
    Sun<br>
    Here it comes
  `;
});

// Color Picker: change text color
const colorInput = document.getElementById("colorInput");
const colorText = document.getElementById("colorText");

colorInput.addEventListener("input", () => {
  const color = colorInput.value;
  colorText.style.color = color;
  colorText.textContent = `You picked: ${color}`;
});

// Image Change: toggle cloudy → sunny
const weatherImage = document.getElementById("weatherImage");
const CLOUDY = "images/cloudy.png";
const SUNNY = "images/sunny.jpg";

weatherImage.addEventListener("click", () => {
  weatherImage.src =
    weatherImage.src.includes("cloudy") ? SUNNY : CLOUDY;
});
