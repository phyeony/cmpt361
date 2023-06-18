
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

    //  TODO: Use initShaders helper to load the vertex-shader and fragment
    // shader from the html page.

    // TODO: Use the shader program

    // TODO: Create a new vertex buffer.

    // TODO: Bind the buffer to ARRAY_BUFFER.

    // TODO: Allocate a buffer for 3^(max subdivisions + 1) vertices. The usage can
    // be set to DYNAMIC_DRAW. Note that each vertex consists of 2 float elements
    // and that each float is 4 bytes. WebGL expects the total size of the buffer in bytes.

    // TODO: Set the vertex attribute pointer for the position attribute. 
    // It is okay to use the default VAO.


    // TODO: Enable the vertex position attribute. 

    // TODO: Add a call to updateGasket for the initial subdivision level of 0.


    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        // TODO: Make the slider update the Gasket

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

    // Divide the triangle
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    // TODO: Update the gasket vertex data using bufferSubData.


}

function divideTriangle( a, b, c, count )
{

    // Check for the base case.
    if ( count == 0 ) {
        // TODO: Push a triangle to the list of points
        
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


        
        // TODO: Decrement the subdivision count.


        /*
            TODO: We need to divide this triangle into
            3 more triangles since this is not the base case.

            Triangle 1: Vertices a, ab, ac.
            Triangle 2: Vertices c, ac, bc.
            Triangle 3: Vertices b, bc, ab.
        */


    }
}

window.onload = init;

function render()
{

    // (Optional): See what happens when you enable face culling.
    // gl.enable(gl.CULL_FACE); // Note the winding order.

    // TODO: Clear the screen

    // TODO: Draw the correct number of vertices in TRIANGLES mode.

    // TODO: Request the next frame
    
}

