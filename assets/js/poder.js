// === Helpers ===
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const norm = s => (s||"").toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

// Persisted theme
const THEME_KEY = "ef_theme";

// Format numbers: 1.2K / 3.4M / 5.6B
function formatNumber(num) {
  if (num === "???" || Number.isNaN(num)) return "???";
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (num >= 1e9)  return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6)  return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3)  return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num;
}



function getTier(strength) {
  if (strength === "???") return { label:"???", color:"#b6b6c8", cls:"unknown" };
  if (strength >= 1e10) return { label:"Dios", color:"#c084fc", cls:"god" };
  if (strength >= 1e9) return { label:"Cataclismo", color:"#ff3b3b", cls:"cataclysm" };
  if (strength >= 1e8) return { label:"Monstruo", color:"#ffd86b", cls:"monster" };
  if (strength >= 1e7) return { label:"Élite", color:"#7CFF6B", cls:"elite" };
  if (strength >= 1e6) return { label:"Combatiente", color:"#00f5ff", cls:"fighter" };
  return { label:"Bajo", color:"#8bb996", cls:"low" };
}

function strongestKnown(list, limit=5) {
  return [...list]
    .filter(c => typeof c.strength === "number" && c.strength > 0)
    .sort((a,b) => b.strength - a.strength)
    .slice(0, limit);
}

// Clean & normalize original data once
function normalizeData(list) {
  return list.map(c => {
    const cc = { ...c };
    const parsed = parseInt(String(cc.strength).replace(/\./g, ""));
    cc.strength = isNaN(parsed) ? "???" : parsed;
    if (Array.isArray(cc.transformations)) {
      cc.transformations = cc.transformations.map(t => {
        const tt = { ...t };
        const pt = parseInt(String(tt.strength).replace(/\./g, ""));
        tt.strength = isNaN(pt) ? "???" : pt;
        return tt;
      });
    }
    return cc;
  });
}

let DATA = normalizeData(characters);
let FILTERED = [...DATA];
let shownCount = 20;

// === UI wiring ===
const searchInput = $("#global-search");
const clearBtn = $("#clear-search");
const chipsWrap = $("#range-chips");
const sortSelect = $("#sort-select");
const hideUnknownPower = $("#hide-unknown-power");
const statsBar = $("#stats-bar");
const topThreats = $("#top-threats");
const toTop = $("#scroll-top");
const collapseAllBtn = $("#collapse-all");

// Theme
const themeBtn = $("#theme-toggle");
function setTheme(mode){
  const body = document.body;
  body.classList.remove("light-mode","dark-mode");
  body.classList.add(mode);
  themeBtn.setAttribute("aria-pressed", mode==="dark-mode" ? "true":"false");
  themeBtn.textContent = mode==="dark-mode" ? "☀️" : "🌙";
  try { localStorage.setItem(THEME_KEY, mode); } catch(e){}
}
function toggleTheme(){
  const isDark = document.body.classList.contains("dark-mode");
  setTheme(isDark ? "light-mode" : "dark-mode");
}
themeBtn?.addEventListener("click", toggleTheme);
(() => {
  const saved = (localStorage.getItem(THEME_KEY)||"").trim();
  if (saved==="dark-mode"||saved==="light-mode") setTheme(saved); else setTheme("dark-mode");
})();

// Search & filter state
const activeRanges = new Set();
let hideUnknownPowerEnabled = false;

function inRange(val, rangeKey) {
  if (val === "???") return rangeKey==="unknown";
  const n = val;
  switch(rangeKey){
    case "lt1m": return n < 1e6;
    case "1to10": return n >= 1e6 && n < 1e7;
    case "10to100": return n >= 1e7 && n < 1e8;
    case "100plus": return n >= 1e8;
    case "unknown": return false; // handled above
  }
  return true;
}

