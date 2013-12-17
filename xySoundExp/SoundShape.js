


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
  if (!this.activated) {
    this.drawContext.fillStyle = 'rgba(30,100,80,0.8)';
  } else {
    this.drawContext.fillStyle = 'rgba(30, 240, 180, 0.8)';
  }
  this.drawContext.beginPath();
  this.drawContext.arc(this.center.x,this.center.y,this.radius,0,2.0*Math.PI);
  this.drawContext.fill();
}

SoundShape.prototype.processDiff = function(diffData) {
  var sum = 0;
  for(var i=0; i<480; i++) {
    for(var j=0; j<640; j++) {
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
  console.log('sum is: ', sum);
  if (!this.activated) {
  
    if (sum > this.tol) {
      console.log('active');    
      this.activated = true;
      if(!this.aSineWave.playing) {
    	  this.aSineWave.setFrequency(this.tone);
    	  this.aSineWave.play();
      }
    }
  } else {
    if (sum < this.tol2) {
      console.log('deactivated');
      this.activated = false;
      this.aSineWave.pause();
    }
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


