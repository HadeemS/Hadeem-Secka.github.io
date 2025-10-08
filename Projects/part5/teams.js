/* Teams (JSON) — Project 5
   This page fetches a JSON list and renders cards.
   Submission note for graders:
   Page: Projects/part5/teams.html
   Data: Projects/part5/data/teams.json (fetched via GitHub Pages URL below)
*/

// IMPORTANT: use your GitHub Pages URL (not a local file path)
const DATA_URL = "https://hadeems.github.io/Hadeem-Secka.github.io/Projects/part5/data/teams.json";

const $ = (s, r = document) => r.querySelector(s);
const teamList = $("#teamList");
const loadMsg  = $("#loadMsg");
const qInput   = $("#q");
const clearBtn = $("#clearBtn");

let TEAMS = [];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function placeholderSVG(text){
  return `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
    <rect width='800' height='600' fill='#f5f6f8'/>
    <text x='400' y='300' text-anchor='middle' font-family='sans-serif' font-size='36' fill='#888'>${text}</text>
  </svg>`.replace(/\n|\s{2,}/g," ");
}

function card(t){
  const s = slug(t.name);
  // Try linking to any existing team page using your naming pattern
  const previewHref =
    s.includes("atlanta-falcons") ? "team-atlanta-falcons.html" :
    s.includes("manchester-united") ? "team-manchester-united.html" :
    s.includes("atlanta-hawks") ? "team-atlanta-hawks.html" : "#";

  return `
    <article class="card">
      <div class="frame">
        <img src="${t.img_name}" alt="${t.name} logo"
             onerror="this.onerror=null;this.src='${placeholderSVG(t.name)}';">
      </div>
      <h3>${t.name}</h3>
      <p>${t.city} • ${t.league}</p>
      <p>Record: ${t.record} • Streak: ${t.streak}</p>
      <div class="actions">
        <a class="btn ${previewHref === '#' ? 'ghost' : ''}" href="${previewHref}">
          ${previewHref === '#' ? 'Details soon' : 'Open preview'}
        </a>
      </div>
    </article>
  `;
}

function render(list){
  teamList.innerHTML = list.map(card).join("") || `<p>No results.</p>`;
  loadMsg.textContent = `Showing ${list.length} of ${TEAMS.length}`;
}

async function init(){
  try{
    loadMsg.textContent = "Loading teams…";
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    TEAMS = Array.isArray(data) ? data : (data.items || []);
    render(TEAMS);
    loadMsg.textContent = `Loaded ${TEAMS.length} teams from JSON`;
  }catch(err){
    console.error(err);
    loadMsg.textContent = "Could not load JSON. Check the URL and that your JSON is publicly accessible.";
    teamList.innerHTML = `<p class="desc">Error: ${String(err.message || err)}</p>`;
  }
}

$("#teamSearch").addEventListener("submit", e => {
  e.preventDefault();
  const q = qInput.value.trim().toLowerCase();
  if(!q){ render(TEAMS); return; }
  const filtered = TEAMS.filter(t =>
    [t.name, t.city, t.league, t.sport].some(v => String(v).toLowerCase().includes(q))
  );
  render(filtered);
});
clearBtn.addEventListener("click", () => { qInput.value = ""; render(TEAMS); });

init();
