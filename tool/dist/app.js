// Application State
let appState = {
  activeTab: 1,
  workDir: "",
  romPath: "",
  dialogs: [],
  pollInterval: null,
  saveTimeout: null
};

// DOM Elements - Tabs & Pages
const tabBtns = [
  document.getElementById('tab-btn-1'),
  document.getElementById('tab-btn-2'),
  document.getElementById('tab-btn-3')
];
const pages = [
  document.getElementById('page-1'),
  document.getElementById('page-2'),
  document.getElementById('page-3')
];

// Page 1 Elements
const inputRomPath = document.getElementById('input-rom-path');
const inputWorkDir = document.getElementById('input-work-dir');
const romDropzone = document.getElementById('rom-dropzone');
const fileRomInput = document.getElementById('file-rom-input');
const lblRomDrop = document.getElementById('lbl-rom-drop');
const btnBrowseRom = document.getElementById('btn-browse-rom');
const btnBrowseWorkdir = document.getElementById('btn-browse-workdir');
const btnOpenWorkdir = document.getElementById('btn-open-workdir');
const btnGoPage2 = document.getElementById('btn-go-to-page2');

// Page 2 Elements
const btnExtractText = document.getElementById('btn-extract-text');
const btnExtractImages = document.getElementById('btn-extract-images');
const badgeTextStatus = document.getElementById('badge-text-status');
const badgeImageStatus = document.getElementById('badge-image-status');
const btnOpenTradFolder = document.getElementById('btn-open-trad-folder');
const btnBackPage1 = document.getElementById('btn-back-to-page1');
const btnGoPage3 = document.getElementById('btn-go-to-page3');

// Page 3 Elements
const btnOpenDrawer = document.getElementById('btn-open-drawer');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const slidingDrawer = document.getElementById('sliding-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerListItems = document.getElementById('drawer-list-items');
const inputDrawerSearch = document.getElementById('input-drawer-search');
const drawerTotal = document.getElementById('drawer-total');
const drawerTrad = document.getElementById('drawer-trad');

const inputJsonPath = document.getElementById('input-json-path');
const inputImagesPath = document.getElementById('input-images-path');
const btnOpenTradFolder2 = document.getElementById('btn-open-trad-folder-2');
const btnOpenImgFolder = document.getElementById('btn-open-img-folder');
const btnRebuildRom = document.getElementById('btn-rebuild-rom');
const btnRebuildLabel = document.getElementById('btn-rebuild-label');
const btnBackPage2 = document.getElementById('btn-back-to-page2');

// Logs & Progress
const logsContainer = document.getElementById('logs-container');
const mainProgressBar = document.getElementById('main-progress-bar');
const btnClearLogs = document.getElementById('btn-clear-logs');

// ── Tab Management ─────────────────────────────────────────────────────────────
function setTab(tabIndex) {
  appState.activeTab = tabIndex;
  tabBtns.forEach((btn, idx) => {
    if (idx + 1 === tabIndex) {
      btn.classList.add('tab-active');
      btn.classList.remove('text-slate-400');
      btn.classList.add('text-white');
    } else {
      btn.classList.remove('tab-active');
      btn.classList.add('text-slate-400');
      btn.classList.remove('text-white');
    }
  });

  pages.forEach((page, idx) => {
    if (idx + 1 === tabIndex) {
      page.classList.remove('hidden');
    } else {
      page.classList.add('hidden');
    }
  });

  if (tabIndex === 3) {
    loadTranslations();
  }

  setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 50);
}

tabBtns[0].addEventListener('click', () => setTab(1));
tabBtns[1].addEventListener('click', () => setTab(2));
tabBtns[2].addEventListener('click', () => setTab(3));

btnGoPage2.addEventListener('click', () => setTab(2));
btnGoPage3.addEventListener('click', () => setTab(3));
btnBackPage1.addEventListener('click', () => setTab(1));
btnBackPage2.addEventListener('click', () => setTab(2));

// ── Sliding Drawer (Menu Coulissant) ───────────────────────────────────────────
function openDrawer() {
  slidingDrawer.classList.add('open');
  drawerBackdrop.classList.add('open');
  if (appState.dialogs.length === 0) {
    loadTranslations();
  } else {
    renderDrawerList();
  }
}

function closeDrawer() {
  slidingDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
}

btnOpenDrawer.addEventListener('click', openDrawer);
btnCloseDrawer.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

