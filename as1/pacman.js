// Refered https://github.com/davidwparker/programmingtil-webgl for various drawings
const WALL = 0;
const DOT = 1;
const EMPTY = 2;
const PACMAN = 3;
const R_GHOST = 4;
const B_GHOST = 5;
const SUPER_DOT = 6;

const ROW_SIZE = 10;
const COLUMN_SIZE = 9;

var tileWidth = 2 / COLUMN_SIZE; // clip space [-1,1]
var tileHeight = 2 / ROW_SIZE;

const GREEN = [0, 1, 0];
const DARK_YELLOW = [0.7, 0.7, 0];
const TEAL_BLUE = [0, 1, 1];
const RED = [1, 0, 0];
const BLUE = [0, 0, 1];
const GREY = [0.8, 0.8, 0.8];
const PINK = [1, 0.4, 0.7];

const LEFT = "ArrowLeft";
const RIGHT = "ArrowRight";
const DOWN = "ArrowDown";
const UP = "ArrowUp";
const START_GAME = "s";
const PAUSE_GAME = "p";
const RESUME_GAME = "r";
const RESTART_GAME = "R";

// initial position
// [row, col]
const initPacmanPosition = { row: 9, col: 4 };
const initRGhostPosition = { row: 4, col: 4 };
const initBGhostPosition = { row: 5, col: 4 };
const initGhostCurrentType = EMPTY;
let pacmanPosition = initPacmanPosition;
let rGhostPosition = initRGhostPosition;
let bGhostPosition = initBGhostPosition;
let rGhostPreviousTileType = initGhostCurrentType;
let bGhostPreviousTileType = initGhostCurrentType;
const ghostHomeBottom = [5, 4];
const ghostHomeTop = [4, 4];

// score & timer
let score = 0;
let timeLeft = 60;
// TOOD:
const totalDotNum = 59;
// const totalDotNum = 15;
let numDotsLeft = totalDotNum;

let timerIntervalId;
let ghostMovementIntervalId;

let gamePlayNum = 0;
let isGameStopped = true;
let isGameFreshlyStarted = false;
let ghostSpeed = 900;
let superPower = false;

var initMapState = [
  [DOT, DOT, DOT, DOT, DOT, DOT, DOT, DOT, DOT],
  [DOT, WALL, WALL, WALL, DOT, WALL, WALL, WALL, DOT],
  [DOT, WALL, WALL, WALL, DOT, WALL, WALL, WALL, DOT],
  [DOT, DOT, DOT, DOT, DOT, DOT, DOT, DOT, DOT],
  [DOT, WALL, DOT, DOT, R_GHOST, DOT, DOT, WALL, DOT],
  [DOT, WALL, DOT, DOT, B_GHOST, DOT, DOT, WALL, DOT],
  [DOT, DOT, DOT, DOT, DOT, DOT, DOT, DOT, DOT],
  [DOT, WALL, WALL, WALL, DOT, WALL, WALL, WALL, DOT],
  [DOT, WALL, WALL, WALL, DOT, WALL, WALL, WALL, DOT],
  [DOT, DOT, DOT, DOT, PACMAN, DOT, DOT, DOT, DOT],
];

let mapState = [];

/*
    Initialization
*/

// The WebGL context.
var gl;
var canvas;

// Sets up the canvas and WebGL context.
function initializeContext() {
  canvas = document.getElementById("myCanvas");
  gl = canvas.getContext("webgl2");

  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = pixelRatio * canvas.clientWidth;
  canvas.height = pixelRatio * canvas.clientHeight;

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1, 1, 1, 0);
  gl.lineWidth(1.0);

  console.log("WebGL initialized.");
}

