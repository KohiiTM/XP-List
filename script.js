// create variables
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

//////////////////////////////////////////////////////////////////

let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;
const baseXP = 100; // base XP 
const baseTaskXP = 20; // base XP for easy task

// Sprite management
const sprites = ["Idle_1", "Idle_2", "Idle_3", "Idle_4"];
let currentSprite = localStorage.getItem("currentSprite") || "Idle_1";

// Sprite frame data
const spriteFrameData = {
  Idle_1: {
    frameWidth: 128,
    frameHeight: 128,
    frames: 6,
    sheetWidth: 768,
    sheetHeight: 128,
  },
  Idle_2: {
    frameWidth: 128,
    frameHeight: 128,
    frames: 6,
    sheetWidth: 768,
    sheetHeight: 128,
  },
  Idle_3: {
    frameWidth: 128,
    frameHeight: 128,
    frames: 5,
    sheetWidth: 640,
    sheetHeight: 128,
  },
  Idle_4: {
    frameWidth: 128,
    frameHeight: 128,
    frames: 6,
    sheetWidth: 768,
    sheetHeight: 128,
  },
};

// Set your desired FPS here
const DEFAULT_SPRITE_FPS = 5;

function xpToLevel(level) {
  return Math.round(baseXP * Math.pow(level, 1.2));
}

function updateGamificationUI() {
  document.getElementById("level").textContent = `Level: ${level}`;
  document.getElementById("xp").textContent = `XP: ${xp}/${xpToLevel(level)}`;
  document.getElementById("xp-progress").style.width = `${
    (xp / xpToLevel(level)) * 100
  }%`;
}

function updateSpriteAnimation(sprite) {
  const spriteElement = document.getElementById("player-sprite");
  const spriteVisual = document.querySelector(".sprite-visual");
  if (!spriteElement || !spriteVisual) return;

  let frameData = spriteFrameData[sprite];
  const fps = DEFAULT_SPRITE_FPS;
  const duration = (frameData.frames / fps).toFixed(3);

  spriteElement.style.width = frameData.frameWidth + "px";
  spriteElement.style.height = frameData.frameHeight + "px";
  spriteElement.style.backgroundSize = `${frameData.sheetWidth}px ${frameData.sheetHeight}px`;
  spriteElement.style.backgroundImage = `url('images/sprites/${sprite}.png')`;
  spriteElement.style.animation = `spriteAnimation ${duration}s steps(${frameData.frames}) infinite`;

  spriteVisual.style.width = frameData.frameWidth + "px";
  spriteVisual.style.height = frameData.frameHeight + "px";
}

function setSpriteKeyframes(frames, frameWidth, sprite) {
  const styleSheet = document.styleSheets[0];
  let keyframesIndex = -1;
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].name === "spriteAnimation") {
      keyframesIndex = i;
      break;
    }
  }
  if (keyframesIndex !== -1) styleSheet.deleteRule(keyframesIndex);

  const totalWidth = spriteFrameData[sprite].sheetWidth;
  const rule = `@keyframes spriteAnimation { from { background-position: 0px 0px; } to { background-position: -${totalWidth}px 0px; } }`;
  styleSheet.insertRule(rule, styleSheet.cssRules.length);
}

function initSprite() {
  const spriteElement = document.getElementById("player-sprite");
  const spriteVisual = document.querySelector(".sprite-visual");
  if (!spriteElement || !spriteVisual) {
    console.error("Sprite element or visual not found!");
    return;
  }

  currentSprite = localStorage.getItem("currentSprite") || "Idle_1";
  let frameData = spriteFrameData[currentSprite];
  const fps = DEFAULT_SPRITE_FPS;
  const duration = (frameData.frames / fps).toFixed(3);

  spriteElement.style.width = frameData.frameWidth + "px";
  spriteElement.style.height = frameData.frameHeight + "px";
  spriteElement.style.backgroundSize = `${frameData.sheetWidth}px ${frameData.sheetHeight}px`;
  spriteElement.style.backgroundImage = `url('images/sprites/${currentSprite}.png')`;
  spriteElement.style.animation = `spriteAnimation ${duration}s steps(${frameData.frames}) infinite`;
  setSpriteKeyframes(frameData.frames, frameData.frameWidth, currentSprite);

  spriteVisual.style.width = frameData.frameWidth + "px";
  spriteVisual.style.height = frameData.frameHeight + "px";

  const changeButton = document.getElementById("change-sprite");
  if (changeButton) {
    changeButton.onclick = () => {
      const currentIndex = sprites.indexOf(currentSprite);
      const nextIndex = (currentIndex + 1) % sprites.length;
      currentSprite = sprites[nextIndex];
      localStorage.setItem("currentSprite", currentSprite);

      frameData = spriteFrameData[currentSprite];
      updateSpriteAnimation(currentSprite);
      setSpriteKeyframes(frameData.frames, frameData.frameWidth, currentSprite);
    };
  }
}

function addXP(amount) {
  xp += amount;
  while (xp >= xpToLevel(level)) {
    xp -= xpToLevel(level);
    level++;
    showToast(`🎉 Level Up! You are now Level ${level}`);
    handleLevelUp();

  }
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  updateGamificationUI();
}

function addTask() {
  const difficulty = document.getElementById("difficulty-select").value;
  if (inputBox.value === "") {
    showToast("Please enter a task ✎");
  } else {
    let li = document.createElement("li");
    li.innerHTML = `<span class="difficulty ${difficulty}"></span> ${inputBox.value}`;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  }
  inputBox.value = "";
  saveData();
}

listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      if (e.target.classList.contains("checked")) {
        // Unchecking: animate reverse
        e.target.classList.remove("checked");
        e.target.classList.add("unchecking");
        setTimeout(() => {
          e.target.classList.remove("unchecking");
        }, 400);
      } else {
        e.target.classList.add("checked");
        // XP modifier based on difficulty and level
        let diffSpan = e.target.querySelector(".difficulty");
        let difficulty = diffSpan
          ? diffSpan.classList.contains("hard")
            ? "hard"
            : diffSpan.classList.contains("medium")
            ? "medium"
            : "easy"
          : "easy";
        let multiplier = 1;
        if (difficulty === "medium") multiplier = 1.5;
        if (difficulty === "hard") multiplier = 2;
        let xpMod = Math.round(
          baseTaskXP * multiplier * (1 + (level - 1) * 0.1)
        );
        addXP(xpMod);
      }
      saveData();
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      saveData();
    }
  },
  false
);

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

document.getElementById("input-box").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTask();
});

// Save data to browser storage
function saveData() {
  const tasks = [];
  listContainer.querySelectorAll("li").forEach((li) => {
    const diffSpan = li.querySelector(".difficulty");
    tasks.push({
      text: li.textContent
        .replace(diffSpan ? diffSpan.textContent : "", "")
        .replace("×", "")
        .trim(),
      checked: li.classList.contains("checked"),
      difficulty: diffSpan ? diffSpan.classList[1] : "easy",
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display saved data
function showList() {
  listContainer.innerHTML = "";
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => {
    let li = document.createElement("li");
    li.innerHTML = `<span class="difficulty ${task.difficulty}"></span> ${task.text}`;
    if (task.checked) li.classList.add("checked");
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
    listContainer.appendChild(li);
  });
}

function getCompletedTasks() {
  const tasks = [];
  listContainer.querySelectorAll("li.checked").forEach((li) => {
    tasks.push({
      text: li.childNodes[1]?.textContent.trim() || "",
      checked: true,
      difficulty: li.querySelector(".difficulty")?.classList[1] || "easy",
    });
  });
  return tasks;
}
function removeCompletedTasks() {
  listContainer.querySelectorAll("li.checked").forEach((li) => li.remove());
  saveData();
}

function handleLevelUp() {
  saveAllTasks(level - 1, getCompletedTasks());
  removeCompletedTasks();
  renderSidebar();
}

function saveAllTasks(level, tasks) {
  let allLevels = JSON.parse(localStorage.getItem("allLevels")) || {};
  allLevels[level] = tasks;
  localStorage.setItem("allLevels", JSON.stringify(allLevels));
}

function renderSidebar() {
  const levelTabs = document.getElementById("level-tabs");
  let allLevels = JSON.parse(localStorage.getItem("allLevels")) || {};
  levelTabs.innerHTML = ""; // Only clear the level tabs, not the entire sidebar
  Object.keys(allLevels)
    .sort((a, b) => a - b)
    .forEach((lvl) => {
      const btn = document.createElement("button");
      btn.className = "level-tab";
      btn.textContent = `Level ${lvl}`;
      btn.onclick = () => showLevelHistory(lvl);
      levelTabs.appendChild(btn);
    });
}

function showLevelHistory(level) {
  const tasks = getTasksForLevel(level);
  listContainer.innerHTML = "";
  tasks.forEach((task) => {
    let li = document.createElement("li");
    li.innerHTML = `<span class="difficulty ${
      task.difficulty || "easy"
    }"></span> ${task.text}`;
    if (task.checked) li.classList.add("checked");
    li.style.pointerEvents = "none";
    li.style.opacity = "0.7";
    listContainer.appendChild(li);
  });
  document.getElementById("input-row").style.display = "none";
  document.getElementById("back-to-current").style.display = "block";
}

function getTasksForLevel(level) {
  let allLevels = JSON.parse(localStorage.getItem("allLevels")) || {};
  return allLevels[level] || [];
}

document
  .getElementById("back-to-current")
  .addEventListener("click", function () {
    showList();
    document.getElementById("input-row").style.display = "flex";
    document.getElementById("back-to-current").style.display = "none";
  });

document
  .getElementById("clear-storage-btn")
  .addEventListener("click", function () {
    showClearConfirmToast();
  });

function showClearConfirmToast() {
  const toast = document.getElementById("toast");
  toast.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:20px;">
      <span style="font-size:16px;letter-spacing:0.02em;">Clear all data?</span>
      <div style="display:flex;gap:12px;">
        <button id="confirm-clear-btn" style="
          background: #d32f2f;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 8px 24px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: background 0.2s;
        ">Confirm</button>
        <button id="cancel-clear-btn" style="
          background: #f5f5f5;
          color: #222;
          border: none;
          border-radius: 999px;
          padding: 8px 24px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: background 0.2s, color 0.2s;
        ">Cancel</button>
      </div>
    </div>
  `;
  toast.className = "toast show";
  const hideTimeout = setTimeout(() => {
    toast.className = "toast";
    toast.innerHTML = "";
  }, 4000);

  document.getElementById("confirm-clear-btn").onclick = function () {
    clearTimeout(hideTimeout);
    localStorage.clear();
    location.reload();
  };
  document.getElementById("cancel-clear-btn").onclick = function () {
    clearTimeout(hideTimeout);
    toast.className = "toast";
    toast.innerHTML = "";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing app...");
  if (!localStorage.getItem("currentSprite")) {
    localStorage.setItem("currentSprite", "Idle_1");
  }
  initSprite();
  showList();
  updateGamificationUI();
  renderSidebar();
});
