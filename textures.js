/*
 * Simple generated texture
 */
Texture = Class({
    initialize: function(color1, color2) {
        this.txtr;

        var canvas  = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            texture;

        canvas.width      = 128;
        canvas.height     = 128;

        context.fillStyle = color1;
        context.fillRect(0, 0, 128, 128);

        context.fillStyle = color2;
        context.fillRect( 0,  0, 64, 64);
        context.fillRect(64, 64, 64, 64);

        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
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