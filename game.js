/*
 * Game scene and logic
 */
Game = Class({
	initialize: function() {
    this.shapes         = [];
    this.shapeInstances = [];
    this.cubeAngle      = 0;
    this.shadowAngle    = 0;
    this.light          = new Light();
    this.ShadowOverlay	= new ShadowOverlay();

    // Create a floor
    this.addShape(new Cube(16, 0.1, 16, new Texture('#00AA00', '#FFFFFF')), false);

    // Create the rotating objects with colors
    this.addShape(new Cube   (10, 1, 1, new Texture('#FF0000', '#FF0000')), true);    
    
    // Create the objects on the floor in black and white
    this.addShape(new Cube   (8, 2, 2, new Texture('#0000FF', '#0000FF')), true);
    this.addShape(new Cube   (getRand(0,5), getRand(0,5), getRand(0,5), new Texture('#00AAAA', '#00AAAA')), true);
    this.addShape(new Pyramid(2, 2, 2, new Texture('#00FF00', '#00FF00')), true);
    
    var sC = 0;
    // Create an instance of the floor
    this.shapeInstances.push({shape:sC++, location:[ 0, -8,  0], angle:[0, 0, 0]});
    
    // Create instances of the rotating objects
    this.shapeInstances.push({shape:sC++, location:[-4,  5,  0], angle:[0, 0, 0]});    
    
    // Create instances for the objects on the floor        
    this.shapeInstances.push({shape:sC, location:[-8, -6,  8], angle:[0, 0, 0]});
    this.shapeInstances.push({shape:sC++, location:[ 8, -6, -8], angle:[0, 1.55, 0]});

    for (var i = 0; i < getRand(5,30); i++) {
      this.shapeInstances.push({shape:sC, location:[getRand(-20,80), getRand(-20,80), getRand(-20,40)], angle:[getRand(0,1), getRand(0,1), getRand(0,1)]});
    }
      

    this.shapeInstances.push({shape:++sC, location:[0, -6, 0], angle:[0, 0, 0]});
    
	},

	/*
   * Add a shape to the list, check if a shadow builder is needed
   */
  addShape: function(shape, shadow) {
      shape.shadow = shadow ? new ShadowBuilder(shape) : null;
      this.shapes.push(shape);
      console.log("Creatign shape:", shape, " shadow:", shadow);
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
    var shapeInstances = this.shapeInstances,
        shapeInstance,
        shape,
        shadow,
        zoom           = 60,
        i;

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);
    
    mat4.translate(mvMatrix, [0, 0, -zoom]);        
    mat4.rotateX(mvMatrix, degToRad(20));
    mat4.rotateY(mvMatrix, degToRad(-this.cubeAngle * 0.5));

    this.light.update(this.shadowAngle);
    
    gl.uniform1i(shaderProgram.useLightingUniform, 1);
    
    // Render all objects
    i = shapeInstances.length;
    while (i) {
        i--;
        shapeInstance = shapeInstances[i];
        mvPushMatrix();
            this.applyShapeInstance(shapeInstance);
            this.shapes[shapeInstance.shape].render();
        mvPopMatrix();
    }

    // Render all shadows
    i = shapeInstances.length;
    while (i) {
        i--;
        shapeInstance = shapeInstances[i];
        shape         = this.shapes[shapeInstance.shape];
        shadow        = shape.shadow;
        if (shadow !== null) {          
            mvPushMatrix();
                this.applyShapeInstance(shapeInstance);
                shadow.update(this.light.location, shapeInstance.angle, mvMatrix, zoom);
                shadow.render();
            mvPopMatrix();
        }
    }

    // Render the overlay to make the shadow areas darker
    this.ShadowOverlay.render();
  },

  /*
   * Update angles (for now)
   */
  update: function(elapsed) {
      var shapeInstances = this.shapeInstances;
      
      this.cubeAngle   += 0.1  * elapsed;
      this.shadowAngle += 0.001 * elapsed;
      
      shapeInstances[1].angle[1] += 0.0006 * elapsed;
      shapeInstances[1].angle[2] += 0.0005 * elapsed;              
  }


});