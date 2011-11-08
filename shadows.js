/*
 * Shadow builder
 */
ShadowBuilder = Class({
	/*
   * Constructor
   */
  initialize: function(item) {
  	this.item                = item;
    this.glPositionBuffer    = null;
    this.glVertexIndexBuffer = null;
  },

  setupData: function() {
  	if (this.glPositionBuffer !== null) {
        gl.deleteBuffer(this.glPositionBuffer);
    }
    if (this.glVertexIndexBuffer !== null) {
        gl.deleteBuffer(this.glVertexIndexBuffer);
    }

    this.glVertices = [];
    this.glIndices  = [];
  },

  addGLVertex: function(vector) {
  	this.glVertices.push(vector[0]);
    this.glVertices.push(vector[1]);
    this.glVertices.push(vector[2]);
    this.glIndices.push(this.glIndices.length);
  },

  addShadowSide: function(vector1, vector2, vector3, vector4) {
  	this.addGLVertex(vector1);
    this.addGLVertex(vector2);
    this.addGLVertex(vector3);

    this.addGLVertex(vector4);
    this.addGLVertex(vector3);
    this.addGLVertex(vector2);
  },

  /*
	 * Check which triangles face the light source
	 */
	checkDirection: function(lightLocation) {
    var triangles = this.item.triangles,
        triangle,
        vector,
        i         = triangles.length;

    while (i) {
      i--;

      // Create a normalized vector based on the vector from
      // the center of the triangle to the lights position
      triangle = triangles[i];
      vector = vec3.create(triangle.center);
      vector = vec3.normalize(vec3.subtract(vector, lightLocation));

      // Compare the vector with the normal of the triangle
      triangle.visible = (vec3.dot(vector, triangle.normal) < 0);
    }
	},

	/*
	 * Find the edge of the object
	 */
	findEdge: function() {
	    var triangles     = this.item.triangles,
	        triangle,
	        a, b,
	        lines         = this.item.lines,
	        line,
	        lineSidesHash = {},
	        i, j, k;

	    this.lineSides = [];

	    i = triangles.length;
	    while (i) {
	        i--;
	        
	        triangle = triangles[i];
	        if (triangle.visible) {
	            j = 3;
	            while (j) {
	                j--;
	                
	                // Check if the side
	                k    = triangle.lines[j];
	                line = lines[k];
	                a    = line.v1 + '_' + line.v2;
	                b    = line.v2 + '_' + line.v1;
	                
	                if (lineSidesHash[a] !== undefined) { // Check the v1 -> v2 direction
	                    // The side already exists, remove it
	                    delete(lineSidesHash[a]);
	                }
	                else if (lineSidesHash[b] !== undefined) { // Check the v2 -> v1 direction
	                    // The side already exists, remove it
	                    delete(lineSidesHash[b]);
	                }
	                else {
	                    // It's a new side, add it to the list
	                    lineSidesHash[a] = k;
	                }
	            }
	        }
	    }

	    // Convert the hash map to an array
	    for (i in lineSidesHash) {
	        line = lines[lineSidesHash[i]];
	        this.lineSides.push(line);
	    }
	},

	rotateVectorX: function(vector, angle) {
    var x, y,
        sin, cos;
    
    if (angle === 0) {
        return;
    }
    
    y         = vector[1];
    z         = vector[2];
    sin       = Math.sin(angle);
    cos       = Math.cos(angle);
    vector[1] = y * cos - z * sin;
    vector[2] = y * sin + z * cos;
	},

	rotateVectorY: function(vector, angle) {
    var x, z,
        sin, cos;
    
    if (angle === 0) {
        return;
    }
    
    x         = vector[0];
    z         = vector[2];
    sin       = Math.sin(angle);
    cos       = Math.cos(angle);
    vector[0] = z * sin + x * cos;
    vector[2] = z * cos - x * sin;
	},

	rotateVectorZ: function(vector, angle) {
    var x, y,
        sin, cos;
    
    if (angle === 0) {
        return;
    }
    
    x         = vector[0];
    y         = vector[1];            
    sin       = Math.sin(angle);
    cos       = Math.cos(angle);
    vector[0] = x * cos - y * sin;
    vector[1] = x * sin + y * cos;
	},

	/*
	 * Update the shadow
	 */
	update: function(lightLocation, lightAngle, matrix, zoom) {
	    // Get the position of the light from the matrix, remove the zoom value
	    var vector = vec3.subtract(vec3.create(lightLocation), [matrix[12], matrix[13], matrix[14] + zoom]),
	        sin, cos,
	        x, y, z;

	    // Instead of rotating the object to face the light at the right angle it's a lot faster to rotate the light in the reverse direction
	    this.rotateVectorX(vector, -lightAngle[0]);
	    this.rotateVectorY(vector, -lightAngle[1]);
	    this.rotateVectorZ(vector, -lightAngle[2]);
	    
	    // Store the location for later use
	    this.lightLocation = vector;

	    this.setupData(); // Reset all lists and buffers
	    this.checkDirection(vector); // Check which triangles face the light source
	    this.findEdge(); // Find the edge
	},

	/*
	 * Create the buffers for the shadow volume
	 */
	createVolume: function(lightLocation) {
    var vertices   = this.item.vertices,
      triangles  = this.item.triangles,
      triangle,
      lineSides  = this.lineSides,
      line,
      vector1, vector2, vector3, vector4,
      i          = lineSides.length,
      j;

    while (i) { // For all edge lines
      i--;
      line    = lineSides[i];
      vector1 = vertices[line.v1];
      vector2 = vertices[line.v2];

      // Extrude the line away from the light

      // Get the vector from the light position to the vertex
      vector3 = vec3.subtract(vector1, lightLocation, vec3.create());

      // Add the normalized vector scaled with the volume depth to the vertex which gives a point on the other side of the object than the light source
      vector3 = vec3.add(vec3.scale(vec3.normalize(vector3), 30), vector1);

      // And again for the second point on the line
      vector4 = vec3.subtract(vector2, lightLocation, vec3.create());
      vector4 = vec3.add(vec3.scale(vec3.normalize(vector4), 30), vector2);

      this.addShadowSide(vector1, vector2, vector3, vector4);
    }

    // Add the end caps to the volume
    i = triangles.length;
    while (i) {
      i--;
      triangle = triangles[i];
      if (triangle.visible) { // Only add polygons facing the light
        // Add the top
        j = 3;
        while (j) {
          j--;
          this.addGLVertex(vertices[triangle.vertices[j]]);
        }        
        // Add the bottom
        j = 0;
        while (j < 3) {
          vector1 = vertices[triangle.vertices[j]];
          vector2 = vec3.subtract(vector1, lightLocation, vec3.create());

          this.addGLVertex(vec3.add(vec3.scale(vec3.normalize(vector2), 30), vector1));
          j++;
        }
      }
    }

    // Create the vertex position buffer
    this.glPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glVertices), gl.STATIC_DRAW);
    this.glPositionBuffer.itemSize = 3;

    // Create the vertex index buffer
    this.glVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.glIndices), gl.STATIC_DRAW);
    this.glVertexIndexBuffer.numItems = this.glIndices.length;
	},
	
	/*
   * Render the shadows
   */
	render: function() {
	  // Create the volume for the light
	  this.createVolume(this.lightLocation);

	  gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
	  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.glPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);
	  setMatrixUniforms();

	  // Disable the texture coord attribute
	  gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
	  // Disable the normal attribute
	  gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	  // Disable the color attribute
	  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

	  // Render both front and back facing polygons with different stencil operations
	  gl.disable(gl.CULL_FACE);                 
	  gl.enable(gl.STENCIL_TEST);
	  gl.depthFunc(gl.LESS);

	  // Disable rendering to the color buffer
	  gl.colorMask(false, false, false, false); 
	  // Disable z buffer updating
	  gl.depthMask(false);                      
	  // Allow all bits in the stencil buffer
	  gl.stencilMask(255);                      

	  // Increase the stencil buffer for back facing polygons, set the z pass opperator
	  gl.stencilOpSeparate(gl.BACK,  gl.KEEP, gl.KEEP, gl.INCR); 
	  // Decrease the stencil buffer for front facing polygons, set the z pass opperator
	  gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.DECR); 
	  
	  // Always pass
	  gl.stencilFunc(gl.ALWAYS, 0, 255);
	  gl.drawElements(gl.TRIANGLES, this.glVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	  // Enable rendering the the color and depth buffer again
	  gl.colorMask(true, true, true, true);
	  gl.depthMask(true);

	  gl.disable(gl.STENCIL_TEST);
	}

});

