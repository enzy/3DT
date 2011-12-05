/*
 *  3DT - 3D Tetris in WebGL
 *
 *  Author: Matej Simek - www.matejsimek.cz
 *  Date: 9.11.2011
 *
 *  Dependency: WebGL, webgl-utils.js, webgl-trace.js, gl-matrix.js
 */

// Debug mode for code tracing
var debugMode = true;
// Canvas element
var canvas = document.getElementById("canvas");  
// Setup a WebGL context
/* @type HTMLCanvasElement */
var gl = WebGLUtils.setupWebGL(canvas);

// Continue only with working context
if(gl){
  
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 1); // Set clear color to black, fully opaque
    gl.enable(gl.DEPTH_TEST); // Enable depth testing  
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things  
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); // Clear the color as well as the depth buffer.

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.  
    var shaderProgram;
    initShaders();    


    /*
     * Global initialization
     */  
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    var cameraAngleX = degToRad(20);
    var cameraAngleY = 0;
    var cameraZoom = 70;

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    if (window.addEventListener) window.addEventListener('DOMMouseScroll', handleMouseWheel, false);
    window.onmousewheel = document.onmousewheel = handleMouseWheel;

    var lastTime = 0;  

    // Start new game!
    var gameWidth = 10;
    var gameHeight = 10;
    var gameElevation = 20;    
    var currentGame = new Game(gameWidth, gameHeight, gameElevation, cameraZoom);

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
    gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.uMVMatrix, false, mvMatrix);    

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.uNMatrix, false, normalMatrix);
}


/*
 * Initialize the shaders, so WebGL knows how to light our scene.
 */
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var fragmentShaderAttributes = ExtractUniformsFromShaderSource(fragmentShader.source);

    var vertexShader = getShader(gl, "shader-vs");
    var vertexShaderAttributes = ExtractUniformsFromShaderSource(vertexShader.source);

    console.log("Fragment shader's uniforms:", fragmentShaderAttributes, "Vertex shader's uniforms:", vertexShaderAttributes);    
  
    // Create the shader program  
    window.shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader.shader);
    gl.attachShader(shaderProgram, fragmentShader.shader);
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

    // Apply vertex shader uniforms
    for (var i = 0; i < vertexShaderAttributes.length; i++) {
        shaderProgram[vertexShaderAttributes[i]] = gl.getUniformLocation(shaderProgram, vertexShaderAttributes[i]);
    }
    // Apply fragment shader uniforms
    for (var i = 0; i < fragmentShaderAttributes.length; i++) {
        shaderProgram[fragmentShaderAttributes[i]] = gl.getUniformLocation(shaderProgram, fragmentShaderAttributes[i]);
    }

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
    // Eventualy load external file via AJAX call
    if(!currentChild && shaderScript.src){    
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", shaderScript.src, false);    
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                theSource = xmlhttp.responseText;
            }
        }
        xmlhttp.send();
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
  
    return {shader:shader, source:theSource};
}



