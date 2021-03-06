/**
  Class is a function that returns a constructor function.

  The constructor function calls #initialize with its arguments.

  The parameters to Class have their prototypes or themselves merged with the
  constructor function's prototype.

  Finally, the constructor function's prototype is merged with the constructor
  function. So you can write Shape.getArea.call(this) instead of
  Shape.prototype.getArea.call(this).

  Shape = Class({
    getArea : function() {
      throw('No area defined!')
    }
  })

  Rectangle = Class(Shape, {
    initialize : function(x, y) {
      this.x = x
      this.y = y
    },

    getArea : function() {
      return this.x * this.y
    }
  })

  Square = Class(Rectangle, {
    initialize : function(s) {
      Rectangle.initialize.call(this, s, s)
    }
  })

  new Square(5).getArea()
  //=> 25

  @return Constructor object for the class
  */
Class = function() {
    var c = function() {
        this.initialize.apply(this, arguments)
    }
    c.ancestors = toArray(arguments)
    c.prototype = {}
    for(var i = 0; i<arguments.length; i++) {
        var a = arguments[i]
        if (a.prototype) {
            Object.extend(c.prototype, a.prototype)
        } else {
            Object.extend(c.prototype, a)
        }
    }
    Object.extend(c, c.prototype)
    return c
}

if (!window['toArray']) {
    /**
    Creates a new array from an object with #length.
    */
    toArray = function(obj) {
        var a = new Array(obj.length)
        for (var i=0; i<obj.length; i++)
            a[i] = obj[i]
        return a
    }
}

/**
  Merges the src object's attributes with the dst object, ignoring errors.

  @param dst The destination object
  @param src The source object
  @return The dst object
  @addon
  */
Object.forceExtend = function(dst, src) {
    for (var i in src) {
        try{
            dst[i] = src[i]
        } catch(e) {}
    }
    return dst
}
// In case Object.extend isn't defined already, set it to Object.forceExtend.
if (!Object.extend)  Object.extend = Object.forceExtend;



function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


/*
 * Converts degrees to radians
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


function rotateVectorX(vector, angle) {
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
}

function rotateVectorY(vector, angle) {
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
}

function rotateVectorZ(vector, angle) {
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
}

function getRand(min, max) {
    var rand = Math.floor(Math.random() * max) + min;  
    return rand;
}

function ExtractUniformsFromShaderSource(source){
    var reg = new RegExp("uniform ((bool|int|uint|float|[biu]?vec[234]|mat[234]x?[234]?|sampler2D) ([A-Za-z0-9]*));", "gi");
    var tmp;
    var returnvalue = [];
    while(true){
        tmp = reg.exec(source);
        if(!tmp) break;
        returnvalue.push(tmp[3]);
    }
    return returnvalue;
}
