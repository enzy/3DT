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
gl = WebGLUtils.setupWebGL(canvas, {antialias:true});

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
  var moonVertexPositionBuffer;
  var moonVertexNormalBuffer;
  var moonVertexTextureCoordBuffer;
  var moonVertexIndexBuffer;
  initBuffers();
  
  // Textures initialization
  var moonTexture = initTexture("moon.gif");


  /*
   * Global initialization
   */

  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;

  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;

  var sceneRotationMatrix = mat4.create();
  mat4.identity(sceneRotationMatrix);

  var mvMatrix = mat4.create();
  var mvMatrixStack = [];
  var pMatrix = mat4.create();
  
  // Catch object state for debug purpose
  if(debugMode) console.log(gl);

  // Proceed to render cycle
  render();
}


/* ----------------------------------------------------- */

// Render function that draw scene on animationFrame event
function render() {
  window.requestAnimFrame(render, canvas); // loop
  

  //gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  // Decide to use directional lighting and pass it to shader
  // var lighting = true;
  // gl.uniform1i(shaderProgram.useLightingUniform, lighting);  

  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0, 0, -6]);
  mat4.multiply(mvMatrix, sceneRotationMatrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, moonTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, moonVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, moonVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, moonVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

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


function initBuffers() {
  


}



