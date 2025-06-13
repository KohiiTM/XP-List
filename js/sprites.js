// Sprite configuration
const SPRITE_ANIMATIONS = {
  idle: {
    src: "images/sprites/Idle_1.png",
    frames: 6,
    spriteWidth: 128,
    spriteHeight: 128,
    sheetWidth: 768,
    sheetHeight: 128,
  },
  idle2: {
    src: "images/sprites/Idle_2.png",
    frames: 6,
    spriteWidth: 128,
    spriteHeight: 128,
    sheetWidth: 768,
    sheetHeight: 128,
  },
  idle3: {
    src: "images/sprites/Idle_3.png",
    frames: 5,
    spriteWidth: 128,
    spriteHeight: 128,
    sheetWidth: 640,
    sheetHeight: 128,
  },
  idle4: {
    src: "images/sprites/Idle_4.png",
    frames: 6,
    spriteWidth: 128,
    spriteHeight: 128,
    sheetWidth: 768,
    sheetHeight: 128,
  },
};

class SpriteManager {
  constructor() {
    this.currentSprite = localStorage.getItem("currentSprite") || "idle";
    this.canvas = null;
    this.ctx = null;
    this.gameFrame = 0;
    this.slowAnim = 5; // Controls animation speed
    this.playerImage = new Image();
    this.isAnimating = false;
  }

  init() {
    console.log("Initializing sprite system...");

    // Create sprite container
    const spriteContainer = document.createElement("div");
    spriteContainer.className = "sprite-container";

    // Create sprite visual container
    const spriteVisual = document.createElement("div");
    spriteVisual.className = "sprite-visual";

    // Create canvas element
    this.canvas = document.createElement("canvas");
    this.canvas.width = 130;
    this.canvas.height = 130;
    this.canvas.id = "player-sprite";
    this.canvas.className = "player-sprite";
    this.ctx = this.canvas.getContext("2d");

    // Create change sprite button
    const changeSpriteBtn = document.createElement("button");
    changeSpriteBtn.id = "change-sprite";
    changeSpriteBtn.className = "sprite-btn";
    changeSpriteBtn.textContent = ">";

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

    spriteVisual.appendChild(this.canvas);
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
    const animationData = SPRITE_ANIMATIONS[this.currentSprite];
    if (!animationData) {
      console.error("No data found for sprite:", this.currentSprite);
      return;
    }

    // Stop current animation if running
    if (this.isAnimating) {
      cancelAnimationFrame(this.animationId);
    }

    // Load new sprite image
    this.playerImage.src = animationData.src;
    this.playerImage.onload = () => {
      this.startAnimation(animationData);
    };
  }

  startAnimation(animationData) {
    this.isAnimating = true;
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let position =
        Math.floor(this.gameFrame / this.slowAnim) % animationData.frames;
      let frameX = animationData.spriteWidth * position;
      let frameY = 0;

      // Center the sprite in the canvas
      const x = (this.canvas.width - animationData.spriteWidth) / 2;
      const y = (this.canvas.height - animationData.spriteHeight) / 2;

      this.ctx.drawImage(
        this.playerImage,
        frameX,
        frameY,
        animationData.spriteWidth,
        animationData.spriteHeight,
        x,
        y,
        animationData.spriteWidth,
        animationData.spriteHeight
      );

      this.gameFrame++;
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  changeSprite() {
    console.log("Changing sprite...");
    const spriteKeys = Object.keys(SPRITE_ANIMATIONS);
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
