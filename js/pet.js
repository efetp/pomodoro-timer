// ============================================================
// Deeply — Virtual Pet System (3D cube pets)
// ============================================================

const PET_DEFAULTS = { xp: 0, level: 1, pet: 'dog' };

const XP_THRESHOLDS = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450];

const PET_LIST = [
    { id: 'beaver', name: 'Beaver' },
    { id: 'bee', name: 'Bee' },
    { id: 'bunny', name: 'Bunny' },
    { id: 'cat', name: 'Cat' },
    { id: 'caterpillar', name: 'Caterpillar' },
    { id: 'chick', name: 'Chick' },
    { id: 'cow', name: 'Cow' },
    { id: 'crab', name: 'Crab' },
    { id: 'deer', name: 'Deer' },
    { id: 'dog', name: 'Dog' },
    { id: 'elephant', name: 'Elephant' },
    { id: 'fish', name: 'Fish' },
    { id: 'fox', name: 'Fox' },
    { id: 'giraffe', name: 'Giraffe' },
    { id: 'hog', name: 'Hog' },
    { id: 'koala', name: 'Koala' },
    { id: 'lion', name: 'Lion' },
    { id: 'monkey', name: 'Monkey' },
    { id: 'panda', name: 'Panda' },
    { id: 'parrot', name: 'Parrot' },
    { id: 'penguin', name: 'Penguin' },
    { id: 'pig', name: 'Pig' },
    { id: 'polar', name: 'Polar Bear' },
    { id: 'tiger', name: 'Tiger' },
];

// Per-animal level titles using real baby/young names
const PET_TITLES = {
    beaver:      ['Kit', 'Young Beaver', 'Beaver', 'Alpha Beaver'],
    bee:         ['Larva', 'Worker Bee', 'Bee', 'Queen Bee'],
    bunny:       ['Kit', 'Young Bunny', 'Bunny', 'Alpha Bunny'],
    cat:         ['Kitten', 'Young Cat', 'Cat', 'Alpha Cat'],
    caterpillar: ['Larva', 'Caterpillar', 'Cocoon', 'Butterfly'],
    chick:       ['Chick', 'Fledgling', 'Hen', 'Rooster'],
    cow:         ['Calf', 'Young Cow', 'Cow', 'Bull'],
    crab:        ['Zoea', 'Young Crab', 'Crab', 'King Crab'],
    deer:        ['Fawn', 'Young Deer', 'Deer', 'Stag'],
    dog:         ['Puppy', 'Young Dog', 'Dog', 'Alpha Dog'],
    elephant:    ['Calf', 'Young Elephant', 'Elephant', 'Matriarch'],
    fish:        ['Fry', 'Young Fish', 'Fish', 'Alpha Fish'],
    fox:         ['Kit', 'Young Fox', 'Fox', 'Alpha Fox'],
    giraffe:     ['Calf', 'Young Giraffe', 'Giraffe', 'Alpha Giraffe'],
    hog:         ['Piglet', 'Young Hog', 'Hog', 'Boar'],
    koala:       ['Joey', 'Young Koala', 'Koala', 'Alpha Koala'],
    lion:        ['Cub', 'Young Lion', 'Lion', 'King'],
    monkey:      ['Infant', 'Young Monkey', 'Monkey', 'Alpha Monkey'],
    panda:       ['Cub', 'Young Panda', 'Panda', 'Alpha Panda'],
    parrot:      ['Chick', 'Fledgling', 'Parrot', 'Alpha Parrot'],
    penguin:     ['Chick', 'Young Penguin', 'Penguin', 'Emperor'],
    pig:         ['Piglet', 'Young Pig', 'Pig', 'Alpha Pig'],
    polar:       ['Cub', 'Young Bear', 'Polar Bear', 'Alpha Bear'],
    tiger:       ['Cub', 'Young Tiger', 'Tiger', 'Alpha Tiger'],
};

function getLevelTitle(lvl, petId) {
    const titles = PET_TITLES[petId] || ['Baby', 'Junior', 'Adult', 'Legend'];
    if (lvl <= 3) return titles[0];
    if (lvl <= 6) return titles[1];
    if (lvl <= 9) return titles[2];
    return titles[3];
}

let _petState = null;

// Three.js refs
let _petScene, _petCamera, _petRenderer, _petModel, _petMixer, _petClock;
let _petAnimId = null;
let _petSessionActive = false;
let _petLoadedId = null;
let _bounceTime = 0;

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
// FEEDING
// ============================================================

