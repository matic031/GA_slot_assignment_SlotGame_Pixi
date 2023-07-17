

// Set the general game settings
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const REELS = 4;
const SYMBOLS = 3;
const SYMBOL_SIZE = 100;
const SYMBOLS_COUNT = 5; // SHOULD MATCH NUMBER OF SYMBOL TEXTURES
const SPACING = 100; // Spacing between symbols

// Initialize the Pixi Application
let app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  autoResize: true, // Enable auto resizing of the canvas
  resolution: window.devicePixelRatio, // Use the device pixel ratio for better quality on high-density displays
  antialias: true, // Enable antialiasing for smoother graphics
  transparent: false, // Set the background to be non-transparent
});

// Load the background image
const backgroundImageURL = './Images/background.jpg';
const backgroundTexture = PIXI.Texture.from(backgroundImageURL);

// Create a sprite from the background texture
const backgroundSprite = new PIXI.Sprite(backgroundTexture);
backgroundSprite.width = WIDTH;
backgroundSprite.height = HEIGHT;

// Add the background sprite to the stage
app.stage.addChild(backgroundSprite);

// Reorder the children of the stage to ensure the background is at the bottom
app.stage.setChildIndex(backgroundSprite, 0);

// Append the Pixi canvas to the document body
document.body.appendChild(app.view);

// Adjust the canvas position to center it on the screen
app.view.style.position = 'absolute';
app.view.style.top = '50%';
app.view.style.left = '50%';
app.view.style.transform = 'translate(-50%, -50%)';

// Create a container for the slot reels
let reelsContainer = new PIXI.Container();
app.stage.addChild(reelsContainer);

// Calculate starting positions
let startX = (WIDTH - REELS * SYMBOL_SIZE - (REELS - 1) * SPACING) / 2;
let startY = (HEIGHT - SYMBOLS * SYMBOL_SIZE - (SYMBOLS - 1) * SPACING) / 2;


const jsonURL = "Images/symStatic.json";
const textureURL = "Images/symStatic.webp";

const clickSound = new Audio('./Sound/click.mp3');
const winSound = new Audio('./Sound/win.mp3');
const loseSound = new Audio('./Sound/loose.mp3');

let refreshButtonClicked = false;