function drawCircle(radius, centerX, centerY, color, vertexBuffer, colorBuffer) {
  var circleVertices = [];
  var circleColor = [];
  for (var i = 0.0; i <= 360; i += 1) {
    // degrees to radians
    var j = (i * Math.PI) / 180;
    // X Y Z
    var vert1 = [centerX + radius * Math.sin(j), centerY + radius * Math.cos(j)];
    var vert2 = [centerX, centerY];
    circleVertices = circleVertices.concat(vert1);
    circleVertices = circleVertices.concat(vert2);
    circleColor = circleColor.concat(color);
    circleColor = circleColor.concat(color);
  }
  drawA(gl.TRIANGLE_STRIP, circleVertices, circleColor, vertexBuffer, colorBuffer);
}

function drawRectangle(centerX, centerY, width, height, color, vertexBuffer, colorBuffer) {
  var rectangleVertices = [
    centerX - width / 2,
    centerY - height / 2,
    centerX + width / 2,
    centerY - height / 2,
    centerX - width / 2,
    centerY + height / 2,
    centerX + width / 2,
    centerY + height / 2,
  ];
  var rectangleColor = [];
  for (var i = 0; i < 8; i++) {
    rectangleColor = rectangleColor.concat(color);
  }
  drawA(gl.TRIANGLE_STRIP, rectangleVertices, rectangleColor, vertexBuffer, colorBuffer);
}

function drawCustomTriangle(centerX, centerY, width, height, color, vertexBuffer, colorBuffer) {
  var triangleVertices = [
    centerX - width / 2,
    centerY - (1 / 3) * height,
    centerX,
    centerY + (2 / 3) * height,
    centerX + width / 2,
    centerY - (1 / 3) * height,
  ];
  var triangleColor = [];
  for (var i = 0; i < 3; i++) {
    triangleColor = triangleColor.concat(color);
  }
  drawA(gl.TRIANGLE_STRIP, triangleVertices, triangleColor, vertexBuffer, colorBuffer);
}

function drawGhostHouseBorder(row, col, centerX, centerY, vertexBuffer, colorBuffer) {
  var margin = 10;
  if (row === ghostHomeTop[0] && col === ghostHomeTop[1]) {
    // draw dotted border
    var dottedTopVertices = [];
    var color = [];
    const num = 10;
    for (var i = 0; i < num; i++) {
      //Left
      dottedTopVertices = dottedTopVertices.concat([
        centerX - tileWidth / 2,
        centerY - tileHeight / 2 + (i * tileHeight) / num,
      ]);
      color = color.concat(BLUE);
    }
    for (var i = 0; i < num; i++) {
      //Top
      dottedTopVertices = dottedTopVertices.concat([
        centerX - tileWidth / 2 + (i * tileHeight) / num,
        centerY + tileHeight / 2,
      ]);
      color = color.concat(BLUE);
    }
    for (var i = 0; i < num; i++) {
      //Right
      dottedTopVertices = dottedTopVertices.concat([
        centerX + tileWidth / 2,
        centerY + tileHeight / 2 - (i * tileHeight) / num,
      ]);
      color = color.concat(BLUE);
    }
    drawA(gl.LINES, dottedTopVertices, color, vertexBuffer, colorBuffer);
  } else if (row === ghostHomeBottom[0] && col === ghostHomeBottom[1]) {
    // draw dotted border
    var dottedTopVertices = [];
    var color = [];
    const num = 10;
    for (var i = 0; i < num; i++) {
      //Left
      dottedTopVertices = dottedTopVertices.concat([
        centerX - tileWidth / 2,
        centerY - tileHeight / 2 + (i * tileHeight) / num + tileHeight / margin,
      ]);
      color = color.concat(BLUE);
    }
    for (var i = 0; i < num; i++) {
      //Bottom
      dottedTopVertices = dottedTopVertices.concat([
        centerX - tileWidth / 2 + (i * tileHeight) / num,
        centerY - tileHeight / 2 + tileHeight / margin,
      ]);
      color = color.concat(BLUE);
    }
    for (var i = 0; i < num; i++) {
      //Right
      dottedTopVertices = dottedTopVertices.concat([
        centerX + tileWidth / 2,
        centerY + tileHeight / 2 - (i * tileHeight) / num,
      ]);
      color = color.concat(BLUE);
    }
    drawA(gl.LINES, dottedTopVertices, color, vertexBuffer, colorBuffer);
  }
}

