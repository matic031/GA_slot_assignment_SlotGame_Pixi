import {
  WIDTH,
  HEIGHT,
  REELS,
  SYMBOLS,
  SYMBOL_SIZE,
  SYMBOLS_COUNT,
  SPACING,
} from "./constants.js";
import Background from "./background.js";
import Button from './button.js';
import Reel from "./reel.js";

// Initialize the Pixi Application
let app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  autoResize: false, // true for responsiveness
  resolution: 1, // window.devicePixelRatio for responsiveness
  antialias: true,
  transparent: false,
});
export default app;

const background = new Background("./Images/background.jpg");
background.loadBackground();

//Symbol resources
const jsonURL = "Images/symStatic.json";
const textureURL = "Images/symStatic.webp";

//Audio
const clickSound = new Audio("./Sound/click.mp3");
const winSound = new Audio("./Sound/win.mp3");
const loseSound = new Audio("./Sound/loose.mp3");

//Logic variables for the Menu/Dialogue
let refreshButtonClicked = false;
let okDialogueButtonClicked = true;
export let spinClicked = false;
let isSpinning = false;

// Calculate starting positions for reels
let startX = (WIDTH - REELS * SYMBOL_SIZE - (REELS - 1) * SPACING) / 2;
let startY = (HEIGHT - SYMBOLS * SYMBOL_SIZE - (SYMBOLS - 1) * SPACING) / 2;

// Create a container for the slot reels
export let reelsContainer = new PIXI.Container();
app.stage.addChild(reelsContainer);

// Define the slot reels
export let slotReels = [];
export let matrix = []; // A 2D array that stores the numbers of the reels
for (let i = 0; i < REELS; i++) {
  let reel = new Reel(app, startX + i * (SYMBOL_SIZE + SPACING), startY, SYMBOLS, SPACING);
  let column = reel.symbols.map(symbol => Number(symbol.text));

  slotReels.push(reel);
  matrix.push(column);
}

// Button styles
const buttonStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 36,
  fontWeight: "bold",
  fill: ["#ffffff"],
});

// Define the button positions
let buttonSpacing = 100;
let leftShift = 25;
let availableVerticalSpace =
  HEIGHT - 100 - startY - SYMBOLS * (SYMBOL_SIZE + SPACING);
let verticalShift = Math.min(
  availableVerticalSpace,
  -0.9 * availableVerticalSpace
);
let buttonWidths = [
  PIXI.TextMetrics.measureText("REFRESH", buttonStyle).width,
  PIXI.TextMetrics.measureText("SPIN", buttonStyle).width,
  PIXI.TextMetrics.measureText("STOP", buttonStyle).width,
];

let totalButtonWidth = buttonWidths.reduce((a, b) => a + b, 0);
let totalSpacing = (buttonWidths.length - 1) * buttonSpacing;
let buttonX = (WIDTH - totalButtonWidth - totalSpacing) / 2;


// Instantiate the buttons
let refreshButton = new Button(
  app,
  "REFRESH",
  buttonStyle,
  buttonX - leftShift + 30,
  HEIGHT - 120 + verticalShift,
  buttonWidths[0],
  function () {
    if (!spinClicked && !refreshButtonClicked && okDialogueButtonClicked) {
      clickSound.play();
      RefreshMatrix();
    }
  }
);

let spinButton = new Button(
  app,
  "SPIN",
  buttonStyle,
  buttonX +
    buttonWidths[0] +
    buttonSpacing, // Spin button starts where the refresh button ends + the button spacing
  HEIGHT - 120 + verticalShift,
  buttonWidths[1],
  function () {
    if (!isSpinning && okDialogueButtonClicked) {
      clickSound.play();
      isSpinning = true;
      LoadSpinningSprites();
      HideSprites();
      spinClicked = true;
    }
  }
);

let stopButton = new Button(
  app,
  "STOP",
  buttonStyle,
  buttonX +
    30 +
    buttonWidths[0] +
    buttonWidths[1] +
    2 * buttonSpacing -
    leftShift,
  HEIGHT - 120 + verticalShift,
  buttonWidths[2],
  async function () { //STOP Button function
    if (spinClicked && okDialogueButtonClicked) {
      clickSound.play();
      HideSpinningSprites();
      ClearMatrix();
      refreshButtonClicked = false;

      for (let i = 0; i < REELS; i++) {
        for (let j = 0; j < SYMBOLS; j++) {
          let number = Math.floor(Math.random() * SYMBOLS_COUNT) + 1;
          matrix[i][j] = number;
        }
      }

      okDialogueButtonClicked = false;

      await LoadSprites();
      ShowSprites();

      reelsContainer.visible = true;
      spinClicked = false;
      isSpinning = false;

      if (CheckWin(matrix, slotReels)) {
        console.log("You win!");
        btnText.text = "You win!";
        winSound.play();
        ShowDialogue(2500);
      } else {
        console.log("You lose!");
        btnText.text = "You lose!";
        loseSound.play();
        ShowDialogue(1000);
      }
    }
  }
);


