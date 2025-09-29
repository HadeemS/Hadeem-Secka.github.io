/* Assignment 8 — Arrays (Before/After with popup) */

const before = {
  "Barbie": "images/barbie.png",
  "Milo":   "images/milobefore.png",
  "Luna":   "images/Lunabefore.png",
  "Zoe":    "images/Zoe.png"
};

const after = {
  "Barbie": "images/barbieafter.png",
  "Milo":   "images/miloafter.png",
  "Luna":   "images/lunaafter.png",
  "Zoe":    "images/Zoeafter.png"
};


/* Render all BEFORE photos */
const gallery = document.getElementById("gallery");

Object.entries(before).forEach(([name, src]) => {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <figure class="frame">
      <img src="${src}" alt="${name} before adoption" loading="lazy">
    </figure>
    <div class="overlay">Please adopt ${name}</div>
  `;
  card.addEventListener("click", () => openPopup(name));
  gallery.appendChild(card);
});

/* Popup logic */
const popup = document.getElementById("popup");
const popupImg = document.getElementById("popupImg");
const petName = document.getElementById("petName");
const closeBtn = document.getElementById("close");

function openPopup(name){
  const afterSrc = after[name] || before[name];
  petName.textContent = name;
  popupImg.src = afterSrc;
  popupImg.alt = `${name} after adoption`;
  popup.classList.remove("hidden");
  closeBtn.focus();
}
function closePopup(){
  popup.classList.add("hidden");
  popupImg.src = "";
}
closeBtn.addEventListener("click", closePopup);
popup.addEventListener("click", (e) => { if (e.target === popup) closePopup(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !popup.classList.contains("hidden")) closePopup(); });
