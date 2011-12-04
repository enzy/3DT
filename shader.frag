#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;
varying vec4 vColor;

uniform sampler2D uSampler;

uniform bool uUseColor;
uniform float uAlpha;

void main(void) {
  if (!uUseColor) {
    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    
    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
    
  }
  else {
    gl_FragColor = vColor * uAlpha;
  }
}