function RefreshSymbols(matrix, slotReels) {
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS; j++) {
    }
  }
}

//Refresh button calls this to set the matrix to the initial predefined state
async function RefreshMatrix() {
  if (!refreshButtonClicked) {
    if (!spinClicked) {
      matrix = [
        [1, 2, 3],
        [2, 3, 4],
        [7, 3, 8],
        [5, 8, 6],
      ];
      RefreshSymbols(matrix, slotReels);
      await HideSprites();
      LoadSprites();
      ShowSprites();
      refreshButtonClicked = true;
      isSpinning = false;
    }
  }
}

function ClearMatrix() {
  // Clear the old reels
  HideSprites();
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS; j++) {
      if (slotReels[i] && slotReels[i][j]) { // Check if slotReels[i][j] exists
        reelsContainer.removeChild(slotReels[i][j]);
        slotReels[i][j].destroy();
      }
    }
  }
  slotReels = [];
  matrix = [];

  // Create new reels and matrix
  for (let i = 0; i < REELS; i++) {
    let reel = [];
    let column = [];
    for (let j = 0; j < SYMBOLS; j++) {
      // Create an empty symbol
      let symbol = new PIXI.Text("", {
        fontFamily: "Arial",
        fontSize: 0.1,
        // fill: 0xff1010,
        align: "center",
      });
      symbol.x = startX + i * (SYMBOL_SIZE + SPACING);
      symbol.y = startY + j * (SYMBOL_SIZE + SPACING);
      reel.push(symbol);
      reelsContainer.addChild(symbol);

      // Update the matrix
      column.push("");
    }
    slotReels.push(reel);
    matrix.push(column);
  }
}

// Check for win
const CheckWin = (matrix, slotReels) => {
  let win = false;
  ScaleWinningSprites(matrix, slotReels, 0.675); // Scale the winning sprites up

  // Check all horizontal lines
  for (let i = 0; i < SYMBOLS; i++) {
    for (let j = 0; j < REELS - 2; j++) {
      if (
        matrix[j][i] === matrix[j + 1][i] &&
        matrix[j + 1][i] === matrix[j + 2][i]
      ) {
        win = true;
      }
    }
  }

  // Check diagonal lines from top-left to bottom-right
  for (let i = 0; i < REELS - 2; i++) {
    if (
      matrix[i][0] === matrix[i + 1][1] &&
      matrix[i + 1][1] === matrix[i + 2][2]
    ) {
      win = true;
    }
  }

  // Check diagonal lines from bottom-left to top-right
  for (let i = 0; i < REELS - 2; i++) {
    if (
      matrix[i][2] === matrix[i + 1][1] &&
      matrix[i + 1][1] === matrix[i + 2][0]
    ) {
      win = true;
    }
  }

  // Check vertical lines
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS - 2; j++) {
      if (
        matrix[i][j] === matrix[i][j + 1] &&
        matrix[i][j + 1] === matrix[i][j + 2]
      ) {
        win = true;
      }
    }
  }

  return win;
};

// Define offsets
let topOffset = 0; // offset for the top of the mask
let bottomOffset = -50; // offset for the bottom of the mask

// Create a mask for the reels container
let mask = new PIXI.Graphics();
mask.beginFill(0xffffff);
mask.drawRect(
  startX,
  startY - topOffset,
  REELS * (SYMBOL_SIZE + SPACING) + 50,
  SYMBOLS * (SYMBOL_SIZE + SPACING) + topOffset + bottomOffset
);
mask.endFill();

// Apply a mask to the reels
reelsContainer.mask = mask;