function bGhostCatchesPacman() {
  //Pacman caught by ghost
  console.log("CAUGHT");
  if (!superPower) {
    score -= numDotsLeft < 20 ? 750 : 500;
  } else {
    superPower = false;
  }

  document.getElementById("scoreValue").innerHTML = score;
  mapState[bGhostPosition.row][bGhostPosition.col] = bGhostPreviousTileType;
  let newHome;
  if (mapState[ghostHomeBottom[0]][ghostHomeBottom[1]] === EMPTY) {
    newHome = ghostHomeBottom;
  } else {
    newHome = ghostHomeTop;
  }
  bGhostPreviousTileType = mapState[newHome[0]][newHome[1]];
  bGhostPosition = { row: newHome[0], col: newHome[1] };
  mapState[newHome[0]][newHome[1]] = B_GHOST;
  if (score < 0) {
    console.log("GAME OVER");
    gameOver();
  }
}

function rGhostCatchesPacman() {
  //Pacman caught by ghost
  console.log("CAUGHT");
  if (!superPower) {
    score -= numDotsLeft < 20 ? 750 : 500;
  } else {
    superPower = false;
  }
  document.getElementById("scoreValue").innerHTML = score;
  mapState[rGhostPosition.row][rGhostPosition.col] = rGhostPreviousTileType;
  let newHome;
  if (mapState[ghostHomeTop[0]][ghostHomeTop[1]] === EMPTY) {
    newHome = ghostHomeTop;
  } else {
    newHome = ghostHomeBottom;
  }
  rGhostPreviousTileType = mapState[newHome[0]][newHome[1]];
  rGhostPosition = { row: newHome[0], col: newHome[1] };
  mapState[newHome[0]][newHome[1]] = R_GHOST;
  if (score < 0) {
    console.log("GAME OVER");
    gameOver();
  }
}

function checkCollision(pacmanDirection) {
  var { row: pacmanRow, col: pacmanCol } = pacmanPosition;
  var nextRow = pacmanRow;
  var nextCol = pacmanCol;

  if (pacmanDirection === UP) {
    nextRow -= 1;
  } else if (pacmanDirection === DOWN) {
    nextRow += 1;
  } else if (pacmanDirection === LEFT) {
    nextCol -= 1;
  } else if (pacmanDirection === RIGHT) {
    nextCol += 1;
  }
  if (nextCol < 0 || nextCol > 8 || nextRow < 0 || nextRow > 9) {
    // console.log("OUT OF BOUNDS")
    return;
  }
  if (
    (nextRow === ghostHomeBottom[0] && nextCol === ghostHomeBottom[1]) ||
    (nextRow === ghostHomeTop[0] && nextCol === ghostHomeTop[1])
  ) {
    return;
  }
  const nextTile = mapState[nextRow][nextCol];
  if (nextTile === WALL) {
    return;
  } else if (nextTile === DOT) {
    mapState[pacmanRow][pacmanCol] = EMPTY;
    if (numDotsLeft < 30) {
      score += 50;
    } else if (numDotsLeft < 15) {
      score += 25;
    } else [(score += 100)];
    // console.log("LEFT:",numDotsLeft)
    if (numDotsLeft === 1) {
      console.log("YOU WIN");
      clearTimer();
      clearGhostMovementInterval();
      calculateFinalScore();
      isGameStopped = true;
      displayGameStopWithText("YOU WIN", "Press 'shift+r' to restart game.");
    }
    document.getElementById("scoreValue").innerHTML = score;
    // console.log(score)
  } else if (nextTile === SUPER_DOT) {
    superPower = true;
  } else if (nextTile === EMPTY) {
    mapState[pacmanRow][pacmanCol] = EMPTY;
  } else if (nextTile === R_GHOST) {
    rGhostCatchesPacman();
  } else if (nextTile === B_GHOST) {
    bGhostCatchesPacman();
  }
  mapState[pacmanRow][pacmanCol] = EMPTY;
  pacmanPosition = { row: nextRow, col: nextCol };
  mapState[nextRow][nextCol] = PACMAN;
}