function feedPet(workMinutes) {
    if (!_petState) return;
    _petState.xp += workMinutes || 25;

    const oldLevel = _petState.level;
    _petState.level = getLevelForXP(_petState.xp);

    if (_petState.level > oldLevel) {
        spawnParticles('⭐');
    } else {
        spawnParticles('❤️');
    }
    triggerBounce();

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
// PET SELECTION
// ============================================================

function selectPet(petId) {
    if (!_petState) return;
    _petState.pet = petId;
    savePetState();
    loadPetModel();
    updatePetUI();
    closePetPicker();
}

function openPetPicker() {
    document.getElementById('pet-picker-modal').classList.remove('hidden');
}

function closePetPicker() {
    document.getElementById('pet-picker-modal').classList.add('hidden');
}

function buildPetPicker() {
    const grid = document.getElementById('pet-picker-grid');
    if (!grid) return;
    const frag = document.createDocumentFragment();

    PET_LIST.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'pet-pick-btn';
        btn.dataset.petId = p.id;
        btn.textContent = p.name;
        btn.addEventListener('click', () => selectPet(p.id));
        frag.appendChild(btn);
    });

    grid.appendChild(frag);
}

function syncPetPickerActive() {
    if (!_petState) return;
    document.querySelectorAll('.pet-pick-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.petId === _petState.pet);
    });
}

// ============================================================
// SESSION STATE — live XP bar during pomodoro
// ============================================================

let _petSessionXPStart = 0;
let _petSessionXPTarget = 0;
let _petSessionTotalSec = 0;
let _petSessionStartTime = 0;
let _petSessionTickId = null;

function setPetSessionActive(active) {
    _petSessionActive = active;

    if (active && _petState) {
        // Figure out how many minutes this session is worth
        const workMin = (typeof currentMode !== 'undefined' && typeof MODES !== 'undefined')
            ? (currentMode === 'custom'
                ? (typeof customWorkMinutes !== 'undefined' ? customWorkMinutes : 25)
                : MODES[currentMode].work)
            : 25;
        _petSessionXPStart = _petState.xp;
        _petSessionXPTarget = _petState.xp + workMin;
        _petSessionTotalSec = workMin * 60;
        _petSessionStartTime = Date.now();

        // Tick the bar every second
        if (_petSessionTickId) clearInterval(_petSessionTickId);
        _petSessionTickId = setInterval(updateLiveXPBar, 1000);
    } else {
        // Stop ticking
        if (_petSessionTickId) {
            clearInterval(_petSessionTickId);
            _petSessionTickId = null;
        }
    }
}

function updateLiveXPBar() {
    if (!_petState || !_petSessionActive) return;
    const elapsed = (Date.now() - _petSessionStartTime) / 1000;
    const progress = Math.min(1, elapsed / _petSessionTotalSec);
    const liveXP = _petSessionXPStart + (_petSessionXPTarget - _petSessionXPStart) * progress;

    // Calculate what the bar would look like at this XP
    const lvl = _petState.level;
    const curr = XP_THRESHOLDS[lvl - 1] || 0;
    const next = XP_THRESHOLDS[lvl] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 50;
    const barProgress = Math.min(1, Math.max(0, (liveXP - curr) / (next - curr)));

    const evoFill = document.getElementById('pet-evo-fill');
    if (evoFill) evoFill.style.width = Math.round(barProgress * 100) + '%';
}

// ============================================================
// UI
// ============================================================

function getPetInfo() {
    const pet = PET_LIST.find(p => p.id === (_petState?.pet || 'dog')) || PET_LIST[9];
    const lvl = _petState?.level || 1;
    return { ...pet, title: getLevelTitle(lvl, pet.id), level: lvl };
}

function getXPProgress() {
    if (!_petState) return 0;
    const lvl = _petState.level;
    const curr = XP_THRESHOLDS[lvl - 1] || 0;
    const next = XP_THRESHOLDS[lvl] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 50;
    return Math.min(1, Math.max(0, (_petState.xp - curr) / (next - curr)));
}

