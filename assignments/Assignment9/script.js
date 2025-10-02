// ===== Assignment 9 — Painting class + modal rendering =====
class Painting {
  constructor({ name, artist, img, framed = false }) {
    this.name = name;
    this.artist = artist;
    this.img = img;            // relative path inside Assignment9/images/
    this.framed = framed;      // boolean
  }

  // Small gallery card section
  getSection(index) {
    return `
      <article class="card" data-index="${index}" tabindex="0" aria-label="${this.name} by ${this.artist}">
        <div class="card__imgwrap">
          <img src="images/${this.img}" alt="${this.name} by ${this.artist}">
        </div>
        <div class="card__meta">
          <h3 class="card__title">${this.name}</h3>
          <p class="card__by">by ${this.artist}</p>
        </div>
      </article>
    `;
  }
}
// Sample paintings

const paintings = [
  new Painting({ name: "The Bee", artist: "RichardsDrawings", img: "bee.jpg", framed: true }),
  new Painting({ name: "Dream love kitten", artist: "CDD20", img: "kitten.jpg", framed: false }),
  new Painting({ name: "Flowers and Butterflies", artist: "paintworldwide.com", img: "flowers.jpg", framed: true }),
  new Painting({ name: "Forest Animals", artist: "blackpainters.com", img: "forest.jpg", framed: false }),
  new Painting({ name: "Sunflowers", artist: "Studio M", img: "sunflowers.jpg", framed: true })
];

// ---- Render gallery ----
const galleryEl = document.getElementById("gallery");
galleryEl.innerHTML = paintings.map((p, i) => p.getSection(i)).join("");

// ---- Modal wiring ----
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalByline = document.querySelector(".modal__byline");
const modalImg = document.getElementById("modal-img");
const modalFrame = document.getElementById("modal-frame");

function openModal(painting) {
  modalTitle.textContent = painting.name;
  modalByline.textContent = `by ${painting.artist}`;
  modalImg.src = `images/${painting.img}`;
  modalImg.alt = `${painting.name} by ${painting.artist}`;

  // frame badge + toggle frame look
  modalFrame.textContent = painting.framed ? "Framed" : "Not framed";
  modalFrame.className = `badge ${painting.framed ? "ok" : "no"}`;
  modalImg.classList.toggle("is-framed", painting.framed);

  modal.setAttribute("aria-hidden", "false");
  // focus trap entry
  document.querySelector(".modal__close").focus();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
}

// click cards
galleryEl.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const idx = +card.dataset.index;
  openModal(paintings[idx]);
});

// keyboard open (Enter/Space on focused card)
galleryEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".card");
  if (!card) return;
  e.preventDefault();
  openModal(paintings[+card.dataset.index]);
});

// modal close interactions
modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
});
