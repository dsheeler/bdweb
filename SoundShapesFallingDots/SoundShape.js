


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
    this.diffSumTol = 2250.0;
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
    
}

SoundShape.prototype.connect = function(node) {
    this.connections.push(node);
}

SoundShape.prototype.setAmplitude = function(amplitude) {
    this.amplitude = amplitude;
}

SoundShape.prototype.setDefaults = function(sTime,isUniform,accelVal) {
    this.center.x = this.xoffset+(Math.random()*(640.0-this.xoffset));
    this.center.y = this.originY;
    this.startTime = sTime;
    this.radius = this.tone/this.radiusDiv;
    this.setAcceleration(isUniform,accelVal);
}

SoundShape.prototype.setAcceleration = function(isUniform,value) {
    if(isUniform) {
        this.acceleration = value;
    } else {
        this.acceleration = (Math.random()*value);
    }
}

SoundShape.prototype.updateCenterWithGravity = function(time) {
    this.center.y = this.acceleration * this.gravity * Math.pow(time/1000,2);
    if(this.center.y > (this.height+this.radius)) {
        this.setDefaults((new Date()).getTime()+(Math.random()*this.padTime),false,0.1);
        this.poppedCount = this.poppedCount - 1;
        this.gravity = this.gravityBase;
    }
}

SoundShape.prototype.popCircle = function() {
    this.setDefaults((new Date()).getTime()+(Math.random()*this.padTime),false,0.1);
    this.poppedCount++;
    if(this.poppedCount == this.popMax) {
        this.gravity = this.gravity + this.gravityOffset;
        this.poppedCount = 0;
    }

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
  this.drawContext.fill();
  if ((this.frameCount - this.onFrame) < 30) {
    var percentFull = (30 - (this.frameCount - this.onFrame))/30.0;
    var percentEmpty = 1 - percentFull;
    this.drawContext.fillStyle = 'rgba(255,255,255,' + 0.5 + ')';
    this.drawContext.beginPath();
    this.drawContext.arc(this.center.x,this.center.y,this.radius*percentFull,0,2.0*Math.PI);
    this.drawContext.fill();
  }
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

SoundShape.prototype.updateSoundShape = function(newData,oldData,time) {
    this.updateCenterWithGravity(time);
    this.processDiff(newData,oldData);
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
