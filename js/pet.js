// ============================================================
// Deeply — Virtual Pet System
// ============================================================

const PET_DEFAULTS = {
    xp: 0,
    level: 1,
};

const XP_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2400, 3500];

// Pet appearance per level — puppy grows up
const PET_STAGES = [
    { emoji: '🐶', name: 'Puppy' },      // Lv 1
    { emoji: '🐕', name: 'Pup' },        // Lv 2
    { emoji: '🦮', name: 'Good Boy' },   // Lv 3
    { emoji: '🐕‍🦺', name: 'Scout' },     // Lv 4
    { emoji: '🐺', name: 'Alpha' },      // Lv 5
    { emoji: '🦊', name: 'Sly Fox' },    // Lv 6
    { emoji: '🐻', name: 'Bear' },       // Lv 7
    { emoji: '🦁', name: 'King' },       // Lv 8
    { emoji: '🐉', name: 'Drake' },      // Lv 9
    { emoji: '🐲', name: 'Legend' },     // Lv 10
];

let _petState = null;

// ============================================================
// STATE
// ============================================================

function loadPetState() {
    if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseLoadPet === 'function') {
        return supabaseLoadPet().then(data => {
            _petState = { ...PET_DEFAULTS, ...(data || {}) };
            return _petState;
        }).catch(() => {
            _petState = loadLocalPet();
            return _petState;
        });
    }
    _petState = loadLocalPet();
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

// ============================================================
// FEEDING — called on pomodoro complete
// ============================================================

function feedPet(workMinutes) {
    if (!_petState) return;
    _petState.xp += workMinutes || 25;

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
// SESSION STATE — pet reacts to active pomodoro
// ============================================================

function setPetSessionActive(active) {
    const charEl = document.getElementById('pet-char');
    if (!charEl) return;
    if (active) {
        charEl.classList.add('session-active');
    } else {
        charEl.classList.remove('session-active');
    }
}

// ============================================================
// UI
// ============================================================

function getPetStage() {
    const idx = Math.min((_petState?.level || 1) - 1, PET_STAGES.length - 1);
    return PET_STAGES[idx];
}

function getXPProgress() {
    if (!_petState) return 0;
    const lvl = _petState.level;
    const currThreshold = XP_THRESHOLDS[lvl - 1] || 0;
    const nextThreshold = XP_THRESHOLDS[lvl] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 500;
    const progress = (_petState.xp - currThreshold) / (nextThreshold - currThreshold);
    return Math.min(1, Math.max(0, progress));
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

    const petStage = getPetStage();
    const nameEl = document.querySelector('.pet-name');
    const levelEl = document.querySelector('.pet-level');
    const evoFill = document.getElementById('pet-evo-fill');
    const evoLabel = document.getElementById('pet-evo-label');

    if (nameEl) nameEl.textContent = petStage.name;
    if (levelEl) levelEl.textContent = `Lv. ${_petState.level}`;

    // Evolution progress bar
    const progress = getXPProgress();
    if (evoFill) evoFill.style.width = Math.round(progress * 100) + '%';

    // Next evolution name
    if (evoLabel) {
        const nextIdx = Math.min(_petState.level, PET_STAGES.length - 1);
        if (_petState.level >= PET_STAGES.length) {
            evoLabel.textContent = 'Max level';
        } else {
            evoLabel.textContent = `${PET_STAGES[nextIdx].emoji} ${PET_STAGES[nextIdx].name}`;
        }
    }

    // Update emoji
    const charEl = document.getElementById('pet-char');
    if (charEl) charEl.textContent = petStage.emoji;
}

function triggerAnimation(type) {
    const charEl = document.getElementById('pet-char');
    if (!charEl) return;
    charEl.classList.add('mood-' + type);
    setTimeout(() => {
        charEl.classList.remove('mood-' + type);
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
}
