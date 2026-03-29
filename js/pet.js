// ============================================================
// Deeply — Virtual Pet System
// ============================================================

// --- Pet State ---
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

let _petState = null;
let _petDecayInterval = null;
let _petSaveInterval = null;

// --- Three.js refs ---
let _petScene = null;
let _petCamera = null;
let _petRenderer = null;
let _petModel = null;
let _petMixer = null;
let _petClock = null;
let _petAnimId = null;

// ============================================================
// STATE MANAGEMENT
// ============================================================

function loadPetState() {
    // Try Supabase first (if logged in)
    if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseLoadPet === 'function') {
        return supabaseLoadPet().then(data => {
            if (data) {
                _petState = { ...PET_DEFAULTS, ...data };
            } else {
                _petState = loadLocalPet();
            }
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
    try {
        return { ...PET_DEFAULTS, ...JSON.parse(raw) };
    } catch {
        return { ...PET_DEFAULTS };
    }
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
    const elapsed = (Date.now() - new Date(_petState.lastDecay).getTime()) / 3600000; // hours
    if (elapsed > 0) {
        _petState.hunger = Math.max(0, _petState.hunger - elapsed * 4);
        _petState.happiness = Math.max(0, _petState.happiness - elapsed * 2);
        _petState.lastDecay = new Date().toISOString();
    }
}

function decayTick() {
    if (!_petState) return;
    // Decay per minute: hunger -0.067/min (~4/hr), happiness -0.033/min (~2/hr)
    _petState.hunger = Math.max(0, _petState.hunger - 0.067);
    _petState.happiness = Math.max(0, _petState.happiness - 0.033);
    _petState.lastDecay = new Date().toISOString();
    updatePetUI();
}

// --- Feeding (called on pomodoro complete) ---
function feedPet(workMinutes) {
    if (!_petState) return;
    _petState.hunger = Math.min(100, _petState.hunger + 20);
    _petState.happiness = Math.min(100, _petState.happiness + 15);
    _petState.xp += workMinutes || 25;
    _petState.lastFed = new Date().toISOString();

    // Level up check
    const oldLevel = _petState.level;
    _petState.level = getLevelForXP(_petState.xp);
    if (_petState.level > oldLevel) {
        triggerLevelUp();
    } else {
        triggerFedAnimation();
    }

    savePetState();
    updatePetUI();
}

function getLevelForXP(xp) {
    let lvl = 1;
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= XP_THRESHOLDS[i]) { lvl = i + 1; break; }
    }
    return lvl;
}

// ============================================================
// UI UPDATES
// ============================================================

function updatePetUI() {
    if (!_petState) return;
    const hungerFill = document.getElementById('pet-hunger-fill');
    const happyFill = document.getElementById('pet-happy-fill');
    const nameEl = document.querySelector('.pet-name');
    const levelEl = document.querySelector('.pet-level');

    if (hungerFill) hungerFill.style.width = Math.round(_petState.hunger) + '%';
    if (happyFill) happyFill.style.width = Math.round(_petState.happiness) + '%';
    if (nameEl) nameEl.textContent = _petState.name;
    if (levelEl) levelEl.textContent = `Lv. ${_petState.level}`;

    // Color the hunger bar based on level
    if (hungerFill) {
        if (_petState.hunger > 60) hungerFill.style.background = '#f59e0b';
        else if (_petState.hunger > 30) hungerFill.style.background = '#f97316';
        else hungerFill.style.background = '#ef4444';
    }

    // Update 3D model visual state
    updatePetVisualState();
}

function getPetMood() {
    if (!_petState) return 'happy';
    if (_petState.hunger < 30) return 'starving';
    if (_petState.hunger < 60) return 'hungry';
    return 'happy';
}

// ============================================================
// THREE.JS RENDERING
// ============================================================

