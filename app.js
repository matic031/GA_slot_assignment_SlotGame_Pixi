// General game settings
const WIDTH = 1920; //window.innerWidth for responsiveness
const HEIGHT = 1080; //window.innerHeight for responsiveness
const REELS = 4;
const SYMBOLS = 3;
const SYMBOL_SIZE = 100;
const SYMBOLS_COUNT = 10; // SHOULD MATCH NUMBER OF SYMBOL TEXTURES (10)
const SPACING = 100; // Spacing between symbols

// Initialize the Pixi Application
let app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  autoResize: false, // true for responsiveness
  resolution: 1, // window.devicePixelRatio for responsiveness
  antialias: true,
  transparent: false,
});

// Background image
const backgroundImageURL = "./Images/background.jpg";
const backgroundTexture = PIXI.Texture.from(backgroundImageURL);

// Create a sprite from the background texture
const backgroundSprite = new PIXI.Sprite(backgroundTexture);
backgroundSprite.width = WIDTH;
backgroundSprite.height = HEIGHT;

// Add the background sprite to the stage
app.stage.addChild(backgroundSprite);

// Reorder the children of the stage to ensure the background is at the bottom
app.stage.setChildIndex(backgroundSprite, 0);

document.body.appendChild(app.view);

// Adjust the canvas position to screen center
app.view.style.position = "absolute";
app.view.style.top = "50%";
app.view.style.left = "50%";
app.view.style.transform = "translate(-50%, -50%)";

// Create a container for the slot reels
let reelsContainer = new PIXI.Container();
app.stage.addChild(reelsContainer);

// Calculate starting positions
let startX = (WIDTH - REELS * SYMBOL_SIZE - (REELS - 1) * SPACING) / 2;
let startY = (HEIGHT - SYMBOLS * SYMBOL_SIZE - (SYMBOLS - 1) * SPACING) / 2;

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
let spinClicked = false;
let isSpinning = false;

// Define the slot reels
let reels = [];
let matrix = []; // A 2D array that stores the numbers of the reels
for (let i = 0; i < REELS; i++) {
  let reel = [];
  let column = []; // A column in the matrix
  for (let j = 0; j < SYMBOLS; j++) {
    let number = Math.floor(Math.random() * SYMBOLS_COUNT) + 1; // Random number between 1 and SYMBOLS_COUNT
    column.push(number);

    // Create a text object for the symbol
    let symbol = new PIXI.Text(number, {
      fontFamily: "Arial",
      fontSize: 0.1, //Make matrix numbers not visible
      fill: 0xff1010,
      align: "center",
    });

    symbol.x = startX + i * (SYMBOL_SIZE + SPACING);
    symbol.y = startY + j * (SYMBOL_SIZE + SPACING);
    reel.push(symbol);
    reelsContainer.addChild(symbol);
  }
  reels.push(reel);
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
); // Shift the buttons up offset
let buttonWidths = [
  PIXI.TextMetrics.measureText("REFRESH", buttonStyle).width,
  PIXI.TextMetrics.measureText("SPIN", buttonStyle).width,
  PIXI.TextMetrics.measureText("STOP", buttonStyle).width,
];

let totalButtonWidth = buttonWidths.reduce((a, b) => a + b, 0); // the total width of the button texts
let totalSpacing = (buttonWidths.length - 1) * buttonSpacing; // the total width of the spaces between the buttons

let buttonX = (WIDTH - totalButtonWidth - totalSpacing) / 2; // centered with equal space on both sides

// Refresh button
let refreshButton = new PIXI.Container();
refreshButton.interactive = true;
refreshButton.buttonMode = true;

// Create a background rectangle for the button
let refreshButtonBackground = new PIXI.Graphics();
refreshButtonBackground.lineStyle(2.5, 0xffffff); // Set the border color and thickness
refreshButtonBackground.beginFill(0x000000); // Set the background color
refreshButtonBackground.drawRoundedRect(
  0,
  0,
  buttonWidths[0] + 40,
  buttonStyle.fontSize + 50,
  15
); // Adjust the size and corner radius based on the button text
refreshButtonBackground.endFill();