// ── Logs & Smooth Progress Polling ────────────────────────────────────────────
function appendLog(msg, type = "INFO") {
  const div = document.createElement('div');
  const time = new Date().toLocaleTimeString();
  div.className = `log-entry-${type.toLowerCase()}`;
  div.textContent = `[${time}] [${type}] ${msg}`;
  logsContainer.appendChild(div);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

btnClearLogs.addEventListener('click', () => {
  logsContainer.innerHTML = '';
});

function startPollingProgress() {
  if (appState.pollInterval) clearInterval(appState.pollInterval);
  appState.pollInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/progress');
      if (!res.ok) return;
      const data = await res.json();
      
      // Mise à jour propre de la barre sans aller-retour intempestif
      if (data.task && data.current > 0) {
        mainProgressBar.style.width = `${data.current}%`;
      }
      
      if (data.logs && data.logs.length > 0) {
        data.logs.forEach(l => appendLog(l.msg, l.type));
      }
      
      if (data.current >= 100) {
        mainProgressBar.style.width = '100%';
        setTimeout(() => {
          mainProgressBar.style.width = '0%';
        }, 1500);
      }
    } catch (e) {}
  }, 500);
}

// ── Initial Default Paths ─────────────────────────────────────────────────────
async function initDefaultPaths() {
  try {
    const res = await fetch('/api/default-paths');
    const data = await res.json();
    if (data.work_dir) {
      appState.workDir = data.work_dir;
      inputWorkDir.value = data.work_dir;
    }
    if (data.rom_path) {
      appState.romPath = data.rom_path;
      inputRomPath.value = data.rom_path;
      lblRomDrop.innerHTML = `ROM détectée : <span class="text-emerald-400 font-mono font-semibold">${data.rom_path.split('\\').pop()}</span>`;
      romDropzone.classList.add('loaded');
    }
  } catch (e) {
    appendLog("Initialisation terminée", "INFO");
  }
}

// ── Browse & Folder Actions ───────────────────────────────────────────────────
btnBrowseRom.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/browse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'file', ext: '.vb' })
    });
    const data = await res.json();
    if (data.path) {
      inputRomPath.value = data.path;
      appState.romPath = data.path;
      lblRomDrop.innerHTML = `ROM sélectionnée : <span class="text-emerald-400 font-mono font-semibold">${data.path.split('\\').pop()}</span>`;
      romDropzone.classList.add('loaded');
      appendLog(`ROM sélectionnée : ${data.path}`, "SUCCESS");
    }
  } catch (e) {
    appendLog("Erreur de sélection de fichier", "ERROR");
  }
});

btnBrowseWorkdir.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/browse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dir' })
    });
    const data = await res.json();
    if (data.path) {
      inputWorkDir.value = data.path;
      appState.workDir = data.path;
      appendLog(`Dossier de travail : ${data.path}`, "INFO");
      loadTranslations(); // Recharger les trads avec le nouveau dossier
    }
  } catch (e) {
    appendLog("Erreur de sélection de dossier", "ERROR");
  }
});

inputWorkDir.addEventListener('change', () => {
  appState.workDir = inputWorkDir.value.trim();
  loadTranslations();
});

function openFolder(subPath = "") {
  const base = inputWorkDir.value.trim();
  const target = subPath ? `${base}\\${subPath}` : base;
  fetch('/api/open-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ work_dir: target })
  });
}

if (btnOpenWorkdir) btnOpenWorkdir.addEventListener('click', () => openFolder());
if (btnOpenTradFolder) btnOpenTradFolder.addEventListener('click', () => openFolder("traduction"));
if (btnOpenTradFolder2) btnOpenTradFolder2.addEventListener('click', () => openFolder("traduction"));
if (btnOpenImgFolder) btnOpenImgFolder.addEventListener('click', () => openFolder("images_modifiees"));

// ── Drag & Drop Zone ──────────────────────────────────────────────────────────
romDropzone.addEventListener('click', () => fileRomInput.click());

fileRomInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const inferred = `${inputWorkDir.value}\\${file.name}`;
    inputRomPath.value = inferred;
    appState.romPath = inferred;
    lblRomDrop.innerHTML = `ROM sélectionnée : <span class="text-emerald-400 font-mono font-semibold">${file.name}</span>`;
    romDropzone.classList.add('loaded');
    appendLog(`Fichier déposé : ${file.name}`, "SUCCESS");
  }
});

['dragenter', 'dragover'].forEach(eventName => {
  romDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    romDropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  romDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    romDropzone.classList.remove('dragover');
  });
});

romDropzone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    const inferred = `${inputWorkDir.value}\\${file.name}`;
    inputRomPath.value = inferred;
    appState.romPath = inferred;
    lblRomDrop.innerHTML = `ROM sélectionnée : <span class="text-emerald-400 font-mono font-semibold">${file.name}</span>`;
    romDropzone.classList.add('loaded');
    appendLog(`Fichier déposé : ${file.name}`, "SUCCESS");
  }
});

