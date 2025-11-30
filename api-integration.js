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

async function apiUpdate(id, payload) {
  const r = await fetch(`${API_BASE}/api/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, price: Number(payload.price) })
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.message || data?.error || "Server error";
    const extra = data?.details?.join(" ") || "";
    throw new Error(extra ? `${msg} ${extra}` : msg);
  }
  return data.game || data;
}

async function apiDelete(id) {
  const r = await fetch(`${API_BASE}/api/games/${id}`, {
    method: "DELETE"
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.message || data?.error || "Server error";
    throw new Error(msg);
  }
  return data;
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
  else if (Number(v.price) > 5000) e.price = "Price must be ≤ $5,000";
  if (!v.img?.trim()) e.img = "Image path is required";
  else if (!IMG_RE.test(v.img.trim())) e.img = "Use /images/<file>.png|jpg|jpeg|webp";
  if (!v.summary?.trim()) e.summary = "Summary is required";
  else if (v.summary.trim().length < 10) e.summary = "Summary must be ≥ 10 chars";
  else if (v.summary.trim().length > 280) e.summary = "Summary must be ≤ 280 chars";
  return e;
}

// --- UI components (JSX compiled by Babel Standalone you already load) ---
function Card({ game, onEdit, onDelete }) {
  return (
    <article style={{
      background:"#fff", border:"1px solid #eee", borderRadius:16, padding:12,
      boxShadow:"0 6px 16px rgba(0,0,0,.05)", position:"relative"
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
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button 
          onClick={() => onEdit(game)}
          style={{
            flex:1, padding:"8px 12px", background:"#3b82f6", color:"#fff",
            border:"none", borderRadius:8, cursor:"pointer", fontSize:14,
            fontWeight:500, transition:"background 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "#2563eb"}
          onMouseOut={(e) => e.target.style.background = "#3b82f6"}
        >
          Edit
        </button>
        <button 
          onClick={() => {
            if (window.confirm(`Delete "${game.title}"?`)) {
              onDelete(game._id);
            }
          }}
          style={{
            flex:1, padding:"8px 12px", background:"#dc2626", color:"#fff",
            border:"none", borderRadius:8, cursor:"pointer", fontSize:14,
            fontWeight:500, transition:"background 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "#b91c1c"}
          onMouseOut={(e) => e.target.style.background = "#dc2626"}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function Form({ onAdded, editingGame, onCancelEdit }) {
  const [form, setForm] = React.useState({
    title:"", league:"NBA", date:"", time:"",
    venue:"", city:"", price:"0",
    img:"/images/usc-vs-clemson.jpg",
    summary:""
  });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  // Load editing game data when editingGame changes
  React.useEffect(() => {
    if (editingGame) {
      setForm({
        title: editingGame.title || "",
        league: editingGame.league || "NBA",
        date: editingGame.date || "",
        time: editingGame.time || "",
        venue: editingGame.venue || "",
        city: editingGame.city || "",
        price: String(editingGame.price || "0"),
        img: editingGame.img || "/images/usc-vs-clemson.jpg",
        summary: editingGame.summary || ""
      });
      setErrors({});
      setStatus("");
    } else {
      // Reset form when not editing
      setForm({
        title:"", league:"NBA", date:"", time:"",
        venue:"", city:"", price:"0",
        img:"/images/usc-vs-clemson.jpg",
        summary:""
      });
      setErrors({});
      setStatus("");
    }
  }, [editingGame]);

  function update(e){ setForm(f => ({ ...f, [e.target.name]: e.target.value })); setStatus(""); }

  async function submit(e){
    e.preventDefault();
    const err = validateGame(form);
    setErrors(err);
    if (Object.keys(err).length) { setStatus("Please fix the highlighted fields."); return; }
    try {
      setBusy(true); setStatus(editingGame ? "Updating…" : "Saving…");
      
      if (editingGame) {
        // Update existing game
        const updated = await apiUpdate(editingGame._id, form);
        onAdded(updated);
        setStatus("Updated! ✅");
        setTimeout(() => {
          setStatus("");
          if (onCancelEdit) onCancelEdit();
        }, 1500);
      } else {
        // Create new game
        const created = await apiCreate(form);
        onAdded(created);
        setForm({
          title:"", league:"NBA", date:"", time:"",
          venue:"", city:"", price:"0", img:"/images/usc-vs-clemson.jpg", summary:""
        });
        setErrors({});
        setStatus("Added! ✅");
        setTimeout(()=>setStatus(""), 1500);
      }
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2 style={{margin:0}}>{editingGame ? `Edit Game (PUT /api/games/${editingGame._id})` : "Add a Game (POST /api/games)"}</h2>
        {editingGame && (
          <button 
            type="button"
            onClick={onCancelEdit}
            style={{
              padding:"6px 12px", background:"#64748b", color:"#fff",
              border:"none", borderRadius:6, cursor:"pointer", fontSize:14
            }}
          >
            Cancel
          </button>
        )}
      </div>
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
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:10,alignItems:"center"}}>
        {status && <span style={{color:status.includes("✅") ? "#059669" : status.includes("error") ? "#dc2626" : "#64748b"}}>{status}</span>}
        <button disabled={busy} style={{
          padding:"10px 20px", background:editingGame ? "#3b82f6" : "#059669",
          color:"#fff", border:"none", borderRadius:8, cursor:busy ? "not-allowed" : "pointer",
          fontSize:15, fontWeight:500, opacity:busy ? 0.6 : 1
        }}>
          {busy ? (editingGame ? "Updating…" : "Adding…") : (editingGame ? "Update Game" : "Add Game")}
        </button>
      </div>
    </form>
  );
}

function List({ onEdit, refreshTrigger }) {
  const [items, setItems] = React.useState([]);
  const [err, setErr] = React.useState("");
  const [deletingId, setDeletingId] = React.useState(null);

  const load = React.useCallback(() => {
    setErr("");
    apiList().then(setItems).catch(e => setErr(e.message));
  }, []);

  React.useEffect(() => { load(); }, [load, refreshTrigger]);

  async function handleDelete(id) {
    try {
      setDeletingId(id);
      await apiDelete(id);
      // Remove from list immediately
      setItems(prev => prev.filter(g => g._id.toString() !== id.toString()));
      setDeletingId(null);
    } catch (ex) {
      setErr(ex.message || "Failed to delete game");
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"8px 0"}}>
        <h3 style={{margin:0}}>Games List ({items.length})</h3>
        <button 
          onClick={load}
          style={{
            padding:"8px 16px", background:"#64748b", color:"#fff",
            border:"none", borderRadius:8, cursor:"pointer", fontSize:14
          }}
        >
          Refresh
        </button>
      </div>
      {err && <p style={{color:"#b91c1c",padding:12,background:"#fee2e2",borderRadius:8}}>{err}</p>}
      {items.length === 0 ? (
        <p>No games yet — add your first one above!</p>
      ) : (
        <div style={{display:"grid",gap:14,gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>
          {items
            .slice()
            .sort((a,b)=> new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .map(g => (
              <Card 
                key={g._id} 
                game={g} 
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function App(){
  const [lastAdded, setLastAdded] = React.useState(null);
  const [editingGame, setEditingGame] = React.useState(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  function handleAdded(game) {
    setLastAdded(game);
    setRefreshTrigger(prev => prev + 1);
    if (editingGame) {
      setEditingGame(null);
    }
  }

  function handleEdit(game) {
    setEditingGame(game);
    // Scroll to form
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleCancelEdit() {
    setEditingGame(null);
  }

  return (
    <div className="api-integration-app">
      <Form 
        onAdded={handleAdded}
        editingGame={editingGame}
        onCancelEdit={handleCancelEdit}
      />
      <List 
        onEdit={handleEdit}
        refreshTrigger={refreshTrigger}
      />
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
