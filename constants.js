// General game settings
export const WIDTH = 1920; //window.innerWidth for responsiveness
export const HEIGHT = 1080; //window.innerHeight for responsiveness
export const REELS = 4;
export const SYMBOLS = 3;
export const SYMBOL_SIZE = 100;
export const SYMBOLS_COUNT = 10; // SHOULD MATCH NUMBER OF SYMBOL TEXTURES (10)
export const SPACING = 100; // Spacing between symbols

//Symbol textures resources
export const jsonURL = "Images/symStatic.json";
export const textureURL = "Images/symStatic.webp";
export const backgroundSourceURL = "./Images/background.jpg";

//Audio
export const clickSound = new Audio("./Sound/click.mp3");
export const winSound = new Audio("./Sound/win.mp3");
export const loseSound = new Audio("./Sound/loose.mp3");

//Spinning symbols mask offset
export const SPAWN_OFFSET = 150; // Offset for spawning the spinning sprites
export const REMOVE_OFFSET = -250; // Offset to remove the spinning sprites

// Calculate starting positions for reels
export let startX = (WIDTH - REELS * SYMBOL_SIZE - (REELS - 1) * SPACING) / 2;
export let startY = (HEIGHT - SYMBOLS * SYMBOL_SIZE - (SYMBOLS - 1) * SPACING) / 2;
