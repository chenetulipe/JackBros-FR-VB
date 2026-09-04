let translations = [];
let currentEditingId = null;

// DOM Elements
const listEl = document.getElementById('translation-list');
const searchInput = document.getElementById('search-input');
const editorPanel = document.getElementById('editor-panel');
const welcomeMsg = document.getElementById('welcome-message');

const editId = document.getElementById('edit-id');
const editFont = document.getElementById('edit-font');
const editNomOrig = document.getElementById('edit-nom-orig');
const editTexteOrig = document.getElementById('edit-texte-orig');
const editTexteFr = document.getElementById('edit-texte-fr');

const currentLengthEl = document.getElementById('current-length');
const maxLengthEl = document.getElementById('max-length');
const lengthWarning = document.getElementById('length-warning');

const saveBtn = document.getElementById('save-btn');
const buildBtn = document.getElementById('build-btn');

const modal = document.getElementById('build-modal');
const buildLogs = document.getElementById('build-logs');
const closeModalBtn = document.getElementById('close-modal-btn');

// Fetch data
async function loadTranslations() {
    try {
        const res = await fetch('/api/translations');
        translations = await res.json();
        renderList(translations);
    } catch (e) {
        alert("Erreur de chargement des traductions.");
        console.error(e);
    }
}

// Render list
function renderList(data) {
    listEl.innerHTML = '';
    data.forEach(t => {
        const li = document.createElement('li');
        li.dataset.id = t.id;
        li.innerHTML = `
            <span class="list-id">ID: ${t.id} (Slot: ${t.slot_size} bytes)</span>
            <div class="list-preview">${t.texte_fr || t.texte_orig}</div>
        `;
        li.addEventListener('click', () => selectItem(t.id));
        listEl.appendChild(li);
    });
}

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = translations.filter(t => 
        t.id.toString().includes(term) || 
        t.texte_orig.toLowerCase().includes(term) || 
        (t.texte_fr && t.texte_fr.toLowerCase().includes(term))
    );
    renderList(filtered);
    
    // Maintain active class if still visible
    if (currentEditingId) {
        const activeLi = document.querySelector(`li[data-id="${currentEditingId}"]`);
        if (activeLi) activeLi.classList.add('active');
    }
});

// Select Item
function selectItem(id) {
    // Save previous
    saveCurrentEditToMemory();

    // UI Updates
    document.querySelectorAll('#translation-list li').forEach(li => li.classList.remove('active'));
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) li.classList.add('active');

    const item = translations.find(t => t.id === id);
    if (!item) return;

    currentEditingId = id;
    
    welcomeMsg.classList.add('hidden');
    editorPanel.classList.remove('hidden');

    editId.textContent = item.id;
    editFont.textContent = `Font ${item.font}`;
    editNomOrig.value = item.nom_orig || '';
    editTexteOrig.value = item.texte_orig || '';
    editTexteFr.value = item.texte_fr || '';
    
    maxLengthEl.textContent = item.slot_size;
    
    updateLengthIndicator();
}

// Memory save
function saveCurrentEditToMemory() {
    if (currentEditingId !== null) {
        const item = translations.find(t => t.id === currentEditingId);
        if (item) {
            item.texte_fr = editTexteFr.value;
            // Update preview
            const li = document.querySelector(`li[data-id="${currentEditingId}"] .list-preview`);
            if (li) li.textContent = item.texte_fr;
        }
    }
}

// Calc length
editTexteFr.addEventListener('input', updateLengthIndicator);

function updateLengthIndicator() {
    if (currentEditingId === null) return;
    const item = translations.find(t => t.id === currentEditingId);
    if (!item) return;

    const val = editTexteFr.value;
    // Approximative calculation (very rough, actual encoding depends on font)
    const approxLen = val.replace(/\\n/g, 'n').replace(/<PAGE>/g, 'P').replace(/<END>/g, 'E').length;
    
    currentLengthEl.textContent = approxLen;
    
    if (approxLen > item.slot_size) {
        currentLengthEl.style.color = 'var(--accent)';
        lengthWarning.classList.remove('hidden');
    } else {
        currentLengthEl.style.color = 'inherit';
        lengthWarning.classList.add('hidden');
    }
}

// Save to disk
saveBtn.addEventListener('click', async () => {
    saveCurrentEditToMemory();
    saveBtn.textContent = 'Sauvegarde...';
    try {
        const res = await fetch('/api/translations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(translations)
        });
        if(res.ok) {
            saveBtn.textContent = '✅ Sauvegardé';
            setTimeout(() => saveBtn.textContent = '💾 Sauvegarder JSON', 2000);
        } else {
            throw new Error("Erreur Serveur");
        }
    } catch(e) {
        alert("Erreur lors de la sauvegarde.");
        saveBtn.textContent = '💾 Sauvegarder JSON';
    }
});

// Build ROM
buildBtn.addEventListener('click', async () => {
    saveCurrentEditToMemory();
    buildBtn.textContent = 'Compilation...';
    buildBtn.disabled = true;
    
    try {
        const res = await fetch('/api/build', { method: 'POST' });
        const data = await res.json();
        
        modal.classList.remove('hidden');
        if (data.status === 'success') {
            buildLogs.textContent = data.output;
            buildLogs.style.color = '#4af626';
        } else {
            buildLogs.textContent = data.error + "\n\n" + data.output;
            buildLogs.style.color = 'var(--accent)';
        }
    } catch(e) {
        alert("Erreur réseau lors de la compilation.");
    }
    
    buildBtn.textContent = '🔨 Compiler ROM';
    buildBtn.disabled = false;
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Init
loadTranslations();
