


//sound shape takes a canvas drawling context and an audio context and x y point
SoundShape = function(cContext, aContext, center, tone, radius, tol, tol2) {
   this.center = center;
   this.tone = tone;
   this.radius = radius;
   this.aSineWave = new SineWave(aContext);
   this.drawContext = cContext;
   this.audioContext = aContext;
   this.tol = tol;
   this.tol2 = tol2;
   this.activated = false;
   this.activatedCount = 0;
   this.playing = false;
   this.activatedCountTol = 10;
}


SoundShape.prototype.setCenter = function(p) {
  this.center = p;
}

SoundShape.prototype.setTone = function(t) {
  this.tone = t;
}

SoundShape.prototype.setRadius = function(r) {
  this.radius = r;
}

SoundShape.prototype.setTol = function(tl) {
  this.tol = tl;
}

SoundShape.prototype.drawCircle = function() {
  this.setFillStyle();
  this.drawContext.beginPath();
  this.drawContext.arc(this.center.x,this.center.y,this.radius,0,2.0*Math.PI);
  this.drawContext.fill();
}

SoundShape.prototype.setFillStyle = function() {

 if (!this.playing) {
    this.drawContext.fillStyle = 'rgba(30,100,80,0.8)';
  } else {
    this.drawContext.fillStyle = 'rgba(30, 240, 180, 0.8)';
  }

}

SoundShape.prototype.processDiff = function(diffData) {
  var sum = 0;
  
  var yStart = Math.round(this.center.y - this.radius) 
  var yEnd  = Math.round(this.center.y + this.radius);
  var xStart = Math.round(this.center.x - this.radius);
  var xEnd  = Math.round(this.center.x + this.radius);
  for(var i=yStart; i<yEnd; i++) {
    for(var j=xStart; j<xEnd; j++) {
      var idx = (j + (i * output.width))*4;
      if (this.isIn(j,i)) {
        sum += diffData.data[idx]*diffData.data[idx];
      }
    }
  }
  sum = Math.sqrt(sum);
  if (sum == 0) {
    return;
  }
  if (!this.activated) {
    if (sum > this.tol) {
      this.activatedCount++;
      if(this.activatedCount > this.activatedCountTol) {
           this.activated = true;
      }
    }
  } else {
   if(this.playing) {
    if (sum > this.tol) {
       if(this.activatedCount < this.activatedCountTol) {	
	  this.activatedCount++;
       } else {
          this.activated = false;
          this.aSineWave.pause();
          this.playing = false;
          this.activatedCount = 0;
       }
    }
  }//if playing
 }//if activated
}

SoundShape.prototype.playFromOutSide = function() {

 if(this.activatedCount > this.activatedCountTol && this.activated  && !this.playing) {
  this.aSineWave.setFrequency(this.tone);
  this.aSineWave.play();
  this.playing = true;
  this.activatedCount = 0;
 }
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


