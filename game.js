/*
 * Game scene and logic
 */
Game = Class({
    initialize: function(gameWidth, gameHeight, gameElevation, gameZoom) {
        this.width = gameWidth;
        this.height = gameHeight;
        this.elevation = gameElevation;
        this.zoom = gameZoom;
        this.shapes = [];
        this.shapeInstances = [];
        this.objects = []; // Array of shapeInstances, suitable to move with whole group
        this.cubeAngle = 0;
        this.sunAngle = 0;
        this.sun2Angle = 0;
        this.sun = new Light();
        this.sun2 = new Light();

        // Create a floor shape #0
        this.addShape(new Cube(this.width, 0.1, this.height, new Texture('#00AA00', '#FFFFFF')));
        
        // Create a brick shape #1
        this.addShape(new Cube(1, 1, 1, new Texture('#00AAAA', '#FFFFFF')));
        
        // Create an instance of the floor
        this.shapeInstances.push({
            shape: 0, 
            location: [0, -0.1, 0],
            angle: [0, 0, 0]
        },
        // And the roof for debug
        {
            shape: 0,
            location: [0, this.elevation + 0.1, 0], 
            angle: [0, 0, 0]
        });
    
        // Testing brickes in corners
        // Front left
        this.shapeInstances.push({
            shape: 1, 
            location: [-this.width + 1, 1, this.height - 1], 
            angle: [0, 0, 0]
        },
        // Front right
        {
            shape: 1, 
            location: [this.width - 1, 1, this.height - 1], 
            angle: [0, 0, 0]
        },
        // Back right
        {
            shape: 1, 
            location: [this.width - 1, 1, -this.height + 1], 
            angle: [0, 0, 0]
        },
        // Back left
        {
            shape: 1, 
            location: [-this.width + 1, 1, -this.height + 1], 
            angle: [0, 0, 0]
        });                   
    
    },

    /*
   * Add a shape to the list
   */
    addShape: function(shape) {      
        this.shapes.push(shape);
        console.log("Creatign shape:", shape);
    },

    /*
   * Update the matrix for the given shape instance
   */
    applyShapeInstance: function(shapeInstance) {
        mat4.translate(mvMatrix, shapeInstance.location);
        if (shapeInstance.angle[0] !== 0) {
            mat4.rotateX(mvMatrix, shapeInstance.angle[0]);
        }
        if (shapeInstance.angle[1] !== 0) {
            mat4.rotateY(mvMatrix, shapeInstance.angle[1]);
        }
        if (shapeInstance.angle[2] !== 0) {
            mat4.rotateZ(mvMatrix, shapeInstance.angle[2]);
        }
    },

    /**
   * Render all objects and their shadows
  **/
    render: function() {
        var shapeInstances = this.shapeInstances;                

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        mat4.perspective(28, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, pMatrix);
        mat4.identity(mvMatrix);
    
        // Position of whole scene (center it in viewport)
        mat4.translate(mvMatrix, [0, -this.elevation / 2 + 2, -this.zoom]);
        // And rotate to good overview
        mat4.rotateX(mvMatrix, degToRad(20));
        mat4.rotateY(mvMatrix, degToRad(-this.cubeAngle * 0.5));

        this.sun.update(this.sunAngle);        
        this.sun2.update(this.sun2Angle);
    
        // Render all objects
        for (i = shapeInstances.length-1; i >= 0; i--) {
            mvPushMatrix();
            this.applyShapeInstance(shapeInstances[i]);
            this.shapes[shapeInstances[i].shape].render();
            mvPopMatrix();
        }

    
    },

    /*
     * Update angles (for now)
     */
    update: function(elapsed) {
        var shapeInstances = this.shapeInstances;
      
        this.cubeAngle   += 0.1  * elapsed;
        this.sunAngle    += 0.001 * elapsed;
        this.sun2Angle    += 0.002 * elapsed;
      
        
        
    }


});