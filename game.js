/*
 * Game scene and logic
 */
Game = Class({
    initialize: function(gameWidth, gameHeight, gameElevation) {
        this.width = gameWidth;
        this.height = gameHeight;
        this.elevation = gameElevation;        
        this.shapes = [];
        this.shapeInstances = [];
        this.bricks = []; // Array of shapeInstances, suitable to move with whole group
        this.sunAngle = 0;
        this.sun2Angle = 0;
        this.sun = new Light();
        this.sun2 = new Light();

        var whiteTexture = new Texture('#FFFFFF', '#FFFFFF');

        // Create a floor shape #0
        this.addShape(new Cube(this.width, 0.1, this.height, new Texture('#00AA00', '#FFFFFF')));
        
        // Create a brick shape #1
        this.addShape(new Cube(1, 1, 1, new Texture('#00AAAA', '#FFFFFF')));

        // Create a corner shape #2
        this.addShape(new Cube(0.1, this.elevation/2, 0.1, whiteTexture))
        // Create a roof shape #3
        this.addShape(new Cube(this.width, 0.1, 0.1, whiteTexture));
        // Create a roof shape #4
        this.addShape(new Cube(0.1, 0.1, this.height, whiteTexture));

     
        
        // Create an instance of the floor
        this.shapeInstances.push({
            shape: 0, 
            location: [0, -0.1, 0],
            angle: [0, 0, 0]
        });

        // TESTING BRICK
        this.shapeInstances.push({
            shape: 1,
            location: [0,5,0],
            angle: [0,0,0],
            type: brickType1
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
        },
        // Test
        {
            shape: 1,
            location: [-this.width + 1, this.elevation-1, -this.height + 1],
            angle: [0, 0, 0]
        });


        // Corners instances
        this.shapeInstances.push({
        // Front left        
            shape: 2,
            location: [-this.width + 0.1, this.elevation/2, this.height - 0.1],
            angle: [0, 0, 0]
        }, {
        // Front right        
            shape: 2,
            location: [this.width - 0.1, this.elevation/2, this.height - 0.1],
            angle: [0, 0, 0]
        }, {
        // Back right        
            shape: 2,
            location: [this.width - 0.1, this.elevation/2, -this.height + 0.1],
            angle: [0, 0, 0]
        }, {
        // Back left        
            shape: 2,
            location: [-this.width + 0.1, this.elevation/2, -this.height + 0.1],
            angle: [0, 0, 0]
        }, {
        // Back width roof
            shape: 3,
            location: [0, this.elevation, -this.height + 0.1],
            angle: [0, 0, 0]
        }, {
        // Front width roof
            shape: 3,
            location: [0, this.elevation, +this.height - 0.1],
            angle: [0, 0, 0]
        }, {
        // Right height roof
            shape: 4,
            location: [this.width - 0.1, this.elevation, 0],
            angle: [0, 0, 0]
        }, {
        // Left hight roof
            shape: 4,
            location: [-this.width + 0.1, this.elevation, 0],
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
    applyShapeInstance: function(shapeInstance, brick) {
        if(!brick){
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
        } else {
            var temp = vec3.create(shapeInstance.location);
            //vec3.add(temp, shapeInstance.type[brick].location);
            mat4.translate(mvMatrix, temp);
            mat4.translate(mvMatrix, shapeInstance.type[brick].location);
        }
    },

    /*
     * Render all objects and their shadows
     */
    render: function() {
        var shapeInstances = this.shapeInstances;        

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        mat4.perspective(28, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, pMatrix);
        mat4.identity(mvMatrix);
    
        // Position of whole scene (center it in viewport)
        mat4.translate(mvMatrix, [0, -this.elevation / 2 + 2, -cameraZoom]);
        // And rotate to good overview
        mat4.rotateX(mvMatrix, cameraAngleX);
        mat4.rotateY(mvMatrix, cameraAngleY);

        this.sun.update(this.sunAngle);        
        this.sun2.update(this.sun2Angle);
    
        // Render all objects
        for (var i = shapeInstances.length-1; i >= 0; i--) {
            mvPushMatrix();
            if(shapeInstances[i].type){                
                for (var j = 0; j < this.shapeInstances[i].type.length; j++) {
                    this.applyShapeInstance(shapeInstances[i], j);
                    this.shapes[shapeInstances[i].shape].render();
                }
            } else {
                this.applyShapeInstance(shapeInstances[i], false);
                this.shapes[shapeInstances[i].shape].render();
            }
            mvPopMatrix();
        }
    
    },

    /*
     * Update angles (for now)
     */
    update: function(elapsed) {                                     
        this.sunAngle += 0.001 * elapsed;
        this.sun2Angle += 0.002 * elapsed;

    }


});