// ── Extraction (Page 2) ───────────────────────────────────────────────────────
btnExtractText.addEventListener('click', async () => {
  const rom = inputRomPath.value.trim();
  const work = inputWorkDir.value.trim();
  if (!rom) {
    alert("Veuillez d'abord sélectionner le fichier de la ROM américaine.");
    return;
  }
  btnExtractText.disabled = true;
  badgeTextStatus.textContent = "Extraction...";
  badgeTextStatus.className = "text-xs font-mono text-amber-300";

  try {
    const res = await fetch('/api/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rom_path: rom, work_dir: work })
    });
    const data = await res.json();
    if (res.ok) {
      badgeTextStatus.textContent = `✓ ${data.count} textes extraits`;
      badgeTextStatus.className = "text-xs font-mono text-emerald-400 font-semibold";
      appendLog(data.msg, "SUCCESS");
      loadTranslations();
    } else {
      throw new Error(data.detail || "Erreur lors de l'extraction");
    }
  } catch (e) {
    badgeTextStatus.textContent = "Erreur";
    badgeTextStatus.className = "text-xs font-mono text-rose-400";
    appendLog(`Erreur : ${e.message}`, "ERROR");
  } finally {
    btnExtractText.disabled = false;
  }
});

if (btnExtractImages) {
  btnExtractImages.addEventListener('click', async () => {
  const rom = inputRomPath.value.trim();
  const work = inputWorkDir.value.trim();
  if (!rom) {
    alert("Veuillez d'abord sélectionner le fichier de la ROM américaine.");
    return;
  }
  btnExtractImages.disabled = true;
  badgeImageStatus.textContent = "Extraction...";
  badgeImageStatus.className = "text-xs font-mono text-amber-300";

  try {
    const res = await fetch('/api/extract-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rom_path: rom, work_dir: work })
    });
    const data = await res.json();
    if (res.ok) {
      badgeImageStatus.textContent = `✓ ${data.count} planches extraites`;
      badgeImageStatus.className = "text-xs font-mono text-emerald-400 font-semibold";
      appendLog(`Images extraites dans : ${work}\\images_extraites et C:\\Users\\nolan\\Desktop\\imajackbros`, "SUCCESS");
    } else {
      throw new Error(data.detail || "Erreur lors de l'extraction");
    }
  } catch (e) {
    badgeImageStatus.textContent = "Erreur";
    badgeImageStatus.className = "text-xs font-mono text-rose-400";
    appendLog(`Erreur : ${e.message}`, "ERROR");
  } finally {
    btnExtractImages.disabled = false;
  }
});
}

// ── Translation Loader & Drawer Renderer ──────────────────────────────────────
async function loadTranslations() {
  const work = inputWorkDir.value.trim();
  try {
    const res = await fetch(`/api/get-translations?work_dir=${encodeURIComponent(work)}`);
    if (!res.ok) throw new Error("Fichier de traduction introuvable");
    appState.dialogs = await res.json();
    renderDrawerList();
  } catch (e) {
    appState.dialogs = [];
    renderDrawerList();
  }
}