// Define the slot reels
let reels = [];
let matrix = []; // A 2D array that stores the numbers of the reels
for (let i = 0; i < REELS; i++) {
  let reel = [];
  let column = []; // A column in the matrix
  for (let j = 0; j < SYMBOLS; j++) {
    let number = Math.floor(Math.random() * SYMBOLS_COUNT) + 1; // Get a random number between 1 SYMBOLS_COUNT
    column.push(number);

    // Create a text object for the symbol
    let symbol = new PIXI.Text(number, {
      fontFamily: "Arial",
      fontSize: 0.1,
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
let buttonSpacing = 100; // the space between the buttons
let leftShift = 25;
let availableVerticalSpace = HEIGHT - 100 - startY - SYMBOLS * (SYMBOL_SIZE + SPACING);
let verticalShift = Math.min(availableVerticalSpace, -1.1 * availableVerticalSpace); // the amount to shift the buttons up (10% of available space)
let buttonWidths = [
  PIXI.TextMetrics.measureText("REFRESH", buttonStyle).width,
  PIXI.TextMetrics.measureText("SPIN", buttonStyle).width,
  PIXI.TextMetrics.measureText("STOP", buttonStyle).width,
]; // the widths of the button texts

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
refreshButtonBackground.drawRoundedRect(0, 0, buttonWidths[0] + 40, buttonStyle.fontSize + 50, 15); // Adjust the size and corner radius based on the button text
refreshButtonBackground.endFill();

refreshButton.addChild(refreshButtonBackground);

// Create the button text
let refreshButtonText = new PIXI.Text("REFRESH", buttonStyle);
refreshButtonText.anchor.set(0.5);
refreshButtonText.x = refreshButtonBackground.width / 2;
refreshButtonText.y = refreshButtonBackground.height / 2; // Adjust the vertical position to center the text

refreshButton.addChild(refreshButtonText);

refreshButton.x = buttonX - leftShift +30;
refreshButton.y = HEIGHT - 120 + verticalShift; // Adjust the y position to move the button up

// Add a slight hover effect
refreshButton.on("pointerover", function () {
  refreshButtonBackground.alpha = 0.7; // Adjust the hover alpha value
});

refreshButton.on("pointerout", function () {
  refreshButtonBackground.alpha = 1.0; // Restore the original alpha value
});

refreshButton.on("pointerdown", function () {
  RefreshMatrix();
  if (!spinClicked && !refreshButtonClicked) {
    clickSound.play();
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
spinButtonBackground.drawRoundedRect(0, 0, buttonWidths[0], buttonStyle.fontSize + 50, 15); // Adjust the size and corner radius based on the button text
spinButtonBackground.endFill();

spinButton.addChild(spinButtonBackground);

// Create the button text
let spinButtonText = new PIXI.Text("SPIN", buttonStyle);
spinButtonText.anchor.set(0.5);
spinButtonText.x = spinButtonBackground.width / 2;
spinButtonText.y = spinButtonBackground.height / 2; // Adjust the vertical position to center the text

spinButton.addChild(spinButtonText);

spinButton.x = buttonX +30 + (buttonWidths[0] - buttonWidths[1] + buttonWidths[2]) / 2 + 2 * buttonSpacing - leftShift -45; // Center the button horizontally and add the spacing
spinButton.y = HEIGHT - 120 + verticalShift; // Adjust the y position to move the button up

// Add a slight hover effect
spinButton.on("pointerover", function () {
    spinButtonBackground.alpha = 0.7; // Adjust the hover alpha value
  });
  
  spinButton.on("pointerout", function () {
    spinButtonBackground.alpha = 1.0; // Restore the original alpha value
  });

let spinClicked = false;

// Flag for spin state
let isSpinning = false;
spinButton.on("pointerdown", function () {
  if (!isSpinning) {
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
stopButtonBackground.drawRoundedRect(0, 0, buttonWidths[2] + 40, buttonStyle.fontSize + 50, 15); // Adjust the size and corner radius based on the button text
stopButtonBackground.endFill();

stopButton.addChild(stopButtonBackground);

// Create the button text
let stopButtonText = new PIXI.Text("STOP", buttonStyle);
stopButtonText.anchor.set(0.5);
stopButtonText.x = stopButtonBackground.width / 2;
stopButtonText.y = stopButtonBackground.height / 2; // Adjust the vertical position to center the text

stopButton.addChild(stopButtonText);

stopButton.x = buttonX +30 + buttonWidths[0] + buttonWidths[1] + 2 * buttonSpacing - leftShift; // Add the widths of the previous buttons and the spaces
stopButton.y = HEIGHT - 120 + verticalShift; // Adjust the y position to move the button up

// Add a slight hover effect
stopButton.on("pointerover", function () {
    stopButtonBackground.alpha = 0.7; // Adjust the hover alpha value
  });
  
  stopButton.on("pointerout", function () {
    stopButtonBackground.alpha = 1.0; // Restore the original alpha value
  });

stopButton.on("pointerdown", async function () {
  if (spinClicked) {
    clickSound.play();
    //LoadDialogue();
    //ShowDialogueText();
    HideSpinningSprites();
    clearMatrix();
    refreshButtonClicked = false;

    for (let i = 0; i < REELS; i++) {
      for (let j = 0; j < SYMBOLS; j++) {
        let number = Math.floor(Math.random() * SYMBOLS_COUNT) + 1;
        matrix[i][j] = number;
        reels[i][j].text = number;
      }
    }

    await LoadSprites();
    ShowSprites();

    reelsContainer.visible = true;
    spinClicked = false;
    isSpinning = false;

    if (CheckWin(matrix, reels)) {
      console.log("You win!");
      winSound.play();
    } else {
      console.log("You lose!");
      loseSound.play();
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
    //   reels[i][j].style.fill = 0xff1010;
    }
  }
}

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

RefreshMatrix(); // Call on start
LoadSprites();

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
    ScaleWinningSprites(matrix, reels, 0.675); // Scale the winning sprites
  
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
    let blurAmount = 3;
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
                  throw new Error(`Invalid sprite index ${spriteIndex} in matrix.`);
                }
                const sprite = new PIXI.Sprite(spriteImages[spriteIndex].texture);
                sprite.x = startX + i * (SYMBOL_SIZE + SPACING);
                sprite.y = startY + j * (SYMBOL_SIZE + SPACING);
  
                // Scale the sprite to make it smaller
                sprite.scale.x = 0.5;
                sprite.scale.y = 0.5;
  
                const newBlurFilter = new PIXI.filters.BlurFilter();
                newBlurFilter.blur = blurAmount;
                sprite.filters = [newBlurFilter];
  
                // Animate the blur filter's strength property to fade out after 0.5 seconds
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

const SPAWN_OFFSET = 150; 
const REMOVE_OFFSET = -250;


function LoadSpinningSprites() {
    let blurAmount = 2;
    const loader = PIXI.Loader.shared;
    let spriteImages = [];
  
    // Remove old resources
    loader.reset();
  
    // Helper function to get a random sprite texture
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
                  throw new Error(`Invalid sprite index ${spriteIndex} in matrix.`);
                }
                const sprite = new PIXI.Sprite(spriteImages[spriteIndex].texture);
                sprite.x = startX + i * (SYMBOL_SIZE + SPACING);
                sprite.y = startY + j * (SYMBOL_SIZE + SPACING);
  
                // Scale the sprite to make it smaller
                sprite.scale.x = 0.5;
                sprite.scale.y = 0.5;
  
                // Add a speed attribute
                sprite.ySpeed = 2.5;
  
                reel.push(sprite);
                reelsContainer.addChild(sprite);
                spinningSprites.push(sprite); // Store the sprite in the spinningSprites array
              }
              reels.push(reel);
            }
  
            // Start the ticker
            if(tickerFunction) {
              app.ticker.remove(tickerFunction); // remove existing ticker
            }
            tickerFunction = () => {
              // Update each sprite's position
              for (const sprite of spinningSprites) {
                sprite.y += sprite.ySpeed * app.ticker.elapsedMS;
  
                // If sprite is out of view, remove it and add a new one at the top
                if (sprite.y >= HEIGHT + REMOVE_OFFSET) {
                  reelsContainer.removeChild(sprite);
                  spinningSprites = spinningSprites.filter(s => s !== sprite); // Remove sprite from the array
  
                  // Create a new sprite at the top
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
            }
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
          sprite.destroy(); // Destroy the sprite to free up memory
        }
      }
      // Clear the sprites array
      sprites = [];
      resolve();
    });
  }
  
  function HideSpinningSprites() {
    return new Promise((resolve) => {
      for (let sprite of spinningSprites) {
        sprite.visible = false;
        reelsContainer.removeChild(sprite); // Remove the sprite from the container
        sprite.destroy(); // Destroy the sprite to free up memory
      }
      // Clear the spinningSprites array
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
let topOffset = 0; // offset for startY
let bottomOffset = -50; // offset for height

// Create a mask for the reels container
let mask = new PIXI.Graphics();
mask.beginFill(0xffffff);
mask.drawRect(startX, startY - topOffset, REELS * (SYMBOL_SIZE + SPACING) +50, SYMBOLS * (SYMBOL_SIZE + SPACING) + topOffset + bottomOffset);
mask.endFill();

// Apply the mask to the reels container
reelsContainer.mask = mask;





function ScaleWinningSprites(matrix, reels, scale) {
    const checkWinningLine = (line) => {
      let win = false;
      const [a, b, c] = line;

      if (matrix[a.x][a.y] === matrix[b.x][b.y] && matrix[b.x][b.y] === matrix[c.x][c.y]) {
        const setScale = (x, y) => {
            if (sprites[x][y].visible && sprites[x][y].scale.x !== scale) {
              gsap.to(sprites[x][y].scale, { 
                x: scale,
                y: scale,
                duration: 0.5,
                ease: 'power1.out',
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





  function LoadDialogue() {
    // Define loader
    const loader = new PIXI.Loader();
  
    // Load Spine data, atlas image, and atlas file
    loader
      .add('spineData', './Spines/dialogue.json')
      .add('imageName', './Spines/dialogue.webp')
      .add('atlasData', './Spines/dialogue.atlas')
      .load((loader, resources) => {
        setTimeout(() => {
          // Create a new Spine animation
          let spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
  
          // Set animation, loop, and start it
          //spineAnimation.state.setAnimation(0, 'in', false); // Show animation
  
          // Set the position of the animation
          spineAnimation.position.set(app.renderer.width / 2, app.renderer.height / 2);
  
          // Add the animation to the stage
          app.stage.addChild(spineAnimation);
  
          const baseTexture = resources.imageName.texture.baseTexture;
          const atlasData = resources.atlasData.data.pages[0].regions;
  
          // Create a sprite for each sub-image in the atlas
          atlasData.forEach(data => {
            const rect = new PIXI.Rectangle(data.x, data.y, data.width, data.height);
            const texture = new PIXI.Texture(baseTexture, rect);
            const sprite = new PIXI.Sprite(texture);
  
            // Center the sprite
            sprite.anchor.set(0.5);
            sprite.position.set(app.renderer.width / 2 + data.offsetX, app.renderer.height / 2 + data.offsetY);
  
            app.stage.addChild(sprite);
          });
  
          // Update the Spine animation
          spineAnimation.update(0);
        }, 0);
      });
  }
  
  // Call the function to start loading the dialogue
  //LoadDialogue();
  ShowDialogueButton();
  //ShowDialogueText();

  

  function HideDialogue(spineAnimation) {
    if (spineAnimation) {
      // Remove the Spine animation from the stage
      app.stage.removeChild(spineAnimation);
  
      // Clean up resources
      spineAnimation.state.clearListeners();
      spineAnimation.destroy();
    }
  }

  function ShowDialogueButton() {
    // Define loader
    const loader = new PIXI.Loader();
  
    // Load Spine data, atlas image, and atlas file
    loader
      .add('spineData', './Spines/dialogue.json')
      .add('imageName', './Spines/dialogue.webp')
      .add('atlasData', './Spines/dialogue.atlas')
      .load((loader, resources) => {
        setTimeout(() => {
          // Create a new Spine animation
          let spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
  
          // Set the button state to "normal"
          spineAnimation.skeleton.setSkinByName('normal');
          spineAnimation.skeleton.setSlotsToSetupPose();
          spineAnimation.state.setAnimation(0, 'in', false); // Show idle animation
  
          // Set the position of the animation
          spineAnimation.position.set(app.renderer.width / 2, app.renderer.height / 2);
  
          // Add the animation to the stage
          app.stage.addChild(spineAnimation);
  
          // Retrieve the button sprite
          const buttonSlotIndex = spineAnimation.skeleton.findSlotIndex('button');
          const buttonSprite = spineAnimation.slotContainers[buttonSlotIndex];
  
          // Assign the interactive property to the button sprite
          buttonSprite.interactive = true;
  
          // Handle button hover
          buttonSprite.on('pointerover', () => {
            spineAnimation.skeleton.setSkinByName('hover');
            spineAnimation.skeleton.setSlotsToSetupPose();
          });
  
          // Handle button press
          buttonSprite.on('pointerdown', () => {
            spineAnimation.skeleton.setSkinByName('pressed');
            spineAnimation.skeleton.setSlotsToSetupPose();
            HideDialogue(spineAnimation);
          });
  
          // Handle button release
          buttonSprite.on('pointerupoutside', () => {
            spineAnimation.skeleton.setSkinByName('normal');
            spineAnimation.skeleton.setSlotsToSetupPose();
          });
  
          // Handle button pointer out (hover out)
          buttonSprite.on('pointerout', () => {
            spineAnimation.skeleton.setSkinByName('normal');
            spineAnimation.skeleton.setSlotsToSetupPose();
          });
  
          // Update the Spine animation
          spineAnimation.update(0);
        }, 0);
      });
  }


  function ShowDialogueText() {
    // Define loader
    const loader = new PIXI.Loader();
  
    // Load Spine data, atlas image, and atlas file
    loader
      .add('spineData', './Spines/dialogue.json')
      .add('imageName', './Spines/dialogue.webp')
      .add('atlasData', './Spines/dialogue.atlas')
      .load((loader, resources) => {
        setTimeout(() => {
          // Create a new Spine animation
          let spineAnimation = new PIXI.spine.Spine(resources.spineData.spineData);
  
          // Set the button state to "normal"
          spineAnimation.skeleton.setSkinByName('normal');
          spineAnimation.skeleton.setSlotsToSetupPose();
          spineAnimation.state.setAnimation(0, 'in', false); // Show idle animation
  
          // Set the position of the animation
          spineAnimation.position.set(app.renderer.width / 2, app.renderer.height / 2);
  
          // Add the animation to the stage
          app.stage.addChild(spineAnimation);
  
          // Retrieve the text slots
          const btnTextSlotIndex = spineAnimation.skeleton.findSlotIndex('btn_txt_placeholder');
          const placeholderSlotIndex = spineAnimation.skeleton.findSlotIndex('txt_placeholder');
  
          // Create a new PIXI.Text object for button text
          const buttonText = new PIXI.Text('Button Text', {
            fill: 'white',
            fontSize: 24,
            fontWeight: 'bold',
          });
          buttonText.anchor.set(0.5);
  
          // Create a new PIXI.Text object for placeholder text
          const placeholderText = new PIXI.Text('New Placeholder Text', {
            fill: 'white',
            fontSize: 24,
            fontWeight: 'bold',
          });
          placeholderText.anchor.set(0.5);
  
          // Set the position of the button text
          buttonText.position.copyFrom(spineAnimation.skeleton.getAttachment(btnTextSlotIndex, 'placeholder').region.offset);
  
          // Set the position of the placeholder text
          placeholderText.position.copyFrom(spineAnimation.skeleton.getAttachment(placeholderSlotIndex, 'placeholder').region.offset);
  
          // Add the button text to the stage
          app.stage.addChild(buttonText);
  
          // Add the placeholder text to the stage
          app.stage.addChild(placeholderText);
  
          // Update the Spine animation
          spineAnimation.update(0);
        }, 0);
      });
  }
