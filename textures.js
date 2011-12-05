/*
 * Simple generated texture
 */
Texture = Class({
    initialize: function(color1, color2) {
        this.txtr = null;

        var canvas  = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var texture;

        canvas.width = 128;
        canvas.height = 128;

        context.fillStyle = color1;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = color2;
        context.fillRect(0, 0, canvas.width/2, canvas.height/2);
        context.fillRect(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);

        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
        
        this.txtr = texture;        
    },

    get: function() {
        return this.txtr;
    }

});
/*
 * Image texture
 */
ImageTexture = Class({
    initialize: function(image){
        this.txtr = null;

        var canvas  = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var texture;

        canvas.width = 128;
        canvas.height = 128;

        context.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);

        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.txtr = texture;

    },
    get: function() {
        return this.txtr;
    }
});