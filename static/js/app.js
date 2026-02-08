// ============================================================
// Pomodoro Timer — Main Application Logic
// ============================================================

// --- Mode Configurations ---
const MODES = {
    light:  { work: 25, break: 5,  color: "#4ecca3" },
    medium: { work: 35, break: 7,  color: "#f0a500" },
    deep:   { work: 50, break: 10, color: "#e74c3c" },
};

// --- State ---
let currentMode = "light";
let totalSeconds = MODES.light.work * 60;
let remainingSeconds = totalSeconds;
let timerInterval = null;
let isRunning = false;
let isBreak = false;
let selectedTodoId = null;

// --- DOM Elements ---
const timerTime = document.getElementById("timer-time");
const timerLabel = document.getElementById("timer-label");
const progressRing = document.querySelector(".timer-ring-progress");
const btnStart = document.getElementById("btn-start");
const btnPause = document.getElementById("btn-pause");
const btnReset = document.getElementById("btn-reset");
const modeButtons = document.querySelectorAll(".mode-btn");
const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const flashOverlay = document.getElementById("flash-overlay");
const currentTaskDiv = document.getElementById("current-task");
const currentTaskName = document.getElementById("current-task-name");
const statPomodoros = document.getElementById("stat-pomodoros");
const statMinutes = document.getElementById("stat-minutes");

// Ring circumference (2 * PI * radius)
const RING_CIRCUMFERENCE = 2 * Math.PI * 90;

// --- Audio ---
let audioContext = null;

function playAlertSound() {
    // Create a pleasant two-tone alert using Web Audio API
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioContext.currentTime;

    function playTone(freq, start, duration) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.start(start);
        osc.stop(start + duration);
    }

    // Three pleasant ascending tones
    playTone(523, now, 0.3);        // C5
    playTone(659, now + 0.15, 0.3); // E5
    playTone(784, now + 0.3, 0.5);  // G5
}

// --- Timer Display ---

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function updateDisplay() {
    timerTime.textContent = formatTime(remainingSeconds);
    timerLabel.textContent = isBreak ? "BREAK" : "WORK";

    // Update progress ring
    const progress = 1 - (remainingSeconds / totalSeconds);
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDasharray = RING_CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;

    // Update page title
    document.title = `${formatTime(remainingSeconds)} — ${isBreak ? "Break" : "Work"} | Pomodoro`;

    // Update body class
    document.body.classList.toggle("on-break", isBreak);
}

function setMode(mode) {
    if (isRunning) return; // Don't switch while running

    currentMode = mode;
    const config = MODES[mode];

    // Update active button
    modeButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

    // Update CSS color variable
    document.documentElement.style.setProperty("--active-color", config.color);
    progressRing.style.stroke = config.color;

    // Reset timer to new mode's work duration
    isBreak = false;
    totalSeconds = config.work * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
}

// --- Timer Logic ---

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    btnStart.disabled = true;
    btnPause.disabled = false;

    // Disable mode switching while running
    modeButtons.forEach(btn => {
        if (!btn.classList.contains("active")) btn.disabled = true;
    });

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
            onTimerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    btnStart.disabled = false;
    btnPause.disabled = true;
}

function resetTimer() {
    pauseTimer();
    const config = MODES[currentMode];
    isBreak = false;
    totalSeconds = config.work * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();

    // Re-enable mode buttons
    modeButtons.forEach(btn => btn.disabled = false);
    btnStart.disabled = false;
    btnPause.disabled = true;
}

function onTimerComplete() {
    // Play sound and flash
    playAlertSound();
    flashOverlay.classList.add("active");
    setTimeout(() => flashOverlay.classList.remove("active"), 1500);

    if (!isBreak) {
        // Work session completed — log it
        logSession();

        // Switch to break
        isBreak = true;
        totalSeconds = MODES[currentMode].break * 60;
        remainingSeconds = totalSeconds;
        updateDisplay();

        // Auto-start break after a short pause
        setTimeout(() => startTimer(), 2000);
    } else {
        // Break completed — set up next work session
        isBreak = false;
        totalSeconds = MODES[currentMode].work * 60;
        remainingSeconds = totalSeconds;
        updateDisplay();

        // Re-enable everything
        modeButtons.forEach(btn => btn.disabled = false);
        btnStart.disabled = false;
        btnPause.disabled = true;
    }
}

