attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform mat4 uSceneMatrix;

uniform vec3 uAmbientColor;

uniform vec3 uLightingLocation;
uniform vec3 uLightingColor;


uniform bool uUseColor;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

varying vec4 vColor;

attribute vec4 aVertexColor;

void main(void) {
  if (!uUseColor) {
    vec4 mvPosition = uMVMatrix  * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uSceneMatrix * mvPosition;
    vTextureCoord = aTextureCoord;

            
    vec3 lightDirection = normalize(uLightingLocation - mvPosition.xyz);

    vec3 transformedNormal = uNMatrix * aVertexNormal;
    float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
    vLightWeighting = uAmbientColor + uLightingColor * directionalLightWeighting;    
  }
  else {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
  }
}