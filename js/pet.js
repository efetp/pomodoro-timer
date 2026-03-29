// ============================================================
// Deeply — Virtual Pet System (3D cube pets)
// ============================================================

const PET_DEFAULTS = { xp: 0, level: 1 };

const XP_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2400, 3500];

// Each stage maps to a .glb file in assets/pet/
// Drop files named: stage1.glb, stage2.glb, ... stage10.glb
const PET_STAGES = [
    { file: 'stage1.glb', name: 'Puppy' },
    { file: 'stage2.glb', name: 'Pup' },
    { file: 'stage3.glb', name: 'Good Boy' },
    { file: 'stage4.glb', name: 'Scout' },
    { file: 'stage5.glb', name: 'Alpha' },
    { file: 'stage6.glb', name: 'Ranger' },
    { file: 'stage7.glb', name: 'Bear' },
    { file: 'stage8.glb', name: 'King' },
    { file: 'stage9.glb', name: 'Drake' },
    { file: 'stage10.glb', name: 'Legend' },
];

let _petState = null;

// Three.js refs
let _petScene, _petCamera, _petRenderer, _petModel, _petMixer, _petClock;
let _petAnimId = null;
let _petSessionActive = false;
let _petCurrentStageFile = null;

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
        // Level up — reload model for new stage
        loadPetModel();
        spawnParticles('⭐');
    } else {
        triggerBounce();
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
// SESSION STATE
// ============================================================

function setPetSessionActive(active) {
    _petSessionActive = active;
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
    const curr = XP_THRESHOLDS[lvl - 1] || 0;
    const next = XP_THRESHOLDS[lvl] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 500;
    return Math.min(1, Math.max(0, (_petState.xp - curr) / (next - curr)));
}

function updatePetUI() {
    if (!_petState) return;
    const stage = getPetStage();

    const nameEl = document.querySelector('.pet-name');
    const levelEl = document.querySelector('.pet-level');
    const evoFill = document.getElementById('pet-evo-fill');
    const evoLabel = document.getElementById('pet-evo-label');

    if (nameEl) nameEl.textContent = stage.name;
    if (levelEl) levelEl.textContent = `Lv. ${_petState.level}`;
    if (evoFill) evoFill.style.width = Math.round(getXPProgress() * 100) + '%';

    if (evoLabel) {
        const nextIdx = Math.min(_petState.level, PET_STAGES.length - 1);
        evoLabel.textContent = _petState.level >= PET_STAGES.length
            ? 'Max level'
            : PET_STAGES[nextIdx].name;
    }
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
    _petCamera.position.set(0, 1.5, 4);
    _petCamera.lookAt(0, 0.5, 0);

    _petRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    _petRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    _petRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _petRenderer.outputEncoding = THREE.sRGBEncoding;

    // Lighting
    _petScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 4, 3);
    _petScene.add(dir);

    // Resize
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
    const stage = getPetStage();
    if (_petCurrentStageFile === stage.file) return; // already loaded
    _petCurrentStageFile = stage.file;

    if (typeof THREE.GLTFLoader === 'undefined') {
        console.warn('GLTFLoader not available');
        return;
    }

    // Remove old model
    if (_petModel) {
        _petScene.remove(_petModel);
        _petModel = null;
        _petMixer = null;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
        `assets/pet/${stage.file}`,
        (gltf) => {
            // Only apply if still the current stage
            if (_petCurrentStageFile !== stage.file) return;

            _petModel = gltf.scene;

            // Auto-fit model into view
            const box = new THREE.Box3().setFromObject(_petModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.8 / maxDim;
            _petModel.scale.setScalar(scale);
            _petModel.position.x = -center.x * scale;
            _petModel.position.z = -center.z * scale;
            _petModel.position.y = -box.min.y * scale; // sit on ground

            _petScene.add(_petModel);

            // Play first animation if available
            if (gltf.animations && gltf.animations.length) {
                _petMixer = new THREE.AnimationMixer(_petModel);
                _petMixer.clipAction(gltf.animations[0]).play();
            }
        },
        undefined,
        (err) => {
            console.warn(`Failed to load ${stage.file}:`, err);
        }
    );
}

let _bounceTime = 0;

function animatePet() {
    _petAnimId = requestAnimationFrame(animatePet);
    if (!_petRenderer || !_petScene || !_petCamera) return;

    const delta = _petClock.getDelta();
    const time = _petClock.getElapsedTime();

    if (_petMixer) _petMixer.update(delta);

    if (_petModel) {
        // Idle bob or excited bounce
        if (_petSessionActive) {
            const bounce = Math.abs(Math.sin(time * 4)) * 0.15;
            _petModel.position.y = (_petModel.position.y || 0) > 0.01
                ? bounce : bounce;
            _petModel.rotation.y = Math.sin(time * 2) * 0.15;
        } else {
            const bob = Math.sin(time * 1.5) * 0.04;
            _petModel.position.y += bob * delta;
            _petModel.rotation.y = Math.sin(time * 0.5) * 0.08;
        }

        // Bounce animation on feed
        if (_bounceTime > 0) {
            _bounceTime -= delta;
            const t = Math.max(0, _bounceTime);
            _petModel.position.y += Math.sin(t * 12) * 0.1 * t;
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
    updatePetUI();
}
