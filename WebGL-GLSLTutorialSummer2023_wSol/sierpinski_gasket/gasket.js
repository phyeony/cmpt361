
var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;

const MAX_SUBDIVISIONS = 8;


// Initializes the context using the Angel library helper functions.
function initializeContext() {
    // Get the canvas and setup the context
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
}

function init()
{
    // TODO: Call the initialize function context
    initializeContext();

    //  TODO: Use initShaders helper to load the vertex-shader and fragment
    // shader from the html page.
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );

    // TODO: Use the shader program
    gl.useProgram( program );

    // TODO: Create a new vertex buffer.
    var bufferId = gl.createBuffer();
    // TODO: Bind the buffer to ARRAY_BUFFER.
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId);

    // TODO: Allocate a buffer for 3^(max subdivisions + 1) vertices. The usage can
    // be set to DYNAMIC_DRAW. Note that each vertex consists of 2 float elements
    // and that each float is 4 bytes. WebGL expects the total size of the buffer in bytes.
    gl.bufferData(gl.ARRAY_BUFFER, 3**(MAX_SUBDIVISIONS+1)*2*4, gl.DYNAMIC_DRAW);

    // TODO: Set the vertex attribute pointer for the position attribute. 
    // It is okay to use the default VAO.
    var pos_loc = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);

    // TODO: Enable the vertex position attribute. 
    gl.enableVertexAttribArray(pos_loc);

    // TODO: Add a call to updateGasket for the initial subdivision level of 0.
    updateGasket(0);

    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        // TODO: Make the slider update the Gasket
        updateGasket(numTimesToSubdivide);
    };


    requestAnimationFrame(render);
};


// Takes in the number of subdivisions and updates the points and vertex buffer
// for the gasket.
function updateGasket(subdivisions) {
    //  Initialize our data for the Sierpinski Gasket

    // This data is defined in clockwise winding order.
    // Note that the default winding order is counterclockwise.
    const vertices = [
        vec2( -1, -1 ), // bottom left vertex (a)
        vec2(  0,  1 ), // top middle vertex (b)
        vec2(  1, -1 ) // bottom right vertex (c)
    ];

    // TODO: Clear the points array.
    points = [];

    // Divide the triangle
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    // TODO: Update the gasket vertex data using bufferSubData.
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
}

function divideTriangle( a, b, c, count )
{

    // Check for the base case.
    if ( count == 0 ) {
        // TODO: Push a triangle to the list of points
        points.push(a, b, c);
    }
    else {
    
        
        // TODO: Compute the points which bisect lines ab, ac, and bc, using the mix function.
        /*
                  b
                /   \
              ab     bc
             /        \
            a____ac____c

        */
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
        
        // TODO: Decrement the subdivision count.
        --count;

        /*
            TODO: We need to divide this triangle into
            3 more triangles since this is not the base case.

            Triangle 1: Vertices a, ab, ac.
            Triangle 2: Vertices c, ac, bc.
            Triangle 3: Vertices b, bc, ab.
        */
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

window.onload = init;

function render()
{

    // (Optional): See what happens when you enable face culling.
    // gl.enable(gl.CULL_FACE); // Note the winding order.

    // TODO: Clear the screen
    gl.clear( gl.COLOR_BUFFER_BIT );
    // TODO: Draw the correct number of vertices in TRIANGLES mode.
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    // TODO: Request the next frame
    requestAnimFrame(render);
}

