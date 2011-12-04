/*
 * Simple flying directional light
 */
Light = Class({
    initialize: function() {
        // Create a small cube to show the light position
        this.cube = new Cube(0.2, 0.2, 0.2, new Texture('#FFDD00', '#FFDD00'));
    },
      
    /*
   * Update the light source position, render a cube to show the position
   */
    update: function(angle) {
        this.location = vec3.create([Math.sin(angle) * 10, 18 + Math.cos(angle * 0.5) * 10, Math.cos(angle * 0.8) * 10]);
        
            
        mvPushMatrix();
        // Move to the light position
        mat4.translate(mvMatrix, this.location);
      
        gl.stencilFunc(gl.NEVER, 0, 255);

        // Set alpha, disable lighting
        gl.uniform1f(shaderProgram.uAlpha,       1);        
      
        // Render the cube
        this.cube.render();

        // Set the light position, color and the ambient color
        gl.uniform3f(shaderProgram.uLightingLocation, mvMatrix[12], mvMatrix[10], mvMatrix[14]);            
        gl.uniform3f(shaderProgram.uLightingColor, 2, 2, 2);
        gl.uniform3f(shaderProgram.uAmbientColor,  0.1, 0.1, 0.1);
        mvPopMatrix();
    }
       
});