// create variables
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Auth-related elements
const userInfo = document.getElementById("user-info");
const username = document.getElementById("username");
const authButtons = document.getElementById("auth-buttons");
const logoutButton = document.getElementById("logout-button");
const profileLink = document.getElementById("profile-link");

// Initialize Supabase client
const supabase = window.supabase.createClient(
  "https://wasmcwusvjkoukofxzkg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc21jd3Vzdmprb3Vrb2Z4emtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTMxNTksImV4cCI6MjA2NTE2OTE1OX0.EUj0Rj288tzsq1ZZOu1KfA3QIzipvcfZDKvdGwDJUoc"
);

// User data management
let xp = 0;
let level = 1;
let currentSprite = "Idle_1";

// Sprite management
const sprites = ["Idle_1", "Idle_2", "Idle_3", "Idle_4"];

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

// fps
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
  saveUserData();
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
      saveUserData();
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      saveUserData();
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

// Load user data from Supabase
async function loadUserData() {
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

// Check authentication state
async function checkAuth() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    // User is signed in
    userInfo.style.display = "block";
    username.textContent =
      user.user_metadata.username || user.email.split("@")[0];
    authButtons.style.display = "none";
    logoutButton.style.display = "block";
    if (profileLink) profileLink.style.display = "inline-block";
    // Load user data
    await loadUserData();
  } else {
    // User is not signed in
    userInfo.style.display = "none";
    authButtons.style.display = "flex";
    logoutButton.style.display = "none";
    if (profileLink) profileLink.style.display = "none";
    // Clear data
    xp = 0;
    level = 1;
    currentSprite = "Idle_1";
    listContainer.innerHTML = "";
    updateGamificationUI();
    updateSpriteAnimation(currentSprite);
  }
}

// Handle logout
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.reload();
  }
}

// Check auth state on page load
checkAuth();

//////////////////////////////////////////////////////////////////

const baseXP = 100; // base XP
const baseTaskXP = 20; // base XP for easy task

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

document
  .getElementById("clear-storage-btn")
  .addEventListener("click", clearAllData);

// Delete user account and all their data
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

document
  .getElementById("delete-account-btn")
  .addEventListener("click", deleteAccount);