/*
 * Shadow overlay (shadow itself)
 */ 
ShadowOverlay = Class({
	/*
   * Constructor
   */
  initialize: function() {
  	// Singleton alternative
  	if (ShadowOverlay.overlay !== undefined) {
        return ShadowOverlay.overlay;
    }

		// Create buffers for an overlay
    var size       = 0.5,
        glVertices = [-size, -size, 0,     size, -size, 0,     size, size, 0,    -size, size, 0],
        glIndices  = [0, 1, 2,  2, 3, 0],
        glColors   = [0, 0, 0, 1,  0, 0, 0, 1,  0, 0, 0, 1,  1, 0, 0, 1];
    
    // Create a rectangle
    this.glPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glVertices), gl.STATIC_DRAW);
    this.glPositionBuffer.itemSize = 3;

    this.glIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glIndices), gl.STATIC_DRAW);
    this.glIndexBuffer.itemSize = 1;
    this.glIndexBuffer.numItems = glIndices.length;

    this.glColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glColors), gl.STATIC_DRAW);
    this.glColorBuffer.itemSize = 4;
    
    ShadowOverlay.overlay = this; // TODO CHECK
  },
       
  /*
   * Darkens the spots which are covered by shadows
   */
  render: function() {
      var stencil;
      
      gl.disable(gl.DEPTH_TEST);               // No depth test
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); // Don't change the stencil buffer

      // Enable the color attribute, disable texture coords and normals
      gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
      gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
      gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute);

      gl.depthMask(false); // Don't write to the depth buffer

      // The stencil buffer contains the shadow values
      gl.enable(gl.STENCIL_TEST);
      
      // Enable blending
      gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
      gl.enable(gl.BLEND);

      // Enable color
      gl.uniform1i(shaderProgram.useColorUniform, 1);        
      // Disable lighting
      gl.uniform1i(shaderProgram.useLightingUniform, 0);

      // Render 2D
      mat4.ortho(0, 0, gl.viewportWidth, gl.viewportHeight, 0, -100, mvMatrix);
      mat4.identity(mvMatrix);
      mat4.translate(mvMatrix, [0, 0, -0.1]);

      // Set the buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.glPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.glColorBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.glColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glIndexBuffer);
      setMatrixUniforms();
      
      // Render 3 passes, each pas with a darker alpha value
      stencil = 128;
      while (stencil < 132) {
          stencil++;
          
          // The stencil value controls the darkness, with each shadow the stencil buffer is increased.
          // When more shadows overlap the shadow gets darker.
          gl.stencilFunc(gl.EQUAL, stencil, 255);
          gl.uniform1f(shaderProgram.alphaUniform, 0.8 - (stencil - 129) * 0.1);

          // Render the rectangle
          gl.drawElements(gl.TRIANGLES, this.glIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
      }

      gl.depthMask(true); // Enable depth buffer updates again

      gl.disable(gl.BLEND);
      gl.disable(gl.STENCIL_TEST);
  }
    
});