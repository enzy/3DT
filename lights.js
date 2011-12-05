/*
 * Simple flying directional light
 */
Light = Class({
    initialize: function() {
        // Create a small pyramid to show the light position
        this.cube = new Pyramid(0.2, 0.2, 0.2, new Texture('#FFDD00', '#FFDD00'));
        // Color atributes
        this.lightingColor = [2, 2, 2];
        this.ambientColor = [0.1, 0.1, 0.1];
    },
      
    /*
     * Update the light source position, render a cube to show the position
     */
    update: function(angle) {
        this.location = vec3.create([Math.sin(angle) * 10, 18 + Math.cos(angle * 0.5) * 10, Math.cos(angle * 0.8) * 10]);

        if(madLights){
            this.lightingColor[0] = Math.sin(angle) + 1;
            this.lightingColor[1] = Math.sin(angle * 0.5) + 1;
            this.lightingColor[2] = Math.sin(angle * 0.8) + 1;
        } else {
            this.lightingColor = [2, 2, 2];
        }
                    
        mvPushMatrix();
        // Move to the light position
        mat4.translate(mvMatrix, this.location);                     
      
        // Render the cube
        this.cube.render();

        // Set the light position, color and the ambient color
        gl.uniform3f(shaderProgram.uLightingLocation, mvMatrix[12], mvMatrix[10], mvMatrix[14]);            
        gl.uniform3f(shaderProgram.uLightingColor, this.lightingColor[0], this.lightingColor[1], this.lightingColor[2]);
        gl.uniform3f(shaderProgram.uAmbientColor,  this.ambientColor[0], this.ambientColor[1], this.ambientColor[2]);
        mvPopMatrix();
    }
       
});