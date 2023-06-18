/*
    Initialization
*/

// The WebGL context.
var gl
var canvas;

// Variables for spinning the cube
var angle;
var angularSpeed;

const WALL = 0;
const DOT = 1;
const EMPTY = 2;
const PACMAN = 3;
const R_GHOST = 4;
const T_GHOST = 5;


const mapState = [
    DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,
    DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,
    DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,
    DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,
    DOT, WALL, DOT,  DOT, R_GHOST, DOT,  DOT,  WALL, DOT,
    DOT, WALL, DOT,  DOT, T_GHOST, DOT,  DOT,  WALL, DOT,
    DOT, DOT,  DOT,  DOT,   DOT,   DOT,  DOT,  DOT,  DOT,
    DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,
    DOT, WALL, WALL, WALL,  DOT,   WALL, WALL, WALL, DOT,
    DOT, DOT,  DOT,  DOT,  PACMAN, DOT,  DOT,  DOT,  DOT,
]

// Sets up the canvas and WebGL context.
function initializeContext() {
    // Get and store the webgl context from the canvas    
    canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl2");

    // Determine the ratio between physical pixels and CSS pixels
    const pixelRatio = window.devicePixelRatio || 1;

    // Set the width and height of the canvas
    // using clientWidth and clientHeight
    canvas.width = pixelRatio * canvas.clientWidth;
    canvas.height = pixelRatio * canvas.clientHeight;

    // Set the viewport size
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set the clear color to white.
    gl.clearColor(1, 1, 1, 0);
    // Set the line width to 1.0.
    gl.lineWidth(1.0);

    // TODO: Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    logMessage("WebGL initialized.");
}

async function setup() {
    // Initialize the context.
    initializeContext();

    // Set event listeners
    setEventListeners(canvas);

    // Create cube data.
    colorCube();

    // Create vertex buffer data.
    createBuffers();

    // Load shader files
    await loadShaders();

    // Compile the shaders
    compileShaders();

    // Create vertex array objects
    createVertexArrayObjects();

    // TODO: Initialize angle and angularSpeed.
    angle = 0.0;
    angularSpeed = 0.0;

    // Draw!
    requestAnimationFrame(render)

};

window.onload = setup;

// Vertex position is in the format [x0, y0, z0, x1, y1, ...]
// Note that a vertex can have multiple attributes (ex. colors, normals, texture coordinates, etc.)
var positions = [];

// Vertex color data in the format [r0, g0, b0, a0, r1, g1, ...].
// Note that for every vertex position, we have an associated color.
// The number of tuples between different vertex attributes must be the same.
var colors = [];


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );

    // flatten
    positions = flatten(positions);
    colors = flatten(colors);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5),
        vec3( -0.5,  0.5,  0.5),
        vec3(  0.5,  0.5,  0.5),
        vec3(  0.5, -0.5,  0.5),
        vec3( -0.5, -0.5, -0.5),
        vec3( -0.5,  0.5, -0.5),
        vec3(  0.5,  0.5, -0.5),
        vec3(  0.5, -0.5, -0.5)
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

// Buffer objects
var position_buffer;
var color_buffer;

