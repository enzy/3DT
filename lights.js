

Light = Class({
  initialize: function() {
    // Create a small cube to show the light position...
    this.cube = new Cube(0.2, 0.2, 0.2, createTexture('#FFFFFF', '#FFDD00'));
  },
      
  /*
   * Update the light source position, render a cube to show the position...
   */
  update: function(angle) {
    this.location = vec3.create([     Math.sin(angle)       * 6, 
                                 18 + Math.cos(angle * 0.5) * 4, 
                                      Math.cos(angle * 0.8) * 9]);
            
    mvPushMatrix();
      // Move to the light position...
      mat4.translate(mvMatrix, this.location);
      
      gl.stencilFunc(gl.NEVER, 0, 255);

      // Set alpha, disable lighting...
      gl.uniform1f(shaderProgram.alphaUniform,       1);
      gl.uniform1i(shaderProgram.useLightingUniform, 0);
      
      // Render the cube...
      this.cube.render();

      // Set the light position, color and the ambient color...
      gl.uniform3f(shaderProgram.lightingLocationUniform, mvMatrix[12], mvMatrix[13], mvMatrix[14]);            
      gl.uniform3f(shaderProgram.lightingColorUniform, 0.5, 0.5, 0.5);
      gl.uniform3f(shaderProgram.ambientColorUniform,  0.5, 0.5, 0.5);
    mvPopMatrix();
  }
       
});