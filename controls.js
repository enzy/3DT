/*
 * Mouse move handling for free mouse camera
 */

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var cameraAnimation = false;
var madLights = false;
var nextMoveX = 0;
var nextMoveZ = 0;
var nextRotation = 0;
var backgroundToogle = false;

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
    //var newRotationMatrix = mat4.create();
    //mat4.identity(newRotationMatrix);
    //mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    // mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);

    //

    cameraAngleY += degToRad(deltaX * 0.5);
    cameraAngleX += degToRad(deltaY * 0.5);

    //mat4.multiply(newRotationMatrix, sceneRotationMatrix, sceneRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}

function handleMouseWheel(event) {
    /** kill default actions.*/
    if (event.preventDefault) event.preventDefault();
    event.returnValue = false;

    var deltaValue = 0;

    if (!event) /** For IE. */
        event = window.event;

    if(event.wheelDelta){ /** IE - Opera. */
        deltaValue = event.wheelDelta/120;

        if(window.opera) /** Opera 9. */
            deltaValue = -deltaValue;

    } else if(event.detail){/** Mozilla. In Mozilla delta is multiple of 3 */
        deltaValue = -event.detail/3;
    }

    if (deltaValue)  {
        cameraZoom += deltaValue * 3;
    }
}

function toogleCameraAnimation(){
    if(cameraAnimation){
        clearInterval(cameraAnimation);
        cameraAnimation = false;
    } else {
        cameraAnimation = setInterval(function(){
            cameraAngleY += degToRad(2);
        }, 10);
    }
}

function toogleMadLights(){
    if(madLights){
        madLights = false;
    } else {
        madLights = true;
    }
}

function handleKeyPress(event){
    console.log(event.keyCode, event.charCode);
    switch (event.keyCode) {
        case 38:
        case 119:
            // up
            nextMoveZ--;
            break;
        case 40:
        case 115:
            // down
            nextMoveZ++;
            break;
        case 37:
        case 97:
            // left
            nextMoveX--;
            break;
        case 39:
        case 100:
            // Right
            nextMoveX++;
            break;
        default:
            break;
    }
    switch (event.charCode){
        case 32:
            // spacebar
            nextRotation++;
            break;
        default:
            break;
    }

}

function toogleBackgroundOpacity(){
    if(backgroundToogle){
        backgroundToogle = false;
        gl.clearColor(0.0, 0.0, 0.0, 0);
    } else {
        backgroundToogle = true;
        gl.clearColor(0.0, 0.0, 0.0, 1);
    }
}