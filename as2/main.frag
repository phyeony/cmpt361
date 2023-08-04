#version 300 es

precision highp float;


// in mediump vec4 vertexColor;
// Passed in and varied from the vertex shader.
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToSpotLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightDirection;
uniform float u_limit;          // in dot space


// Point light properties
// uniform int u_numPointLights; // Number of point lights
uniform vec3 u_pointLightPosition; // Array of point light positions
uniform vec3 u_pointLightColor; // Array of point light colors
uniform float u_pointLightIntensity; // Array of point light intensities

// Spot light properties
// uniform int u_numSpotLights; // Number of spot lights
uniform vec3 u_spotLightPosition; // Array of spot light positions
uniform vec3 u_spotLightDirection; // Array of spot light directions
uniform vec3 u_spotLightColor; // Array of spot light colors
uniform float u_spotLightIntensity; // Array of spot light intensities
uniform float u_spotLightAngle; // Array of spot light angles (cosine of the angle)


// Define the color output.
out mediump vec4 outputColor;

void main() {
    // Normalize the interpolated normal vector to make it a unit vector
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLightDirection;
    vec3 surfaceToSpotLightDirection;
    vec3 halfVector;
    float light;
    float specular;
    // Initialize the final color as the object's color
    vec3 finalColor = u_color.rgb;

    // Add ambient
    float ambientCoefficient = 0.3;
    vec3 ambientColor =  vec3(0.85, 0.65, 0.13) * 0.5;
    finalColor += ambientCoefficient * ambientColor * u_color.rgb;
    
    // surfaceToLightDirection = normalize(u_pointLightPosition - gl_FragCoord.xyz);
    surfaceToLightDirection = normalize(v_surfaceToLight);
    light = dot(normal, surfaceToLightDirection);

    if (light > 0.0) {
        // Add diffuse contribution from the point light
        // intensity => coefficient
        vec3 diffuseColor = u_pointLightColor * u_pointLightIntensity * light;
        finalColor += diffuseColor;
        
        // Calculate the half vector for specular reflection
        halfVector = normalize(surfaceToLightDirection + normalize(v_surfaceToView));
        
        specular = pow(max(dot(normal, halfVector), 0.0), u_shininess);
        // Add specular contribution from the point light
        finalColor += u_pointLightColor * u_pointLightIntensity * specular;
    }


    // Calculate the contribution from spot lights
    // surfaceToLightDirection = normalize(u_spotLightPosition - gl_FragCoord.xyz);
    surfaceToSpotLightDirection = normalize(v_surfaceToSpotLight);

    light = dot(normal, surfaceToSpotLightDirection);
    if (light > 0.0) {
        // Check if the fragment is within the spot light's cone angle
        float dotFromDirection = dot(surfaceToSpotLightDirection, -(u_spotLightDirection));
        if (dotFromDirection >= u_spotLightAngle) {
            // Add diffuse contribution from the spot light
            vec3 diffuseColor = u_spotLightColor * u_spotLightIntensity * light;
            finalColor += diffuseColor;

            // Calculate the half vector for specular reflection
            halfVector = normalize(surfaceToSpotLightDirection + normalize(v_surfaceToView));
            specular = pow(max(dot(normal, halfVector), 0.0), u_shininess);
            // Add specular contribution from the spot light
            finalColor += u_spotLightColor * u_spotLightIntensity * specular;
        }
    }


    outputColor = vec4(finalColor, u_color.a);
}
