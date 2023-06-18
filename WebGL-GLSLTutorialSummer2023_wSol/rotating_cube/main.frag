#version 300 es

// Define the input to the fragment shader
// based on the output from the vertex shader,, assuming
// there are no intermediate shader stages.
in mediump vec4 vertexColor;

// Define the color output.
out mediump vec4 outputColor;

void main() {
    // Write the color to the output.
    outputColor = vertexColor;
}