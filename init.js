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

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

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

  // Now the boring part
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  // shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
  // shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  // shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
  // shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
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
  /*var latitudeBands = 30;
  var longitudeBands = 30;
  var radius = 2;

  var vertexPositionData = [];
  var normalData = [];
  var textureCoordData = [];
  for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
    var theta = latNumber * Math.PI / latitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
      var phi = longNumber * 2 * Math.PI / longitudeBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longNumber / longitudeBands);
      var v = 1 - (latNumber / latitudeBands);

      normalData.push(x);
      normalData.push(y);
      normalData.push(z);
      textureCoordData.push(u);
      textureCoordData.push(v);
      vertexPositionData.push(radius * x);
      vertexPositionData.push(radius * y);
      vertexPositionData.push(radius * z);
    }
  }

  var indexData = [];
  for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
    for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
      var first = (latNumber * (longitudeBands + 1)) + longNumber;
      var second = first + longitudeBands + 1;
      indexData.push(first);
      indexData.push(second);
      indexData.push(first + 1);

      indexData.push(second);
      indexData.push(second + 1);
      indexData.push(first + 1);
    }
  }

  moonVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
  moonVertexNormalBuffer.itemSize = 3;
  moonVertexNormalBuffer.numItems = normalData.length / 3;

  moonVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
  moonVertexTextureCoordBuffer.itemSize = 2;
  moonVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

  moonVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
  moonVertexPositionBuffer.itemSize = 3;
  moonVertexPositionBuffer.numItems = vertexPositionData.length / 3;

  moonVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
  moonVertexIndexBuffer.itemSize = 1;
  moonVertexIndexBuffer.numItems = indexData.length;*/

  
}


/*
 * Load and return texture object
 */
function initTexture(texturePath) {  
  var texture = gl.createTexture();
  texture.image = new Image();
  texture.image.onload = function () {
      handleLoadedTexture(texture)
  }
  texture.image.src = texturePath;

  return texture;
}

/*
 * Textures handling
 */
function handleLoadedTexture(texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.bindTexture(gl.TEXTURE_2D, null);
}



/*
 * Converts degrees to radians
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/*
 * Mouse move handling for free mouse camera
 */
function handleMouseDown(event) {
  mouseDown = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}
function handleMouseUp(event) {
  mouseDown = false;
}
function handleMouseMove(event) {
  if (!mouseDown) {
    return;
  }
  var newX = event.clientX;
  var newY = event.clientY;

  var deltaX = newX - lastMouseX
  var newRotationMatrix = mat4.create();
  mat4.identity(newRotationMatrix);
  mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);

  var deltaY = newY - lastMouseY;
  mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

  mat4.multiply(newRotationMatrix, sceneRotationMatrix, sceneRotationMatrix);

  lastMouseX = newX
  lastMouseY = newY;
}