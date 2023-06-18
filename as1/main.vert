#version 300 es

// Define the inputs. The first input
// will be the position and the second will be
// the color.
layout(location = 0) in vec3 position;
layout(location = 1) in vec4 color;

// Define the outputs. Since the output for the vertex
// position is a built-in variable, we just need to define
// an output for the color. Note that the default interpolation 
// qualifier is smooth, so it is not neccessary to write.
smooth out vec4 vertexColor;

// Define a uniform mat4 variable for the
// transformation matrix.
uniform mat4 transform;

// Per-vertex transformations 
// should be computed in the vertex shader.
void main() {

    // Write the position to gl_Position.
    // Remember, we need to use homogenous coordinates.
    gl_Position = transform*vec4(position, 1.0f);

    // Write the color to the output defined earlier.
    vertexColor = color;

}