// Creates buffers using provided data.
function createBuffers() {
    // Create a position buffer for the vertices.
    // In WebGL, the default winding order is counter-clock-wise,
    // meaning that the order of vertices in a triangle must occur
    // in a counter-clock-wise sequence relative to the viewer to be
    // considered front-facing.
    position_buffer = gl.createBuffer();

    // Bind the buffer as an ARRAY_BUFFER to tell WebGL it will
    // be used as a vertex buffer. Note that if another buffer was previously
    // bound to ARRAY_BUFFER, that binding will be broken.
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

    // Set the buffer data of the buffer bound to target 
    // ARRAY_BUFFER with STATIC_DRAW usage. The usage is a hint
    // that tells the API & driver the expected usage pattern of the backing
    // data store. This allows it to make some optimizations.
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    // Repeat for the color vertex data.
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
    // Create a shader of type VERTEX_SHADER.
    vs = gl.createShader(gl.VERTEX_SHADER);
    // Specify the shader source code.
    gl.shaderSource(vs, vs_source);
    // Compile the shader.
    gl.compileShader(vs);
    // Check that the shader actually compiled (COMPILE_STATUS).
    // This can be done using the getShaderParameter function.
    // The error message can be retrieved with getShaderInfoLog.
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        logError(gl.getShaderInfoLog(vs));
        gl.deleteShader(vs);
    }

    // Repeat for the fragment shader.
    fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fs_source);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        logError(gl.getShaderInfoLog(fs));
        gl.deleteShader(fs);
    }

    // Next we have to create a shader program
    // using the shader stages that we compiled.

    // Create a shader program.
    prog = gl.createProgram();

    // Attach the vertex and fragment shaders
    // to the program.
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);

    // Link the program
    gl.linkProgram(prog);

    // Check the LINK_STATUS using getProgramParameter
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

    // Tell the current rendering state to use the shader program
    gl.useProgram(prog);

    // Get the location of the uniform variable in the shader
    var transform_loc = gl.getUniformLocation(prog, "transform");
    
    var model = matrix;
    // TODO: Create a rotation matrix using the angle
    model = rotate(angle, [0.0, 1.0, 0.0]);

    // TODO: Define a camera location
    var eye = vec3(2, 2, 2);

    // TODO: Define the target position
    var target = vec3(0, 0, 0);

    // TODO: Define the up direction
    var up = vec3(0, 1, 0);

    // TODO: Create view matrix.
    var view = lookAt(
        eye,
        target,
        up
    );


    // TODO: Calculate the aspect ratio.
    var aspect = canvas.width / canvas.height;

    // TODO: Create a projection matrix.
    var projection = perspective(45.0, aspect, 0.1, 1000.0);

    // TODO: Multiply the matrices before sending to the shader.
    var transform = mult(projection, mult(view, model));

    // TODO: Set the data of the transformation matrix.
    gl.uniformMatrix4fv(transform_loc, false, flatten(transform));

    // logMessage("Set uniform variables.")
}

// Handle for the vertex array object
var vao;

// Creates VAOs for vertex attributes
function createVertexArrayObjects() {

    // Create vertex array object
    vao = gl.createVertexArray();
    // Bind vertex array so we can modify it
    gl.bindVertexArray(vao);

    // Get shader location of the position vertex attribute.
    var pos_idx = gl.getAttribLocation(prog, "position");
    // Bind the position buffer again
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    // Specify the layout of the data using vertexAttribPointer.
    gl.vertexAttribPointer(pos_idx, 3, gl.FLOAT, false, 0, 0);
    // Enable this vertex attribute.
    gl.enableVertexAttribArray(pos_idx);

    // Repeat for the color vertex attribute. The size is now 4. 
    var col_idx = gl.getAttribLocation(prog, "color");
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.vertexAttribPointer(col_idx, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(col_idx);

    // Unbind array to prevent accidental modification.
    gl.bindVertexArray(null);

    logMessage("Created VAOs.");

}

var previousTimestamp;
function updateAngle(timestamp) {
    // TODO: Initialize previousTimestamp the first time this is called.
    if (previousTimestamp === undefined) {
        // console.log("previous" + previousTimestamp);
        previousTimestamp = timestamp;
    }

    // TODO: Calculate the change in time in seconds
    var delta = (timestamp - previousTimestamp) / 1000;

    // TODO: Update the angle using angularSpeed and the change in time
    angle += angularSpeed*delta;
    angle -= Math.floor(angle/360.0)*360.0;

    // TODO: Decrease the angular speed using the change in time
    angularSpeed = Math.max(angularSpeed - 100.0*delta, 0.0);

    // TODO: Update previousTimestamp
    previousTimestamp = timestamp;

}

// Draws the vertex data.
function render(timestamp) {
    // TODO: Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the rendering state to use the shader program
    gl.useProgram(prog);

    // TODO: Call updateAngle
    updateAngle(timestamp)

    // TODO: Update uniforms
    setUniformVariables();

    // Bind the VAO
    gl.bindVertexArray(vao);

    // TODO: Draw the correct number of vertices using the TRIANGLES mode.
    gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);

    // Call this function repeatedly with requestAnimationFrame.
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

        // TODO: Increase the rate of rotation
        angularSpeed += 50;
        
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