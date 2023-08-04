// Refered https://github.com/davidwparker/programmingtil-webgl for various drawings
// Refered https://webglfundamentals.org/webgl/lessons
// Refered https://learnopengl.com/Lighting/Multiple-lights
// https://www.cs.toronto.edu/~jacobson/phong-demo/
// https://stackoverflow.com/questions/38070899/how-to-interpolate-normals-for-phong-shading-in-opengl
import { get_vertices, get_faces } from "./cow.js";
import { loadShaders, compileShaders } from "./utility.js";
/*
    Initialization
*/

// The WebGL context.
var gl;
var canvas;
let program;

const faces = flatten(get_faces()).map((ele) => ele - 1);

// let viewMatLoc;
// let modelMatLoc;
let projectionMatLoc;
let modelViewMatLoc;
let normalVecLoc, colorLoc, lightWorldPosLoc, worldInverseTransposeMatLoc, viewWorldPositionLoc, modalWorldMatLoc, shininessLocation;

// state
let eye = { x: 0, y: 0, z: 30 };
let cowX = 0,
  cowY = 0,
  cowZ = 0;
let rotateX = 0,
  rotateY = 0,
  rotateZ = 0;

// Cube state
let cubeRotateX = 0,
  cubeRotateY = 0,
  cubeRotateZ = 0;
let autoRotate = true;

let rotateMat = mat4Identity();
let translationMat = translate(cowX, cowY, cowZ);

let cubeWorldCenterVec3 = vec3(8, 5, 5)