function runSearchAndFilter(){
  const q = norm(searchInput?.value || "");
  FILTERED = DATA.filter(c => {
    // name or transformations match?
    const baseText = c.name + " " + (Array.isArray(c.transformations) ? c.transformations.map(t=>t.name).join(" ") : "");
    const hay = norm(baseText);
    const hit = !q || hay.includes(q);

    // hide characters without established power
    const hasKnownPower = typeof c.strength === "number" && c.strength > 0;
    const knownPowerOk = !hideUnknownPowerEnabled || hasKnownPower;

    // range chips
    let rangeOk = true;
    if (activeRanges.size>0) {
      let ok = false;
      for (const key of activeRanges) {
        if (key==="unknown") {
          if (c.strength==="???") { ok = true; break; }
        } else if (inRange(c.strength, key)) { ok = true; break; }
      }
      rangeOk = ok;
    }
    return hit && knownPowerOk && rangeOk;
  });

  // sort
  if (sortSelect.value==="az") {
    FILTERED.sort((a,b)=> a.name.localeCompare(b.name));
  } else {
    // strength desc, "???" at the end
    FILTERED.sort((a,b)=> (b.strength==="???")-(a.strength==="???") || (b.strength||0) - (a.strength||0));
  }

  shownCount = 20;
  renderList();
  renderTopThreats();
  renderScale();
  updateStats();
}

searchInput?.addEventListener("input", runSearchAndFilter);
clearBtn?.addEventListener("click", ()=>{ searchInput.value=""; runSearchAndFilter(); searchInput.focus(); });

// "/" to focus search, "t" to toggle theme
document.addEventListener("keydown", (e)=>{
  const tag = (e.target.tagName||"").toLowerCase();
  if (e.key === "/" && !["input","textarea","select"].includes(tag)) { e.preventDefault(); searchInput?.focus(); }
  if (e.key.toLowerCase()==="t" && !["input","textarea","select"].includes(tag)) { e.preventDefault(); toggleTheme(); }
});

// Chips
chipsWrap?.addEventListener("click", (e)=>{
  const btn = e.target.closest(".chip");
  if (!btn) return;
  const key = btn.dataset.range;
  if (activeRanges.has(key)) {
    activeRanges.delete(key);
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed","false");
  } else {
    activeRanges.add(key);
    btn.classList.add("active");
    btn.setAttribute("aria-pressed","true");
  }
  runSearchAndFilter();
});

sortSelect?.addEventListener("change", runSearchAndFilter);

hideUnknownPower?.addEventListener("change", () => {
  hideUnknownPowerEnabled = hideUnknownPower.checked;
  runSearchAndFilter();
});

// Stats
function avg(nums) {
  const arr = nums.filter(n => n!=="???");
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a,b)=>a+b,0) / arr.length);
}

function updateStats(){
  const total = FILTERED.length;
  const visibleTopScale = Math.min(20, FILTERED.filter(c => c.strength!=="???").length);
  const avgPower = avg(FILTERED.map(c=>c.strength));

  statsBar.innerHTML = `
    <div class="stat">Personajes: <strong>${total}</strong></div>
    <div class="stat">En escala: <strong>${visibleTopScale}</strong></div>
    <div class="stat">Fuerza media: <strong>${formatNumber(avgPower)}</strong></div>
    <div class="badges">
      <span class="badge ok">SCOUTER OK</span>
      <span class="badge warn">${(activeRanges.size || hideUnknownPowerEnabled) ? "FILTRO ACTIVO" : "SIN FILTRO"}</span>
      <span class="badge err">??? ${FILTERED.filter(c=>c.strength==="???").length}</span>
    </div>
  `;
}


function renderTopThreats(){
  if (!topThreats) return;
  topThreats.innerHTML = "";
  const top = strongestKnown(FILTERED, 5);

  if (!top.length) {
    topThreats.innerHTML = `<div class="scale-note">No hay lecturas de poder conocidas con los filtros actuales.</div>`;
    return;
  }

  top.forEach((c, idx) => {
    const tier = getTier(c.strength);
    const card = document.createElement("article");
    card.className = `threat-card rank-${idx + 1}`;
    card.style.setProperty("--tier-color", tier.color);

    const rank = document.createElement("div");
    rank.className = "threat-rank";
    rank.textContent = `#${idx + 1}`;

    const img = makeImageOrAvatar(c.photo, c.name, "avatar");
    const name = document.createElement("div");
    name.className = "threat-name";
    name.textContent = c.name;

    const power = document.createElement("div");
    power.className = "threat-power";
    power.textContent = `${formatNumber(c.strength)} · ${tier.label}`;

    card.append(rank, img, name, power);
    topThreats.appendChild(card);
  });
}

