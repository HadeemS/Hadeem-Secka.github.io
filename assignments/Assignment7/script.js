const scene = document.getElementById("scene");
const drawBtn = document.getElementById("drawBtn");
const clearBtn = document.getElementById("clearBtn");

drawBtn.addEventListener("click", drawScene);
clearBtn.addEventListener("click", clearScene);

function clearScene(){
  scene.innerHTML = "";
  scene.classList.remove("day","night");
}

function drawScene(){
  // reset
  scene.innerHTML = "";

  // Determine time: night is 6pm–5:59am
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;
  scene.classList.toggle("night", isNight);
  scene.classList.toggle("day", !isNight);

  // BACKDROP EXTRAS (optional but pure CSS)
  addMountains();

  // Celestial body
  const sky = document.createElement("div");
  sky.className = isNight ? "moon" : "sun";
  scene.appendChild(sky);

  // Stars only at night (CSS dots twinkling)
  if (isNight) addStars(40);

  // Clouds (6 identical) — loop & even spacing
  const cloudCount = 6;
  const cGap = (scene.clientWidth || 1000) / (cloudCount + 1);
  for (let i = 0; i < cloudCount; i++){
    const c = document.createElement("div");
    c.className = "cloud";
    c.style.top  = `${110 + (i%2)*10}px`;              // slight stagger
    c.style.left = `${Math.round(cGap*(i+1) - 80)}px`;
    c.style.animationDelay = `${i * 0.6}s`;            // offset the drift
    scene.appendChild(c);
  }

  // Trees (6 identical) — loop & even spacing
  const treeCount = 6;
  const tGap = (scene.clientWidth || 1000) / (treeCount + 1);
  for (let i = 0; i < treeCount; i++){
    const tree = document.createElement("div");
    tree.className = "tree";
    tree.style.left = `${Math.round(tGap*(i+1) - 40)}px`;

    const trunk = document.createElement("div");
    trunk.className = "trunk";
    const leaves = document.createElement("div");
    leaves.className = "leaves";

    tree.appendChild(trunk);
    tree.appendChild(leaves);
    scene.appendChild(tree);
  }
}

/* ------- helpers (pure CSS art pieces added via DOM) ------- */
function addMountains(){
  const wrap = document.createElement("div");
  wrap.className = "mountains";
  // five CSS-triangle mountains; two darker for depth
  const ids = ["m1","m2 dark","m3","m4 dark","m5"];
  ids.forEach(cls => {
    const el = document.createElement("div");
    el.className = `mt ${cls}`;
    wrap.appendChild(el);
  });
  scene.appendChild(wrap);
}

function addStars(n){
  for (let i = 0; i < n; i++){
    const s = document.createElement("div");
    s.className = "star";
    // random position upper 60% of sky (avoid ground)
    s.style.left = Math.floor(Math.random() * (scene.clientWidth || 1000)) + "px";
    s.style.top  = Math.floor(Math.random() * 260 + 10) + "px";
    s.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
    s.style.transform = `scale(${(Math.random()*0.8 + 0.6).toFixed(2)})`;
    scene.appendChild(s);
  }
}