function mat4Identity() {
  // Create a new 4x4 identity matrix
  return mat4(
    vec4(1.0, 0.0, 0.0, 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(0.0, 0.0, 1.0, 0.0),
    vec4(0.0, 0.0, 0.0, 1.0)
  );
}

// Sets up the canvas and WebGL context.
function initializeContext() {
  canvas = document.getElementById("myCanvas");
  gl = canvas.getContext("webgl2");

  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = pixelRatio * canvas.clientWidth;
  canvas.height = pixelRatio * canvas.clientHeight;

  gl.viewport(0, 0, canvas.width, canvas.height);

  // gl.clearColor(1, 1, 1, 0);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.lineWidth(1.0);

  console.log("WebGL initialized.");
}

async function main() {
  initializeContext();
  // gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // Set event listeners
  setEventListeners(canvas);

  await loadShaders();
  program = compileShaders(gl);

  // get locations
  // viewMatLoc = gl.getUniformLocation(program, 'viewMat');
  // modelMatLoc = gl.getUniformLocation(program,'modelMat')
  projectionMatLoc = gl.getUniformLocation(program, "u_projectionMat");
  modelViewMatLoc = gl.getUniformLocation(program, "u_modelViewMat");
  colorLoc = gl.getUniformLocation(program, "u_color");
  lightWorldPosLoc =
      gl.getUniformLocation(program, "u_lightWorldPos");

  worldInverseTransposeMatLoc = gl.getUniformLocation(program, "u_worldInverseTranspose")
  modalWorldMatLoc = gl.getUniformLocation(program, "u_world");
  viewWorldPositionLoc = gl.getUniformLocation(program, "u_viewWorldPosition");

  shininessLocation = gl.getUniformLocation(program, "u_shininess");
  // // // Set up Attributes
  // var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  // var normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
  // gl.


    // gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(positionLoc);

  console.log("Start drawing");
  setNormal();
  draw();
  console.log("faces:", faces);
}

window.onload = main;



function draw() {
  // Clear the screen (for COLOR_BUFFER_BIT)
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set the rendering st`ate to use the shader program
  gl.useProgram(program);


  // Draw Cube
  autoRotateCube();
  drawCube();

  // Draw Cone
  autoPanCone();
  drawCone();


  // Draw Cow
  drawCow();

  requestAnimationFrame(draw);
}


const getNormalsPerFaceVectors = (vertices, faces) => {
  const normals = [];
  for (let i = 0; i < vertices.length; i++) {
    normals.push(vec3(0, 0, 0));
  }
  // Compute face normals and add them to the corresponding vertices
  for (let i = 0; i < faces.length; i += 3) {
    const v1 = vertices[faces[i]];
    const v2 = vertices[faces[i + 1]];
    const v3 = vertices[faces[i + 2]];

    const n = normalize(cross(subtract(v2, v1), subtract(v3, v1)));

    // normals[faces[i]] = add(normals[faces[i]], n);
    // normals[faces[i + 1]] = add(normals[faces[i + 1]], n);
    // normals[faces[i + 2]] = add(normals[faces[i + 2]], n);
    
    normals[faces[i]] = n
    normals[faces[i + 1]] = n
    normals[faces[i + 2]] = n
  }

  // Normalize the vertex normals
  for (let i = 0; i < normals.length; i++) {
    normals[i] = normalize(normals[i]);
  }

  return normals;
};
// const getNormalsPerFaceVectors = (vertices, faces) => {
//   const normals = [];
//   for (let i = 0; i < faces.length; i += 3) {
//     const v1 = vertices[faces[i]];
//     const v2 = vertices[faces[i + 1]];
//     const v3 = vertices[faces[i + 2]];

//     const n = normalize(cross(subtract(v2, v1), subtract(v3, v1)));
//     normals.push(normalize(vec3(n, n, n)));
//   }
//   return normals;
// }

function setNormal() {
  // Create a buffer for normals.
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  normalVecLoc = gl.getAttribLocation(program, "a_normal");
  gl.vertexAttribPointer(normalVecLoc, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(normalVecLoc);

  const normalVec = getNormalsPerFaceVectors(get_vertices(), faces)
  console.log("NORMAL:", normalVec)
  console.log('vec', get_vertices())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(normalVec)), gl.STATIC_DRAW)
}

function drawCow() {
  // Create the vertex buffer and color buffer
  const vertexBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  if (!vertexBuffer || !colorBuffer || !indexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // bind and fill vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(get_vertices())), gl.STATIC_DRAW);

  // bind and fill index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);

  // TODO: bind and fill colour buffer

  // lookAt -
  // out, eye, center, up
  // out = output matrix
  // eye = position of the "camera", or eyes, while "looking at" the center
  // center = the focal point, where we're looking
  // up = the "vertical" up direction from the center
  // var ex=0.25,ey=0.25,ez=1;
  const viewMat = lookAt(vec3(eye.x, eye.y, eye.z), vec3(0, 0, 0), vec3(0, 1, 0));
  
  //
  let modal2WorldMat = mat4();
  modal2WorldMat = mult(modal2WorldMat, translationMat);
  rotateMat = rotate(rotateX, [1, 0, 0]);
  rotateMat = mult(rotateMat, rotate(rotateY, [0, 1, 0]));
  rotateMat = mult(rotateMat, rotate(rotateZ, [0, 0, 1]));
  modal2WorldMat = mult(modal2WorldMat, rotateMat);
  const scalingMatrix = scalem(1.5, 1.5, 1.5);
  modal2WorldMat = mult(modal2WorldMat, scalingMatrix);
  
  const modelViewMat = mult(viewMat, modal2WorldMat);


  var fovy = 90.0;
  var aspect = canvas.width / canvas.height;
  var near = 0.0;
  var far = 10;
  const projectionMat = perspective(fovy, aspect, near, far);

  const worldInverseMat = inverse(modal2WorldMat);
  const worldInverseTransposeMat = transpose(worldInverseMat);  
  
  // Set Uniforms
  gl.uniformMatrix4fv(projectionMatLoc, false, flatten(projectionMat));
  gl.uniformMatrix4fv(modelViewMatLoc, false, flatten(modelViewMat));
  gl.uniformMatrix4fv(modalWorldMatLoc, false, flatten(modal2WorldMat));
  gl.uniformMatrix4fv(worldInverseTransposeMatLoc, false, flatten(worldInverseTransposeMat));

  var positionLoc = gl.getAttribLocation(program, "a_position");
  if (positionLoc < 0) {
    console.log("Failed to get the storage location of positionLoc");
    return -1;
  }
  gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  //colour
  // gl.uniform4fv(colorLoc, [0.7, 0.5, 0.2, 1.0]);
  // gl.uniform4fv(colorLoc, [0.85, 0.65, 0.13, 1.0]); // gold brown
  // set the light direction.



  // gl.uniform1f(shininessLocation, 60);

  setFragmentShaderUniforms(gl,program, cubeWorldCenterVec3) ;
  gl.uniform3fv(lightWorldPosLoc, cubeWorldCenterVec3);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_spotLightWorldPos'), vec3([0, 6, 6]))
  gl.uniform3fv(gl.getUniformLocation(program, 'u_pointLightPosition'), cubeWorldCenterVec3);
  gl.uniform3fv(viewWorldPositionLoc, vec3(eye.x, eye.y, eye.z));

  // console.log("FACES",get_faces())
  // draw
  gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0);

  // Delete the vertex buffer and color buffer
  gl.deleteBuffer(vertexBuffer);
  gl.deleteBuffer(colorBuffer);
  gl.deleteBuffer(indexBuffer);

}

function autoPanCone() {

}

function drawCone() {
  const coneVertices = [];
  const radius = 1.0; // Radius of the circular base
  const height = 2.0; // Height of the cone
  const segments = 12; // Number of vertices in the circular base
  
  // Vertex at the tip (top) of the cone
  coneVertices.push(0.0, height, 0.0);
  
  // Vertices for the circular base
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    coneVertices.push(x, 0.0, z);
  }

  const coneCenter = [0,6,6]

  // Create a buffer for the pyramid vertices and bind it
  const coneVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coneVertices), gl.STATIC_DRAW);

  // Set the attribute location and enable it
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const modelMat = translate(coneCenter[0], coneCenter[1], coneCenter[2]);
  const viewMat = lookAt(vec3(eye.x, eye.y, eye.z), vec3(0, 0, 0), vec3(0, 1, 0));
  const modelViewMat = mult(viewMat, modelMat);

  
  var fovy = 90.0;
  var aspect = canvas.width / canvas.height;
  var near = 0.0;
  var far = 10;
  const projectionMat = perspective(fovy, aspect, near, far);
  // gl.uniformMatrix4fv(viewMatLoc, false, flatten(viewMat))
  gl.uniformMatrix4fv(projectionMatLoc, false, flatten(projectionMat));
  // gl.uniformMatrix4fv(modelMatLoc, false, flatten(translationMat))
  gl.uniformMatrix4fv(modelViewMatLoc, false, flatten(modelViewMat));
  
  // Draw the pyramid (spotlight cone)
  gl.drawArrays(gl.LINE_LOOP, 0, coneVertices.length / 3);
  // Clean up the buffer
  gl.deleteBuffer(coneVertexBuffer);

}

// Function to handle auto-rotation of the cube
function autoRotateCube() {
  if (autoRotate) {
    cubeRotateY += 3;
  } 
}
function multMatrixVector(matrix, vector) {
  if (matrix.length === 0 || vector.length === 0) {
    throw "Empty matrix or vector.";
  }

  if (matrix[0].length !== vector.length) {
    throw "Matrix and vector dimensions do not match for multiplication.";
  }

  const result = [];
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < vector.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(sum);
  }

  return result;
}

function setFragmentShaderUniforms(gl, program, cubeWorldCenterVec3) {
  // Get the uniform locations for the fragment shader
  const u_colorLocation = gl.getUniformLocation(program, 'u_color');
  // Sample values for the uniforms (you can replace these with your desired values)
// const color = [0.85, 0.65, 0.13, 1.0]
  const shininess = 50.0;
  gl.uniform1f(shininessLocation, shininess);
  gl.uniform4fv(colorLoc, [0.3, 0.15, 0.05, 1.0] ) // golden brown
  // const numPointLights = 2;
  // In the drawCow() function or the function where you set the uniforms for the cow object

  // Set the uniform values for the point light
  const pointLightPosition = cubeWorldCenterVec3;
  const pointLightColor = [1.0, 1.0, 1.0];
  const pointLightIntensity = 0.4;
  // gl.uniform3fv(gl.getUniformLocation(program, 'u_pointLightPosition'), pointLightPosition);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_pointLightColor'), pointLightColor);
  gl.uniform1f(gl.getUniformLocation(program, 'u_pointLightIntensity'), pointLightIntensity);

  // Set the uniform values for the spot light
  const spotLightPosition = [0, 6, 6];
  const spotLightDirection = [0.0, -1.0, 0.0];
  const spotLightColor = [1.0, 1.0, 0.0];
  const spotLightIntensity = 0.5;
  const spotLightAngle =  15* Math.PI /180; // Adjust the angle as needed
  // gl.uniform3fv(gl.getUniformLocation(program, 'u_spotLightPosition'), spotLightPosition);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_spotLightDirection'), spotLightDirection);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_spotLightColor'), spotLightColor);
  gl.uniform1f(gl.getUniformLocation(program, 'u_spotLightIntensity'), spotLightIntensity);
  gl.uniform1f(gl.getUniformLocation(program, 'u_spotLightAngle'), spotLightAngle);

}

function drawCube() {
  // Calculate the world position of the center of the cube
  const cubeCenter = [8, 5, 5]; // The initial translation of the cube
  let cubeWorldCenter = vec4(cubeCenter[0], cubeCenter[1], cubeCenter[2], 1.0);

  // Step 1: Translate the cube to its initial position
  const initialTranslationMat = translate(8, 5, 5); // Translate to the initial position
  let model2World = initialTranslationMat;

  const rotationPoint = [8, 0, 0]; // The point around which the cube will rotate
  // Step 2: Apply the rotation around the rotation point
  const rotationMat = rotate(cubeRotateY, [0, 1, 0]);
  model2World = mult(model2World, translate(-rotationPoint[0], -rotationPoint[1], -rotationPoint[2]));
  model2World = mult(model2World, rotationMat);
  model2World = mult(model2World, translate(rotationPoint[0], rotationPoint[1], rotationPoint[2]));

  // Step 3: Apply the view matrix to bring the cube into the camera's view
  const viewMat2 = lookAt(vec3(eye.x, eye.y, eye.z), vec3(0, 0, 0), vec3(0, 1, 0));
  const modelViewMat2 = mult(viewMat2, model2World);

  cubeWorldCenter = multMatrixVector(model2World, cubeWorldCenter);
  // Convert the vec4 to vec3
  cubeWorldCenterVec3 = vec3(cubeWorldCenter[0], cubeWorldCenter[1], cubeWorldCenter[2]);
  
  // console.log("Cube world center:", cubeWorldCenterVec3);
  


  var fovy = 90.0;
  var aspect = canvas.width / canvas.height;
  var near = 0.0;
  var far = 10;
  const projectionMat2 = perspective(fovy, aspect, near, far);

  // gl.uniformMatrix4fv(viewMatLoc, false, flatten(viewMat))
  gl.uniformMatrix4fv(projectionMatLoc, false, flatten(projectionMat2));
  // gl.uniformMatrix4fv(modelMatLoc, false, flatten(translationMat))
  gl.uniformMatrix4fv(modelViewMatLoc, false, flatten(modelViewMat2));

  // gl.uniform4fv(colorLoc, [0.2, 1, 0.2, 1]); // green
  // Create the cube vertices and indices
  const cubeVertices = [
    // Front face
    -0.25, -0.25, 0.25,
    0.25, -0.25, 0.25,
    0.25, 0.25, 0.25,
    -0.25, 0.25, 0.25,
    // Back face
    -0.25, -0.25, -0.25,
    0.25, -0.25, -0.25,
    0.25, 0.25, -0.25,
    -0.25, 0.25, -0.25,
  ];
  
  const cubeIndices = [ 0, 1, 2, 3, 0, 4, 5, 6, 7, 4, 0, 3, 7, 6, 2, 1, 5];
  const cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

  const cubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Draw the cube
  gl.drawElements(gl.LINE_STRIP, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
}


/*
    Input Events
*/

function handleMouseMovement(event) {
  if (event.buttons === 1) {
    // Left mouse button pressed
    cowX += event.movementX * 0.5;
    cowY += event.movementY * 0.5;
    console.log("X, Y:", cowX, cowY);
    translationMat = translate(cowX, cowY, cowZ);
  } else if (event.buttons === 2) {
    // Right mouse button pressed
    rotateY -= event.movementY * 0.5; 
    rotateX -= event.movementX * 0.5;
    console.log("RotateX, RotateY:, RotateZ:", rotateX, rotateY, rotateZ);
  }
}

// Function to handle keyboard events (up and down arrows)
function handleKeyPress(event) {
  event.preventDefault();
  if (event.key === "ArrowUp") {
    cowZ += 3; // Increase Z translation
    translationMat = translate(cowX, cowY, cowZ);
    // drawCow();
  } else if (event.key === "ArrowDown") {
    cowZ -= 3; // Decrease Z translation
    translationMat = translate(cowX, cowY, cowZ);
  } else if (event.key === "ArrowLeft") {
    rotateZ += 3; 
    // rotateMat = rotate(rotateZ, [0, 0, 1]);
  } else if (event.key === "ArrowRight") {
    console.log("hi")
    rotateZ -= 3;
  } else if (event.key === "r") {
    cowX = 0;
    cowY = 0;
    cowZ = 0;
    rotateX = 0;
    rotateY = 0;
    rotateZ = 0;
    rotateMat = mat4Identity();
    translationMat = translate(cowX, cowY, cowZ);
  } else if (event.key === 'p') {
    autoRotate = !autoRotate;
  }
  console.log("X, Y, Z: ", cowX, cowY, cowZ);
  console.log("RotateX, RotateY, RotateZ: ", rotateX, rotateY, rotateZ);
}

function setEventListeners(canvas) {
  // Add event listeners
  canvas.addEventListener("mousemove", handleMouseMovement);
  canvas.addEventListener("mousedown", () => {
    canvas.addEventListener("mousemove", handleMouseMovement);
  });
  canvas.addEventListener("mouseup", () => {
    canvas.removeEventListener("mousemove", handleMouseMovement);
  });

  document.addEventListener("keydown", handleKeyPress);
  document.oncontextmenu = (event) => {
    event.preventDefault();
  };
}