function ScaleWinningSprites(matrix, reels, scale) {
  const checkWinningLine = (line) => {
    let win = false;
    const [a, b, c] = line;

    if (
      matrix[a.x][a.y] === matrix[b.x][b.y] &&
      matrix[b.x][b.y] === matrix[c.x][c.y]
    ) {
      const setScale = (x, y) => {
        if (sprites[x][y].visible && sprites[x][y].scale.x !== scale) {
          gsap.to(sprites[x][y].scale, {
            x: scale,
            y: scale,
            duration: 0.5,
            ease: "power1.out",
            yoyo: true,
            repeat: 3,
            transformOrigin: "50% 50%", // Scales from the center
          });
        }
      };

      setScale(a.x, a.y);
      setScale(b.x, b.y);
      setScale(c.x, c.y);

      win = true;
    }

    return win;
  };

  const SYMBOLS = matrix[0].length;
  const REELS = matrix.length;

  // Check horizontal lines
  for (let i = 0; i < SYMBOLS; i++) {
    for (let j = 0; j < REELS - 2; j++) {
      const line = [
        { x: j, y: i },
        { x: j + 1, y: i },
        { x: j + 2, y: i },
      ];
      checkWinningLine(line);
    }
  }

  // Check vertical lines
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS - 2; j++) {
      const line = [
        { x: i, y: j },
        { x: i, y: j + 1 },
        { x: i, y: j + 2 },
      ];
      checkWinningLine(line);
    }
  }

  // Check diagonal lines from top-left to bottom-right
  for (let i = 0; i < REELS - 2; i++) {
    const line = [
      { x: i, y: 0 },
      { x: i + 1, y: 1 },
      { x: i + 2, y: 2 },
    ];
    checkWinningLine(line);
  }

  // Check diagonal lines from bottom-left to top-right
  for (let i = 0; i < REELS - 2; i++) {
    const line = [
      { x: i, y: 2 },
      { x: i + 1, y: 1 },
      { x: i + 2, y: 0 },
    ];
    checkWinningLine(line);
  }
}


let sprites = []; //symbols sprites array

// Returns a promise that resolves when the sprites are loaded
function LoadSprites() {
  let blurAmount = 2;
  const loader = PIXI.Loader.shared;
  let spriteImages = [];

  // Remove old resources
  loader.reset();

  // Load the JSON file and texture
  return new Promise((resolve, reject) => {
    loader
      .add("json", jsonURL)
      .add("texture", textureURL)

      .load((_, resources) => {
        const json = resources.json.data;
        const texture = resources.texture.texture;

        // Create a spritesheet from the texture and JSON data
        const spritesheet = new PIXI.Spritesheet(texture.baseTexture, json);

        // Parse the spritesheet
        spritesheet.parse(() => {
          // Iterate over the frames and create sprites
          for (const frameKey in json.frames) {
            if (frameKey.includes("static")) {
              //Only sprites with static in json name
              const sprite = new PIXI.Sprite(spritesheet.textures[frameKey]);
              const blurFilter = new PIXI.filters.BlurFilter();
              blurFilter.blur = blurAmount;
              sprite.filters = [blurFilter];
              spriteImages.push(sprite);
            }
          }
          for (let i = 0; i < REELS; i++) {
            let reel = [];
            let spriteRow = []; // 2D array to store the sprites in each reel
            for (let j = 0; j < SYMBOLS; j++) {
              const spriteIndex = matrix[i][j] - 1;
              if (spriteIndex < 0 || spriteIndex >= spriteImages.length) {
                throw new Error(
                  `Invalid sprite index ${spriteIndex} in matrix.`
                );
              }
              const sprite = new PIXI.Sprite(spriteImages[spriteIndex].texture);
              sprite.x = startX + i * (SYMBOL_SIZE + SPACING);
              sprite.y = startY + j * (SYMBOL_SIZE + SPACING);

              sprite.scale.x = 0.5;
              sprite.scale.y = 0.5;

              const newBlurFilter = new PIXI.filters.BlurFilter();
              newBlurFilter.blur = blurAmount;
              sprite.filters = [newBlurFilter];

              // Animate the blur filter
              gsap.to(newBlurFilter, {
                blur: 0,
                duration: 0.15,
                delay: 0,
              });

              reel.push(sprite);
              spriteRow.push(sprite); // Store the sprite in the spriteRow array
              reelsContainer.addChild(sprite);
            }
            slotReels.push(reel);
            sprites.push(spriteRow); // Store the spriteRow array in the sprites array
          }
          resolve(); // Resolve the promise as the sprites are loaded and parsed
        });
      });
  });
}



let spinningSprites = [];
let tickerFunction;

const SPAWN_OFFSET = 150; // Offset for spawnning the Spinning sprites
const REMOVE_OFFSET = -250;