// Render list
function renderList(){
  const ul = $("#character-list");
  ul.innerHTML = "";

  FILTERED.slice(0, shownCount).forEach(character => {
    const li = document.createElement("li");
    const tier = getTier(character.strength);
    li.className = `character-item ${character.strength === "???" ? "unknown-card" : ""}`;
    li.style.setProperty("--tier-color", tier.color);

    const img = makeImageOrAvatar(character.photo, character.name, "avatar");

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div class="name">${character.name}</div>
      <div class="power">Lectura: ${character.strength==="???" ? "???" : formatNumber(character.strength)}</div>
      <div class="tier-badge" style="--tier-color:${tier.color}">${tier.label}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "actions";

    // Transformations
    if (Array.isArray(character.transformations) && character.transformations.length) {
      const toggle = document.createElement("button");
      toggle.textContent = "Desbloquear formas";
      toggle.className = "toggle-button";

      const tContainer = document.createElement("div");
      tContainer.className = "transformation hidden";

      character.transformations.forEach(t => {
        const tDiv = document.createElement("div");
        tDiv.className = "transformation-item";
        const tImg = makeImageOrAvatar(t.photo, t.name, "avatar");
        const tMeta = document.createElement("div");

let multiplierText = "";

if (character.strength !== "???" && t.strength !== "???") {
  const mult = t.strength / character.strength;

  let hue = 200;
  let glow = "";

  if (mult >= 50) { hue = 55; glow = "glow"; }
  else if (mult >= 25) hue = 280;
  else if (mult >= 10) hue = 200;
  else if (mult >= 5) hue = 180;
  else hue = 0;

  const color = `hsl(${hue}, 90%, 60%)`;

  multiplierText = `<span class="multiplier ${glow}" style="color:${color}; border:1px solid ${color};">
    x${mult.toFixed(1)}
  </span>`;
}

tMeta.innerHTML = `
  <strong>${t.name}</strong> —
  ${t.strength==="???" ? "Fuerza: ???" : "Fuerza: " + formatNumber(t.strength)}
  ${multiplierText}
`;

        tDiv.appendChild(tImg); tDiv.appendChild(tMeta);
        tContainer.appendChild(tDiv);
      });

      toggle.onclick = () => {
        tContainer.classList.toggle("hidden");
        toggle.textContent = tContainer.classList.contains("hidden") ? "Desbloquear formas" : "Bloquear formas";
      };

      actions.appendChild(toggle);
      li.appendChild(img); li.appendChild(meta); li.appendChild(actions); li.appendChild(tContainer);
    } else {
      li.appendChild(img); li.appendChild(meta);
    }

    ul.appendChild(li);
  });

  if (shownCount < FILTERED.length) {
    const btn = document.createElement("button");
    btn.textContent = "Mostrar más";
    btn.onclick = () => { shownCount += 20; renderList(); };
    ul.appendChild(btn);
  }
}

// Render scale (top 20 by current order, ignoring strength "???")
function renderScale() {
  const rail = document.querySelector(".power-rail");
  if (!rail) return;

  rail.querySelectorAll(".power-node").forEach(n => n.remove());

  const visible = FILTERED
    .filter(c => typeof c.strength === "number" && c.strength > 0)
    .slice(0, 20);

  if (!visible.length) return;

  // Escala logarítmica
  const values = visible.map(c => c.strength);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const logMin = Math.log10(min);
  const logMax = Math.log10(max);

  visible.forEach(c => {
    const logVal = Math.log10(c.strength);
    const percent =
      ((logVal - logMin) / (logMax - logMin)) * 100;

    const node = document.createElement("div");
    node.className = "power-node";
    node.style.left = `${percent}%`;
    node.title = `${c.name} — ${formatNumber(c.strength)}`;

    const avatar = makeImageOrAvatar(c.photo, c.name, "power-avatar");

    node.appendChild(avatar);
    rail.appendChild(node);
  });
}


// Collapse-all transformations
collapseAllBtn?.addEventListener("click", ()=>{
  $$(".transformation").forEach(t => t.classList.add("hidden"));
  $$(".toggle-button").forEach(btn => btn.textContent = "Desbloquear formas");
});

// Scroll-to-top
window.addEventListener("scroll", ()=>{
  if (window.scrollY > 600) toTop.classList.add("show"); else toTop.classList.remove("show");
});
toTop?.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));

// Init
runSearchAndFilter();
