/*
 *  3DT - 3D Tetris in WebGL
 *
 *  Author: Matej Simek - www.matejsimek.cz
 *  Date: 9.11.2011
 *
 *  Dependency: WebGL, webgl-utils.js, webgl-trace.js, gl-matrix.js
 */

// Debug mode for code tracing
var debugMode = false;
// Canvas element
var canvas = document.getElementById("canvas");  
// Setup a WebGL context
gl = WebGLUtils.setupWebGL(canvas);

// Continue only with working context
if(gl){
  
  // Wrap WebGL context with webgltrace
  if(debugMode){    
    gl = WebGLDebugUtils.makeDebugContext(gl);
    gl.setTracing(true); // Enable tracing
  }
  
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black, fully opaque  
  gl.enable(gl.DEPTH_TEST); // Enable depth testing  
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things  
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); // Clear the color as well as the depth buffer.   

  // Initialize the shaders; this is where all the lighting for the
  // vertices and so forth is established.  
  var shaderProgram;
  initShaders();
    
  // Here's where we call the routine that builds all the objects
  // we'll be drawing.      


  /*
   * Global initialization
   */  
  var mvMatrix = mat4.create();
  var mvMatrixStack = [];
  var pMatrix = mat4.create();

  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;

  var sceneRotationMatrix = mat4.create();
  mat4.identity(sceneRotationMatrix);

  var lastTime = 0;  

  // Start new game!
  var currentGame = new Game();

  // Catch object state for debug purpose
  if(debugMode) console.log(gl);  

  // Proceed to render cycle
  render();
}


/* ----------------------------------------------------- */

// Render function that draw scene on animationFrame event
function render() {
  window.requestAnimFrame(render, canvas); // loop  

  currentGame.render();
  animate();
}

function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
      currentGame.update(timeNow - lastTime);
  }
  lastTime = timeNow;
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  gl.uniformMatrix4fv(shaderProgram.nSceneUniform, false, sceneRotationMatrix);

  var normalMatrix = mat3.create();
  mat4.toInverseMat3(mvMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}


/*
 * Initialize the shaders, so WebGL knows how to light our scene.
 */
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);  

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.nSceneUniform = gl.getUniformLocation(shaderProgram, "uSceneMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

  shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
  shaderProgram.useColorUniform = gl.getUniformLocation(shaderProgram, "uUseColor");

  shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  shaderProgram.lightingLocationUniform = gl.getUniformLocation(shaderProgram, "uLightingLocation");
  shaderProgram.lightingColorUniform = gl.getUniformLocation(shaderProgram, "uLightingColor");
}

/*
 * Loads a shader program by scouring the current document, looking for a script with the specified ID.
 */
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the shader source string.  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have, based on its MIME type.  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program  
  gl.compileShader(shader);
  
  // See if it compiled successfully  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}



