


//sound shape takes a canvas drawling context and an audio context and x y point
SoundShape = function(id,cContext, aContext, center, tone, radius) {
    this.center = center;
    this.radius = radius;
    this.drawContext = cContext;
    this.audioContext = aContext;
    this.myId = id;
    this.frameCount = 0;
    this.onFrame = 0;
    this.offFrame = 0;
    this.Ionian = [];
    this.Aeolian = [];
    this.MajorChord = [];
    this.MinorChord = [];
    this.makeScales();
    this.tone = tone * Math.pow(1.05946,this.Aeolian[id]);
    this.currentOriginX = 320;
    this.currentOriginY = 240;
    this.acceleration = 0.0;
    this.originX = this.center.x;
    this.originY = this.center.y;
    this.startTime = 0;
    this.entropyChange = 0.0;
    this.soundShapeIsReady = -1;
    this.diffSum = 0.0;
    this.diffSumTol = 1250.0;
    this.padTime = 1000.0;
    this.toneSave = 0.0;
    this.amplitude = 0.1;
    this.connections = [];
    this.xoffset = 65.0;
    this.radiusDivBase = 20.0;
    this.radiusDiv = this.radiusDivBase;
    this.gravityBase = 200;
    this.gravity = this.gravityBase;
    this.gravityOffset = 75.0;
    this.poppedCount = 0;
    this.popMax = 4;
    this.width = 640;
    this.height = 480;
    this.myColorMap = ["rgba(127,0,0,0.8)","rgba(255,0,0,0.8)","rgba(127,127,0,0.8)","rgba(127,255,0,0.8)",
                       "rgba(0,127,0,0.8)","rgba(0,255,0,0.8)","rgba(0,127,127,0.8)","rgba(0,127,255,0.8)",
                       "rgba(0,0,127,0.8)","rgba(0,0,255,0.8)","rgba(127,0,127,0.8)","rgba(127,0,255,0.8"];
   // this.myColorMap = ["rgba(127,0,0,0.8)","rgba(255,0,0,0.8)","rgba(255,127,0,0.8)","rgba(255,255,0,0.8)",
    //                   "rgba(0,127,0,0.8)","rgba(0,127,127,0.8)","rgba(0,255,127,0.8)","rgba(0,255,0,0.8)",
    //                   "rgba(0,0,127,0.8)","rgba(127,0,127,0.8)","rgba(127,0,255,0.8)","rgba(0,0,255,0.8)"];
   // this.myColorMap = [];
    this.colorMapBitBase = 2;
    this.circleAlpha = 0.8;
    //this.createColorMap();
    
    this.accelIsUniform = false;
    this.motionIsLinear = false;
    this.yVelocity = 0.0;
}

SoundShape.prototype.createColorMap = function() {
    var totalColors = Math.pow(this.colorMapBitBase,3);
    for(var i = 1; i<this.colorMapBitBase+1; i++) {
        for(var j = 1; j<this.colorMapBitBase+1; j++) {
            for(var k = 1; k<this.colorMapBitBase+1; k++) {
                var idx = (k-1) + ((j-1) * this.colorMapBitBase) + ((i-1) * Math.pow(this.colorMapBitBase,2));
                var red = Math.floor(255*(k/this.colorMapBitBase));
                var green = Math.floor(255*(j/this.colorMapBitBase));
                var blue = Math.floor(255*(i/this.colorMapBitBase));
                this.myColorMap[idx] = "rgba(" + red + "," + green + "," + blue + "," + this.circleAlpha + ")";
                console.log("COLORMAP: ",idx,this.myColorMap[idx]);
            }
        }
    }
    console.log("Create Color Map! NumColors: ",idx+1)
}

SoundShape.prototype.connect = function(node) {
    this.connections.push(node);
}

SoundShape.prototype.setAmplitude = function(amplitude) {
    this.amplitude = amplitude;
}

SoundShape.prototype.setAccelIsUniform = function(isUnifrm) {
    this.accelIsUniform = isUnifrm;
}

SoundShape.prototype.setMotionIsLinear = function(isLinear) {
    this.motionIsLinear = isLinear;
}

