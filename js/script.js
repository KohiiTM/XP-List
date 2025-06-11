// Constants
const baseXP = 100; // Base XP required for level 1
const baseTaskXP = 10; // Base XP for completing an easy task

// create variables
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Auth-related elements
const userInfo = document.getElementById("user-info");
const username = document.getElementById("username");
const authButtons = document.getElementById("auth-buttons");
const logoutButton = document.getElementById("logout-button");
const profileLink = document.getElementById("profile-link");

let supabase = null;
let xp = 0;
let level = 1;
let currentSprite = "Idle_1";

const sprites = ["Idle_1", "Idle_2", "Idle_3", "Idle_4"];

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

// fps
const DEFAULT_SPRITE_FPS = 5;

function xpToLevel(level) {
  return Math.round(baseXP * Math.pow(level, 1.2));
}

function updateGamificationUI() {
  const levelElement = document.getElementById("level");
  const xpElement = document.getElementById("xp");
  const xpProgressElement = document.getElementById("xp-progress");

  if (levelElement) levelElement.textContent = `Level: ${level}`;
  if (xpElement) xpElement.textContent = `XP: ${xp}/${xpToLevel(level)}`;
  if (xpProgressElement)
    xpProgressElement.style.width = `${(xp / xpToLevel(level)) * 100}%`;
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
      saveUserData();

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
  saveUserData();
  updateGamificationUI();
}

function saveTasks() {
  const tasks = [];
  listContainer.querySelectorAll("li").forEach((li) => {
    tasks.push({
      text: li.childNodes[1]?.textContent.trim() || "",
      checked: li.classList.contains("checked"),
      difficulty: li.querySelector(".difficulty")?.classList[1] || "easy",
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  if (!inputBox) return;

  const difficulty =
    document.getElementById("difficulty-select")?.value || "easy";
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
  saveTasks();
  saveUserData();
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
  return allLevels[level]?.tasks || [];
}

function showList() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  listContainer.innerHTML = "";
  tasks.forEach((task) => {
    let li = document.createElement("li");
    li.innerHTML = `<span class="difficulty ${
      task.difficulty || "easy"
    }"></span> ${task.text}`;
    if (task.checked) li.classList.add("checked");
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  });
}

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

async function clearAllData() {
  localStorage.clear();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase
      .from("user_data")
      .delete()
      .eq("user_id", user.id);
    if (error) {
      showToast("Error clearing account data.");
      console.error(error);
      return;
    }
  }

  xp = 0;
  level = 1;
  currentSprite = "Idle_1";
  listContainer.innerHTML = "";
  updateGamificationUI();
  updateSpriteAnimation(currentSprite);
  showToast("All data cleared!");
}

async function deleteAccount() {
  if (
    !confirm(
      "Are you sure you want to delete your account? This cannot be undone!"
    )
  )
    return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("user_data").delete().eq("user_id", user.id);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      showToast("Error deleting account.");
      console.error(error);
      return;
    }
    showToast("Account deleted. Goodbye!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }
}

// Initialize all event listeners and app state
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing app...");

  // Initialize localStorage defaults
  if (!localStorage.getItem("currentSprite")) {
    localStorage.setItem("currentSprite", "Idle_1");
  }

  // Initialize UI elements
  initSprite();
  showList();
  updateGamificationUI();
  renderSidebar();

  // Add event listeners
  const backToCurrentBtn = document.getElementById("back-to-current");
  if (backToCurrentBtn) {
    backToCurrentBtn.addEventListener("click", function () {
      showList();
      document.getElementById("input-row").style.display = "flex";
      document.getElementById("back-to-current").style.display = "none";
    });
  }

  const clearStorageBtn = document.getElementById("clear-storage-btn");
  if (clearStorageBtn) {
    clearStorageBtn.addEventListener("click", clearAllData);
  }

  const deleteAccountBtn = document.getElementById("delete-account-btn");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", deleteAccount);
  }

  // Add list item click handler
  if (listContainer) {
    listContainer.addEventListener("click", function (e) {
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
        saveTasks();
        saveUserData();
      } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveTasks();
        saveUserData();
      }
    });
  }

  // Add input box enter key handler
  if (inputBox) {
    inputBox.addEventListener("keydown", function (e) {
      if (e.key === "Enter") addTask();
    });
  }

  // Add difficulty selector handler
  const difficultySelect = document.getElementById("difficulty-select");
  if (difficultySelect) {
    difficultySelect.addEventListener("change", function () {
      saveUserData();
    });
  }

  // Load data from localStorage
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    const tasks = JSON.parse(savedTasks);
    listContainer.innerHTML = "";
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

  const savedXP = localStorage.getItem("xp");
  const savedLevel = localStorage.getItem("level");
  if (savedXP) xp = parseInt(savedXP);
  if (savedLevel) level = parseInt(savedLevel);
  updateGamificationUI();

  // Add logout button handler
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Clear all localStorage data
      localStorage.removeItem("tasks");
      localStorage.removeItem("xp");
      localStorage.removeItem("level");
      localStorage.removeItem("currentSprite");
      localStorage.removeItem("allLevels");
      localStorage.removeItem("user");

      // Reset variables
      xp = 0;
      level = 1;
      currentSprite = "Idle_1";

      // Clear the list container
      if (listContainer) {
        listContainer.innerHTML = "";
      }

      // Update UI
      updateGamificationUI();
      updateSpriteAnimation(currentSprite);

      // Redirect to login page
      window.location.href = "login.html";
    });
  }
});

