#version 300 es

// Attributes
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec4 a_color;
layout(location = 2) in vec3 a_normal;

//Varyings
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;
out vec3 v_surfaceToSpotLight;
// out vec3 v_normalInterp;

// Define the outputs. Since the output for the vertex
// position is a built-in variable, we just need to define
// an output for the color. Note that the default interpolation 
// qualifier is smooth, so it is not necessary to write.
smooth out vec4 v_vertexColor;

//Uniform
uniform mat4 u_projectionMat;
uniform mat4 u_modelViewMat;
uniform mat4 u_worldMat; // transformation
uniform mat4 u_worldInverseTranspose;

uniform vec3 u_viewWorldPosition;
uniform vec3 u_lightWorldPos;
uniform vec3 u_spotLightWorldPos;

// Per-vertex transformations 
// should be computed in the vertex shader.
void main() {

    // Write the position to gl_Position.
    // Remember, we need to use homogeneous coordinates.
    gl_Position = u_projectionMat * u_modelViewMat * vec4(a_position, 1.0f);

    // Orient the normals and pass them to the fragment shader
    // Interpolation for Phong Shading is done before fragment shader
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
    
    // Compute the world position of the surface
    vec3 surfaceWorldPosition = (u_worldMat * vec4(a_position, 1.0)).xyz;
    
    // Compute the vector of the surface to the light
    // and pass it to the fragment shader
    v_surfaceToLight =  u_lightWorldPos - surfaceWorldPosition;
    v_surfaceToSpotLight = u_spotLightWorldPos - surfaceWorldPosition;

    // compute the vector of the surface to the view/camera
    // and pass it to the fragment shader
    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
    // // Write the color to the output defined earlier.
    // v_vertexColor = color;
}
