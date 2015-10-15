


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
    this.SequenceOne = [];
    this.makeScales();
    this.tone = tone * Math.pow(1.05946,this.Aeolian[id]);
    this.currentOriginX = 320;
    this.currentOriginY = 240;
    this.originX = this.center.x;
    this.originY = this.center.y;
    this.startTime = 0;
    this.entropyChange = 0.0;
    this.soundShapeIsReady = -1;
    this.diffSum = 0.0;
    this.diffSumTol = 750.0;
    
    this.toneSave = 0.0;
    this.amplitude = 0.1;
    this.connections = [];
    this.xoffset = 65.0;
    this.radiusDiv = 20.0;
    
    this.poppedCount = 0;
    this.popMax = 4;
    this.width = 640;
    this.height = 480;
    
    this.motionIsLinear = false;
    this.yVelocity = 0.0;
    this.yVelocitySave = this.yVelocity;
    this.gravity = 200.0;
    this.gravitySave = this.gravity;
    
    this.toneToPlay = this.tone;
    
    this.restartTime = 1000.0;
    this.randomizeRestartTime = false;
    
    this.randomizeXStartPos = false;
    this.randomizeYStartPos = false;
    this.adjustRadiusByTone = false;
}

SoundShape.prototype.connect = function(node) {
    this.connections.push(node);
}

SoundShape.prototype.setRandomizeXPos = function(rposx) {
    this.randomizeXStartPos = rposx;
}

SoundShape.prototype.setRandomizeYPos = function(rposy) {
    this.randomizeYStartPos = rposy;
}

SoundShape.prototype.setRandomizeRestartTime = function(rTime) {
    this.randomizeRestartTime = rTime;
}

SoundShape.prototype.setAmplitude = function(amplitude) {
    this.amplitude = amplitude;
}

SoundShape.prototype.setMotionIsLinear = function(isLinear) {
    this.motionIsLinear = isLinear;
}

SoundShape.prototype.setYVelocity = function(vel) {
    this.yVelocitySave = this.yVelocity;
    this.yVelocity = vel;
}

SoundShape.prototype.setDefaults = function(sTime) {
    this.randomizeXStartPos ?
    this.center.x = this.xoffset+(Math.random()*(this.width-this.xoffset)):
    this.center.x = this.originX;
    this.center.y = this.originY;
    this.startTime = sTime;
    if(this.adjustRadiusByTone)
        this.radius = this.tone/this.radiusDiv;
}

SoundShape.prototype.setGravity = function(grav) {
    this.gravitySave = this.gravity;
    this.gravity = grav;
}

SoundShape.prototype.updateCenterWithGravity = function(time) {
    this.center.y = 0.5 * this.gravity * Math.pow(time/1000,2);
    if(this.center.y > (this.height+this.radius)) {
        this.randomizeRestartTime ?
        this.setDefaults((new Date()).getTime()+(Math.random()*this.restartTime)):
        this.setDefaults((new Date()).getTime()+this.restartTime);
        this.poppedCount = this.poppedCount - 1;
    }
}

SoundShape.prototype.updateCenterLinear = function(time) {
    this.center.y = this.center.y + (this.yVelocity * (time/1000));
    if(this.center.y > (this.height+this.radius)) {
        this.randomizeRestartTime ?
        this.setDefaults((new Date()).getTime()+(Math.random()*this.restartTime)):
        this.setDefaults((new Date()).getTime()+this.restartTime);
        this.poppedCount = this.poppedCount - 1;
    }
}

SoundShape.prototype.popCircle = function() {
    this.randomizeRestartTime ?
    this.setDefaults((new Date()).getTime()+(Math.random()*this.restartTime)):
    this.setDefaults((new Date()).getTime()+this.restartTime);
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
    var linGrad = this.drawContext.createLinearGradient(0,0,0,this.height);
    linGrad.addColorStop(0, "rgba(255,0,0,0.8)");
    linGrad.addColorStop(0.5,"rgba(0,255,0,0.8)");
    linGrad.addColorStop(1, "rgba(0,0,255,0.8)");
    this.drawContext.strokeStyle = "black";
    this.drawContext.fillStyle = linGrad;
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

SoundShape.prototype.setToneByYLocation = function() {
    this.toneToPlay = this.tone * Math.pow(1.05946,Math.floor((this.center.y/this.height)*(this.SequenceOne.length-1)));
}

SoundShape.prototype.PlayTone = function (caller) {
    if(!this.playing) {
        this.playing = true;
        this.player = caller;
        this.aSineWave = new SineWave(this.audioContext);
       // this.setToneByYLocation();
        this.aSineWave.setFrequency(this.toneToPlay);
        this.aSineWave.setAmplitude(this.amplitude);
        for (var i = 0; i < this.connections.length; i++) {
            this.aSineWave.getOutNode().connect(this.connections[i]);
        }
        this.aSineWave.play();
        //this.setFillStyle();
        this.onFrame = this.frameCount;
    }
}

SoundShape.prototype.PauseTone = function (caller) {
    if(this.playing) {
        if(this.player == caller) {
            this.playing = false;
            //this.setFillStyle();
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
    
    this.SequenceOne[0] = 0;
    this.SequenceOne[1] = 4;
    this.SequenceOne[2] = 5;
    this.SequenceOne[3] = 7;
    this.SequenceOne[4] = 11;
    this.SequenceOne[5] = 12;
    
}

