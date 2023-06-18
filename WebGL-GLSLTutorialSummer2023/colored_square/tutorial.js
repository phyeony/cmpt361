/*
    Initialization
*/

// The WebGL context.
var gl
var canvas;

// Sets up the canvas and WebGL context.
function initializeContext() {
    // TODO: Get and store the webgl context from the canvas    

    // TODO: Determine the ratio between physical pixels and CSS pixels

    // TODO: Set the width and height of the canvas
    // using clientWidth and clientHeight

    // TODO: Set the viewport size

    // TODO: Set the clear color to white.

    // TODO: Set the line width to 1.0.

    logMessage("WebGL initialized.");
}

async function setup() {
    // TODO: Initialize the context.

    // Set event listeners
    setEventListeners(canvas);

    // TODO: Create vertex buffer data.

    // TODO: Load shader files

    // TODO: Compile the shaders

    // TODO: Set the uniform variables

    // TODO: Create vertex array objects

    // TODO: Draw!

};

window.onload = setup;

// Vertex position is in the format [x0, y0, z0, x1, y1, ...]
// Note that a vertex can have multiple attributes (ex. colors, normals, texture coordinates, etc.)
var positions = [
    -0.8, 0.6, 0,
    0.8, 0.6, 0,
    0.8, -0.6, 0,
    -0.8, 0.6, 0,
    0.8, -0.6, 0,
    -0.8, -0.6, 0
];

// Vertex color data in the format [r0, g0, b0, a0, r1, g1, ...].
// Note that for every vertex position, we have an associated color.
// The number of tuples between different vertex attributes must be the same.
var colors = [
    1, 0, 0, 1, // red
    0, 1, 0, 1, // green
    0, 0, 1, 1, // blue
    1, 0, 0, 1, // red
    0, 0, 1, 1, // blue
    1, 0, 1, 1 // purple
];

// Buffer objects
var position_buffer;
var color_buffer;

// Creates buffers using provided data.
function createBuffers() {
    // TODO: Create a position buffer for the vertices.
    // In WebGL, the default winding order is counter-clock-wise,
    // meaning that the order of vertices in a triangle must occur
    // in a counter-clock-wise sequence relative to the viewer to be
    // considered front-facing.

    // TODO: Bind the buffer as an ARRAY_BUFFER to tell WebGL it will
    // be used as a vertex buffer. Note that if another buffer was previously
    // bound to ARRAY_BUFFER, that binding will be broken.

    // TODO: Set the buffer data of the buffer bound to target 
    // ARRAY_BUFFER with STATIC_DRAW usage. The usage is a hint
    // that tells the API & driver the expected usage pattern of the backing
    // data store. This allows it to make some optimizations.

    // TODO: Repeat for the color vertex data.

    logMessage("Created buffers.");
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

    // TODO: Specify the shader source code.

    // TODO: Compile the shader.

    // TODO: Check that the shader actually compiled (COMPILE_STATUS).
    // This can be done using the getShaderParameter function.
    // The error message can be retrieved with getShaderInfoLog.


    // TODO: Repeat for the fragment shader.

    // Next we have to create a shader program
    // using the shader stages that we compiled.

    // TODO: Create a shader program.

    // TODO: Attach the vertex and fragment shaders
    // to the program.

    // TODO: Link the program

    // TODO: Check the LINK_STATUS using getProgramParameter

    logMessage("Shader program compiled successfully.");
}


// Sets the uniform variables in the shader program
function setUniformVariables() {

    // Defines a 4x4 identity matrix. Note that the layout
    // in memory depends on whether the matrix is on the left or right
    // of the vector during multiplication in the vertex shader.
    // Here, this matrix is stored in column-major format.
    // To convert it to row-major, you would take its transpose.
    // For an identity matrix, these are equivalent.
    const matrix = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    // TODO: Tell the current rendering state to use the shader program

    // TODO: Get the location of the uniform variable in the shader

    // TODO: Set the data of the uniform.
    // The values should not be transposed.

    logMessage("Set uniform variables.")
}

// Handle for the vertex array object
var vao;

// Creates VAOs for vertex attributes
function createVertexArrayObjects() {

    // TODO: Create vertex array object

    // TODO: Bind vertex array so we can modify it

    // TODO: Get shader location of the position vertex attribute.

    // TODO: Bind the position buffer again

    // TODO: Specify the layout of the data using vertexAttribPointer.

    // TODO: Enable this vertex attribute.

    // TODO: Repeat for the color vertex attribute. The size is now 4. 

    // TODO: Unbind array to prevent accidental modification.

    logMessage("Created VAOs.");

}

// Draws the vertex data.
function render() {
    // TODO: Clear the screen (for COLOR_BUFFER_BIT)

    // TODO: Set the rendering state to use the shader program

    // TODO: Bind the VAO

    // TODO: Draw 6 vertices using the TRIANGLES mode.

    // logMessage("Rendered to the screen!");

    // TODO: Call this function repeatedly with requestAnimationFrame.
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