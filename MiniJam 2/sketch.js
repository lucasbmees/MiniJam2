let backgroundImg;
let sonicIdleImg;
let sonicMovingImg;
let bubbleImg; 
let eggmanImg; 

let gameFont;

let sonicX;
let sonicY;
let sonicSpeed = 5; 
let isMoving = false; 
let currentSonicImage; 
let animationFrame = 0; 
let animationSpeed = 8; 
let sonicWidth = 80;
let sonicHeight;

let facingRight = true;

let projectiles = []; 
let projectileSpeed = 10;
let projectileSize = 15; 
let projectileColor; 
let canShoot = true; 
let shotDelay = 15; 
let lastShotTime = 0; 
let doubleShotActive = false; 


let bubbles = []; 
let bubbleSize = 60;
let maxBubbles = 10; 
let bubbleSpawnRate = 60; 
let lastBubbleSpawn = 0; 

let score = 0; 
const WIN_SCORE = 100; 
const DOUBLE_SHOT_THRESHOLD = 50; 

let gameState = 'MENU'; 

let storyText = "Sonic e Shadow batalhavam.\nUma fenda dimensional se abriu!\n\nSonic foi sugado, caindo em um portal.\n\nEmergiu em um mundo de bolhas. O que o aguarda?";
let storyLines; 
let currentStoryLine = 0; 
let storyDisplayComplete = false; 
let charIndex = 0; 
let lineDisplayComplete = false; 

let titleText = "Sonic: Mundo das Bolhas";
let startButtonText = "PRESSIONE ENTER";
let continueButtonText = "CONTINUAR";
let winMessage = "VITÓRIA!"; 
let finalScoreMessage = "Sua pontuação final: ";

let eggmanAnnouncement = "Eu vim fazer um anuncio...."; 

let titleScale = 1;
let titleScaleDirection = 0.005;

function preload() {
  backgroundImg = loadImage('image/background-world-bubbles.png');
  sonicIdleImg = loadImage('image/sonic 1.png');
  sonicMovingImg = loadImage('image/sonic 2.png');
  bubbleImg = loadImage('image/bubble.png');
  eggmanImg = loadImage('image/eggman.png'); 
  gameFont = loadFont('fonts/PressStart2P-Regular.ttf');
}

function setup() {
  createCanvas(800, 600);
  textFont(gameFont);
  textAlign(CENTER, CENTER);

  let originalAspectRatio = sonicIdleImg.width / sonicIdleImg.height;
  sonicHeight = sonicWidth / originalAspectRatio;

  sonicIdleImg.resize(sonicWidth, sonicHeight);
  sonicMovingImg.resize(sonicWidth, sonicHeight);
  bubbleImg.resize(bubbleSize, bubbleSize);
  eggmanImg.resize(300, 300); 

  projectileColor = color(0, 255, 255); 

  resetSonic();
  storyLines = storyText.split('\n');
}

function resetSonic() {
  sonicX = width / 2;
  sonicY = height - sonicHeight / 2 - 60;
  currentSonicImage = sonicIdleImg;
  isMoving = false;
  facingRight = true;
  animationFrame = 0;
  projectiles = [];
  bubbles = [];
  score = 0;
  doubleShotActive = false; 
}

function draw() {
  background(backgroundImg);

  if (gameState === 'MENU') {
    drawMenu();
  } else if (gameState === 'STORY') {
    drawStory();
  } else if (gameState === 'PLAYING') {
    drawPlaying();
  } else if (gameState === 'GAME_OVER') {
    drawGameOver();
  } else if (gameState === 'END_GAME') { 
    drawEndGame();
  }
}

function drawMenu() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  titleScale += titleScaleDirection;
  if (titleScale > 1.05 || titleScale < 0.95) {
    titleScaleDirection *= -1;
  }
  push();
  translate(width / 2, height / 2 - 100);
  scale(titleScale);
  fill(255, 255, 0);
  textSize(32);
  text(titleText, 0, 0);
  pop();

  fill(255);
  textSize(20);
  text(startButtonText, width / 2, height / 2 + 50);

  let sonicPulse = sin(frameCount * 0.1) * 5;
  image(sonicIdleImg, width / 2 - sonicWidth / 2, height / 2 + 100 + sonicPulse, sonicWidth, sonicHeight);
}

function drawStory() {
  fill(0, 0, 0, 220);
  rect(0, 0, width, height);

  textSize(16);
  let yOffset = 150;
  let lineHeight = 40;

  if (currentStoryLine < storyLines.length) {
    let currentLine = storyLines[currentStoryLine];
    let displayedText = currentLine.substring(0, charIndex);
    fill(255);
    text(displayedText, width / 2, yOffset + currentStoryLine * lineHeight);

    if (charIndex < currentLine.length) {
      charIndex += 0.8;
    } else {
      lineDisplayComplete = true;
    }
  }

  for (let i = 0; i < currentStoryLine; i++) {
    fill(255);
    text(storyLines[i], width / 2, yOffset + i * lineHeight);
  }

  if (storyDisplayComplete) {
    textSize(20);
    fill(255, 255, 0);
    text(continueButtonText, width / 2, height - 70);
  }
}