const gameOver = () => {
  clearTimer();
  clearGhostMovementInterval();
  isGameStopped = true;
  displayGameStopWithText("Game Over!", "Press 'shift+r' to restart game.");
};

function movePacman(pacmanDirection) {
  checkCollision(pacmanDirection);
}

async function setup() {
  initializeContext();

  // Set event listeners
  setEventListeners(canvas);

  await loadShaders();
  compileShaders();

  displayGameStopWithText(
    "Ready to play Pacman?",
    "Press 's' to start the game, 'p' to pause the game, and 'r' to resume the game"
  );
  startGame();
}

function displayGameStopWithText(text, subText) {
  const element = document.getElementById("canvasContainer");
  element.style.backgroundColor = "black";
  const gameOverText = document.getElementById("gameOver");
  gameOverText.style.display = "block";
  gameOverText.innerText = text;
  const canvas = document.getElementById("myCanvas");
  canvas.style.display = "none";
  const gameDescription = document.getElementById("gameDescription");
  gameDescription.style.display = "block";
  gameDescription.innerText = subText;
}
function removeGameStopDisplay() {
  const element = document.getElementById("canvasContainer");
  element.style.backgroundColor = "";
  const gameOverText = document.getElementById("gameOver");
  gameOverText.style.display = "none";
  gameOverText.innerText = "";
  const canvas = document.getElementById("myCanvas");
  canvas.style.display = "block";
  const gameDescription = document.getElementById("gameDescription");
  gameDescription.style.display = "none";
  // gameDescription.innerText =  "";
  document.getElementById("timerValue").innerHTML = timeLeft;
  document.getElementById("scoreValue").innerHTML = score;
}

function displayPaused() {
  const gameDescription = document.getElementById("gameDescription");
  gameDescription.style.display = "block";
  gameDescription.innerText = "Game Paused";
}
function removePausedDisplay() {
  const gameDescription = document.getElementById("gameDescription");
  gameDescription.style.display = "none";
  gameDescription.innerText = "";
}

function startTimer() {
  return setInterval(function () {
    if (timeLeft > 0) {
      timeLeft -= 1;
      document.getElementById("timerValue").innerHTML = timeLeft;
    } else {
      clearTimer();
      calculateFinalScore();
      clearGhostMovementInterval();
      isGameStopped = true;
      displayGameStopWithText("Time Over!", "Press 'shift+r' to restart game.");
    }
  }, 1000);
}

function clearTimer() {
  clearInterval(timerIntervalId);
}

function calculateFinalScore() {
  score += timeLeft * 100;
  document.getElementById("scoreValue").innerHTML = score;
}

window.onload = setup;

