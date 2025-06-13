// Character sprite configurations
const CHARACTER_SPRITES = {
  samurai: {
    idle: {
      src: "images/sprites/Idle_1.png",
      frames: 6,
      spriteWidth: 128,
      spriteHeight: 128,
      sheetWidth: 768,
      sheetHeight: 128,
    },
    shield: {
      src: "images/sprites/Shield.png",
      frames: 6,
      spriteWidth: 128,
      spriteHeight: 128,
      sheetWidth: 768,
      sheetHeight: 128,
    },
  },
  knight2: {
    idle: {
      src: "images/sprites/Idle_2.png",
      frames: 6,
      spriteWidth: 128,
      spriteHeight: 128,
      sheetWidth: 768,
      sheetHeight: 128,
    },
    shield: {
      src: "images/sprites/Shield.png",
      frames: 6,
      spriteWidth: 128,
      spriteHeight: 128,
      sheetWidth: 768,
      sheetHeight: 128,
    },
  },
  knight3: {
    idle: {
      src: "images/sprites/Idle_3.png",
      frames: 5,
      spriteWidth: 128,
      spriteHeight: 128,
      sheetWidth: 640,
      sheetHeight: 128,
    },
  },
  knight4: {
    idle: {
      src: "images/sprites/Idle_4.png",
      frames: 6,
      spriteWidth: 128,
      spriteHeight: 128,
      sheetWidth: 768,
      sheetHeight: 128,
    },
  },
  // Add more characters here as needed
  // wizard: {
  //   idle: { ... },
  //   cast: { ... },
};

class SpriteManager {
  constructor() {
    this.currentCharacter =
      localStorage.getItem("currentCharacter") || "samurai";
    this.currentAnimation = localStorage.getItem("currentAnimation") || "idle";
    this.canvas = null;
    this.ctx = null;
    this.gameFrame = 0;
    this.slowAnim = 5;
    this.playerImage = new Image();
    this.isAnimating = false;
    this.animationTimeout = null;
  }

  init() {
    console.log("Initializing sprite system...");

    const spriteContainer = document.createElement("div");
    spriteContainer.className = "sprite-container";

    const spriteVisual = document.createElement("div");
    spriteVisual.className = "sprite-visual";

    this.canvas = document.createElement("canvas");
    this.canvas.width = 130;
    this.canvas.height = 130;
    this.canvas.id = "player-sprite";
    this.canvas.className = "player-sprite";
    this.ctx = this.canvas.getContext("2d");

    const changeSpriteBtn = document.createElement("button");
    changeSpriteBtn.id = "change-sprite";
    changeSpriteBtn.className = "sprite-btn";
    changeSpriteBtn.textContent = ">";

    const leveling = document.createElement("div");
    leveling.className = "leveling";

    const levelDisplay = document.createElement("span");
    levelDisplay.id = "level";
    levelDisplay.textContent = "Level: 1";

    const xpBar = document.createElement("div");
    xpBar.className = "xp-bar";

    const xpProgress = document.createElement("div");
    xpProgress.id = "xp-progress";

    const xpText = document.createElement("span");
    xpText.className = "xp-text";
    xpText.id = "xp";
    xpText.textContent = "XP: 0/100";

    xpBar.appendChild(xpProgress);
    leveling.appendChild(levelDisplay);
    leveling.appendChild(xpBar);
    leveling.appendChild(xpText);

    spriteVisual.appendChild(this.canvas);
    spriteContainer.appendChild(spriteVisual);
    spriteContainer.appendChild(changeSpriteBtn);
    spriteContainer.appendChild(leveling);

    const todoApp = document.querySelector(".todo-app");
    if (todoApp) {
      todoApp.insertBefore(spriteContainer, todoApp.firstChild);
      console.log("Sprite container inserted into DOM");
    } else {
      console.error("Could not find .todo-app element");
    }

    changeSpriteBtn.addEventListener("click", () => this.changeSprite());

    // Add event listener for the add button
    const addButton = document.querySelector('button[onclick="addTask()"]');
    if (addButton) {
      addButton.addEventListener("click", () => {
        this.changeAnimation("shield");
      });
    }

    this.updateSprite();
  }

  updateSprite() {
    console.log(
      "Updating sprite to:",
      this.currentCharacter,
      this.currentAnimation
    );
    const characterData = CHARACTER_SPRITES[this.currentCharacter];
    if (!characterData) {
      console.error("No data found for character:", this.currentCharacter);
      return;
    }

    const animationData = characterData[this.currentAnimation];
    if (!animationData) {
      console.error("No animation data found for:", this.currentAnimation);
      return;
    }

    if (this.isAnimating) {
      cancelAnimationFrame(this.animationId);
    }

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
    const characterKeys = Object.keys(CHARACTER_SPRITES);
    const currentCharIndex = characterKeys.indexOf(this.currentCharacter);
    const nextCharIndex = (currentCharIndex + 1) % characterKeys.length;
    this.currentCharacter = characterKeys[nextCharIndex];

    this.currentAnimation = Object.keys(
      CHARACTER_SPRITES[this.currentCharacter]
    )[0];

    localStorage.setItem("currentCharacter", this.currentCharacter);
    localStorage.setItem("currentAnimation", this.currentAnimation);
    this.updateSprite();
  }

  changeAnimation(animationName) {
    if (!CHARACTER_SPRITES[this.currentCharacter][animationName]) {
      console.error(
        `Animation ${animationName} not found for character ${this.currentCharacter}`
      );
      return;
    }

    this.currentAnimation = animationName;
    this.updateSprite();

    // If it's not the idle animation, set a timeout to return to idle
    if (animationName !== "idle") {
      if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
      }
      this.animationTimeout = setTimeout(() => {
        this.changeAnimation("idle");
      }, 1000); // Return to idle after 1 second
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const spriteManager = new SpriteManager();
  spriteManager.init();
});