refreshButton.addChild(refreshButtonBackground);

// Create the button text
let refreshButtonText = new PIXI.Text("REFRESH", buttonStyle);
refreshButtonText.anchor.set(0.5);
refreshButtonText.x = refreshButtonBackground.width / 2;
refreshButtonText.y = refreshButtonBackground.height / 2; // Adjust the vertical position to center the text

refreshButton.addChild(refreshButtonText);

refreshButton.x = buttonX - leftShift + 30;
refreshButton.y = HEIGHT - 120 + verticalShift; // Adjust the y position to move the button up

// Refresh button hover effect
refreshButton.on("pointerover", function () {
  refreshButtonBackground.alpha = 0.7; // Adjust the hover alpha value
});

refreshButton.on("pointerout", function () {
  refreshButtonBackground.alpha = 1.0; // Restore the original alpha value
});

refreshButton.on("pointerdown", function () {
  if (!spinClicked && !refreshButtonClicked && okDialogueButtonClicked) {
    clickSound.play();
    RefreshMatrix();
  }
});

app.stage.addChild(refreshButton);

// Spin button
let spinButton = new PIXI.Container();
spinButton.interactive = true;
spinButton.buttonMode = true;

// Create a background rectangle for the button
let spinButtonBackground = new PIXI.Graphics();
spinButtonBackground.lineStyle(2.5, 0xffffff); // Set the border color and thickness
spinButtonBackground.beginFill(0x000000); // Set the background color
spinButtonBackground.drawRoundedRect(
  0,
  0,
  buttonWidths[0],
  buttonStyle.fontSize + 50,
  15
); // Adjust the size and corner radius based on the button text
spinButtonBackground.endFill();

spinButton.addChild(spinButtonBackground);

// Create the button text
let spinButtonText = new PIXI.Text("SPIN", buttonStyle);
spinButtonText.anchor.set(0.5);
spinButtonText.x = spinButtonBackground.width / 2;
spinButtonText.y = spinButtonBackground.height / 2; // Adjust the vertical position to center the text

spinButton.addChild(spinButtonText);

spinButton.x =
  buttonX +
  30 +
  (buttonWidths[0] - buttonWidths[1] + buttonWidths[2]) / 2 +
  2 * buttonSpacing -
  leftShift -
  45; // Center the button horizontally and add the spacing
spinButton.y = HEIGHT - 120 + verticalShift; // Adjust the y position to move the button up

// Spin button hover effect
spinButton.on("pointerover", function () {
  spinButtonBackground.alpha = 0.7; // Adjust the hover alpha value
});

spinButton.on("pointerout", function () {
  spinButtonBackground.alpha = 1.0; // Restore the original alpha value
});

// Spin button click event
spinButton.on("pointerdown", function () {
  if (!isSpinning && okDialogueButtonClicked) {
    clickSound.play();
    isSpinning = true;
    LoadSpinningSprites();
    HideSprites();
    spinClicked = true;
  }
});

app.stage.addChild(spinButton);

// Stop button
let stopButton = new PIXI.Container();
stopButton.interactive = true;
stopButton.buttonMode = true;

// Create a background rectangle for the button
let stopButtonBackground = new PIXI.Graphics();
stopButtonBackground.lineStyle(2.5, 0xffffff); // Set the border color and thickness
stopButtonBackground.beginFill(0x000000); // Set the background color
stopButtonBackground.drawRoundedRect(
  0,
  0,
  buttonWidths[2] + 40,
  buttonStyle.fontSize + 50,
  15
); // Adjust the size and corner radius based on the button text
stopButtonBackground.endFill();

stopButton.addChild(stopButtonBackground);

// Create the button text
let stopButtonText = new PIXI.Text("STOP", buttonStyle);
stopButtonText.anchor.set(0.5);
stopButtonText.x = stopButtonBackground.width / 2;
stopButtonText.y = stopButtonBackground.height / 2; // Adjust the vertical position to center the text