function drawBackground() {
  // Clear the screen (for COLOR_BUFFER_BIT)
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set the rendering st`ate to use the shader program
  gl.useProgram(prog);

  // Create the vertex buffer and color buffer
  var vertexBuffer = gl.createBuffer();
  var colorBuffer = gl.createBuffer();

  if (!vertexBuffer || !colorBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  // Loop through the mapState array
  for (var row = 0; row < ROW_SIZE; row++) {
    for (var col = 0; col < COLUMN_SIZE; col++) {
      var tile = mapState[row][col];

      // Calculate the position of the current tile in clip space
      var x = -1 + ((2 * col + 1) * tileWidth) / 2;
      var y = 1 - ((2 * row + 1) * tileHeight) / 2;

      // Set the color based on the tile type
      var color;
      if (tile === WALL) {
        color = GREEN;
      } else {
        color = GREY; // Black color for other tiles
      }

      // Draw a rectangle for the background
      drawRectangle(x, y, tileWidth, tileWidth, color, vertexBuffer, colorBuffer);
    }
  }

  // Delete the vertex buffer and color buffer
  gl.deleteBuffer(vertexBuffer);
  gl.deleteBuffer(colorBuffer);
}

function moveGhosts() {
  ghostMovementIntervalId = setInterval(function () {
    // Calculate the next locations for both ghosts

    const { position: nextRGhostLocation } = dijkstra(rGhostPosition, pacmanPosition);
    const { position: nextBGhostLocation } = dijkstra(bGhostPosition, pacmanPosition);

    // Update the map state for both ghosts
    mapState[rGhostPosition.row][rGhostPosition.col] = rGhostPreviousTileType;
    mapState[bGhostPosition.row][bGhostPosition.col] = bGhostPreviousTileType;

    rGhostPreviousTileType = mapState[nextRGhostLocation.row][nextRGhostLocation.col];
    bGhostPreviousTileType = mapState[nextBGhostLocation.row][nextBGhostLocation.col];

    // Update the positions of both ghosts
    rGhostPosition = nextRGhostLocation;
    bGhostPosition = nextBGhostLocation;

    // Update the map state with the new ghost positions
    mapState[rGhostPosition.row][rGhostPosition.col] = R_GHOST;
    mapState[bGhostPosition.row][bGhostPosition.col] = B_GHOST;

    if (nextRGhostLocation.row === pacmanPosition.row && nextRGhostLocation.col === pacmanPosition.col) {
      rGhostCatchesPacman();
    }

    if (nextBGhostLocation.row === pacmanPosition.row && nextBGhostLocation.col === pacmanPosition.col) {
      bGhostCatchesPacman();
    }
  }, 500);
}

function isValidPath(row, col) {
  if (row < 0 || row >= ROW_SIZE || col < 0 || col >= COLUMN_SIZE) {
    console.log("OUT OF BOUND");
    return false;
  }
  if (mapState[row][col] === WALL) {
    return false;
  }
  return true;
}

function getRandomPathFromGhostLoc({ row, col }) {
  const directions = [UP, DOWN, LEFT, RIGHT];
  const validDirections = [];
  let nextRow, nextCol;
  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];
    nextRow = row;
    nextCol = col;
    if (direction === UP) {
      nextRow -= 1;
    } else if (direction === DOWN) {
      nextRow += 1;
    } else if (direction === LEFT) {
      nextCol -= 1;
    } else if (direction === RIGHT) {
      nextCol += 1;
    }
    if (isValidPath(nextRow, nextCol)) {
      validDirections.push(direction);
    }
  }
  const randomIndex = Math.floor(Math.random() * validDirections.length);
  const selectedDirection = validDirections[randomIndex];
  let updatedRow = row;
  let updatedCol = col;

  if (selectedDirection === UP) {
    updatedRow -= 1;
  } else if (selectedDirection === DOWN) {
    updatedRow += 1;
  } else if (selectedDirection === LEFT) {
    updatedCol -= 1;
  } else if (selectedDirection === RIGHT) {
    updatedCol += 1;
  }
  return {
    direction: validDirections[randomIndex],
    position: { row: updatedRow, col: updatedCol },
  };
}

function dijkstra(ghostLoc, pacmanLoc) {
  const dist = [];
  const visited = [];
  const prev = [];

  // initialize distances and visited array
  for (let i = 0; i < ROW_SIZE; i++) {
    dist[i] = [];
    visited[i] = [];
    prev[i] = [];
    for (let j = 0; j < COLUMN_SIZE; j++) {
      dist[i][j] = Infinity;
      visited[i][j] = 0;
    }
  }

  // set distance to the ghost's location to 0
  dist[ghostLoc.row][ghostLoc.col] = 0;

  // find shortest path using Dijkstra's algorithm
  for (let count = 0; count < ROW_SIZE * COLUMN_SIZE - 1; count++) {
    let minDist = Infinity;
    let u = { row: -1, col: -1 };

    // find the vertex with the minimum distance
    for (let i = 0; i < ROW_SIZE; i++) {
      for (let j = 0; j < COLUMN_SIZE; j++) {
        if (!visited[i][j] && dist[i][j] < minDist) {
          minDist = dist[i][j];
          u.row = i;
          u.col = j;
        }
      }
    }

    // mark the vertex as visited
    visited[u.row][u.col] = 1;

    // check if the visited vertex is Pacman's location
    if (u.row === pacmanLoc.row && u.col === pacmanLoc.col) {
      break;
    }

    const directions = [UP, DOWN, LEFT, RIGHT];
    // update the distance of adjacent vertices
    for (let dir = 0; dir < directions.length; dir++) {
      const direction = directions[dir];
      let row = u.row;
      let col = u.col;
      if (direction === UP) {
        row -= 1;
      } else if (direction === DOWN) {
        row += 1;
      } else if (direction === LEFT) {
        col -= 1;
      } else if (direction === RIGHT) {
        col += 1;
      }
      if (row >= 0 && row < ROW_SIZE && col >= 0 && col < COLUMN_SIZE) {
        const altDist = dist[u.row][u.col] + 1;
        if (altDist < dist[row][col] && isValidPath(row, col)) {
          dist[row][col] = altDist;
          prev[row][col] = u;
        }
      }
    }
  }

  // backtrack to find the shortest path to Pacman
  let nextMove = pacmanLoc;
  while (
    prev[nextMove.row][nextMove.col].row !== ghostLoc.row ||
    prev[nextMove.row][nextMove.col].col !== ghostLoc.col
  ) {
    nextMove = prev[nextMove.row][nextMove.col];
  }
  //   console.log("NEXTMOVE:", nextMove)
  return { position: nextMove };
}

function clearGhostMovementInterval() {
  clearInterval(ghostMovementIntervalId);
}

function randomilyPopulateSuperDot() {
  const dotPositions = [];

  // Find all dot positions in the map
  for (let row = 0; row < initMapState.length; row++) {
    for (let col = 0; col < initMapState[row].length; col++) {
      if (initMapState[row][col] === DOT) {
        dotPositions.push({ row, col });
      }
    }
  }

  // Randomly select a dot position to assign the super_dot
  const randomIndex = Math.floor(Math.random() * dotPositions.length);
  const superDotPosition = dotPositions[randomIndex];

  // Assign the super_dot at the selected position
  mapState[superDotPosition.row][superDotPosition.col] = SUPER_DOT;
}

function startGame() {
  if (isGameFreshlyStarted) {
    mapState = JSON.parse(JSON.stringify(initMapState));
    randomilyPopulateSuperDot();
    timeLeft = 60;
    pacmanPosition = initPacmanPosition;
    rGhostPosition = initRGhostPosition;
    bGhostPosition = initBGhostPosition;
    rGhostPreviousTileType = EMPTY;
    bGhostPreviousTileType = EMPTY;
    // numDotsLeft = totalDotNum;
    score = 0;
    timerIntervalId = startTimer();
    isGameFreshlyStarted = false;
    removeGameStopDisplay();
    moveGhosts();
  }

  if (!isGameStopped) {
    // Clear the screen (for COLOR_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the rendering st`ate to use the shader program
    gl.useProgram(prog);

    // Create the vertex buffer and color buffer
    var vertexBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();

    if (!vertexBuffer || !colorBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }

    let numDotsInField = 0;
    // Loop through the mapState array
    for (var row = 0; row < ROW_SIZE; row++) {
      for (var col = 0; col < COLUMN_SIZE; col++) {
        var tile = mapState[row][col];

        // Calculate the position of the current tile in clip space
        var x = -1 + ((2 * col + 1) * tileWidth) / 2;
        var y = 1 - ((2 * row + 1) * tileHeight) / 2;

        if (tile === WALL) {
          drawRectangle(x, y, tileWidth, tileWidth, GREEN, vertexBuffer, colorBuffer);
        } else if (tile === DOT) {
          numDotsInField += 1;
          drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
          drawCircle(tileWidth / 7, x, y, DARK_YELLOW, vertexBuffer, colorBuffer);
        } else if (tile === SUPER_DOT) {
          drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
          drawCircle(tileWidth / 7, x, y, PINK, vertexBuffer, colorBuffer);
        } else if (tile === PACMAN) {
          drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
          drawCustomTriangle(x, y, tileWidth / 2, tileWidth / 2, BLUE, vertexBuffer, colorBuffer);
        } else if (tile === R_GHOST) {
          drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
          drawRectangle(x, y, tileWidth / 2, tileWidth / 2, RED, vertexBuffer, colorBuffer);
        } else if (tile === B_GHOST) {
          drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
          drawRectangle(x, y, tileWidth / 2, tileWidth / 2, TEAL_BLUE, vertexBuffer, colorBuffer);
        } else {
          drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
        }

        drawGhostHouseBorder(row, col, x, y, vertexBuffer, colorBuffer);
      }
    }
    numDotsLeft = numDotsInField;
    // console.log("NUM DOST IN FIELD", numDotsInField)

    // Delete the vertex buffer and color buffer
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(colorBuffer);

    requestAnimationFrame(startGame);
  } else {
    // gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(startGame);
  }
}

