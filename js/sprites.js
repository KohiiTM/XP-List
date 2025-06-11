// Sprite configuration
const SPRITES = {
  Idle_1: {
    frames: 6,
    width: 128,
    height: 128,
    sheetWidth: 768,
    sheetHeight: 128,
  },
  Idle_2: {
    frames: 6,
    width: 128,
    height: 128,
    sheetWidth: 768,
    sheetHeight: 128,
  },
  Idle_3: {
    frames: 5,
    width: 128,
    height: 128,
    sheetWidth: 640,
    sheetHeight: 128,
  },
  Idle_4: {
    frames: 6,
    width: 128,
    height: 128,
    sheetWidth: 768,
    sheetHeight: 128,
  },
};

const SPRITE_NAMES = Object.keys(SPRITES);
const FPS = 5;

class SpriteManager {
  constructor() {
    this.currentSprite = localStorage.getItem("currentSprite") || "Idle_1";
    this.sprites = {
      Idle_1: {
        frames: 4,
        width: 96,
        height: 96,
        sheetWidth: 384,
        sheetHeight: 96,
      },
      Idle_2: {
        frames: 4,
        width: 96,
        height: 96,
        sheetWidth: 384,
        sheetHeight: 96,
      },
      Idle_3: {
        frames: 4,
        width: 96,
        height: 96,
        sheetWidth: 384,
        sheetHeight: 96,
      },
      Idle_4: {
        frames: 4,
        width: 96,
        height: 96,
        sheetWidth: 384,
        sheetHeight: 96,
      },
    };
  }

  init() {
    console.log("Initializing sprite system...");

    // Create sprite container
    const spriteContainer = document.createElement("div");
    spriteContainer.className = "sprite-container";

    // Create sprite visual container
    const spriteVisual = document.createElement("div");
    spriteVisual.className = "sprite-visual";

    // Create sprite element
    const spriteElement = document.createElement("div");
    spriteElement.id = "player-sprite";
    spriteElement.className = "player-sprite";

    // Create change sprite button
    const changeSpriteBtn = document.createElement("button");
    changeSpriteBtn.id = "change-sprite";
    changeSpriteBtn.className = "sprite-btn";
    changeSpriteBtn.textContent = "Change Sprite";

    // Create leveling container
    const leveling = document.createElement("div");
    leveling.className = "leveling";

    // Create level display
    const levelDisplay = document.createElement("span");
    levelDisplay.id = "level";
    levelDisplay.textContent = "Level: 1";

    // Create XP bar container
    const xpBar = document.createElement("div");
    xpBar.className = "xp-bar";

    // Create XP progress bar
    const xpProgress = document.createElement("div");
    xpProgress.id = "xp-progress";

    // Create XP text
    const xpText = document.createElement("span");
    xpText.className = "xp-text";
    xpText.id = "xp";
    xpText.textContent = "XP: 0/100";

    // Assemble the structure
    xpBar.appendChild(xpProgress);
    leveling.appendChild(levelDisplay);
    leveling.appendChild(xpBar);
    leveling.appendChild(xpText);

    spriteVisual.appendChild(spriteElement);
    spriteContainer.appendChild(spriteVisual);
    spriteContainer.appendChild(changeSpriteBtn);
    spriteContainer.appendChild(leveling);

    // Insert at the beginning of the todo-app
    const todoApp = document.querySelector(".todo-app");
    if (todoApp) {
      todoApp.insertBefore(spriteContainer, todoApp.firstChild);
      console.log("Sprite container inserted into DOM");
    } else {
      console.error("Could not find .todo-app element");
    }

    // Add event listener for sprite change
    changeSpriteBtn.addEventListener("click", () => this.changeSprite());

    // Initialize the first sprite
    this.updateSprite();
  }

  updateSprite() {
    console.log("Updating sprite to:", this.currentSprite);
    const spriteElement = document.getElementById("player-sprite");
    if (!spriteElement) {
      console.error("Could not find player-sprite element");
      return;
    }

    const spriteData = this.sprites[this.currentSprite];
    if (!spriteData) {
      console.error("No data found for sprite:", this.currentSprite);
      return;
    }

    // Create absolute URL for sprite image
    const spriteUrl = new URL(
      `images/sprites/${this.currentSprite}.png?v=1.0`,
      window.location.href
    ).href;
    console.log("Loading sprite from URL:", spriteUrl);

    // Create a test image to verify the sprite loads
    const testImage = new Image();
    testImage.onload = () => {
      console.log("Sprite image loaded successfully");

      // Reset animation
      spriteElement.style.animation = "none";
      spriteElement.offsetHeight; // Force reflow

      // Set sprite styles
      spriteElement.style.backgroundImage = `url('${spriteUrl}')`;
      spriteElement.style.backgroundSize = `${spriteData.sheetWidth}px ${spriteData.sheetHeight}px`;
      spriteElement.style.width = `${spriteData.width}px`;
      spriteElement.style.height = `${spriteData.height}px`;

      // Calculate animation duration based on frames (1.2s per frame)
      const duration = (spriteData.frames * 1.2).toFixed(1);

      // Re-enable animation with correct frame count
      spriteElement.style.animation = `spriteAnimation ${duration}s steps(${spriteData.frames}) infinite`;

      // Update keyframes for this sprite
      this.updateKeyframes(spriteData);

      console.log("Sprite styles applied:", {
        backgroundImage: spriteElement.style.backgroundImage,
        backgroundSize: spriteElement.style.backgroundSize,
        width: spriteElement.style.width,
        height: spriteElement.style.height,
        animation: spriteElement.style.animation,
        frames: spriteData.frames,
        duration: duration,
      });
    };

    testImage.onerror = () => {
      console.error("Failed to load sprite image:", spriteUrl);
    };

    testImage.src = spriteUrl;
  }

  updateKeyframes(spriteData) {
    const styleSheet = document.styleSheets[0];
    let keyframesIndex = -1;

    // Find existing keyframes
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      if (styleSheet.cssRules[i].name === "spriteAnimation") {
        keyframesIndex = i;
        break;
      }
    }

    // Remove existing keyframes
    if (keyframesIndex !== -1) {
      styleSheet.deleteRule(keyframesIndex);
    }

    // Calculate frame positions
    const frameWidth = spriteData.width;
    const totalWidth = spriteData.sheetWidth;
    const frameCount = spriteData.frames;

    // Generate keyframe rules
    let keyframeRules = [];
    for (let i = 0; i <= frameCount; i++) {
      const percentage = (i * 100) / frameCount;
      const position = -i * frameWidth;
      keyframeRules.push(
        `${percentage}% { background-position: ${position}px 0px; }`
      );
    }

    // Add new keyframes
    const rule = `@keyframes spriteAnimation {
      ${keyframeRules.join("\n      ")}
    }`;
    styleSheet.insertRule(rule, styleSheet.cssRules.length);
  }

  changeSprite() {
    console.log("Changing sprite...");
    const spriteKeys = Object.keys(this.sprites);
    const currentIndex = spriteKeys.indexOf(this.currentSprite);
    const nextIndex = (currentIndex + 1) % spriteKeys.length;
    this.currentSprite = spriteKeys[nextIndex];
    localStorage.setItem("currentSprite", this.currentSprite);
    this.updateSprite();
  }
}

// Initialize sprite manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const spriteManager = new SpriteManager();
  spriteManager.init();
});
