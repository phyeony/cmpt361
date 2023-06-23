// TODO:
// 1. Ghost movement
// 2. Ghost collision (game over screen)
// 3. HTML Score display
// 4. Ghost home boundary display
// 5. Game win screen
// 6. setEventListeners on windows?
// 7. Read over assingnment requirements

const WALL = 0;
const DOT = 1;
const EMPTY = 2;
const PACMAN = 3;
const R_GHOST = 4;
const B_GHOST = 5;

const NUM_ROW = 10;
const NUM_COL = 9;

var tileWidth = 2 / NUM_COL; // clip space [-1,1] 
var tileHeight = 2 / NUM_ROW;

const GREEN = [0,1,0]
const DARK_YELLOW = [0.7, 0.7, 0];
const TEAL_BLUE = [0,1,1];
const RED = [1, 0, 0];
const BLUE = [0, 0, 1];
const GREY = [0.8, 0.8, 0.8];

const LEFT = "ArrowLeft";
const RIGHT = "ArrowRight";
const DOWN = "ArrowDown";
const UP = "ArrowUp";

// initial position
// [row, col]
var pacmanPosition = [9, 4];
var rGhostPosition = [4, 4];
var bGhostPosition = [5, 4];

var score =0;

var mapState = [
    [DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,],
    [DOT, WALL, DOT,  DOT, R_GHOST, DOT,  DOT,  WALL, DOT,],
    [DOT, WALL, DOT,  DOT, B_GHOST, DOT,  DOT,  WALL, DOT,],
    [DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, DOT,  DOT,  DOT,  PACMAN, DOT,  DOT,  DOT,  DOT,],
]
console.log(mapState[9][4])
// Refered https://github.com/davidwparker/programmingtil-webgl for various drawings

/*
    Initialization
*/

// The WebGL context.
var gl
var canvas;

// Sets up the canvas and WebGL context.
function initializeContext() {
    // TODO: Get and store the webgl context from the canvas    
    canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl2");

    // TODO: Determine the ratio between physical pixels and CSS pixels
    const pixelRatio = window.devicePixelRatio || 1;

    // TODO: Set the width and height of the canvas
    // using clientWidth and clientHeight
    canvas.width = pixelRatio * canvas.clientWidth;
    canvas.height = pixelRatio * canvas.clientHeight;

    // TODO: Set the viewport size
    gl.viewport(0, 0, canvas.width, canvas.height);

    // TODO: Set the clear color to white.
    gl.clearColor(1, 1, 1, 0);
    // TODO: Set the line width to 1.0.
    gl.lineWidth(1.0);

    console.log("WebGL initialized.");
}

function drawCircle(radius, centerX, centerY, color, vertexBuffer, colorBuffer) {
    var circleVertices = [];
    var circleColor = [];
    for (var i=0.0; i<=360; i+=1) {
        // degrees to radians
        var j = i * Math.PI / 180;
        // X Y Z
        var vert1 = [
          centerX+radius*Math.sin(j),
          centerY+radius*Math.cos(j),
        ];
        var vert2 = [
          centerX,
          centerY,
        ];
        circleVertices = circleVertices.concat(vert1);
        circleVertices = circleVertices.concat(vert2);
        circleColor = circleColor.concat(color)
        circleColor = circleColor.concat(color)
    }
    drawA(gl.TRIANGLE_STRIP, circleVertices, circleColor, vertexBuffer, colorBuffer)
}

function drawRectangle(centerX, centerY, width, height, color, vertexBuffer, colorBuffer) {
    var rectangleVertices = [
        centerX-width/2, centerY-height/2, 
        centerX+width/2, centerY-height/2,
        centerX-width/2, centerY+height/2,
        centerX+width/2, centerY+height/2,
    ]
    var rectangleColor = []
    for(var i=0;i<8;i++){
        rectangleColor = rectangleColor.concat(color)
    }
    drawA(gl.TRIANGLE_STRIP, rectangleVertices, rectangleColor, vertexBuffer, colorBuffer)
}   