// Generic format
function drawA(type, vertices, colors, vertexBuffer, colorBuffer) {
  var n = vertices.length / 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(prog, "position");
  if (aPosition < 0) {
    console.log("Failed to get the storage location of aPosition");
    return -1;
  }
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  var aColor = gl.getAttribLocation(prog, "color");
  if (aColor < 0) {
    console.log("Failed to get the storage location of aColor");
    return -1;
  }
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);
  gl.bindVertexArray(null);

  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }
  gl.drawArrays(type, 0, n);
}

/*
    Input Events
*/

function setEventListeners(canvas) {
  // canvas.addEventListener('keydown', function (event) {

  // });
  var hasPressed = null;
  window.addEventListener("keydown", function (event) {
    // Handle the click event here
    // console.log(event.key)
    if (!hasPressed && hasPressed !== event.key) {
      if (!isGameStopped) {
        if (event.key === UP || event.key === DOWN || event.key === LEFT || event.key === RIGHT) {
          movePacman(event.key);
          hasPressed = event.key;
        }
      }
      if (event.key === START_GAME && gamePlayNum === 0) {
        console.log("START GAME");
        gamePlayNum++;
        isGameFreshlyStarted = true;
        isGameStopped = false;
      } else if (!isGameStopped && event.key === PAUSE_GAME && numDotsLeft > 0) {
        isGameStopped = true;
        clearTimer();
        clearGhostMovementInterval();
        displayPaused();
      } else if (isGameStopped && event.key === RESUME_GAME && numDotsLeft > 0 && score > 0) {
        isGameStopped = false;
        removePausedDisplay();
        timerIntervalId = startTimer();
        moveGhosts();
      } else if (event.key === RESTART_GAME && gamePlayNum > 0) {
        isGameFreshlyStarted = true;
        isGameStopped = false;
        clearTimer();
        clearGhostMovementInterval();
      }
    }
  });
  window.addEventListener("keyup", function (event) {
    hasPressed = null;
  });
}

// Shader sources
var vs_source;
var fs_source;

function loadShaderFile(url) {
  return fetch(url).then((response) => response.text());
}

// Loads the shader data from the files.
async function loadShaders() {
  // Specify shader URLs for your
  // local web server.
  const shaderURLs = ["./main.vert", "./main.frag"];

  // Load shader files.
  const shader_files = await Promise.all(shaderURLs.map(loadShaderFile));

  // Assign shader sources.
  vs_source = shader_files[0];
  fs_source = shader_files[1];

  console.log("Shader files loaded.");
}

// Shader handles
var vs;
var fs;
var prog;

// Compile the GLSL shader stages and combine them
// into a shader program.
function compileShaders() {
  vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vs_source);
  gl.compileShader(vs);

  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(vs));
    gl.deleteShader(vs);
  }

  // TODO: Repeat for the fragment shader.
  fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fs_source);
  gl.compileShader(fs);

  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fs));
    gl.deleteShader(fs);
  }

  prog = gl.createProgram();

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);

  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
  }
  console.log("Shader program compiled successfully.");
}