SoundShape.prototype.setYVelocity = function(vel) {
    this.yVelocity = vel;
}

SoundShape.prototype.setDefaults = function(sTime) {
    this.center.x = this.xoffset+(Math.random()*(640.0-this.xoffset));
    this.center.y = this.originY;
    this.startTime = sTime;
    this.radius = this.tone/this.radiusDiv;
    this.setAcceleration(this.acceleration);
}

SoundShape.prototype.setAcceleration = function(value) {
    if(this.accelIsUniform) {
        this.acceleration = value;
    } else {
        this.acceleration = (Math.random()*value);
    }
}

SoundShape.prototype.updateCenterWithGravity = function(time) {
    this.center.y = this.acceleration * this.gravity * Math.pow(time/1000,2);
    if(this.center.y > (this.height+this.radius)) {
        this.setDefaults((new Date()).getTime()+(Math.random()*this.padTime));
        this.poppedCount = this.poppedCount - 1;
        this.gravity = this.gravityBase;
    }
}

SoundShape.prototype.updateCenterLinear = function(time) {
    this.center.y = this.center.y + (this.yVelocity * (time/1000));
    if(this.center.y > (this.height+this.radius)) {
        this.setDefaults((new Date()).getTime()+(Math.random()*this.padTime));
        this.poppedCount = this.poppedCount - 1;
    }
}

SoundShape.prototype.popCircle = function() {
    this.setDefaults((new Date()).getTime()+(Math.random()*this.padTime));
    this.poppedCount++;
    if(this.poppedCount == this.popMax) {
        this.gravity = this.gravity + this.gravityOffset;
        this.poppedCount = 0;
    }

}

SoundShape.prototype.updateSoundShape = function(newData,oldData,time) {
    if(this.motionIsLinear) {
        this.updateCenterLinear(time);
    } else {
        this.updateCenterWithGravity(time);
    }
    this.processDiff(newData,oldData);
}


SoundShape.prototype.setCenter = function(p) {
  this.center = p;
  this.currentOriginX = this.center.x;
  this.currentOriginY = this.center.y;
}

SoundShape.prototype.setTone = function(t) {
  this.aSineWave.setFrequency(this.tone);
}

SoundShape.prototype.setRadius = function(r) {
  this.radius = r;
}

SoundShape.prototype.drawCircle = function() {
  this.setFillStyle();
  this.drawContext.beginPath();
    this.drawContext.arc(this.center.x,this.center.y,this.radius,0,2.0*Math.PI);
    //calculate the indx for color map
    var idx = Math.floor((this.center.y/this.height) * (this.myColorMap.length-1));
    if(idx >= 1 && idx < (this.myColorMap.length-1)) {
        //var grdRadial = this.drawContext.createRadialGradient(this.center.x, this.center.y,this.radius, 0, this.center.x/5, this.center.y+(this.center.y*0.2));
        var linGrad = this.drawContext.createLinearGradient(this.center.x,this.center.y-this.radius,this.center.x,this.center.y+this.radius);
      //  console.log("Color string!! ",idx,this.myColorMap[idx])
        linGrad.addColorStop(0, this.myColorMap[idx-1]);
        linGrad.addColorStop(1, this.myColorMap[idx]);
       // linGrad.addColorStop(1, this.myColorMap[idx+1]);
        this.drawContext.strokeStyle = this.myColorMap[idx];
        this.drawContext.fillStyle = linGrad;
    } else {
        if(idx == 0) {
            var linGrad = this.drawContext.createLinearGradient(this.center.x,this.center.y+this.radius,this.center.x,this.center.y-this.radius);
            linGrad.addColorStop(0, this.myColorMap[idx]);
            linGrad.addColorStop(1, this.myColorMap[idx+1]);
        }
        if(idx == this.myColorMap.length-1) {
            var linGrad = this.drawContext.createLinearGradient(this.center.x,this.center.y-this.radius,this.center.x,this.center.y+this.radius);
            linGrad.addColorStop(0, this.myColorMap[idx-1]);
            linGrad.addColorStop(1, this.myColorMap[idx]);
        }
        this.drawContext.strokeStyle = this.myColorMap[idx]
        this.drawContext.fillStyle = linGrad;
    }
  
    this.drawContext.lineWidth = 2.0;
    this.drawContext.fill();
    this.drawContext.stroke();
    this.drawContext.closePath();
}