function drawPlaying() {
  isMoving = false;

  if (keyIsDown(LEFT_ARROW)) {
    sonicX -= sonicSpeed;
    isMoving = true;
    facingRight = false;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    sonicX += sonicSpeed;
    isMoving = true;
    facingRight = true;
  }

  if (sonicX < sonicWidth / 2) {
    sonicX = sonicWidth / 2;
  }
  if (sonicX > width - sonicWidth / 2) {
    sonicX = width - sonicWidth / 2;
  }

  if (isMoving) {
    animationFrame++;
    if (animationFrame >= animationSpeed) {
      animationFrame = 0;
      currentSonicImage = (currentSonicImage === sonicIdleImg) ? sonicMovingImg : sonicIdleImg;
    }
  } else {
    currentSonicImage = sonicIdleImg;
    animationFrame = 0;
  }

  push();
  translate(sonicX, sonicY);
  if (!facingRight) {
    scale(-1, 1);
  }
  image(currentSonicImage, -sonicWidth / 2, -sonicHeight / 2);
  pop();

  if (score >= DOUBLE_SHOT_THRESHOLD && !doubleShotActive) {
    doubleShotActive = true;
  }

  let remainingProjectiles = [];
  for (let i = 0; i < projectiles.length; i++) {
    let p = projectiles[i];
    p.y -= projectileSpeed;

    fill(projectileColor);
    noStroke();
    ellipse(p.x, p.y, projectileSize, projectileSize);

    if (p.y > -projectileSize / 2) {
      remainingProjectiles.push(p);
    }
  }
  projectiles = remainingProjectiles;

  if (score < WIN_SCORE && frameCount - lastBubbleSpawn > bubbleSpawnRate && bubbles.length < maxBubbles) {
    let x = random(bubbleSize / 2, width - bubbleSize / 2);
    let y = random(height / 4, height / 2);
    let speed = random(0.5, 2);
    bubbles.push({ x: x, y: y, originalY: y, speed: speed, phase: random(TWO_PI) });
    lastBubbleSpawn = frameCount;
  }

  let remainingBubbles = [];
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    b.y -= b.speed * 0.2;
    b.x += sin(frameCount * 0.05 + b.phase) * 0.5;

    if (b.x < bubbleSize / 2) b.x = bubbleSize / 2;
    if (b.x > width - bubbleSize / 2) b.x = width - bubbleSize / 2;

    image(bubbleImg, b.x - bubbleSize / 2, b.y - bubbleSize / 2);

    let hit = false;
    for (let j = projectiles.length - 1; j >= 0; j--) {
      let p = projectiles[j];
      let d = dist(p.x, p.y, b.x, b.y);
      if (d < (projectileSize / 2 + bubbleSize / 2) - 10) {
        score += 10;
        projectiles.splice(j, 1);
        hit = true;

        if (score >= WIN_SCORE) {
          gameState = 'GAME_OVER'; 
          bubbles = [];
          projectiles = [];
          return;
        }
        break;
      }
    }

    if (!hit && b.y > -bubbleSize / 2) {
      remainingBubbles.push(b);
    }
  }
  bubbles = remainingBubbles;

  fill(255, 255, 0);
  textSize(24);
  textAlign(LEFT, TOP);
  text('PONTOS: ' + score, 20, 20);
  textAlign(CENTER, CENTER);
}

function drawGameOver() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  fill(255, 255, 0);
  textSize(32);
  text(winMessage, width / 2, height / 2 - 50);

  fill(255);
  textSize(24);
  text(finalScoreMessage + score, width / 2, height / 2 + 20);

  fill(255);
  textSize(20);
  text("Pressione ENTER para continuar...", width / 2, height - 70); 
}

function drawEndGame() {
  background(0); 
  image(eggmanImg, width / 2 - eggmanImg.width / 2, height / 2 - eggmanImg.height / 2 + 50); 

  fill(255, 0, 0); 
  textSize(28);
  text(eggmanAnnouncement, width / 2, height / 2 - eggmanImg.height / 2 - 50); 
}


function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === 'MENU') {
      gameState = 'STORY';
      currentStoryLine = 0;
      charIndex = 0;
      lineDisplayComplete = false;
      storyDisplayComplete = false;
    } else if (gameState === 'STORY') {
      if (storyDisplayComplete) {
        gameState = 'PLAYING';
        resetSonic();
      } else if (lineDisplayComplete) {
        currentStoryLine++;
        charIndex = 0;
        lineDisplayComplete = false;
        if (currentStoryLine >= storyLines.length) {
          storyDisplayComplete = true;
        }
      } else {
        charIndex = storyLines[currentStoryLine].length;
        lineDisplayComplete = true;
      }
    } else if (gameState === 'GAME_OVER') { 
      gameState = 'END_GAME';
    }
  } else if (gameState === 'PLAYING') {
    if (keyCode === 32 && canShoot) {
      if (doubleShotActive) {
        projectiles.push({ x: sonicX - 10, y: sonicY - sonicHeight / 2 });
        projectiles.push({ x: sonicX + 10, y: sonicY - sonicHeight / 2 });
      } else {
        projectiles.push({ x: sonicX, y: sonicY - sonicHeight / 2 });
      }
      canShoot = false;
      lastShotTime = frameCount;
    }
  }
}

function keyReleased() {
  if (keyCode === 32) {
    canShoot = true;
  }
}

function mousePressed() {
    canShoot = true;
}

function handleShootingCooldown() {
  if (!canShoot && frameCount - lastShotTime >= shotDelay) {
    canShoot = true;
  }
}