function drawCustomTriangle(centerX, centerY, width, height, color, vertexBuffer, colorBuffer) {
    var triangleVertices = [
        centerX-width/2, centerY - 1/3*height,
        centerX, centerY + 2/3 * height,
        centerX+width/2, centerY - 1/3*height,
    ]
    var triangleColor = []
    for(var i=0;i<3;i++){
        triangleColor = triangleColor.concat(color)
    }
    // console.log(rectangleColor)
    drawA(gl.TRIANGLE_STRIP, triangleVertices, triangleColor, vertexBuffer, colorBuffer)
}   

function checkCollision(pacmanDirection) {
    var [pacmanRow, pacmanCol] = pacmanPosition
    var nextRow = pacmanRow
    var nextCol = pacmanCol
    
    if(pacmanDirection === UP) {
        nextRow -= 1
    } else if(pacmanDirection === DOWN) {
        nextRow += 1
    } else if(pacmanDirection === LEFT) {
        nextCol -= 1
    } else if(pacmanDirection === RIGHT) {
        nextCol += 1
    }
    if(nextCol < 0 || nextCol > 8 || nextRow < 0 || nextRow > 9) {
        console.log("OUT OF BOUNDS")
        return;
    }
    if(mapState[nextRow][nextCol] === WALL) {
        console.log("WALL")
        return
    } else if(mapState[nextRow][nextCol] === DOT) {
        mapState[pacmanRow][pacmanCol] = EMPTY
        score += 100
        console.log(score)
    } else if (mapState[nextRow][nextCol] === EMPTY) {
        mapState[pacmanRow][pacmanCol] = EMPTY
    }
    else if(mapState[nextRow][nextCol] === R_GHOST || mapState[nextRow][nextCol] === B_GHOST) {
        // gameOver()
        console.log("GAME OVER")
    }
    mapState[pacmanRow][pacmanCol] = EMPTY
    pacmanPosition = [nextRow, nextCol]
    mapState[nextRow][nextCol] = PACMAN;
    // drawPacman(pacmanPosition)
    // drawScore()    

}

