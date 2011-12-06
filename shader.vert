attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uAmbientColor;
uniform vec3 uLightingLocation;
uniform vec3 uLightingColor;
// uniform vec3 uPointLightingDirection;

// uniform float uInnerAngle;
// uniform float uOuterAngle;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main(void) {  
    vec4 mvPosition = uMVMatrix  * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * mvPosition;
    vTextureCoord = aTextureCoord;
            
    vec3 lightDirection = normalize(uLightingLocation - mvPosition.xyz);
    vec3 transformedNormal = uNMatrix * aVertexNormal;

    float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
    
    vLightWeighting = uAmbientColor + uLightingColor * directionalLightWeighting;    
    
    
    // float diff = acos(dot(lightDirection, normalize(uPointLightingDirection)));

    // if (diff < uInnerAngle){
    //     vLightWeighting += uLightingColor * directionalLightWeighting;
    // }
    // else if (diff <= uOuterAngle) {
    //     // scalingFactor - gives a gradient between two circles
    //     float c = (uOuterAngle - diff) / (uOuterAngle - uInnerAngle);
    //     vLightWeighting += uLightingColor * directionalLightWeighting * vec3(c,c,c);
    // }
    
  
}