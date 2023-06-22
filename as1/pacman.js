const WALL = 0;
const DOT = 1;
const EMPTY = 2;
const PACMAN = 3;
const R_GHOST = 4;
const T_GHOST = 5;

const tileSize = 20;
const tileWidth = 50;
const tileHeight = 50;
// const tileWidth2CanvasWidthRatio = tileWidth/canvas.width;
// const tileHeight2CanvasHeightRatio = tileHeight/canvas.height;

const GREEN = [0,1,0,1]
const DARK_YELLOW = [0.6, 0.6, 0, 1];
const TEAL_BLUE = [0, 0.5, 0.5, 1];
const RED = [1, 0, 0, 1];
const BLUE = [0, 0, 1, 1];


const mapState = [
    [DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,],
    [DOT, WALL, DOT,  DOT, R_GHOST, DOT,  DOT,  WALL, DOT,],
    [DOT, WALL, DOT,  DOT, T_GHOST, DOT,  DOT,  WALL, DOT,],
    [DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,],
    [DOT, DOT,  DOT,  DOT,  PACMAN, DOT,  DOT,  DOT,  DOT,],
]
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

    logMessage("WebGL initialized.");
}

function drawCircle() {
    // Create a buffer object
    var vertexBuffer = gl.createBuffer(),
        vertices = [],
        vertCount = 2;
    for (var i=0.0; i<=360; i+=1) {
      // degrees to radians
      var j = i * Math.PI / 180;
      // X Y Z
      var vert1 = [
        Math.sin(j),
        Math.cos(j),
        // 0,
      ];
      var vert2 = [
        0,
        0,
        // 0,
      ];
      // DONUT:
      // var vert2 = [
      //   Math.sin(j)*0.5,
      //   Math.cos(j)*0.5,
      // ];
      vertices = vertices.concat(vert1);
      vertices = vertices.concat(vert2);
    }
    var n = vertices.length / vertCount;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, vertCount, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

async function setup() {
    // TODO: Initialize the context.
    initializeContext();

    // Set event listeners
    setEventListeners(canvas);

    await loadShaders();
    compileShaders();

    render();
};

window.onload = setup;


// Creates buffers using provided data.
function createBuffers() {
    // TODO: Create a position buffer for the vertices.
    // In WebGL, the default winding order is counter-clock-wise,
    // meaning that the order of vertices in a triangle must occur
    // in a counter-clock-wise sequence relative to the viewer to be
    // considered front-facing.
    position_buffer = gl.createBuffer();

    // TODO: Bind the buffer as an ARRAY_BUFFER to tell WebGL it will
    // be used as a vertex buffer. Note that if another buffer was previously
    // bound to ARRAY_BUFFER, that binding will be broken.
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

    // TODO: Set the buffer data of the buffer bound to target 
    // ARRAY_BUFFER with STATIC_DRAW usage. The usage is a hint
    // that tells the API & driver the expected usage pattern of the backing
    // data store. This allows it to make some optimizations.
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    // TODO: Repeat for the color vertex data.
    color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW);

    logMessage("Created buffers.");
}


// Draws the vertex data.
function render() {
    // TODO: Clear the screen (for COLOR_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);

    // TODO: Set the rendering st`ate to use the shader program
    gl.useProgram(prog);

    
    var pointsVertices = [
        -0.5, -0.5
    ]
    var linesVertices = [
        -0.25, -0.25,  -0.5, +0.5
    ]
    var triangleVertices = [
        +0.5, -0.5,  0.0, 0.25,  +0.5, 0.0
    ]

    var colors = [
        1, 0, 1, 1, // red
    ]

    drawA(gl.POINTS, pointsVertices, colors);
    drawA(gl.LINES, linesVertices, colors);
    drawA(gl.TRIANGLES, triangleVertices, colors);

    // TODO: Call this function repeatedly with requestAnimationFrame.
    requestAnimationFrame(render);
}

 // Generic format
 function drawA(type, vertices, colors) {
    var n = vertices.length / 2;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(prog, 'position');
    if (aPosition < 0) {
      console.log('Failed to get the storage location of aPosition');
      return -1;
    }

    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var aColor = gl.getAttribLocation(prog, 'color');
    if (aColor < 0) {
      console.log('Failed to get the storage location of aColor');
      return -1;
    }

    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);


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
    });

    canvas.addEventListener('keyup', function (event) {
        document.getElementById("keyup").innerText = event.key;
    });

    canvas.addEventListener('mousemove', function (event) {
        document.getElementById("mpos_x").innerText = event.x;
        document.getElementById("mpos_y").innerText = event.y;
    });

    var click_count = 0;
    canvas.addEventListener('click', function (event) {
        click_count += 1;
        document.getElementById("click_count").innerText = click_count;
    })
}


// Logging

function logMessage(message) {
    document.getElementById("messageBox").innerText += `[msg]: ${message}\n`;
}

function logError(message) {
    document.getElementById("messageBox").innerText += `[err]: ${message}\n`;
}

function logObject(obj) {
    let message = JSON.stringify(obj, null, 2);
    document.getElementById("messageBox").innerText += `[obj]:\n${message}\n\n`;
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

    // logMessage(vs_source);
    // logMessage(fs_source);

    logMessage("Shader files loaded.")
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
        logError(gl.getShaderInfoLog(vs));
        gl.deleteShader(vs);
    }

    // TODO: Repeat for the fragment shader.
    fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fs_source);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        logError(gl.getShaderInfoLog(fs));
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
        logError(gl.getProgramInfoLog(prog));
    }

    logMessage("Shader program compiled successfully.");
}