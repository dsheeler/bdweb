


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
   this.activatedCountTol = 4;
   this.previousSum = 0.0;
   this.activatedSum = 0.0;
   this.gettingBaseLine = true;
   this.basis = 0.0;
   this.sigma = 0.0;
   this.min = 99999;
   this.max = -99999;
   this.Entropies = {'data':[]};
   this.numPixels = 0;
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
  if(sum == 0 || isNaN(sum)) {
     return;
  } else {
     this.activatedSum = this.activatedSum + Math.sqrt(sum);
  }
   if(this.gettingBaseLine) {
     if(this.activatedCount == 100) {
	this.basis = this.activatedSum/this.activatedCount;
        this.activatedCount = 0;
        this.gettingBaseLine = false;
        this.tol = this.basis + 250;
        this.tol2 = this.basis + 25;
        console.log("Basis, Tol, Tol2:",this.activatedSum,this.basis,this.tol,this.tol2);
     } else {
        this.activatedCount++;
     }
   } else {
      if(this.activatedCount == this.activatedCountTol) {
    	if(this.activatedSum/this.activatedCountTol > this.tol) {
	  if(!this.playing) {
	    
	    this.aSineWave.setFrequency(this.tone);
  	    this.aSineWave.play();
  	    this.playing = true;
	  } 
         } else if(this.activatedSum/this.activatedCountTol < this.tol2) {
          if(this.playing) {
            this.aSineWave.pause();
            this.playing = false;
          }
         }
      this.activatedSum = 0.0;
      this.activatedCount = 0;
      } else {
      this.activatedCount++;
      }
   }
}

SoundShape.prototype.GetEntropy = function(imgData) {

  var skinTonePixel = 0;
  var notSkinTonePixel = 0;
  var yStart = Math.round(this.center.y - this.radius)
  var yEnd  = Math.round(this.center.y + this.radius);
  var xStart = Math.round(this.center.x - this.radius);
  var xEnd  = Math.round(this.center.x + this.radius);

  var GreyScale = new Array(); 
  for(var i=0; i<256; i++) {
      GreyScale[i] = 0;
  }
  this.numPixels = 0;
  for(var i=yStart; i<yEnd; i++) {
    for(var j=xStart; j<xEnd; j++) {
      var idx = (j + (i * output.width))*4;
      if (this.isIn(j,i)) {
        var greyScale = 0.299*imgData.data[idx] + 0.587*imgData.data[idx+1] + 0.114*imgData.data[idx+2];
	GreyScale[Math.round(greyScale)] = GreyScale[Math.round(greyScale)] + 1;
	this.numPixels++;
      }
    }
  }
  //calculate entropy
  var psum = 0.0;
  for(var index in GreyScale) {
     if(GreyScale[index] != 0) {
	psum = psum +  ((GreyScale[index]/this.numPixels) * Math.log(GreyScale[index]/this.numPixels)/Math.log(2));
     }
  }

  var entropy = -1.0 * psum;
  if(this.gettingBaseLine && !isNaN(entropy)) {

        this.Entropies.data[this.activatedCount] = entropy;
	this.activatedSum = this.activatedSum + entropy;
	this.activatedCount++;
        if(entropy < this.min)
	  this.min = entropy;
        if(entropy > this.max)
          this.max = entropy;
	if(this.activatedCount == 150) {
	    this.gettingBaseLine = false;
	    this.tol = this.activatedSum/this.activatedCount;
	    var sigmaSum = 0;
	    for(var i=0; i<this.activatedCount; i++) {
		sigmaSum = sigmaSum + (Math.pow((this.Entropies.data[i]-this.tol),2));	
	    }
	    this.sigma = Math.sqrt(sigmaSum/this.activatedCount);
	    console.log("Base Entropy is:",this.tol,this.min,this.max,this.sigma,sigmaSum,this.numPixels);
	}
  } else {
   //console.log("Entropy:",entropy,this.tol+0.5);
   if(entropy > this.max+0.5) { // && entropy < this.tol + (this.max*0.5)) {
    if(!this.playing)
     this.PlayTone();
    } else {
     if(this.playing)
      this.PauseTone();
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

SoundShape.prototype.PlayTone = function () {
   this.aSineWave.setFrequency(this.tone);
   this.aSineWave.play();
   this.playing = true;
}

SoundShape.prototype.PauseTone = function () {
   this.aSineWave.pause();
   this.playing = false;
}
