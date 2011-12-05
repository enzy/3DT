/*
 * Base class for shapes creation
 */
Shape = Class({
    /*
     * Constructor
     */
    initialize: function(texture) {
        this.texture              =  texture.get();

        this.glVertexCount        = -1;    // The active vertex index
        this.glVertices           =  [];   // Vertex position list for gl
        this.glNormals            =  [];   // Normal list for gl
        this.glIndices            =  [];   // Index list for gl
        this.glTextureCoords      =  [];   // Texture cooordinate list for gl

        this.glPositionBuffer     =  null; // Position buffer for gl
        this.glNormalBuffer       =  null; // Normal buffer for gl
        this.glTextureCoordBuffer =  null; // Texture cooordinate buffer for gl
        this.glVertexIndexBuffer  =  null; // Vertex buffer for gl        
    },


    /*
     * Add position and texture cooordinates to the gl lists. Returns the index of the vertex
     */
    addGLVertex: function(x, y, z, u, v) {
        this.glVertices.push(x);
        this.glVertices.push(y);
        this.glVertices.push(z);

        this.glTextureCoords.push(u);
        this.glTextureCoords.push(v);

        this.glVertexCount++;
        return this.glVertexCount;
    },

    /*
     * Add a normal to a gl list
     */
    addNormal: function(normal) {
        this.glNormals.push(normal[0]);
        this.glNormals.push(normal[1]);
        this.glNormals.push(normal[2]);
    },    

    /*
     * Add a triangle to this object.
     */
    addTriangle: function(x1, y1, z1, uu1, vv1,
                          x2, y2, z2, uu2, vv2,
                          x3, y3, z3, uu3, vv3) {

        var vector1, vector2, vector3;        

        // Calculate the normal of the triangle
        vector1 = vec3.create([x2 - x1, y2 - y1, z2 - z1]);
        vector2 = vec3.create([x3 - x2, y3 - y2, z3 - z2]);
        vector3 = vec3.normalize(vec3.cross(vector1, vector2));

        // Add normals for 3 vertices
        this.addNormal(vector3);
        this.addNormal(vector3);
        this.addNormal(vector3);

        // Add the vertex cooordinates and texture info and store the index values
        this.glIndices.push(this.addGLVertex(x1, y1, z1, uu1, vv1));
        this.glIndices.push(this.addGLVertex(x2, y2, z2, uu2, vv2));
        this.glIndices.push(this.addGLVertex(x3, y3, z3, uu3, vv3));       
    },

    /*
     * Create gl buffers for the object
     */
    createBuffers: function() {
        this.glPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glVertices), gl.STATIC_DRAW);
        this.glPositionBuffer.itemSize = 3;

        this.glVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.glIndices), gl.STATIC_DRAW);
        this.glVertexIndexBuffer.itemSize = 1;
        this.glVertexIndexBuffer.numItems = this.glIndices.length;

        this.glTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glTextureCoords), gl.STATIC_DRAW);
        this.glTextureCoordBuffer.itemSize = 2;

        this.glNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glNormals), gl.STATIC_DRAW);
        this.glNormalBuffer.itemSize = 3;
    },

    /*
     * Render the object
     */
    render: function(){        

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);        
        
        // Set the vertex position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.glPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // Enable the normal attribute and set the buffer
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.glNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // Enable the texture coord attribute and set the buffer
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.glTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // Set the texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(shaderProgram.uSampler, 0);        

        // Set the index, render the triangles
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, this.glVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

});

/*
 * Shape class: Cube
 */
Cube = Class(Shape, {
    /*
     * Constructor
     */
    initialize: function(sizeX, sizeY, sizeZ, texture){
        Shape.initialize.call(this, texture); // Call super contructor

        this.addTriangle(-sizeX, -sizeY,  sizeZ, 0,0,  sizeX, -sizeY,  sizeZ, 1,0,  sizeX,  sizeY,  sizeZ,  1,1);
        this.addTriangle(-sizeX, -sizeY,  sizeZ, 0,0,  sizeX,  sizeY,  sizeZ, 1,1, -sizeX,  sizeY,  sizeZ,  0,1);

        this.addTriangle(-sizeX, -sizeY, -sizeZ, 1,0, -sizeX,  sizeY, -sizeZ, 0,0,  sizeX,  sizeY, -sizeZ,  0,1);
        this.addTriangle(-sizeX, -sizeY, -sizeZ, 1,0,  sizeX,  sizeY, -sizeZ, 0,1,  sizeX, -sizeY, -sizeZ,  1,1);

        this.addTriangle(-sizeX,  sizeY, -sizeZ, 0,0, -sizeX,  sizeY,  sizeZ, 1,0,  sizeX,  sizeY,  sizeZ,  1,1);
        this.addTriangle(-sizeX,  sizeY, -sizeZ, 0,0,  sizeX,  sizeY,  sizeZ, 1,1,  sizeX,  sizeY, -sizeZ,  0,1);

        this.addTriangle(-sizeX, -sizeY, -sizeZ, 1,0,  sizeX, -sizeY, -sizeZ, 0,0,  sizeX, -sizeY,  sizeZ,  0,1);
        this.addTriangle(-sizeX, -sizeY, -sizeZ, 1,0,  sizeX, -sizeY,  sizeZ, 0,1, -sizeX, -sizeY,  sizeZ,  1,1);

        this.addTriangle( sizeX, -sizeY, -sizeZ, 0,0,  sizeX,  sizeY, -sizeZ, 1,0,  sizeX,  sizeY,  sizeZ,  1,1);
        this.addTriangle( sizeX, -sizeY, -sizeZ, 0,0,  sizeX,  sizeY,  sizeZ, 1,1,  sizeX, -sizeY,  sizeZ,  0,1);

        this.addTriangle(-sizeX, -sizeY, -sizeZ, 1,0, -sizeX, -sizeY,  sizeZ, 0,0, -sizeX,  sizeY,  sizeZ,  0,1);
        this.addTriangle(-sizeX, -sizeY, -sizeZ, 1,0, -sizeX,  sizeY,  sizeZ, 0,1, -sizeX,  sizeY, -sizeZ,  1,1);

        this.createBuffers();
    }
});

