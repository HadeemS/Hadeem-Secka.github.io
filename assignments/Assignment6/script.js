// ===== Menu toggle (small screens) =====
const menuToggle = document.getElementById('menuToggle');
const navList = document.getElementById('navList');
const navRow = document.getElementById('navRow');

function setMenu(open){
  navRow.classList.toggle('nav-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
}
menuToggle.addEventListener('click', () => {
  setMenu(!navRow.classList.contains('nav-open'));
});
navList.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (a) setMenu(false);
});

// ===== Tabs + section toggle =====
const plantingSection = document.getElementById('plantingSection');
const clockSection    = document.getElementById('clockSection');
const btnEx1 = document.getElementById('btnEx1');
const btnEx2 = document.getElementById('btnEx2');
const navEx1 = document.getElementById('navEx1');
const navEx2 = document.getElementById('navEx2');

function showSection(which){
  const showPlanting = which === 'planting';
  plantingSection.classList.toggle('hidden', !showPlanting);
  clockSection.classList.toggle('hidden', showPlanting);

  btnEx1.classList.toggle('active', showPlanting);
  btnEx2.classList.toggle('active', !showPlanting);

  navEx1.setAttribute('aria-current', showPlanting ? 'page' : '');
  navEx2.setAttribute('aria-current', !showPlanting ? 'page' : '');

  (showPlanting ? plantingSection : clockSection).querySelector('h2').focus?.();
}
btnEx1.addEventListener('click', () => showSection('planting'));
btnEx2.addEventListener('click', () => showSection('clock'));
navEx1.addEventListener('click', (e) => { e.preventDefault(); showSection('planting'); });
navEx2.addEventListener('click', (e) => { e.preventDefault(); showSection('clock'); });

// default view
showSection('planting');

// ===== Planting logic =====
const days = document.getElementById('days');
const daysOut = document.getElementById('daysOut');
const plantMsg = document.getElementById('plantMsg');
const plantNote = document.getElementById('plantNote');
const plantImg = document.getElementById('plantImg');

function plantSVG(stateColor, face, drop=false){
  return `
    <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="200" height="150" fill="#fff"/>
      <g transform="translate(0,10)">
        <rect x="70" y="90" width="60" height="35" rx="6" fill="#d6a16d" stroke="#b98951"/>
        <rect x="98" y="50" width="4" height="40" fill="#6b8e23"/>
        <ellipse cx="90" cy="60" rx="18" ry="10" fill="${stateColor}" />
        <ellipse cx="110" cy="60" rx="18" ry="10" fill="${stateColor}" />
        <circle cx="100" cy="40" r="12" fill="${stateColor}" />
        <text x="100" y="44" text-anchor="middle" font-size="12" font-family="system-ui,Arial" fill="#fff">${face}</text>
        ${drop ? `<path d="M150,30 q10,10 0,20 q-10,-10 0,-20" fill="#79c2ff" stroke="#57a6e6"/>` : ``}
      </g>
    </svg>
  `;
}
function updatePlant(){
  const v = Number(days.value);
  daysOut.textContent = v;

  if (v >= 1 && v <= 2){
    plantMsg.textContent = "Looking fresh!";
    plantNote.textContent = "Recently watered — keep enjoying the sunshine.";
    plantImg.innerHTML = plantSVG("#2ecc71","😊");
  } else if (v >= 3 && v <= 5){
    plantMsg.textContent = "A sip soon…";
    plantNote.textContent = "It’s been a few days — consider watering soon.";
    plantImg.innerHTML = plantSVG("#58d68d","🙂");
  } else if (v >= 6 && v <= 9){
    plantMsg.textContent = "Water today.";
    plantNote.textContent = "Leaves are drooping — give it a drink.";
    plantImg.innerHTML = plantSVG("#f1c40f","😬", true);
  } else { // 10–12
    plantMsg.textContent = "Very dry!";
    plantNote.textContent = "Soil is parched — water immediately.";
    plantImg.innerHTML = plantSVG("#e74c3c","😵", true);
  }
}
days.addEventListener('input', updatePlant);
updatePlant(); // initial paint

// ===== Digital clock (updates each minute) =====
const clockEl = document.getElementById('clock');
const clockDate = document.getElementById('clockDate');

function pad(n){ return n.toString().padStart(2,'0'); }
function updateClock(){
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  clockEl.textContent = `${h}:${pad(m)} ${ampm}`;
  clockDate.textContent = now.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}
// Align to the next minute, then tick every 60s
(function startClock(){
  updateClock();
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => {
    updateClock();
    setInterval(updateClock, 60000);
  }, Math.max(msToNextMinute, 0));
})();
