


//sound shape takes a canvas drawling context and an audio context and x y point
SoundShape = function(cContext, aContext, center, tone, radius, tol, tol2) {
   this.center = center;
   this.radius = radius;
   this.aSineWave = new SineWave(aContext);
   this.drawContext = cContext;
   this.audioContext = aContext;
   this.tol = tol;
   this.tol2 = tol2;
   this.activated = false;
   this.activatedCount = 0;
   this.playing = false;
   this.activatedCountTol = 5;
   this.previousSum = 0.0;
   this.activatedSum = 0.0;
   this.gettingBaseLine = true;
   this.basis = 0.0;
   this.sigma = 0.0;
   this.min = 99999;
   this.max = -99999;
   this.Entropies = {'data':[]};
   this.numPixels = 0;
   this.prevEntropy = 0.0;
   this.frameCount = 0;
   this.onFrame = 0;
   this.offFrame = 0;
   this.Ionian = [];
   this.Aeolian = [];

   this.makeScales();
   this.tone = tone * Math.pow(1.05946,this.Aeolian[tol2]);

}


SoundShape.prototype.setCenter = function(p) {
  this.center = p;
}

SoundShape.prototype.setTone = function(t) {
  this.aSineWave.setFrequency(this.tone);
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
  if ((this.frameCount - this.onFrame) < 30) {
    var percentFull = (30 - (this.frameCount - this.onFrame))/30.0;
    var percentEmpty = 1 - percentFull;
    this.drawContext.fillStyle = 'rgba(255,255,255,' + 0.5 + ')';
    this.drawContext.beginPath();
    this.drawContext.arc(this.center.x,this.center.y,this.radius*percentFull,0,2.0*Math.PI);
    this.drawContext.fill();
    //this.aSineWave.setFrequency(this.tone *Math.pow(2.0, (5*percentEmpty*(1/12.0))));
  } else {
    this.PauseTone();
  }
}

SoundShape.prototype.setFillStyle = function() {

 if (!this.playing) {
    this.drawContext.fillStyle = 'rgba(30,100,80,0.8)';
  } else {
    this.drawContext.fillStyle = 'rgba(30, 240, 180, 0.8)';
  }

}

SoundShape.prototype.processDiff = function(diffData) {
  this.frameCount++;
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
	    
	    this.setTone(this.tone);
  	    this.aSineWave.play();
  	    this.playing = true;
        this.onFrame = this.frameCount;
	  } 
         } else if(this.activatedSum/this.activatedCountTol < this.tol2) {
          if(this.playing) {
                        this.offFrame = this.frameCount;
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
   console.log("Entropy:",this.center.x,this.center.y,entropy,this.prevEntropy,this.max);
   if(entropy > this.max+0.5) { // && entropy < this.tol + (this.max*0.5)) {
    if(!this.playing)
     this.PlayTone();
     this.onFrame = this.frameCount;
    } else {
     if(this.playing)
      //this.PauseTone();
      this.offFrame = this.frameCount;
    }
  }
  this.prevEntropy = entropy;
  this.frameCount++;
}

SoundShape.prototype.GetEntropyChange = function(imgData) {
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
       this.activatedCount = 0;
       this.Entropies = {'data':[]};
     }

  } else {

    if(this.activatedCount == this.activatedCountTol) {
      var esum = 0.0;
      var eavg = 0.0;
      for(var i=0; i<this.Entropies.data.length; i++) {
	 esum = esum + this.Entropies.data[i];
      }
      eavg = esum/this.Entropies.data.length;
      if(eavg > this.tol+1.0) {
        if(!this.playing) {
	  this.PlayTone();
          this.onFrame = this.frameCount;
        }
      } else {
        if(this.playing)
	  this.offFrame = this.frameCount;
      }
      this.prevEntropy = eavg;
      this.activatedCount = 0;
    } else {
      if(!isNaN(entropy)) {
        this.Entropies.data[this.activatedCount] = entropy;
        this.activatedCount++;
      }
   }
  this.frameCount++;
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

SoundShape.prototype.PlayTone = function () {
     this.aSineWave.setFrequency(this.tone);
     this.aSineWave.play();
     this.playing = true;
}

SoundShape.prototype.PauseTone = function () {
     this.aSineWave.pause();
     this.playing = false;
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
}