SoundShape.prototype.setFillStyle = function() {

 if (!this.playing) {
    this.drawContext.fillStyle = 'rgba(30,100,80,0.8)';
  } else {
    this.drawContext.fillStyle = 'rgba(30, 240, 180, 0.8)';
  }

}

SoundShape.prototype.processDiff = function(diffData, oldData) {
    this.frameCount++;
    var sum = 0;
    var yStart = Math.round(this.center.y - this.radius)
    var yEnd  = Math.round(this.center.y + this.radius);
    var xStart = Math.round(this.center.x - this.radius);
    var xEnd  = Math.round(this.center.x + this.radius);
    for(var i=yStart; i<yEnd; i++) {
        for(var j=xStart; j<xEnd; j++) {
            var idx = (j + (i * this.width))*4;
            if (this.isIn(j,i)) {
                sum += ((diffData.data[idx]-oldData.data[idx])*(diffData.data[idx]-oldData.data[idx]));
            }
        }
    }
    sum = Math.sqrt(sum);
    
    if(sum == 0 || isNaN(sum)) {
        this.diffSum = 0.0;
        if(this.playing) {
            this.PauseTone(this);
        }
        this.drawCircle();
        return;
    } else {
        this.diffSum = sum;
        if(this.diffSum > this.diffSumTol) {
            if(!this.playing) {
                this.PlayTone(this);
                this.drawCircle();
                this.popCircle();
            }
        } else {
            this.drawCircle();
        }
    }
 }


SoundShape.prototype.PlayOrPause = function() {
    this.playing ? this.PauseTone() : this.PlayTone();
    this.frameCount++;
}

SoundShape.prototype.isIn = function(x,y) {

var xDiff  = x - this.center.x;
var yDiff = y - this.center.y;
var dist = Math.sqrt((xDiff*xDiff)+(yDiff*yDiff));
  if(dist <= this.radius) {
    return true;
  } else {
    return false;
  }
}

SoundShape.prototype.PlayTone = function (caller) {
    if(!this.playing) {
        this.playing = true;
        this.player = caller;
        this.aSineWave = new SineWave(this.audioContext);
        this.aSineWave.setFrequency(this.tone);
        this.aSineWave.setAmplitude(this.amplitude);
        for (var i = 0; i < this.connections.length; i++) {
            this.aSineWave.getOutNode().connect(this.connections[i]);
        }
        this.aSineWave.play();
        this.setFillStyle();
        this.onFrame = this.frameCount;
    }
}

SoundShape.prototype.PauseTone = function (caller) {
    if(this.playing) {
        if(this.player == caller) {
            this.playing = false;
            this.setFillStyle();
            this.offFrame = this.frameCount;
            this.aSineWave.pause();
        }
    }
 }

SoundShape.prototype.makeScales = function () {

   this.Ionian[0] = 0;
   this.Ionian[1] = 2;
   this.Ionian[2] = 4;
   this.Ionian[3] = 5;
   this.Ionian[4] = 7;
   this.Ionian[5] = 9;
   this.Ionian[6] = 11;
   this.Ionian[7] = 12;

   this.Aeolian[0] = 0;
   this.Aeolian[1] = 2;
   this.Aeolian[2] = 3;
   this.Aeolian[3] = 5;
   this.Aeolian[4] = 7;
   this.Aeolian[5] = 8;
   this.Aeolian[6] = 10;
   this.Aeolian[7] = 12;
    
    this.MajorChord[0] = 0;
    this.MajorChord[1] = 4;
    this.MajorChord[2] = 7;
    this.MajorChord[3] = 12;
    
    this.MinorChord[0] = 0;
    this.MinorChord[1] = 3;
    this.MinorChord[2] = 7;
    this.MinorChord[3] = 12;
    
}