// --- Session Logging ---

async function logSession() {
    const taskName = selectedTodoId
        ? document.querySelector(`[data-id="${selectedTodoId}"] .todo-name`)?.textContent || "Unnamed"
        : "No task selected";

    await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            mode: currentMode,
            task: taskName,
            work_minutes: MODES[currentMode].work,
        }),
    });

    loadStats();
}

async function loadStats() {
    const res = await fetch("/api/stats");
    const stats = await res.json();
    statPomodoros.textContent = `${stats.total_pomodoros} pomodoro${stats.total_pomodoros !== 1 ? "s" : ""}`;
    statMinutes.textContent = `${stats.total_minutes} min focused`;
}

// --- Todo List ---

function calcPomodoros(minutes) {
    return {
        light: Math.ceil(minutes / MODES.light.work),
        medium: Math.ceil(minutes / MODES.medium.work),
        deep: Math.ceil(minutes / MODES.deep.work),
    };
}

function renderTodo(todo) {
    const minutes = todo.estimated_minutes;
    const pomos = calcPomodoros(minutes);
    const isSelected = todo.id === selectedTodoId;

    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

    li.innerHTML = `
        <input type="checkbox" ${todo.completed ? "checked" : ""}>
        <div class="todo-info">
            <div class="todo-name ${todo.completed ? "completed" : ""}">${escapeHtml(todo.name)}</div>
            <div class="todo-meta">${timeStr} estimated</div>
            <div class="todo-pomodoros">
                <span class="pomo-badge light"><span class="pomo-count">${pomos.light}</span><span class="pomo-label"> light</span></span>
                <span class="pomo-badge medium"><span class="pomo-count">${pomos.medium}</span><span class="pomo-label"> med</span></span>
                <span class="pomo-badge deep"><span class="pomo-count">${pomos.deep}</span><span class="pomo-label"> deep</span></span>
            </div>
        </div>
        <div class="todo-actions">
            <button class="todo-action-btn select-btn" title="Work on this task">${isSelected ? "Working" : "Select"}</button>
            <button class="todo-action-btn delete-btn" title="Delete task">X</button>
        </div>
    `;

    // Checkbox toggle
    li.querySelector("input[type=checkbox]").addEventListener("change", (e) => {
        toggleTodo(todo.id, e.target.checked);
    });

    // Select button
    li.querySelector(".select-btn").addEventListener("click", () => {
        selectTodo(todo.id, todo.name);
    });

    // Delete button
    li.querySelector(".delete-btn").addEventListener("click", () => {
        deleteTodo(todo.id);
    });

    return li;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

async function loadTodos() {
    const res = await fetch("/api/todos");
    const todos = await res.json();
    todoList.innerHTML = "";
    todos.forEach(todo => todoList.appendChild(renderTodo(todo)));
}

async function addTodo(name, hours, minutes) {
    const totalMins = (hours * 60) + minutes;
    if (totalMins <= 0) return;

    await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, estimated_minutes: totalMins }),
    });

    loadTodos();
}

async function toggleTodo(id, completed) {
    await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
    });
    loadTodos();
}

async function deleteTodo(id) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (selectedTodoId === id) {
        selectedTodoId = null;
        currentTaskDiv.classList.add("hidden");
    }
    loadTodos();
}

function selectTodo(id, name) {
    selectedTodoId = id;
    currentTaskName.textContent = name;
    currentTaskDiv.classList.remove("hidden");
    loadTodos(); // Re-render to update "Select"/"Working" labels
}

// --- Event Listeners ---

btnStart.addEventListener("click", startTimer);
btnPause.addEventListener("click", pauseTimer);
btnReset.addEventListener("click", resetTimer);

modeButtons.forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("todo-name").value.trim();
    const hours = parseInt(document.getElementById("todo-hours").value) || 0;
    const mins = parseInt(document.getElementById("todo-minutes").value) || 0;
    if (name && (hours > 0 || mins > 0)) {
        addTodo(name, hours, mins);
        document.getElementById("todo-name").value = "";
        document.getElementById("todo-hours").value = "0";
        document.getElementById("todo-minutes").value = "30";
    }
});

// --- Initialize ---
updateDisplay();
loadTodos();
loadStats();