/*
 * Shape class: Pyramid
 */
Pyramid = Class(Shape, {
    /*
     * Constructor
     */
    initialize: function(sizeX, sizeY, sizeZ, texture){
        Shape.initialize.call(this, texture); // Call super contructor

        this.addTriangle(-sizeX, -sizeY,  sizeZ, 1.0,0.0,  sizeX, -sizeY,  sizeZ, 0.0,0.0,  0,      sizeY,  0,      0.5,1.0);
        this.addTriangle(-sizeX, -sizeY, -sizeZ, 0.0,0.0,  0,      sizeY,  0,     0.5,1.0,  sizeX, -sizeY, -sizeZ,  1.0,0.0);

        this.addTriangle(-sizeX, -sizeY, -sizeZ, 0.0,0.0,  sizeX, -sizeY, -sizeZ, 1.0,0.0,  sizeX, -sizeY,  sizeZ,  1.0,1.0);
        this.addTriangle(-sizeX, -sizeY, -sizeZ, 0.0,0.0,  sizeX, -sizeY,  sizeZ, 1.0,1.0, -sizeX, -sizeY,  sizeZ,  0.0,1.0);

        this.addTriangle( sizeX, -sizeY, -sizeZ, 1.0,0.0,  0,      sizeY,  0,     0.5,1.0,  sizeX, -sizeY,  sizeZ,  0.0,0.0);
        this.addTriangle(-sizeX, -sizeY, -sizeZ, 0.0,0.0, -sizeX, -sizeY,  sizeZ, 1.0,0.0,  0,      sizeY,  0,      0.5,1.0);

        this.createBuffers();
    }
});

/*
 * Shape class: Star (Five vertexs)
 */
Star = Class(Shape, {
    /*
     * Constructor
     */
    initialize: function(sizeX, sizeY, sizeZ, texture){
        Shape.initialize.call(this, texture); // Call super contructor

        var step  = degToRad(360 / 5),
        start = degToRad(360 / 10),
        x1, y1,
        x2, y2,
        x3, y3;
            
        for (var i = 0; i < 5; i++) {
            x1 = Math.sin(start +  i * step) * sizeX * 0.5;
            y1 = Math.cos(start +  i * step) * sizeY * 0.5;
            x2 = Math.sin(start + (i + 1) * step) * sizeX * 0.5;
            y2 = Math.cos(start + (i + 1) * step) * sizeY * 0.5;
            x3 = Math.sin(start + (i + 0.5) * step) * sizeX;
            y3 = Math.cos(start + (i + 0.5) * step) * sizeY;
            
            var u1, v1, u2, v2, u3, v3;
            u1 = (x1 + sizeX) / (sizeX * 2);
            v1 = (y1 + sizeY) / (sizeY * 2);
            u2 = (x2 + sizeX) / (sizeX * 2);
            v2 = (y2 + sizeY) / (sizeY * 2);
            u3 = (x3 + sizeX) / (sizeX * 2);
            v3 = (y3 + sizeY) / (sizeY * 2);
            
            this.addTriangle(x1, y1, -sizeZ, u1, v1, x2, y2, -sizeZ, u2, v2, 0, 0, -sizeZ, u3, v3);
            this.addTriangle(x2, y2, -sizeZ, u2, v2, x1, y1, -sizeZ, u1, v1, x3, y3, 0, u3, v3);            
            this.addTriangle(x2, y2, sizeZ, u2, v2, x1, y1, sizeZ, u1,v1,0, 0, sizeZ, 0.5, 0.5);
            this.addTriangle(x1, y1, sizeZ, u1, v1, x2, y2, sizeZ, u2,v2, x3, y3, 0, u3, v3);                             
            this.addTriangle(x1, y1, -sizeZ, u1, v1, x1, y1, sizeZ, u1, v1, x3, y3, 0, u3, v3);
            this.addTriangle(x2, y2, sizeZ, u2, v2, x2, y2, -sizeZ, u2, v2 ,x3, y3,  0, u3, v3);
        }

        this.createBuffers();
    }
});