stopButton.addChild(stopButtonText);

stopButton.x =
  buttonX +
  30 + //slight offset 
  buttonWidths[0] +
  buttonWidths[1] +
  2 * buttonSpacing -
  leftShift; // Add the widths of the previous buttons and the spaces
stopButton.y = HEIGHT - 120 + verticalShift; // Adjust the y position to move the button up

// Stop button hover effect
stopButton.on("pointerover", function () {
  stopButtonBackground.alpha = 0.7; // Adjust the hover alpha value
});

stopButton.on("pointerout", function () {
  stopButtonBackground.alpha = 1.0; // Restore the original alpha value
});

// Stop button click event
stopButton.on("pointerdown", async function () {
  if (spinClicked && okDialogueButtonClicked) {
    clickSound.play();
    HideSpinningSprites();
    clearMatrix();
    refreshButtonClicked = false;

    for (let i = 0; i < REELS; i++) {
      for (let j = 0; j < SYMBOLS; j++) {
        let number = Math.floor(Math.random() * SYMBOLS_COUNT) + 1; //Make a new random matrix
        matrix[i][j] = number;
        reels[i][j].text = number;
      }
    }

    okDialogueButtonClicked = false;

    await LoadSprites();
    ShowSprites();

    reelsContainer.visible = true;
    spinClicked = false;
    isSpinning = false;

    if (CheckWin(matrix, reels)) {
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
});

app.stage.addChild(stopButton);

function RefreshSymbols(matrix, reels) {
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS; j++) {
      // Update the symbol text
      reels[i][j].text = matrix[i][j];
      // Reset the color
      //reels[i][j].style.fill = 0xff1010;
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
      RefreshSymbols(matrix, reels);
      await HideSprites();
      LoadSprites();
      ShowSprites();
      refreshButtonClicked = true;
      isSpinning = false;
    }
  }
}

function clearMatrix() {
  // Clear the old reels
  HideSprites();
  for (let i = 0; i < REELS; i++) {
    for (let j = 0; j < SYMBOLS; j++) {
      reelsContainer.removeChild(reels[i][j]);
      reels[i][j].destroy();
    }
  }
  reels = [];
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
    reels.push(reel);
    matrix.push(column);
  }
}

// Check for win
const CheckWin = (matrix, reels) => {
  let win = false;
  ScaleWinningSprites(matrix, reels, 0.675); // Scale the winning sprites up

  // Check all horizontal lines
  for (let i = 0; i < SYMBOLS; i++) {
    for (let j = 0; j < REELS - 2; j++) {
      if (
        matrix[j][i] === matrix[j + 1][i] &&
        matrix[j + 1][i] === matrix[j + 2][i]
      ) {
        win = true;
        //   reels[j][i].style.fill =
        //     reels[j + 1][i].style.fill =
        //     reels[j + 2][i].style.fill =
        //       0x00ff00; // highlight winning numbers
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
      // reels[i][0].style.fill =
      //   reels[i + 1][1].style.fill =
      //   reels[i + 2][2].style.fill =
      //     0x00ff00; // highlight winning numbers
    }
  }

  // Check diagonal lines from bottom-left to top-right
  for (let i = 0; i < REELS - 2; i++) {
    if (
      matrix[i][2] === matrix[i + 1][1] &&
      matrix[i + 1][1] === matrix[i + 2][0]
    ) {
      win = true;
      // reels[i][2].style.fill =
      //   reels[i + 1][1].style.fill =
      //   reels[i + 2][0].style.fill =
      //     0x00ff00; // highlight winning numbers
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
        //   reels[i][j].style.fill =
        //     reels[i][j + 1].style.fill =
        //     reels[i][j + 2].style.fill =
        //       0x00ff00; // highlight winning numbers
      }
    }
  }

  return win;
};

let sprites = [];

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
            reels.push(reel);
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
            reels.push(reel);
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

function ShowSprites() {
  for (let sprite of sprites) {
    sprite.visible = true;
  }
}

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