function initPetCanvas() {
    const canvas = document.getElementById('pet-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    _petClock = new THREE.Clock();

    // Scene
    _petScene = new THREE.Scene();

    // Camera
    _petCamera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    _petCamera.position.set(0, 1.2, 3);
    _petCamera.lookAt(0, 0.5, 0);

    // Renderer — transparent background
    _petRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    _petRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    _petRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _petRenderer.outputEncoding = THREE.sRGBEncoding;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    _petScene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 3, 2);
    _petScene.add(dir);

    // Load glTF model
    loadPetModel();

    // Handle resize
    const ro = new ResizeObserver(() => {
        if (!canvas.clientWidth || !canvas.clientHeight) return;
        _petCamera.aspect = canvas.clientWidth / canvas.clientHeight;
        _petCamera.updateProjectionMatrix();
        _petRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
    ro.observe(canvas);

    // Start render loop
    animatePet();
}

function loadPetModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.warn('GLTFLoader not available');
        createFallbackPet();
        return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/pet/Husky.glb',
        (gltf) => {
            _petModel = gltf.scene;
            _petModel.scale.set(1, 1, 1);
            _petScene.add(_petModel);

            // Set up animations if available
            if (gltf.animations && gltf.animations.length > 0) {
                _petMixer = new THREE.AnimationMixer(_petModel);
                const idle = gltf.animations[0];
                _petMixer.clipAction(idle).play();
            }

            updatePetVisualState();
        },
        undefined,
        (err) => {
            console.warn('Pet model load failed, using fallback:', err.message || err);
            createFallbackPet();
        }
    );
}

function createFallbackPet() {
    // Simple sphere pet as fallback when no glTF model is available
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4, metalness: 0.1 })
    );
    body.position.y = 0.5;
    group.add(body);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 0.6, 0.42);
    group.add(leftEye);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.15, 0.6, 0.48);
    group.add(leftPupil);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 0.6, 0.42);
    group.add(rightEye);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.15, 0.6, 0.48);
    group.add(rightPupil);

    _petModel = group;
    _petScene.add(_petModel);
}

function animatePet() {
    _petAnimId = requestAnimationFrame(animatePet);
    if (!_petRenderer || !_petScene || !_petCamera) return;

    const delta = _petClock.getDelta();
    if (_petMixer) _petMixer.update(delta);

    // Idle bobbing animation
    if (_petModel) {
        const mood = getPetMood();
        const time = _petClock.getElapsedTime();
        const speed = mood === 'happy' ? 1.5 : mood === 'hungry' ? 0.8 : 0.3;
        const amp = mood === 'happy' ? 0.06 : mood === 'hungry' ? 0.03 : 0.01;
        _petModel.position.y = Math.sin(time * speed) * amp;
        _petModel.rotation.y = Math.sin(time * 0.5) * 0.1;
    }

    _petRenderer.render(_petScene, _petCamera);
}

function updatePetVisualState() {
    if (!_petModel) return;
    const mood = getPetMood();

    // Scale based on mood — starving pet shrinks slightly
    const targetScale = mood === 'happy' ? 1.0 : mood === 'hungry' ? 0.92 : 0.85;
    _petModel.scale.setScalar(targetScale);

    // Tint body color for fallback pet
    if (_petModel.children && _petModel.children[0] && _petModel.children[0].material) {
        const mat = _petModel.children[0].material;
        if (mood === 'happy') mat.color.setHex(0x60a5fa);
        else if (mood === 'hungry') mat.color.setHex(0xf59e0b);
        else mat.color.setHex(0xef4444);
    }
}

// --- Feeding animations ---
function triggerFedAnimation() {
    if (!_petModel) return;
    // Quick bounce
    const origY = _petModel.position.y;
    let frame = 0;
    const bounce = () => {
        frame++;
        _petModel.position.y = origY + Math.sin(frame * 0.3) * 0.15 * Math.max(0, 1 - frame / 20);
        if (frame < 20) requestAnimationFrame(bounce);
    };
    bounce();
}

function triggerLevelUp() {
    if (!_petModel) return;
    // Spin + grow
    let frame = 0;
    const spin = () => {
        frame++;
        _petModel.rotation.y = (frame / 30) * Math.PI * 2;
        _petModel.scale.setScalar(1 + Math.sin(frame * 0.2) * 0.15);
        if (frame < 30) requestAnimationFrame(spin);
        else {
            _petModel.rotation.y = 0;
            updatePetVisualState();
        }
    };
    spin();
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initPet() {
    await loadPetState();
    initPetCanvas();
    updatePetUI();

    // Decay every minute
    _petDecayInterval = setInterval(decayTick, 60000);

    // Save every 60 seconds
    _petSaveInterval = setInterval(savePetState, 60000);
}