function LoadSpinningSprites() {
  let blurAmount = 1;
  const loader = PIXI.Loader.shared;
  let spriteImages = [];

  // Remove old resources
  loader.reset();

  // Helper function to get a random sprite texture for spinning
  function getRandomSprite() {
    const spriteIndex = Math.floor(Math.random() * spriteImages.length);
    return spriteImages[spriteIndex].texture;
  }

  // Load the JSON file and texture
  return new Promise((resolve, reject) => {
    loader
      .add("json", jsonURL)
      .add("texture", textureURL)
      .load((_, resources) => {
        const json = resources.json.data;
        const texture = resources.texture.texture;

        // Create a spritesheet from the texture and JSON data
        const spritesheet = new PIXI.Spritesheet(texture.baseTexture, json);

        // Parse the spritesheet
        spritesheet.parse(() => {
          // Iterate over the frames and create sprites
          for (const frameKey in json.frames) {
            if (frameKey.includes("spin")) {
              // Check for sprites with spin in the name
              const sprite = new PIXI.Sprite(spritesheet.textures[frameKey]);
              const blurFilter = new PIXI.filters.BlurFilter();
              blurFilter.blur = blurAmount;
              sprite.filters = [blurFilter];
              spriteImages.push(sprite);
            }
          }
          for (let i = 0; i < REELS; i++) {
            let reel = [];
            for (let j = 0; j < SYMBOLS; j++) {
              const spriteIndex = matrix[i][j] - 1;
              if (spriteIndex < 0 || spriteIndex >= spriteImages.length) {
                throw new Error(
                  `Invalid sprite index ${spriteIndex} in matrix.`
                );
              }
              const sprite = new PIXI.Sprite(spriteImages[spriteIndex].texture);
              sprite.x = startX + i * (SYMBOL_SIZE + SPACING);
              sprite.y = startY + j * (SYMBOL_SIZE + SPACING);

              sprite.scale.x = 0.5;
              sprite.scale.y = 0.5;

              // Add a speed attribute (How fast sprites spin)
              sprite.ySpeed = 2.5;

              reel.push(sprite);
              reelsContainer.addChild(sprite);
              spinningSprites.push(sprite); // Store the sprite in the spinningSprites array
            }
            slotReels.push(reel);
          }

          // Start the ticker
          if (tickerFunction) {
            app.ticker.remove(tickerFunction); // remove existing ticker
          }
          tickerFunction = () => {
            // Update each sprite's position
            for (const sprite of spinningSprites) {
              sprite.y += sprite.ySpeed * app.ticker.elapsedMS;

              // If sprite is out of view, remove it and add a new one at the top
              if (sprite.y >= HEIGHT + REMOVE_OFFSET) {
                reelsContainer.removeChild(sprite);
                spinningSprites = spinningSprites.filter((s) => s !== sprite); // Remove sprite from the array

                // Create a new sprite at the top of the reels container
                const newSprite = new PIXI.Sprite(getRandomSprite());
                newSprite.x = sprite.x;
                newSprite.y = startY - SPAWN_OFFSET;
                newSprite.ySpeed = sprite.ySpeed;
                newSprite.scale.x = sprite.scale.x;
                newSprite.scale.y = sprite.scale.y;
                const newBlurFilter = new PIXI.filters.BlurFilter();
                newBlurFilter.blur = blurAmount;
                newSprite.filters = [newBlurFilter];
                spinningSprites.push(newSprite);
                reelsContainer.addChild(newSprite);
              }
            }
          };
          app.ticker.add(tickerFunction);
          resolve(); // Resolve the promise as the sprites are loaded and parsed
        });
      });
  });
}

function HideSpinningSprites() {
  return new Promise((resolve) => {
    for (let sprite of spinningSprites) {
      sprite.visible = false;
      reelsContainer.removeChild(sprite); // Remove the sprite from the container
      sprite.destroy();
    }
    spinningSprites = [];
    resolve();
  });
}

function HideSprites() {
    return new Promise((resolve) => {
      for (let spriteRow of sprites) {
        for (let sprite of spriteRow) {
          sprite.visible = false;
          reelsContainer.removeChild(sprite); // Remove the sprite from the container
          sprite.destroy();
        }
      }
      sprites = [];
      resolve();
    });
  }

  function ShowSprites() {
    for (let sprite of sprites) {
      sprite.visible = true;
    }
  }


  

