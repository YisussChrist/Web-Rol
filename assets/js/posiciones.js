    // =========================
    // Data model
    // =========================
    const LS_KEY = "go2_positions_v2_minimal";

    /** @type {{id:string, name:string, number:number|null, role:string, element:string, zone:""|"GK"|"DF"|"MF"|"FW"|"MN"|"GR", notes:string}[]} */
    let players = [];
    let selectedId = null;
    let lockMoves = false;

    // Demo seed (puedes borrar para empezar vacío)
    const demoSeed = [
      { name:"Renzu Itō", number:10, role:"As", element:"Fuego", zone:"FW", notes:"Tiro principal del equipo." },
      { name:"Jeanne d’Arc", number:9, role:"Capitán", element:"Luz", zone:"MF", notes:"Control y liderazgo." },
      { name:"Mavuika", number:7, role:"Jugador", element:"Electricidad", zone:"DF", notes:"Velocidad + presión alta." },
      { name:"Kanon Tsukihara", number:null, role:"Manager", element:"—", zone:"MN", notes:"Apoya desde la banda." },
    ];

    const ZONES_FIELD = ["GK","DF","MF","FW"];
    const ZONES_STAFF = ["MN","GR"];
    const ZONES_ALL = [...ZONES_FIELD, ...ZONES_STAFF];

    // =========================
    // Helpers
    // =========================
    const $ = (id) => document.getElementById(id);

    function escapeHtml(str){
      return (str ?? "").toString()
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/\'/g,"&#39;");
    }
    function uid(){
      return Math.random().toString(16).slice(2,10) + "-" + Date.now().toString(16).slice(-6);
    }
    function initials(name){
      const parts = (name || "").trim().split(/\s+/).filter(Boolean);
      if(!parts.length) return "??";
      const a = parts[0][0] || "?";
      const b = parts.length > 1 ? (parts[parts.length-1][0] || "") : (parts[0][1] || "");
      return (a + b).toUpperCase();
    }
    function elementBadge(el){
      const map = {
        "Fuego":"🔥","Aire":"🌪️","Montaña":"🪨","Bosque":"🌿","Hielo":"❄️","Agua":"💧","Electricidad":"⚡",
        "Luz":"✨","Cósmico":"🌙","Dragón":"🐲","Sangre":"🩸","Psíquico":"🧠","Psiquico":"🧠","Onírico":"🌌","Onirico":"🌌","Fuerza":"💪","—":"—",
      };
      return map[el] ?? "—";
    }
    function zoneLabel(z){
      return z === "GK" ? "Portero"
        : z === "DF" ? "Defensa"
        : z === "MF" ? "Medio"
        : z === "FW" ? "Delantera"
        : z === "MN" ? "Manager"
        : z === "GR" ? "Gerente"
        : "Sin asignar";
    }
    function sanitizeNumber(n){
      if(n === "" || n === null || typeof n === "undefined") return null;
      const v = Number(n);
      if(Number.isNaN(v)) return null;
      return Math.max(0, Math.min(999, Math.floor(v)));
    }
    function toast(msg){
      const t = $("toast");
      $("toastMsg").textContent = msg;
      t.classList.add("show");
      clearTimeout(toast._timer);
      toast._timer = setTimeout(()=>t.classList.remove("show"), 1700);
    }

    function counts(){
      const c = {GK:0,DF:0,MF:0,FW:0,MN:0,GR:0};
      for(const p of players){
        if(p.zone && c[p.zone] !== undefined) c[p.zone]++;
      }
      return c;
    }
    function countPlacedField(){ return players.filter(p=>ZONES_FIELD.includes(p.zone)).length; }
    function countStaff(){ return players.filter(p=>ZONES_STAFF.includes(p.zone)).length; }

    // =========================
    // Rendering
    // =========================
    function render(){
      renderRoster();
      renderZones();
      renderCounts();
      renderSelectedInfo();
    }

    function renderCounts(){
      const c = counts();
      $("countGK").textContent = c.GK;
      $("countDF").textContent = c.DF;
      $("countMF").textContent = c.MF;
      $("countFW").textContent = c.FW;
      $("countMN").textContent = c.MN;
      $("countGR").textContent = c.GR;

      $("rosterCount").textContent = `${players.length} personajes`;
      $("placedCount").textContent = `${countPlacedField()} en campo`;
      $("staffCount").textContent = `${countStaff()} staff`;

      $("hintPill").textContent = lockMoves ? "Arrastrar: OFF" : "Arrastrar: ON";
    }

    function matchesSearch(p, q){
      if(!q) return true;
      const hay = `${p.name} ${p.number ?? ""} ${p.role} ${p.element} ${p.zone} ${p.notes}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    }

    function renderRoster(){
      const q = $("searchInput").value.trim();
      const list = $("rosterList");
      list.innerHTML = "";

      const filtered = players.filter(p=>matchesSearch(p,q));
      if(filtered.length === 0){
        const empty = document.createElement("div");
        empty.className = "muted";
        empty.style.padding = "12px";
        empty.innerHTML = `No hay resultados. <br><br>Usa <b>＋ Añadir</b> para crear un personaje.`;
        list.appendChild(empty);
        return;
      }

      for(const p of filtered){
        const el = document.createElement("div");
        el.className = "card";
        el.draggable = !lockMoves;
        el.dataset.id = p.id;

        el.innerHTML = `
          <div class="avatar">${escapeHtml(initials(p.name))}<span class="tag">${elementBadge(p.element)}</span></div>
          <div class="meta">
            <div class="nameRow">
              <div class="name">${escapeHtml(p.name || "(Sin nombre)")}</div>
              <div class="iconRow">
                <button class="iconBtn" title="Editar" data-act="edit">✏️</button>
                <button class="iconBtn" title="Quitar de zona" data-act="unassign">🧲</button>
              </div>
            </div>
            <div class="small">
              <span class="chip">#${p.number ?? "—"}</span>
              <span class="chip">${escapeHtml(p.role || "Jugador")}</span>
              <span class="chip">${zoneLabel(p.zone)}</span>
            </div>
          </div>
        `;

        el.addEventListener("click", (ev)=>{
          const act = ev.target?.dataset?.act;
          if(act === "unassign"){
            setZone(p.id, "");
            render();
            toast("Quitado de zona");
            return;
          }
          // Por defecto, editar/seleccionar
          selectPlayer(p.id);
        });

        el.addEventListener("dragstart", (ev)=>{
          if(lockMoves) return ev.preventDefault();
          ev.dataTransfer.setData("text/plain", p.id);
          ev.dataTransfer.effectAllowed = "move";
        });

        list.appendChild(el);
      }
    }

    function renderZones(){
      // clear all slots
      for(const z of ZONES_ALL){
        const slot = $("slot" + z);
        if(slot) slot.innerHTML = "";
      }

      const byZone = {};
      for(const z of ZONES_ALL) byZone[z] = [];
      for(const p of players){
        if(p.zone && byZone[p.zone]) byZone[p.zone].push(p);
      }

      for(const z of ZONES_ALL){
        const slot = $("slot" + z);
        if(!slot) continue;

        for(const p of byZone[z]){
          const mini = document.createElement("div");
          mini.className = "mini";
          mini.draggable = !lockMoves;
          mini.dataset.id = p.id;

          mini.innerHTML = `
            <div class="miniLeft">
              <div class="badge">${elementBadge(p.element)}</div>
              <div class="miniTxt">
                <div class="t1">${escapeHtml(p.name || "(Sin nombre)")}</div>
                <div class="t2">
                  <span class="chip">#${p.number ?? "—"}</span>
                  <span class="chip">${escapeHtml(p.role || "Jugador")}</span>
                </div>
              </div>
            </div>
            <div class="miniRight">
              <button class="iconBtn" title="Editar" data-act="edit">✏️</button>
              <button class="iconBtn" title="Quitar" data-act="remove">🧲</button>
            </div>
          `;

          mini.addEventListener("click", (ev)=>{
            const act = ev.target?.dataset?.act;
            if(act === "remove"){
              setZone(p.id, "");
              render();
              toast("Quitado de zona");
              return;
            }
            selectPlayer(p.id);
          });

          mini.addEventListener("dragstart", (ev)=>{
            if(lockMoves) return ev.preventDefault();
            ev.dataTransfer.setData("text/plain", p.id);
            ev.dataTransfer.effectAllowed = "move";
          });

          slot.appendChild(mini);
        }
      }
    }

    function renderSelectedInfo(){
      const p = players.find(x=>x.id===selectedId);
      $("selectedIdPill").textContent = p ? p.id : "—";
      $("selectedLabel").textContent = p ? `Editando: ${p.name || "(Sin nombre)"}` : "Selecciona un personaje";
      $("selectedPill").textContent = p ? (p.name || "Seleccionado") : "—";

      // Fill form
      $("fName").value = p?.name ?? "";
      $("fNumber").value = (p?.number ?? "");
      $("fRole").value = p?.role ?? "Jugador";
      $("fElement").value = p?.element ?? "—";
      $("fZone").value = p?.zone ?? "";
      $("fNotes").value = p?.notes ?? "";

      const disabled = !p;
      for(const id of ["btnApply","btnUnassign","btnDelete"]){
        $(id).disabled = disabled;
        $(id).style.opacity = disabled ? ".55" : "1";
        $(id).style.pointerEvents = disabled ? "none" : "auto";
      }
    }

    // =========================
    // Actions
    // =========================
    function selectPlayer(id){
      selectedId = id;
      renderSelectedInfo();
    }

    function addPlayer(payload={}){
      const p = {
        id: uid(),
        name: payload.name ?? "Nuevo personaje",
        number: sanitizeNumber(payload.number ?? ""),
        role: payload.role ?? "Jugador",
        element: payload.element ?? "—",
        zone: payload.zone ?? "",
        notes: payload.notes ?? ""
      };
      players.unshift(p);
      selectedId = p.id;
      render();
      toast("Creado");
    }

    function deletePlayer(id){
      const idx = players.findIndex(p=>p.id===id);
      if(idx >= 0){
        const was = players[idx];
        players.splice(idx,1);
        if(selectedId === id) selectedId = null;
        render();
        toast(`Borrado: ${was.name || "personaje"}`);
      }
    }

    function setZone(id, zone){
      const p = players.find(x=>x.id===id);
      if(!p) return;
      p.zone = zone;
    }

    function applyForm(){
      const p = players.find(x=>x.id===selectedId);
      if(!p) return;

      p.name = $("fName").value.trim() || "Sin nombre";
      p.number = sanitizeNumber($("fNumber").value);
      p.role = $("fRole").value;
      p.element = $("fElement").value;
      p.zone = $("fZone").value;
      p.notes = $("fNotes").value.trim();

      render();
      toast("Guardado en ficha");
    }

    function unassignSelected(){
      const p = players.find(x=>x.id===selectedId);
      if(!p) return;
      p.zone = "";
      $("fZone").value = "";
      render();
      toast("Quitado de zona");
    }

    function saveLS(){
      const payload = {
        version: 2,
        updatedAt: new Date().toISOString(),
        lockMoves,
        players
      };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
      toast("Guardado");
    }

    function loadLS(){
      const raw = localStorage.getItem(LS_KEY);
      if(!raw){
        players = demoSeed.map(x=>({id:uid(), ...x}));
        selectedId = players[0]?.id ?? null;
        setLock(false, true);
        render();
        toast("Demo cargado");
        return;
      }
      try{
        const obj = JSON.parse(raw);
        players = Array.isArray(obj.players) ? obj.players : [];
        lockMoves = !!obj.lockMoves;
        setLock(lockMoves, true);
        selectedId = players[0]?.id ?? null;
        render();
        toast("Cargado");
      }catch(e){
        console.error(e);
        toast("Error al cargar");
      }
    }

    function exportJSON(){
      const payload = { version: 2, exportedAt: new Date().toISOString(), players };
      $("jsonBox").value = JSON.stringify(payload, null, 2);
      $("jsonBox").focus();
      $("jsonBox").select();
      toast("Exportado");
      try{ document.execCommand("copy"); }catch(_){}
    }

    function importJSON(){
      const txt = $("jsonBox").value.trim();
      if(!txt){ toast("Pega un JSON"); return; }
      try{
        const obj = JSON.parse(txt);
        const incoming = Array.isArray(obj.players) ? obj.players : (Array.isArray(obj) ? obj : null);
        if(!incoming) throw new Error("Formato no válido");

        players = incoming.map(p=>({
          id: p.id || uid(),
          name: (p.name ?? "").toString(),
          number: sanitizeNumber(p.number ?? ""),
          role: (p.role ?? "Jugador").toString(),
          element: (p.element ?? "—").toString(),
          zone: (p.zone ?? "").toString(),
          notes: (p.notes ?? "").toString()
        }));

        selectedId = players[0]?.id ?? null;
        render();
        toast("Importado");
      }catch(e){
        console.error(e);
        toast("JSON inválido");
      }
    }

    function resetAll(){
      players = [];
      selectedId = null;
      $("jsonBox").value = "";
      localStorage.removeItem(LS_KEY);
      render();
      toast("Reseteado");
    }

    function setLock(on, silent=false){
      lockMoves = on;
      const sw = $("lockSwitch");
      sw.classList.toggle("on", on);
      sw.setAttribute("aria-checked", String(on));
      $("hintPill").textContent = lockMoves ? "Arrastrar: OFF" : "Arrastrar: ON";
      if(!silent) toast(on ? "Arrastre bloqueado" : "Arrastre activado");
      const hp = $("hintPill");
      if(hp) hp.textContent = on ? "Arrastrar: OFF" : "Arrastrar: ON";
      render();
    }

    // =========================
    // Drag & Drop zones (field + staff)
    // =========================
    function setupZones(){
      document.querySelectorAll("[data-zone]").forEach(zoneEl=>{
        const zone = zoneEl.dataset.zone;

        zoneEl.addEventListener("dragover", (ev)=>{
          if(lockMoves) return;
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "move";
          zoneEl.classList.add("dragover");
        });

        zoneEl.addEventListener("dragleave", ()=>{
          zoneEl.classList.remove("dragover");
        });

        zoneEl.addEventListener("drop", (ev)=>{
          if(lockMoves) return;
          ev.preventDefault();
          zoneEl.classList.remove("dragover");
          const id = ev.dataTransfer.getData("text/plain");
          if(!id) return;
          setZone(id, zone);
          render();
          toast(`Asignado: ${zoneLabel(zone)}`);
        });
      });
    }

    // =========================
    // UI bindings / init
    // =========================
    function setupUI(){
      $("btnAdd").addEventListener("click", ()=> addPlayer({}));
      $("btnSave").addEventListener("click", saveLS);
      $("btnLoad").addEventListener("click", loadLS);
      $("btnExport").addEventListener("click", exportJSON);
      $("btnImport").addEventListener("click", importJSON);
      // Mobile: more actions menu
      const moreBtn = $("btnMore");
      const moreMenu = $("moreMenu");
      function setMore(open){
        const isOpen = !!open;
        moreMenu.classList.toggle("hidden", !isOpen);
        moreBtn.setAttribute("aria-expanded", String(isOpen));
      }
      moreBtn.addEventListener("click", (ev)=>{
        ev.stopPropagation();
        setMore(moreMenu.classList.contains("hidden"));
      });
      document.addEventListener("click", ()=> setMore(false));
      moreMenu.addEventListener("click", (ev)=> ev.stopPropagation());

      $("btnReset").addEventListener("click", ()=>{
        if(confirm("¿Resetear? Se borrará el guardado local.")) resetAll();
      });

      $("searchInput").addEventListener("input", renderRoster);
      $("btnClearSearch").addEventListener("click", ()=>{
        $("searchInput").value = "";
        renderRoster();
      });

      $("btnApply").addEventListener("click", applyForm);
      $("btnUnassign").addEventListener("click", unassignSelected);
      $("btnDelete").addEventListener("click", ()=>{
        if(!selectedId) return;
        const p = players.find(x=>x.id===selectedId);
        if(confirm(`¿Borrar a ${p?.name || "este personaje"}?`)) deletePlayer(selectedId);
      });

      function toggleLock(){ setLock(!lockMoves); }
      $("lockSwitch").addEventListener("click", toggleLock);
      $("lockSwitch").addEventListener("keydown", (ev)=>{
        if(ev.key === "Enter" || ev.key === " "){
          ev.preventDefault();
          toggleLock();
        }
      });


      // Quick toggle for drag on mobile: tap the "Arrastrar" pill
      const hp = $("hintPill");
      if(hp){
        hp.style.cursor = "pointer";
        hp.addEventListener("click", ()=>{
          setLock(!lockMoves);
          hp.textContent = lockMoves ? "Arrastrar: OFF" : "Arrastrar: ON";
        });
      }
document.addEventListener("keydown", (ev)=>{
        const isMac = navigator.platform.toUpperCase().includes("MAC");
        if((isMac ? ev.metaKey : ev.ctrlKey) && ev.key.toLowerCase() === "s"){
          ev.preventDefault();
          saveLS();
        }
      });
    }


    function setupMobileTabs(){
      const nav = document.querySelector(".mobileNav");
      if(!nav) return;

      const pages = {
        Roster: $("pageRoster"),
        Pitch: $("pagePitch"),
        Editor: $("pageEditor"),
      };
      const tabs = {
        Roster: $("tabRoster"),
        Pitch: $("tabPitch"),
        Editor: $("tabEditor"),
      };

      function apply(tab){
        // Only apply on small screens where nav is visible
        const isMobile = window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
        if(!isMobile) {
          // ensure desktop shows all
          Object.values(pages).forEach(p=>p && p.classList.remove("activePage"));
          Object.values(tabs).forEach(t=>t && t.classList.remove("active"));
          return;
        }

        Object.entries(pages).forEach(([k,el])=>{
          if(!el) return;
          el.classList.toggle("activePage", k===tab);
        });
        Object.entries(tabs).forEach(([k,el])=>{
          if(!el) return;
          el.classList.toggle("active", k===tab);
        });

        try{ sessionStorage.setItem("go2_mobile_tab", tab); }catch(_){}
      }

      // Click handlers
      Object.entries(tabs).forEach(([k,btn])=>{
        if(!btn) return;
        btn.addEventListener("click", ()=>apply(k));
      });

      // Default tab
      let start = "Pitch";
      try{
        const saved = sessionStorage.getItem("go2_mobile_tab");
        if(saved && pages[saved]) start = saved;
      }catch(_){}

      // Apply now + on resize/orientation change
      apply(start);
      window.addEventListener("resize", ()=>apply(start));
      window.addEventListener("orientationchange", ()=>apply(start));
    }


    // =========================
    // Touch drag fallback (iOS Safari)
    // =========================
    let touchDrag = {
      active:false,
      id:null,
      ghost:null,
      lastZoneEl:null,
      pointerId:null
    };

    function makeGhost(label){
      const g = document.createElement("div");
      g.style.position = "fixed";
      g.style.left = "0px";
      g.style.top = "0px";
      g.style.zIndex = "9999";
      g.style.transform = "translate(-9999px,-9999px)";
      g.style.pointerEvents = "none";
      g.style.padding = "10px 12px";
      g.style.borderRadius = "14px";
      g.style.border = "1px solid rgba(255,255,255,.18)";
      g.style.background = "rgba(0,0,0,.55)";
      g.style.backdropFilter = "blur(10px)";
      g.style.webkitBackdropFilter = "blur(10px)";
      g.style.boxShadow = "0 14px 40px rgba(0,0,0,.45)";
      g.style.fontWeight = "900";
      g.style.fontSize = "12px";
      g.style.maxWidth = "70vw";
      g.style.whiteSpace = "nowrap";
      g.style.overflow = "hidden";
      g.style.textOverflow = "ellipsis";
      g.textContent = label || "Arrastrando…";
      document.body.appendChild(g);
      return g;
    }

    function clearZoneHighlight(){
      if(touchDrag.lastZoneEl){
        touchDrag.lastZoneEl.classList.remove("dragover");
        touchDrag.lastZoneEl = null;
      }
    }

    function touchStartFrom(el, ev){
      if(lockMoves) return;
      const id = el?.dataset?.id;
      if(!id) return;

      const p = players.find(x=>x.id===id);
      touchDrag.active = true;
      touchDrag.id = id;

      // Capture pointer if available
      if(ev.pointerId != null){
        touchDrag.pointerId = ev.pointerId;
        try{ el.setPointerCapture(ev.pointerId); }catch(_){}
      }

      // Create ghost
      if(touchDrag.ghost) touchDrag.ghost.remove();
      touchDrag.ghost = makeGhost(p?.name || "Arrastrando…");

      // Prevent page from scrolling while dragging
      ev.preventDefault();
      document.body.classList.add("dragging");
    }

    function touchMove(ev){
      if(!touchDrag.active) return;

      const x = ev.clientX ?? (ev.touches && ev.touches[0]?.clientX);
      const y = ev.clientY ?? (ev.touches && ev.touches[0]?.clientY);
      if(x == null || y == null) return;

      // Move ghost
      if(touchDrag.ghost){
        touchDrag.ghost.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
      }

      // Highlight zone under pointer
      const el = document.elementFromPoint(x, y);
      const zoneEl = el ? el.closest("[data-zone]") : null;

      if(zoneEl !== touchDrag.lastZoneEl){
        clearZoneHighlight();
        if(zoneEl){
          zoneEl.classList.add("dragover");
          touchDrag.lastZoneEl = zoneEl;
        }
      }

      ev.preventDefault();
    }

    function touchEnd(ev){
      if(!touchDrag.active) return;

      const x = ev.clientX ?? (ev.changedTouches && ev.changedTouches[0]?.clientX);
      const y = ev.clientY ?? (ev.changedTouches && ev.changedTouches[0]?.clientY);

      let dropped = false;
      if(x != null && y != null){
        const el = document.elementFromPoint(x, y);
        const zoneEl = el ? el.closest("[data-zone]") : null;
        const zone = zoneEl?.dataset?.zone;

        if(zone){
          setZone(touchDrag.id, zone);
          dropped = true;
        }
      }

      clearZoneHighlight();

      if(touchDrag.ghost){
        touchDrag.ghost.remove();
        touchDrag.ghost = null;
      }

      const id = touchDrag.id;
      touchDrag.active = false;
      touchDrag.id = null;
      touchDrag.pointerId = null;
      document.body.classList.remove("dragging");

      if(dropped){
        render();
        toast(`Asignado: ${zoneLabel(players.find(p=>p.id===id)?.zone)}`);
      }
    }

    function setupTouchDrag(){
      // Use Pointer Events when available; fallback to Touch Events
      const usePointer = "PointerEvent" in window;

      // Start on roster cards / minis (event delegation)
      document.addEventListener(usePointer ? "pointerdown" : "touchstart", (ev)=>{
        // Only primary touch/pen
        if(usePointer){
          if(ev.pointerType && ev.pointerType !== "touch" && ev.pointerType !== "pen") return;
          if(ev.button != null && ev.button !== 0) return;
        }

        const target = ev.target;
        const draggableEl = target?.closest?.(".card, .mini");
        if(!draggableEl) return;

        // If they tapped an action button, don't start drag
        if(target.closest(".iconBtn")) return;

        // If the element isn't marked with an id, ignore
        if(!draggableEl.dataset.id) return;

        // Only apply touch drag on coarse pointer devices (phones/tablets)
        // (Still works on desktop touchscreens)
        touchStartFrom(draggableEl, ev);
      }, {passive:false});

      document.addEventListener(usePointer ? "pointermove" : "touchmove", touchMove, {passive:false});
      document.addEventListener(usePointer ? "pointerup" : "touchend", touchEnd, {passive:false});
      document.addEventListener(usePointer ? "pointercancel" : "touchcancel", touchEnd, {passive:false});
    }




    // =========================
    // Usability patch v2
    // =========================
    function setupUsabilityV2(){
      const actionsMain = document.querySelector('.actionsMain');
      if(actionsMain && !document.getElementById('btnFocusMode')){
        const focusBtn = document.createElement('button');
        focusBtn.className = 'btn';
        focusBtn.id = 'btnFocusMode';
        focusBtn.type = 'button';
        focusBtn.textContent = 'Modo campo';
        focusBtn.title = 'Oculta/muestra el editor para trabajar más limpio';
        focusBtn.addEventListener('click', ()=>{
          document.body.classList.toggle('focus-mode');
          const on = document.body.classList.contains('focus-mode');
          focusBtn.textContent = on ? 'Ver editor' : 'Modo campo';
          try{ localStorage.setItem('go2_focus_mode', on ? '1':'0'); }catch(_){ }
          toast(on ? 'Modo campo activado' : 'Editor visible');
        });
        actionsMain.insertBefore(focusBtn, document.getElementById('btnMore'));
        try{
          if(localStorage.getItem('go2_focus_mode') === '1'){
            document.body.classList.add('focus-mode');
            focusBtn.textContent = 'Ver editor';
          }
        }catch(_){ }
      }

      if(!document.getElementById('btnClearField')){
        const btn = document.createElement('button');
        btn.className = 'btn warn';
        btn.id = 'btnClearField';
        btn.type = 'button';
        btn.textContent = 'Vaciar campo';
        btn.title = 'Quita jugadores del campo sin borrar personajes';
        btn.addEventListener('click', ()=>{
          if(!confirm('¿Vaciar campo y staff? No borra personajes, solo zonas.')) return;
          players.forEach(p=>p.zone='');
          render();
          toast('Campo vaciado');
        });
        const moreMenu = document.getElementById('moreMenu');
        if(moreMenu) moreMenu.appendChild(btn);
      }
    }

    function goMobileTab(tab){
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
      if(!isMobile) return;
      const pages = {Roster: $('pageRoster'), Pitch: $('pagePitch'), Editor: $('pageEditor')};
      const tabs = {Roster: $('tabRoster'), Pitch: $('tabPitch'), Editor: $('tabEditor')};
      Object.entries(pages).forEach(([k,el])=> el && el.classList.toggle('activePage', k===tab));
      Object.entries(tabs).forEach(([k,el])=> el && el.classList.toggle('active', k===tab));
      try{ sessionStorage.setItem('go2_mobile_tab', tab); }catch(_){ }
    }

    const __oldSelectPlayer = selectPlayer;
    selectPlayer = function(id){
      __oldSelectPlayer(id);
      goMobileTab('Editor');
    };

    window.addEventListener("DOMContentLoaded", ()=>{
      setupUsabilityV2();
      setupZones();
      setupUI();
      setupTouchDrag();

      // Mobile app navigation (tabs)
      setupMobileTabs();
      loadLS();
    });