function updatePetUI() {
    if (!_petState) return;
    const info = getPetInfo();

    const nameEl = document.querySelector('.pet-name');
    const levelEl = document.querySelector('.pet-level');
    const evoFill = document.getElementById('pet-evo-fill');
    const evoLabel = document.getElementById('pet-evo-label');

    if (nameEl) nameEl.textContent = info.name;
    if (levelEl) levelEl.textContent = `Lv. ${info.level}`;
    if (evoFill) evoFill.style.width = Math.round(getXPProgress() * 100) + '%';

    // Growth title — the current stage name (prominent)
    const growthEl = document.getElementById('pet-growth-title');
    if (growthEl) growthEl.textContent = info.title;

    // Next stage label
    if (evoLabel) {
        if (info.level >= 10) {
            evoLabel.textContent = 'Max';
        } else {
            evoLabel.textContent = getLevelTitle(info.level + 1, _petState.pet);
        }
    }

    syncPetPickerActive();
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
// THREE.JS
// ============================================================

function initPetCanvas() {
    const canvas = document.getElementById('pet-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    _petClock = new THREE.Clock();
    _petScene = new THREE.Scene();

    _petCamera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    _petCamera.position.set(0, 2, 5);
    _petCamera.lookAt(0, 0.6, 0);

    _petRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    _petRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    _petRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _petRenderer.outputEncoding = THREE.sRGBEncoding;

    _petScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 4, 3);
    _petScene.add(dir);

    const ro = new ResizeObserver(() => {
        if (!canvas.clientWidth || !canvas.clientHeight) return;
        _petCamera.aspect = canvas.clientWidth / canvas.clientHeight;
        _petCamera.updateProjectionMatrix();
        _petRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    ro.observe(canvas);

    loadPetModel();
    animatePet();
}

function loadPetModel() {
    const petId = _petState?.pet || 'dog';
    if (_petLoadedId === petId) return;
    _petLoadedId = petId;

    if (typeof THREE.GLTFLoader === 'undefined') return;

    if (_petModel) {
        _petScene.remove(_petModel);
        _petModel = null;
        _petMixer = null;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
        `assets/pet/animal-${petId}.glb`,
        (gltf) => {
            if (_petLoadedId !== petId) return;

            _petModel = gltf.scene;

            // Auto-fit
            const box = new THREE.Box3().setFromObject(_petModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = maxDim > 0 ? 1.8 / maxDim : 1.0;
            _petModel.scale.setScalar(scale);
            _petModel.position.x = -center.x * scale;
            _petModel.position.z = -center.z * scale;
            _petModel.position.y = -box.min.y * scale;

            _petScene.add(_petModel);

            if (gltf.animations && gltf.animations.length) {
                _petMixer = new THREE.AnimationMixer(_petModel);
                _petMixer.clipAction(gltf.animations[0]).play();
            }
        },
        undefined,
        (err) => console.warn(`Failed to load animal-${petId}.glb:`, err)
    );
}

function animatePet() {
    _petAnimId = requestAnimationFrame(animatePet);
    if (!_petRenderer || !_petScene || !_petCamera) return;

    const delta = _petClock.getDelta();
    const time = _petClock.getElapsedTime();

    if (_petMixer) _petMixer.update(delta);

    if (_petModel) {
        if (_petSessionActive) {
            _petModel.position.y = Math.abs(Math.sin(time * 4)) * 0.15;
            _petModel.rotation.y = Math.sin(time * 2) * 0.15;
        } else {
            _petModel.position.y = Math.sin(time * 1.5) * 0.04;
            _petModel.rotation.y = Math.sin(time * 0.5) * 0.08;
        }

        if (_bounceTime > 0) {
            _bounceTime -= delta;
            _petModel.position.y += Math.sin(_bounceTime * 12) * 0.1 * Math.max(0, _bounceTime);
        }
    }

    _petRenderer.render(_petScene, _petCamera);
}

function triggerBounce() {
    _bounceTime = 0.6;
}

// ============================================================
// INIT
// ============================================================

async function initPet() {
    await loadPetState();
    initPetCanvas();
    buildPetPicker();
    updatePetUI();

    // Change pet button
    const changeBtn = document.getElementById('pet-change-btn');
    if (changeBtn) changeBtn.addEventListener('click', openPetPicker);

    // Close picker
    const closeBtn = document.getElementById('pet-picker-close');
    if (closeBtn) closeBtn.addEventListener('click', closePetPicker);

    const modal = document.getElementById('pet-picker-modal');
    if (modal) modal.addEventListener('click', e => {
        if (e.target === modal) closePetPicker();
    });
}