function HideDialogue(spineAnimation) {
  if (spineAnimation) {
    // Play the animation
    spineAnimation.state.setAnimation(0, "out", false);

    setTimeout(() => {
      // Remove the Spine animation from the stage
      app.stage.removeChild(spineAnimation);

      // Clean up resources
      spineAnimation.state.clearListeners();
      spineAnimation.destroy();
    }, 1000);
  }
}

// Define the text styles
const btnTextStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 65,
  fontWeight: "bold",
  fill: ["#ffffff"],
  align: "center",
  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowBlur: 10,
  dropShadowDistance: 5,
  dropShadowAngle: Math.PI / 6,
});

// Dialogue button Text
let btnText = new PIXI.Text("", btnTextStyle);

const txtTextStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 30,
  fontWeight: "bold",
  fill: ["#ffffff"],
  align: "center",
  dropShadow: true,
  dropShadowColor: "#000000",
  dropShadowBlur: 10,
  dropShadowDistance: 5,
  dropShadowAngle: Math.PI / 6,
});

// Dialogue OK Text
let txtText = new PIXI.Text("OK", txtTextStyle);

function ShowDialogue(delay) {
  // Define loader
  const loader = new PIXI.Loader();

  // Load Spine data, atlas image, and atlas file
  loader
    .add("spineData", "./Spines/dialogue.json")
    .add("imageName", "./Spines/dialogue.webp")
    .add("atlasData", "./Spines/dialogue.atlas")
    .load((loader, resources) => {
      setTimeout(() => {
        // Create a new Spine animation
        let spineAnimation = new PIXI.spine.Spine(
          resources.spineData.spineData
        );

        // Set the button state to normal
        spineAnimation.skeleton.setSkinByName("normal");
        spineAnimation.skeleton.setSlotsToSetupPose();
        spineAnimation.state.setAnimation(0, "in", false); // Show in animation

        // Set the position of the animation
        spineAnimation.position.set(
          app.renderer.width / 2,
          app.renderer.height / 2
        );

        // Add the animation to the stage
        app.stage.addChild(spineAnimation);

        // Retrieve the button sprite
        const buttonSlotIndex = spineAnimation.skeleton.findSlotIndex("button");
        const buttonSprite = spineAnimation.slotContainers[buttonSlotIndex];

        // Assign the interactive property to the button sprite
        buttonSprite.interactive = true;

        // Handle button hover
        buttonSprite.on("pointerover", () => {
          spineAnimation.skeleton.setSkinByName("hover");
          spineAnimation.skeleton.setSlotsToSetupPose();
        });

        // Handle button press
        buttonSprite.on("pointerdown", () => {
          clickSound.play();
          spineAnimation.skeleton.setSkinByName("pressed");
          spineAnimation.skeleton.setSlotsToSetupPose();
          okDialogueButtonClicked = true;
          HideDialogue(spineAnimation);
        });

        // Handle button release
        buttonSprite.on("pointerupoutside", () => {
          spineAnimation.skeleton.setSkinByName("normal");
          spineAnimation.skeleton.setSlotsToSetupPose();
        });

        // Handle button pointer out (hover out)
        buttonSprite.on("pointerout", () => {
          spineAnimation.skeleton.setSkinByName("normal");
          spineAnimation.skeleton.setSlotsToSetupPose();
        });

        btnText.anchor.set(0.5);
        txtText.anchor.set(0.5);

        const btnPlaceholderSlot = spineAnimation.skeleton.findSlot(
          "btn_txt_placeholder"
        );
        const txtPlaceholderSlot =
          spineAnimation.skeleton.findSlot("txt_placeholder");

        let btnTextContainer =
          spineAnimation.slotContainers[btnPlaceholderSlot.data.index];
        let txtTextContainer =
          spineAnimation.slotContainers[txtPlaceholderSlot.data.index];

        btnTextContainer.addChild(btnText);
        txtTextContainer.addChild(txtText);

        btnText.scale.set(
          -1 / btnTextContainer.scale.x,
          1 / btnTextContainer.scale.y
        );
        txtText.scale.set(
          -1 / txtTextContainer.scale.x,
          1 / txtTextContainer.scale.y
        );

        btnText.rotation = -btnTextContainer.rotation + Math.PI;
        txtText.rotation = -txtTextContainer.rotation + Math.PI;

        btnText.position.set(
          -btnTextContainer.position.x,
          -btnTextContainer.position.y + 70
        );
        txtText.position.set(
          -txtTextContainer.position.x,
          -txtTextContainer.position.y - 185
        );
      }, delay);
    });
}

RefreshMatrix(); // Call on start
LoadSprites(); // Call on start