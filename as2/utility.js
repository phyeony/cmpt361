// Shader sources
var vs_source;
var fs_source;

// Shader handles
var vs;
var fs;
var prog;

    
export function loadShaderFile(url) {
  return fetch(url).then((response) => response.text());
}

// Loads the shader data from the files.
export async function loadShaders() {
  // Specify shader URLs for your
  // local web server.
  const shaderURLs = ["./main.vert", "./main.frag"];

  // Load shader files.
  const shader_files = await Promise.all(shaderURLs.map(loadShaderFile));

  // Assign shader sources.
  vs_source = shader_files[0];
  fs_source = shader_files[1];

  console.log("Shader files loaded.");
}


// Compile the GLSL shader stages and combine them
// into a shader program.
export function compileShaders(gl) {
  vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vs_source);
  gl.compileShader(vs);

  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(vs));
    gl.deleteShader(vs);
  }

  // TODO: Repeat for the fragment shader.
  fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fs_source);
  gl.compileShader(fs);

  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fs));
    gl.deleteShader(fs);
  }

  prog = gl.createProgram();

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);

  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
  }
  console.log("Shader program compiled successfully.");
  return prog
}
