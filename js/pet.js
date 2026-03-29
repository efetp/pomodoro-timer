// ============================================================
// Deeply — Virtual Pet System (2D)
// ============================================================

const PET_DEFAULTS = {
    name: 'Buddy',
    hunger: 100,
    happiness: 100,
    xp: 0,
    level: 1,
    lastFed: null,
    lastDecay: new Date().toISOString(),
};

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

// Pet appearance per level — evolves as it levels up
const PET_STAGES = [
    { emoji: '🐣', name: 'Egg' },       // Lv 1
    { emoji: '🐥', name: 'Chick' },     // Lv 2
    { emoji: '🐤', name: 'Duckling' },  // Lv 3
    { emoji: '🐶', name: 'Pup' },       // Lv 4
    { emoji: '🐕', name: 'Dog' },       // Lv 5
    { emoji: '🦊', name: 'Fox' },       // Lv 6
    { emoji: '🐺', name: 'Wolf' },      // Lv 7
    { emoji: '🦁', name: 'Lion' },      // Lv 8
    { emoji: '🐉', name: 'Drake' },     // Lv 9
    { emoji: '🐲', name: 'Dragon' },    // Lv 10
];

let _petState = null;

// ============================================================
// STATE MANAGEMENT
// ============================================================

function loadPetState() {
    if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseLoadPet === 'function') {
        return supabaseLoadPet().then(data => {
            _petState = { ...PET_DEFAULTS, ...(data || {}) };
            applyDecayCatchup();
            return _petState;
        }).catch(() => {
            _petState = loadLocalPet();
            applyDecayCatchup();
            return _petState;
        });
    }
    _petState = loadLocalPet();
    applyDecayCatchup();
    return Promise.resolve(_petState);
}

function loadLocalPet() {
    const raw = localStorage.getItem('deeply_pet');
    if (!raw) return { ...PET_DEFAULTS };
    try { return { ...PET_DEFAULTS, ...JSON.parse(raw) }; }
    catch { return { ...PET_DEFAULTS }; }
}

function savePetState() {
    if (!_petState) return;
    localStorage.setItem('deeply_pet', JSON.stringify(_petState));
    if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseSavePet === 'function') {
        supabaseSavePet(_petState).catch(e => console.warn('Pet save error:', e));
    }
}

// --- Decay ---
function applyDecayCatchup() {
    if (!_petState || !_petState.lastDecay) {
        _petState.lastDecay = new Date().toISOString();
        return;
    }
    const hours = (Date.now() - new Date(_petState.lastDecay).getTime()) / 3600000;
    if (hours > 0) {
        _petState.hunger = Math.max(0, _petState.hunger - hours * 4);
        _petState.happiness = Math.max(0, _petState.happiness - hours * 2);
        _petState.lastDecay = new Date().toISOString();
    }
}

function decayTick() {
    if (!_petState) return;
    _petState.hunger = Math.max(0, _petState.hunger - 0.067);
    _petState.happiness = Math.max(0, _petState.happiness - 0.033);
    _petState.lastDecay = new Date().toISOString();
    updatePetUI();
}

// --- Feeding ---
function feedPet(workMinutes) {
    if (!_petState) return;
    _petState.hunger = Math.min(100, _petState.hunger + 20);
    _petState.happiness = Math.min(100, _petState.happiness + 15);
    _petState.xp += workMinutes || 25;
    _petState.lastFed = new Date().toISOString();

    const oldLevel = _petState.level;
    _petState.level = getLevelForXP(_petState.xp);

    if (_petState.level > oldLevel) {
        triggerAnimation('levelup');
        spawnParticles('⭐');
    } else {
        triggerAnimation('fed');
        spawnParticles('❤️');
    }

    savePetState();
    updatePetUI();
}

function getLevelForXP(xp) {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= XP_THRESHOLDS[i]) return i + 1;
    }
    return 1;
}

// ============================================================
// UI
// ============================================================

function getPetMood() {
    if (!_petState) return 'happy';
    if (_petState.hunger < 30) return 'starving';
    if (_petState.hunger < 60) return 'hungry';
    return 'happy';
}

function getPetStage() {
    const idx = Math.min((_petState?.level || 1) - 1, PET_STAGES.length - 1);
    return PET_STAGES[idx];
}

function buildPetDOM() {
    const stage = document.getElementById('pet-stage');
    if (!stage) return;

    stage.innerHTML = `
        <div class="pet-shadow"></div>
        <div id="pet-char" class="pet-char">${getPetStage().emoji}</div>
    `;
}

function updatePetUI() {
    if (!_petState) return;

    // Bars
    const hungerFill = document.getElementById('pet-hunger-fill');
    const happyFill = document.getElementById('pet-happy-fill');
    const nameEl = document.querySelector('.pet-name');
    const levelEl = document.querySelector('.pet-level');

    if (hungerFill) {
        hungerFill.style.width = Math.round(_petState.hunger) + '%';
        if (_petState.hunger > 60) hungerFill.style.background = '#f59e0b';
        else if (_petState.hunger > 30) hungerFill.style.background = '#f97316';
        else hungerFill.style.background = '#ef4444';
    }
    if (happyFill) happyFill.style.width = Math.round(_petState.happiness) + '%';

    const petStage = getPetStage();
    if (nameEl) nameEl.textContent = petStage.name;
    if (levelEl) levelEl.textContent = `Lv. ${_petState.level}`;

    // Update emoji if level changed
    const charEl = document.getElementById('pet-char');
    if (charEl) {
        charEl.textContent = petStage.emoji;
        charEl.className = 'pet-char mood-' + getPetMood();
    }
}

function triggerAnimation(type) {
    const charEl = document.getElementById('pet-char');
    if (!charEl) return;
    charEl.className = 'pet-char mood-' + type;
    // Reset to mood after animation
    setTimeout(() => {
        charEl.className = 'pet-char mood-' + getPetMood();
    }, type === 'levelup' ? 800 : 500);
}

function spawnParticles(emoji) {
    const stage = document.getElementById('pet-stage');
    if (!stage) return;
    for (let i = 0; i < 4; i++) {
        const p = document.createElement('span');
        p.className = 'pet-particle';
        p.textContent = emoji;
        p.style.left = (35 + Math.random() * 30) + '%';
        p.style.bottom = (40 + Math.random() * 20) + '%';
        p.style.animationDelay = (i * 0.12) + 's';
        stage.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}

// ============================================================
// INIT
// ============================================================

async function initPet() {
    await loadPetState();
    buildPetDOM();
    updatePetUI();

    // Decay every minute
    setInterval(decayTick, 60000);

    // Save every 60 seconds
    setInterval(savePetState, 60000);
}
