#version 300 es

// TODO: Define the input to the fragment shader
// based on the output from the vertex shader,, assuming
// there are no intermediate shader stages.
in mediump vec4 vertexColor;

// TODO: Define the color output.
out mediump vec4 outputColor;

void main() {
    // TODO: Write the color to the output.
    outputColor = vertexColor;
}