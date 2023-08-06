import {
  WIDTH,
  HEIGHT,
  REELS,
  SYMBOLS,
  SYMBOL_SIZE,
  SYMBOLS_COUNT,
  SPACING,
  startX,
  startY,
  jsonURL,
  textureURL,
  clickSound,
  loseSound,
  winSound,
  backgroundSourceURL,
  REMOVE_OFFSET,
  SPAWN_OFFSET
} from "./constants.js";
import Background from "./components/background.js";
import Button from "./components/button.js";
import Reel from "./components/reel.js";
import { ShowDialogue, btnText } from "./components/dialogue.js";
import CreateReelsMask from "./components/reel-mask.js";
import {
  buttonStyle,
  buttonSpacing,
  leftShift,
  verticalShift,
  buttonWidths,
  buttonX,
} from "./components/button-style.js";

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

const background = new Background(backgroundSourceURL);
background.loadBackground();

//Logic variables for the Menu/Dialogue
let refreshButtonClicked = false;
let isSpinning = false;
export let spinClicked = false;
export let okDialogueButtonClicked = true;
export function modifyOkDialogueButtonClicked(value) {
  okDialogueButtonClicked = value;
}

// Create a container for the slot reels
export let reelsContainer = new PIXI.Container();
app.stage.addChild(reelsContainer);

// Define the slot reels
let slotReels = [];
let matrix = []; // A 2D array that stores the numbers of the reels
for (let i = 0; i < REELS; i++) {
  let reel = new Reel(
    app,
    startX + i * (SYMBOL_SIZE + SPACING),
    startY,
    SYMBOLS,
    SPACING
  );
  let column = reel.symbols.map((symbol) => Number(symbol.text));

  slotReels.push(reel);
  matrix.push(column);
}

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
  buttonX + buttonWidths[0] + buttonSpacing, // Spin button starts where the refresh button ends + the button spacing
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
  async function () {
    //STOP Button function
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
      await HideSprites();
      LoadSprites();
      ShowSprites();
      refreshButtonClicked = true;
      isSpinning = false;
    }
  }
}

function ClearMatrix() {
  HideSprites();
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS; j++) {
      if (slotReels[i] && slotReels[i][j]) {
        // Check if slotReels[i][j] exists
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

// Helper function to check lines
const checkLines = (matrix, setScale) => {
  const SYMBOLS = matrix[0].length;
  const REELS = matrix.length;
  let win = false;

  const checkWinningLine = (line) => {
    const [a, b, c] = line;

    if (
      matrix[a.x][a.y] === matrix[b.x][b.y] &&
      matrix[b.x][b.y] === matrix[c.x][c.y]
    ) {
      setScale && setScale(a.x, a.y);
      setScale && setScale(b.x, b.y);
      setScale && setScale(c.x, c.y);
      win = true;
    }
  };

  // Checks for all types of lines (horizontal, vertical and diagonal)
  const checkAllLines = () => {
    for (let i = 0; i < SYMBOLS; i++) {
      for (let j = 0; j < REELS - 2; j++) {
        checkWinningLine([
          { x: j, y: i },
          { x: j + 1, y: i },
          { x: j + 2, y: i },
        ]);
      }
    }

    for (let i = 0; i < REELS; i++) {
      for (let j = 0; j < SYMBOLS - 2; j++) {
        checkWinningLine([
          { x: i, y: j },
          { x: i, y: j + 1 },
          { x: i, y: j + 2 },
        ]);
      }
    }

    for (let i = 0; i < REELS - 2; i++) {
      checkWinningLine([
        { x: i, y: 0 },
        { x: i + 1, y: 1 },
        { x: i + 2, y: 2 },
      ]);
      checkWinningLine([
        { x: i, y: 2 },
        { x: i + 1, y: 1 },
        { x: i + 2, y: 0 },
      ]);
    }
  };

  checkAllLines();

  return win;
};

const ScaleWinningSprites = (matrix, reels, scale) => {
  const setScale = (x, y) => {
    console.log(`x: ${x}, y: ${y}`);
    console.log(`sprites.length: ${sprites.length}`);
    console.log(`sprites[x].length: ${sprites[x] && sprites[x].length}`);
    if (sprites[x] && sprites[x][y] && sprites[x][y].visible && sprites[x][y].scale.x !== scale) {
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

  return checkLines(matrix, setScale);
};

const CheckWin = (matrix, slotReels) => {
  return ScaleWinningSprites(matrix, slotReels, 0.675);
};

let sprites = []; //symbols sprites
let spinningSprites = []; //spinning symbols sprites
let tickerFunction;
const loader = PIXI.Loader.shared;

// Returns a promise that resolves when the sprites are loaded
function LoadSprites() {
  let blurAmount = 2;
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

function LoadSpinningSprites() {
  let blurAmount = 1; //additional blur
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

 CreateReelsMask(); // Call on start
 RefreshMatrix(); // Call on start