function renderDrawerList() {
  drawerListItems.innerHTML = '';
  const search = inputDrawerSearch.value.toLowerCase().trim();

  let tradCount = 0;
  const filtered = appState.dialogs.filter(d => {
    const isTrad = !!(d.texte_fr && d.texte_fr.trim());
    if (isTrad) tradCount++;

    const matchId = d.id.toString().includes(search);
    const matchOffset = `0x${d.offset.toString(16)}`.toLowerCase().includes(search);
    const matchOrig = d.texte_orig && d.texte_orig.toLowerCase().includes(search);
    const matchFr = d.texte_fr && d.texte_fr.toLowerCase().includes(search);
    return matchId || matchOffset || matchOrig || matchFr;
  });

  drawerTotal.textContent = appState.dialogs.length;
  drawerTrad.textContent = tradCount;

  if (appState.dialogs.length === 0) {
    drawerListItems.innerHTML = `
      <div class="text-xs text-slate-400 text-center py-12 flex flex-col items-center gap-2">
        <i data-lucide="file-x" class="w-8 h-8 text-slate-600"></i>
        <span>Aucun dialogue chargé. Effectuez l'étape 2 (Extraction) d'abord.</span>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (filtered.length === 0) {
    drawerListItems.innerHTML = `<div class="text-xs text-slate-500 text-center py-8">Aucun dialogue ne correspond à la recherche.</div>`;
    return;
  }

  filtered.forEach(item => {
    const offsetHex = `0x${item.offset.toString(16).toUpperCase()}`;
    // Conserver et afficher exactement les tags et balises comme <PAGE> et <END>
    const escapeTags = (str) => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };
    const origClean = escapeTags(item.texte_orig || "");
    const frClean = item.texte_fr || "";
    const isOverflow = frClean.length > item.slot_size;

    const card = document.createElement('div');
    card.className = "p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col gap-2 text-xs hover:border-white/20 transition";

    // Format EXACT demandé par l'utilisateur:
    // #ID
    // 0xOFFSET
    // SIZEb
    // EN: ... (avec tags <PAGE>, <END> visibles)
    // FR: [Champ à remplir]
    card.innerHTML = `
      <div class="flex items-center justify-between font-mono pb-1 border-b border-white/5">
        <span class="text-sky-400 font-bold text-sm">#${item.id}</span>
        <span class="text-slate-400 text-[11px]">${offsetHex}</span>
        <span class="text-amber-300 font-bold text-[11px]">${item.slot_size}b</span>
      </div>

      <div class="text-slate-300 text-[11px] leading-relaxed font-mono">
        <span class="text-slate-400 font-bold">EN:</span> ${origClean}
      </div>

      <div class="flex flex-col gap-1 mt-0.5">
        <div class="flex justify-between items-center text-[10px] font-mono">
          <span class="text-emerald-400 font-bold">FR:</span>
          <span id="counter-${item.id}" class="${isOverflow ? 'text-rose-400 font-bold' : 'text-slate-500'}">
            ${frClean.length} / ${item.slot_size}b
          </span>
        </div>
        <textarea data-id="${item.id}" rows="2" class="glass-input text-xs w-full font-mono input-fr-trad focus:border-sky-400" placeholder="Entrez la traduction en français...">${frClean}</textarea>
      </div>
    `;

    drawerListItems.appendChild(card);
  });

  // Attach input listeners
  document.querySelectorAll('.input-fr-trad').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = parseInt(e.target.dataset.id);
      const val = e.target.value;
      const item = appState.dialogs.find(d => d.id === id);
      if (item) {
        item.texte_fr = val;
        // Update counter
        const counterEl = document.getElementById(`counter-${id}`);
        if (counterEl) {
          const isOver = val.length > item.slot_size;
          counterEl.textContent = `${val.length} / ${item.slot_size}b`;
          counterEl.className = isOver ? 'text-rose-400 font-bold' : 'text-slate-500';
        }
        // Update stats
        const currentTradCount = appState.dialogs.filter(d => d.texte_fr && d.texte_fr.trim()).length;
        drawerTrad.textContent = currentTradCount;
        
        // Auto-save debounced
        debouncedSave();
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

function debouncedSave() {
  if (appState.saveTimeout) clearTimeout(appState.saveTimeout);
  appState.saveTimeout = setTimeout(async () => {
    try {
      const work = inputWorkDir.value.trim();
      await fetch('/api/save-translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_dir: work,
          data: appState.dialogs
        })
      });
    } catch (e) {}
  }, 1000);
}

inputDrawerSearch.addEventListener('input', renderDrawerList);

// ── Rebuild ROM Action ────────────────────────────────────────────────────────
btnRebuildRom.addEventListener('click', async () => {
  const rom = inputRomPath.value.trim();
  const work = inputWorkDir.value.trim();
  if (!rom) {
    alert("Veuillez sélectionner la ROM originale.");
    return;
  }

  // Sauvegarder immédiatement avant rebuild
  if (appState.dialogs.length > 0) {
    await fetch('/api/save-translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        work_dir: work,
        data: appState.dialogs
      })
    });
  }

  btnRebuildRom.disabled = true;
  btnRebuildLabel.textContent = "Compilation en cours...";
  appendLog("Démarrage de la compilation de la ROM...", "INFO");

  try {
    const res = await fetch('/api/rebuild-rom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rom_path: rom,
        work_dir: work
      })
    });
    const data = await res.json();
    if (res.ok) {
      appendLog(`✓ Compilation réussie : ${data.out_rom}`, "SUCCESS");
      alert(`Félicitations !\nLa ROM en français a été compilée avec succès :\n${data.out_rom}`);
    } else {
      throw new Error(data.detail || "Erreur de compilation");
    }
  } catch (e) {
    appendLog(`Erreur : ${e.message}`, "ERROR");
    alert(`Erreur de compilation : ${e.message}`);
  } finally {
    btnRebuildRom.disabled = false;
    btnRebuildLabel.textContent = "Compiler la ROM traduite [Jack Bros (Fr).vb]";
  }
});

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
  initDefaultPaths();
  startPollingProgress();
  setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 100);
});