function movePacman(pacmanDirection) {
    console.log(pacmanDirection)
    if(pacmanDirection === UP) {
        console.log('up')
    }
    checkCollision(pacmanDirection)
    
}
async function setup() {
    // TODO: Initialize the context.
    initializeContext();

    // Set event listeners
    setEventListeners(canvas);

    await loadShaders();
    compileShaders();

    // drawBackground();
    startGame();
};

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
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Loop through the mapState array
    for (var row = 0; row < NUM_ROW; row++) {
        for (var col = 0; col < NUM_COL; col++) {
            var tile = mapState[row][col];

            // Calculate the position of the current tile in clip space
            var x = -1 + (2*(col)+1) * tileWidth / 2;
            var y = 1 - (2*(row)+1) * tileHeight / 2;

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


function startGame() {
    // Clear the screen (for COLOR_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the rendering st`ate to use the shader program
    gl.useProgram(prog);

    // Create the vertex buffer and color buffer
    var vertexBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    
    if (!vertexBuffer || !colorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // var pointsVertices = [
    //     -0.5, -0.5
    // ]
    // var linesVertices = [
    //     -0.25, -0.25,  -0.5, +0.5
    // ]
    // var triangleVertices = [
    //     +0.5, -0.5,  0.0, 0.25,  +0.5, 0.0
    // ]


    // // Draw points
    // drawA(gl.POINTS, pointsVertices, colors, vertexBuffer, colorBuffer);

    // // Draw lines
    // drawA(gl.LINES, linesVertices, colors, vertexBuffer, colorBuffer);
    // // Draw Circle
    // drawCircle(0.32, 0, 0, DARK_YELLOW, vertexBuffer, colorBuffer)
    // drawRectangle(0,0, 0.5, 0.5,BLUE, vertexBuffer, colorBuffer)
    // drawCustomTriangle(0, 0, 0.3, 0.3, [1,0,0], vertexBuffer, colorBuffer)

    // // Draw triangles
    // drawA(gl.TRIANGLES, triangleVertices, colors, vertexBuffer, colorBuffer);

    // Loop through the mapState array
    for (var row = 0; row < NUM_ROW; row++) {
        for (var col = 0; col < NUM_COL; col++) {
            var tile = mapState[row][col];

            // Calculate the position of the current tile in clip space
            var x = -1 + (2*(col)+1) * tileWidth / 2;
            var y = 1 - (2*(row)+1) * tileHeight / 2;
            

            if (tile === WALL) {
                drawRectangle(x, y, tileWidth, tileWidth, GREEN, vertexBuffer, colorBuffer);
            } else if (tile === DOT) {
                drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
                drawCircle(tileWidth/7, x, y, DARK_YELLOW, vertexBuffer, colorBuffer);
            } else if (tile === PACMAN) {
                drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
                drawCustomTriangle(x,y, tileWidth/2, tileWidth/2, BLUE, vertexBuffer, colorBuffer);
            } else if (tile === R_GHOST) {
                drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
                drawRectangle(x, y, tileWidth/2, tileWidth/2, RED, vertexBuffer, colorBuffer);
            } else if (tile === B_GHOST){ 
                drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
                drawRectangle(x, y, tileWidth/2, tileWidth/2, TEAL_BLUE, vertexBuffer, colorBuffer);
            } else {
                drawRectangle(x, y, tileWidth, tileWidth, GREY, vertexBuffer, colorBuffer);
            }
            

        }
    }
    
    // Delete the vertex buffer and color buffer
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(colorBuffer);
    // TODO: Call this function repeatedly with requestAnimationFrame.
    requestAnimationFrame(startGame);
}

 // Generic format
 function drawA(type, vertices, colors, vertexBuffer, colorBuffer) {
    var n = vertices.length / 2;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(prog, 'position');
    if (aPosition < 0) {
      console.log('Failed to get the storage location of aPosition');
      return -1;
    }
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);


    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var aColor = gl.getAttribLocation(prog, 'color');
    if (aColor < 0) {
      console.log('Failed to get the storage location of aColor');
      return -1;
    }
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    gl.bindVertexArray(null);

    if (n < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }
    gl.drawArrays(type, 0, n);
  }



/*
    Input Events
*/

function setEventListeners(canvas) {
    canvas.addEventListener('keydown', function (event) {
        document.getElementById("keydown").innerText = event.key;
        movePacman(event.key);
    });

    // canvas.addEventListener('keyup', function (event) {
    //     document.getElementById("keyup").innerText = event.key;
    // });
}

// Shader sources
var vs_source;
var fs_source;

function loadShaderFile(url) {
    return fetch(url).then(response => response.text());
}

// Loads the shader data from the files.
async function loadShaders() {
    // Specify shader URLs for your
    // local web server.
    const shaderURLs = [
        './main.vert',
        './main.frag'
    ];

    // Load shader files.
    const shader_files = await Promise.all(shaderURLs.map(loadShaderFile));

    // Assign shader sources.
    vs_source = shader_files[0];
    fs_source = shader_files[1];

    console.log("Shader files loaded.")
}

// Shader handles
var vs;
var fs;
var prog;

// Compile the GLSL shader stages and combine them
// into a shader program.
function compileShaders() {
    // TODO: Create a shader of type VERTEX_SHADER.
    vs = gl.createShader(gl.VERTEX_SHADER);
    // TODO: Specify the shader source code.
    gl.shaderSource(vs, vs_source);
    // TODO: Compile the shader.
    gl.compileShader(vs);
    // TODO: Check that the shader actually compiled (COMPILE_STATUS).
    // This can be done using the getShaderParameter function.
    // The error message can be retrieved with getShaderInfoLog.
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vs))
        gl.deleteShader(vs);
    }

    // TODO: Repeat for the fragment shader.
    fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fs_source);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs))
        gl.deleteShader(fs);
    }

    // Next we have to create a shader program
    // using the shader stages that we compiled.

    // TODO: Create a shader program.
    prog = gl.createProgram();

    // TODO: Attach the vertex and fragment shaders
    // to the program.
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);

    // TODO: Link the program
    gl.linkProgram(prog);

    // TODO: Check the LINK_STATUS using getProgramParameter
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
    }
    console.log("Shader program compiled successfully.");
}