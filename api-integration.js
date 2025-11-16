/* api-integration.js — matches your /api/games (title, league, date, time, venue, city, price, img, summary) */

const API_BASE = "https://game-day-api-1.onrender.com"; // your live Render URL

// --- tiny helpers ---
const fmtMoney = (n) => "$" + Number(n || 0).toLocaleString("en-US");
const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return isNaN(d) ? s : d.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
};
const apiImg = (rel) => `${API_BASE}${rel}`;

// --- API ---
async function apiList() {
  const r = await fetch(`${API_BASE}/api/games`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load games");
  return r.json();
}
async function apiCreate(payload) {
  const r = await fetch(`${API_BASE}/api/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, price: Number(payload.price) })
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.message || data?.error || "Server error";
    const extra = data?.details?.join(" ") || "";
    throw new Error(extra ? `${msg} ${extra}` : msg);
  }
  return data.game || data.item;
}

// --- client-side validation mirroring server Joi ---
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const IMG_RE  = /^\/images\/[a-z0-9._\-]+\.(png|jpg|jpeg|webp)$/i; // must be /images/… on your API

function validateGame(v) {
  const e = {};
  if (!v.title?.trim()) e.title = "Title is required";
  else if (v.title.trim().length < 3) e.title = "Title must be ≥ 3 chars";
  if (!v.league?.trim()) e.league = "League is required";
  if (!v.date) e.date = "Date is required";
  else if (!DATE_RE.test(v.date)) e.date = "Use YYYY-MM-DD";
  if (!v.time) e.time = "Time is required";
  else if (!TIME_RE.test(v.time)) e.time = "Use 24-hour HH:mm";
  if (!v.venue?.trim()) e.venue = "Venue is required";
  if (!v.city?.trim()) e.city = "City is required";
  if (v.price === "" || v.price === null || v.price === undefined) e.price = "Price is required";
  else if (Number.isNaN(Number(v.price))) e.price = "Price must be a number";
  else if (Number(v.price) < 0) e.price = "Price cannot be negative";
  else if (Number(v.price) > 10000) e.price = "Price must be ≤ $10,000";
  if (!v.img?.trim()) e.img = "Image path is required";
  else if (!IMG_RE.test(v.img.trim())) e.img = "Use /images/<file>.png|jpg|jpeg|webp";
  if (!v.summary?.trim()) e.summary = "Summary is required";
  else if (v.summary.trim().length < 5) e.summary = "Summary must be ≥ 5 chars";
  else if (v.summary.trim().length > 240) e.summary = "Summary must be ≤ 240 chars";
  return e;
}

// --- UI components (JSX compiled by Babel Standalone you already load) ---
function Card({ game }) {
  return (
    <article style={{
      background:"#fff", border:"1px solid #eee", borderRadius:16, padding:12,
      boxShadow:"0 6px 16px rgba(0,0,0,.05)"
    }}>
      <img
        src={apiImg(game.img)}
        alt={game.title}
        style={{width:"100%",height:150,objectFit:"cover",borderRadius:12}}
        loading="lazy"
      />
      <h3 style={{margin:"8px 0 2px"}}>{game.title}</h3>
      <p style={{margin:0,opacity:.8}}>{game.league} • {game.city}</p>
      <p style={{margin:"6px 0 0"}}><strong>{fmtDate(game.date)} @ {game.time}</strong></p>
      <p style={{margin:"6px 0"}}>{game.summary}</p>
      <p style={{margin:0, fontWeight:700}}>{fmtMoney(game.price)}</p>
    </article>
  );
}

function Form({ onAdded }) {
  const [form, setForm] = React.useState({
    title:"", league:"NBA", date:"", time:"",
    venue:"", city:"", price:"0",
    img:"/images/usc-vs-clemson.jpg",
    summary:""
  });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function update(e){ setForm(f => ({ ...f, [e.target.name]: e.target.value })); setStatus(""); }

  async function submit(e){
    e.preventDefault();
    const err = validateGame(form);
    setErrors(err);
    if (Object.keys(err).length) { setStatus("Please fix the highlighted fields."); return; }
    try {
      setBusy(true); setStatus("Saving…");
      const created = await apiCreate(form);
      onAdded(created);
      setForm({
        title:"", league:"NBA", date:"", time:"",
        venue:"", city:"", price:"0", img:"/images/usc-vs-clemson.jpg", summary:""
      });
      setErrors({});
      setStatus("Added! ✅");
      setTimeout(()=>setStatus(""), 1500);
    } catch (ex) {
      setStatus(ex.message || "Server error");
    } finally {
      setBusy(false);
    }
  }

  function Field({name,label,type="text",placeholder}) {
    return (
      <label>
        {label}
        {type==="textarea" ? (
          <textarea rows="3" name={name} value={form[name]} onChange={update} className={errors[name]?"error":""}/>
        ) : (
          <input type={type} name={name} value={form[name]} onChange={update} placeholder={placeholder} className={errors[name]?"error":""}/>
        )}
        {errors[name] && <span className="error-message">{errors[name]}</span>}
      </label>
    );
  }

  return (
    <form onSubmit={submit} style={{
      background:"#fff", border:"1px solid #eee", borderRadius:16, padding:16,
      boxShadow:"0 6px 16px rgba(0,0,0,.05)", margin:"16px 0"
    }} noValidate>
      <h2 style={{marginTop:0}}>Add a Game (POST /api/games)</h2>
      <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>
        <Field name="title" label="Title" placeholder="Lakers vs Celtics"/>
        <label>League
          <select name="league" value={form.league} onChange={update} className={errors.league?"error":""}>
            {["NFL","NBA","NCAA Football","MLB","MLS"].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {errors.league && <span className="error-message">{errors.league}</span>}
        </label>
        <Field name="date" label="Date" type="date"/>
        <Field name="time" label="Time" type="time"/>
        <Field name="venue" label="Venue" placeholder="Crypto.com Arena"/>
        <Field name="city" label="City" placeholder="Los Angeles, CA"/>
        <Field name="price" label="Starting Price (USD)" type="number"/>
        <Field name="img" label="Image path (on API)" placeholder="/images/saints-vs-falcons.jpg"/>
        <div style={{gridColumn:"1 / -1"}}>
          <Field name="summary" label="Summary" type="textarea"/>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:10}}>
        {status && <span>{status}</span>}
        <button disabled={busy}>{busy ? "Adding…" : "Add Game"}</button>
      </div>
    </form>
  );
}

function List() {
  const [items, setItems] = React.useState([]);
  const [err, setErr] = React.useState("");

  const load = React.useCallback(() => {
    setErr("");
    apiList().then(setItems).catch(e => setErr(e.message));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"8px 0"}}>
        <h3 style={{margin:0}}>Games List ({items.length})</h3>
        <button onClick={load}>Refresh</button>
      </div>
      {err && <p style={{color:"#b91c1c"}}>{err}</p>}
      {items.length === 0 ? (
        <p>No games yet — add your first one above!</p>
      ) : (
        <div style={{display:"grid",gap:14,gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>
          {items
            .slice()
            .sort((a,b)=> new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .map(g => <Card key={g._id} game={g} />)}
        </div>
      )}
    </div>
  );
}

function App(){
  const [lastAdded, setLastAdded] = React.useState(null);
  return (
    <div className="api-integration-app">
      <Form onAdded={setLastAdded}/>
      {/* Changing key triggers List remount/reload after add; List also has a Refresh button */}
      <List key={lastAdded?._id || "list"} />
    </div>
  );
}

// Mount
(function mount(){
  const root = document.getElementById("react-root");
  if (!root) return setTimeout(mount, 100);
  if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
    root.innerHTML = '<div style="color:#c0392b;padding:20px;background:#ffe6e6;border-radius:8px;">React libs not loaded.</div>';
    return;
  }
  ReactDOM.createRoot(root).render(<App />);
})();
