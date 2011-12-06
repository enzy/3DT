/*
 * Game scene and logic
 */
Game = Class({
    initialize: function(gameWidth, gameHeight, gameElevation, gameTimeStep) {
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

        this.timer = 0;
        this.timeStep = gameTimeStep;

        this.spawnLocation = [-1, this.elevation+1, 1];

        var whiteTexture = new Texture('#FFFFFF', '#FFFFFF');

        // Create a floor shape #0
        this.addShape(new Cube(this.width, 0.1, this.height, new VideoTexture()));

        // Create a brick shape #1
        this.addShape(new Cube(1, 1, 1, new Texture('#00FFFF', '#000000')));

        // Create a corner shape #2
        this.addShape(new Cube(0.1, this.elevation/2, 0.1, whiteTexture))
        // Create a roof shape #3
        this.addShape(new Cube(this.width, 0.1, 0.1, whiteTexture));
        // Create a roof shape #4
        this.addShape(new Cube(0.1, 0.1, this.height, whiteTexture));

        // Oriented pyramid for some form of navigation #5
        this.addShape(new Pyramid(0.5, 2, 0.5, new Texture('#FFDD00', '#FFDD00')));

        // Skybox shape #6
        var skybox = new Cube(this.width+1, this.elevation/2+1, this.height+1, whiteTexture);
        skybox.setFlipSided();
        this.addShape(skybox);
        this.shapeInstances.push({
            shape: 6,
            location: [0, this.elevation/2, 0],
            angle: [0, 0, 0]
        });


        // Create an instance of the floor
        this.shapeInstances.push({
            shape: 0,
            location: [0, -0.1, 0],
            angle: [0, 0, 0]
        });


        // Testing brickes in corners
        // Front left
        //        this.shapeInstances.push({
        //            shape: 1,
        //            location: [-this.width + 1, 1, this.height - 1],
        //            angle: [0, 0, 0]
        //        },
        //        // Front right
        //        {
        //            shape: 1,
        //            location: [this.width - 1, 1, this.height - 1],
        //            angle: [0, 0, 0]
        //        },
        //        // Back right
        //        {
        //            shape: 1,
        //            location: [this.width - 1, 1, -this.height + 1],
        //            angle: [0, 0, 0]
        //        },
        //        // Back left
        //        {
        //            shape: 1,
        //            location: [-this.width + 1, 1, -this.height + 1],
        //            angle: [0, 0, 0]
        //        },
        //        // Test
        //        {
        //            shape: 1,
        //            location: [-this.width + 1, this.elevation-1, -this.height + 1],
        //            angle: [0, 0, 0]
        //        });


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

        // Oriented pyramid
        this.shapeInstances.push({
            shape: 5,
            location: [this.width + 1, this.elevation/2, 0],
            angle: [degToRad(-90), 0, 0]
        })


        // Add starting brick
        this.addRandomBrick();

    },

    /*
     * Add a shape to the list
     */
    addShape: function(shape) {
        this.shapes.push(shape);
        if(debugMode) console.log("Creatign shape:", shape);
    },

    /*
     * Update the matrix for the given shape instance
     */
    applyShapeInstance: function(shapeInstance, brick) {
        if(brick === false){
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
        }
        // Shape is combined, treat it in different way
        else {
            var groupPosition = vec3.create(shapeInstance.location);
            var elementPosition = shapeInstance.type[brick].location;
            // TODO
            if (shapeInstance.angle[0] !== 0) {
                mat4.rotateX(mvMatrix, shapeInstance.angle[0]);
            }
            if (shapeInstance.angle[1] !== 0) {
                mat4.rotateY(mvMatrix, shapeInstance.angle[1]);
            }
            if (shapeInstance.angle[2] !== 0) {
                mat4.rotateZ(mvMatrix, shapeInstance.angle[2]);
            }

            vec3.add(groupPosition, elementPosition);
            mat4.translate(mvMatrix, groupPosition);
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
            // Treat bricks in different way, than ordinary single shape
            if(shapeInstances[i].type){
                for (var j = 0; j < this.shapeInstances[i].type.length; j++) {
                    mvPushMatrix();
                    this.applyShapeInstance(shapeInstances[i], j);
                    this.shapes[shapeInstances[i].shape].render();
                    mvPopMatrix();
                }
            } else {
                // Single shape
                mvPushMatrix();
                this.applyShapeInstance(shapeInstances[i], false);
                this.shapes[shapeInstances[i].shape].render();
                mvPopMatrix();
            }

        }

    },

    /*
     * Update angles (for now)
     */
    update: function(elapsed) {
        this.sunAngle += 0.001 * elapsed;
        this.sun2Angle += 0.002 * elapsed;

        // Last brick is the active one
        var actualBrick = this.bricks[this.bricks.length-1];
        var nextMoveY = 0;

        this.timer += elapsed;
        // Automatic fall
        if(this.timer >= this.timeStep){
            if(actualBrick.location[1] > 2){
                nextMoveY = -1;
            } else {
                this.addRandomBrick();
            }
            this.timer = 0;
        }

        // Handle bricks moves
        var nextMove = [nextMoveX, nextMoveY, nextMoveZ];

        if(nextMoveX != 0 || nextMoveY != 0 || nextMoveZ != 0){
            var freeToMove = this.checkFreeMove(nextMove);

            nextMoveX = 0;
            nextMoveZ = 0;

            actualBrick.location[0] += nextMove[0] * 2;
            actualBrick.location[1] += nextMove[1] * 2;
            actualBrick.location[2] += nextMove[2] * 2;
        }


//            actualBrick.angle[1] += degToRad(nextRotation*90);
//            nextRotation = 0;


    },
    addRandomBrick: function(){
        var randomType = Math.max(0, Math.round(Math.random()*brickTypes.length-1));

        var testBrick2 = this.shapeInstances.push({
            shape: 1,
            location: vec3.create(this.spawnLocation),
            angle: [0,0,0],
            type: brickTypes[randomType]
        });
        this.bricks.push(this.shapeInstances[testBrick2-1]);

        if(debugMode) console.log("Added new brick type: ", randomType);
    },
    checkFreeMove: function(nextMove){
        var actualBrick = this.bricks[this.bricks.length -1];
        if(debugMode) console.log("Next move: ", nextMove);
        // TODO
        this.bricks.forEach(function(){

            });

        return true;
    }



});