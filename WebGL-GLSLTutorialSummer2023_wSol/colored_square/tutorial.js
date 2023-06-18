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

async function setup() {
    // TODO: Initialize the context.
    initializeContext();

    // Set event listeners
    setEventListeners(canvas);

    // TODO: Create vertex buffer data.
    createBuffers();

    // TODO: Load shader files
    await loadShaders();

    // TODO: Compile the shaders
    compileShaders();

    // TODO: Set the uniform variables
    setUniformVariables();

    // TODO: Create vertex array objects
    createVertexArrayObjects();

    // TODO: Draw!
    render();

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
    gl.useProgram(prog);

    // TODO: Get the location of the uniform variable in the shader
    var transform_loc = gl.getUniformLocation(prog, "transform");

    // TODO: Set the data of the uniform.
    // The values should not be transposed.
    gl.uniformMatrix4fv(transform_loc, false, matrix);

    logMessage("Set uniform variables.")
}

// Handle for the vertex array object
var vao;

// Creates VAOs for vertex attributes
function createVertexArrayObjects() {

    // TODO: Create vertex array object
    vao = gl.createVertexArray();
    // TODO: Bind vertex array so we can modify it
    gl.bindVertexArray(vao);

    // TODO: Get shader location of the position vertex attribute.
    var pos_idx = gl.getAttribLocation(prog, "position");
    // TODO: Bind the position buffer again
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    // TODO: Specify the layout of the data using vertexAttribPointer.
    gl.vertexAttribPointer(pos_idx, 3, gl.FLOAT, false, 0, 0);
    // TODO: Enable this vertex attribute.
    gl.enableVertexAttribArray(pos_idx);

    // TODO: Repeat for the color vertex attribute. The size is now 4. 
    var col_idx = gl.getAttribLocation(prog, "color");
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.vertexAttribPointer(col_idx, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(col_idx);

    // TODO: Unbind array to prevent accidental modification.
    gl.bindVertexArray(null);

    logMessage("Created VAOs.");

}

// Draws the vertex data.
function render() {
    // TODO: Clear the screen (for COLOR_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);

    // TODO: Set the rendering state to use the shader program
    gl.useProgram(prog);

    // TODO: Bind the VAO
    gl.bindVertexArray(vao);

    // TODO: Draw 6 vertices using the TRIANGLES mode.
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // logMessage("Rendered to the screen!");

    // TODO: Call this function repeatedly with requestAnimationFrame.
    requestAnimationFrame(render);
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