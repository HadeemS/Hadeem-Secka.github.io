/* schedule.js — team lookup + dynamic schedule rendering */

/* ===== Helpers ===== */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ===== Data (edit/expand as needed) =====
   Keep opponents short; 'venue' is Home/Away; 'comp' for competition/round; 'tv' optional.
*/
const SCHEDULES = {
  'atlanta-falcons': {
    name: 'Atlanta Falcons',
    compLabel: 'Week',
    rows: [
      { date:'Oct 05', opponent:'Atlanta Hawks', venue:'Home', comp:'Week 6',  time:'1:00 PM', tv:'Network A' },
      { date:'Oct 12', opponent:'Manchester United', venue:'Away', comp:'Week 7', time:'4:25 PM', tv:'Network B' },
      { date:'Oct 19', opponent:'Kings', venue:'Home', comp:'Week 8', time:'1:00 PM', tv:'Network C' },
      { date:'Oct 26', opponent:'United', venue:'Home', comp:'Week 9', time:'8:15 PM', tv:'Network D' },
      { date:'Nov 02', opponent:'Hawks', venue:'Away', comp:'Week 10', time:'1:00 PM', tv:'Network A' },
      { date:'Nov 09', opponent:'Riverdale', venue:'Home', comp:'Week 11', time:'4:05 PM', tv:'Network B' }
    ]
  },
  'manchester-united': {
    name: 'Manchester United',
    compLabel: 'Competition',
    rows: [
      { date:'Oct 06', opponent:'Kings', venue:'Home', comp:'League',    time:'7:30 PM', tv:'—' },
      { date:'Oct 13', opponent:'Atlanta Falcons', venue:'Away', comp:'Friendly', time:'3:00 PM', tv:'—' },
      { date:'Oct 20', opponent:'Riverdale', venue:'Home', comp:'League', time:'11:30 AM', tv:'—' },
      { date:'Oct 27', opponent:'Hawks', venue:'Away', comp:'Cup R4',     time:'2:45 PM', tv:'—' },
      { date:'Nov 03', opponent:'Falcons', venue:'Home', comp:'Friendly', time:'1:00 PM', tv:'—' },
      { date:'Nov 10', opponent:'United XI', venue:'Away', comp:'League', time:'9:00 AM', tv:'—' }
    ]
  },
  'atlanta-hawks': {
    name: 'Atlanta Hawks',
    compLabel: 'Game',
    rows: [
      { date:'Oct 04', opponent:'Riverdale', venue:'Home', comp:'#3', time:'7:00 PM', tv:'BSS' },
      { date:'Oct 11', opponent:'Atlanta Falcons', venue:'Away', comp:'#4', time:'7:30 PM', tv:'ESPN' },
      { date:'Oct 18', opponent:'Manchester United', venue:'Home', comp:'#5', time:'7:00 PM', tv:'NBA TV' },
      { date:'Oct 25', opponent:'Kings', venue:'Away', comp:'#6', time:'8:00 PM', tv:'TNT' },
      { date:'Nov 01', opponent:'Falcons', venue:'Home', comp:'#7', time:'7:30 PM', tv:'BSS' },
      { date:'Nov 08', opponent:'United', venue:'Away', comp:'#8', time:'7:00 PM', tv:'ESPN2' }
    ]
  }
};

/* Build datalist options from data */
const TEAMS = Object.values(SCHEDULES).map(t => t.name);
const SLUG_MAP = Object.fromEntries(Object.keys(SCHEDULES).map(slug => [SCHEDULES[slug].name.toLowerCase(), slug]));

/* ===== DOM refs ===== */
const teamInput = $('#teamQuery');
const datalist = $('#teamsDatalist');
const showBtn = $('#showBtn');
const printBtn = $('#printBtn');
const chips = $$('.chip');
const title = $('#teamTitle');
const results = $('#scheduleResults');

/* Populate datalist */
datalist.innerHTML = TEAMS.map(t => `<option value="${t}">`).join('');

/* Render a team's schedule */
function renderSchedule(slug){
  const team = SCHEDULES[slug];
  if (!team){
    title.textContent = 'No team found';
    results.innerHTML = `<p class="msg">Try: ${TEAMS.join(' • ')}</p>`;
    return;
  }

  title.textContent = `${team.name} — Schedule`;

  // Table HTML
  const head =
  `<table class="table" aria-label="${team.name} schedule">
     <thead>
       <tr>
         <th scope="col">Date</th>
         <th scope="col">Opponent</th>
         <th scope="col">Venue</th>
         <th scope="col">${team.compLabel}</th>
         <th scope="col">Time</th>
         <th scope="col">Broadcast</th>
       </tr>
     </thead>
     <tbody>
       ${team.rows.map(r => `
         <tr>
           <td>${r.date}</td>
           <td>${r.opponent}</td>
           <td>${r.venue}</td>
           <td>${r.comp}</td>
           <td>${r.time}</td>
           <td>${r.tv || '—'}</td>
         </tr>
       `).join('')}
     </tbody>
   </table>`;

  results.innerHTML = head;

  // Update URL (deep link)
  const url = new URL(location.href);
  url.searchParams.set('team', slug);
  history.replaceState(null, '', url.toString());
}

/* Parse team from input value (name or slug) */
function parseTeam(value){
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (SCHEDULES[v]) return v;                 // already a slug
  if (SLUG_MAP[v]) return SLUG_MAP[v];        // exact name
  // fuzzy: try slugify
  const s = slugify(value);
  if (SCHEDULES[s]) return s;
  // last chance: includes
  const found = Object.keys(SCHEDULES).find(slug => SCHEDULES[slug].name.toLowerCase().includes(v));
  return found || null;
}

/* Wire up form submit */
$('#scheduleSearch').addEventListener('submit', (e) => {
  e.preventDefault();
  const slug = parseTeam(teamInput.value);
  renderSchedule(slug);
});

/* Quick-pick chips */
chips.forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.getAttribute('data-team');
    teamInput.value = name;
    const slug = parseTeam(name);
    renderSchedule(slug);
    teamInput.focus();
  });
});

/* Print handler */
printBtn.addEventListener('click', () => window.print());

/* On load: hydrate from ?team= */
(function init(){
  const params = new URLSearchParams(location.search);
  const q = params.get('team');
  if (q){
    const slug = parseTeam(q);
    if (slug){
      teamInput.value = SCHEDULES[slug].name;
      renderSchedule(slug);
      return;
    }
  }
  // Default: nothing selected (title already set in HTML)
})();
/* End of schedule.js */