// Load user data from Supabase
async function loadUserData() {
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("user_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error loading user data:", error);
    return;
  }

  if (data) {
    xp = data.xp || 0;
    level = data.level || 1;
    currentSprite = data.current_sprite || "Idle_1";

    // Update UI
    updateGamificationUI();
    updateSpriteAnimation(currentSprite);

    // Load tasks
    if (data.tasks) {
      const tasks = JSON.parse(data.tasks);
      listContainer.innerHTML = "";
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
  }
}

// Save user data to Supabase
async function saveUserData() {
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

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

  const { error } = await supabase.from("user_data").upsert({
    user_id: user.id,
    tasks: JSON.stringify(tasks),
    current_sprite: currentSprite,
    xp: xp,
    level: level,
  });

  if (error) {
    console.error("Error saving user data:", error);
  }
}

async function checkAuth() {
  const isLocalMode =
    !window.env.SUPABASE_URL ||
    window.env.SUPABASE_URL === "YOUR_SUPABASE_URL" ||
    !window.env.SUPABASE_ANON_KEY ||
    window.env.SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY";

  // If in local mode, show the app without auth
  if (isLocalMode) {
    if (userInfo) userInfo.style.display = "none";
    if (authButtons) authButtons.style.display = "none"; // Hide auth buttons in local mode
    if (logoutButton) logoutButton.style.display = "none";

    // Load tasks from localStorage in local mode
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      listContainer.innerHTML = "";
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

    // Load XP and level from localStorage
    const savedXP = localStorage.getItem("xp");
    const savedLevel = localStorage.getItem("level");
    if (savedXP) xp = parseInt(savedXP);
    if (savedLevel) level = parseInt(savedLevel);
    updateGamificationUI();

    return;
  }

  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is logged in
    if (userInfo) userInfo.style.display = "flex";
    if (authButtons) authButtons.style.display = "none";
    if (logoutButton) logoutButton.style.display = "block";
    if (username) {
      const displayName =
        user.user_metadata?.username || user.email?.split("@")[0] || "User";
      username.textContent = displayName;
    }

    // Load user data
    await loadUserData();
  } else {
    // User is not logged in
    if (userInfo) userInfo.style.display = "none";
    if (authButtons) authButtons.style.display = "flex";
    if (logoutButton) logoutButton.style.display = "none";

    // Only redirect to login if not on auth pages and not in local mode
    const currentPage = window.location.pathname;
    if (
      !currentPage.includes("login.html") &&
      !currentPage.includes("signup.html") &&
      !isLocalMode
    ) {
      window.location.href = "login.html";
    }
  }
}

async function handleLogout() {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast("Error logging out");
    console.error(error);
    return;
  }

  // Clear local data
  localStorage.clear();

  // Redirect to login
  window.location.href = "login.html";
}

function handleLevelUp() {
  saveAllTasks(level - 1, getCompletedTasks());
  removeCompletedTasks();
  renderSidebar();
}

function saveAllTasks(level, tasks) {
  let allLevels = JSON.parse(localStorage.getItem("allLevels")) || {};
  allLevels[level] = {
    tasks: tasks,
    completedDate: new Date().toISOString(),
  };
  localStorage.setItem("allLevels", JSON.stringify(allLevels));
}

function renderSidebar() {
  const levelTabs = document.getElementById("level-tabs");
  let allLevels = JSON.parse(localStorage.getItem("allLevels")) || {};
  levelTabs.innerHTML = ""; // Only clear the level tabs, not the entire sidebar

  Object.entries(allLevels)
    .sort((a, b) => new Date(b[1].completedDate) - new Date(a[1].completedDate))
    .forEach(([lvl, data]) => {
      const btn = document.createElement("button");
      btn.className = "level-tab";
      const date = new Date(data.completedDate);
      btn.textContent = date.toLocaleDateString();
      btn.onclick = () => showLevelHistory(lvl);
      levelTabs.appendChild(btn);
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
  saveUserData();
}
