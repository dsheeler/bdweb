


//sound shape takes a canvas drawling context and an audio context and x y point
SoundShape = function(cContext, aContext) {

   this.center = {"x":0,"y":0};
   this.tone = 0;
   this.radius = 0;
   this.aSineWave = new SineWave(aContext);
   this.drawContext = cContext;
   this.audioContext = aContext;
   this.tol = 0;
   
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
  this.drawContext.lineWidth = 2;
  this.drawContext.strokeStyle = 'rgba(230,87,0,0.8)';
  this.drawContext.beginPath();
  this.drawContext.arc(this.center.x,this.center.y,this.radius,0,2.0*Math.PI);
  this.drawContext.stroke();
}


SoundShape.prototype.isIn = function(x,y,inTol) {

var xDiff  = x - this.center.x;
var yDiff = y - this.center.y;
var dist = Math.sqrt((xDiff*xDiff)+(yDiff*yDiff));
  if(dist <= this.radius && inTol >= this.tol) {
    if(!this.aSineWave.playing) {
    	this.aSineWave.setFrequency(this.tone);
    	this.aSineWave.play();
    } else {
        this.aSineWave.pause();
    }
  }
}


