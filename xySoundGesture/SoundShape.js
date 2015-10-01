


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
   this.activatedCountTol = 25;
   this.previousSum = 0.0;
   this.activatedSum = 0.0;
   this.gettingBaseLine = true;
   this.basis = 0.0;
   this.sigma = 0.0;
   this.min = 99999;
   this.max = -99999;
   this.Entropies = {'data':[]};
   this.prevEntropy = 0.0;
    this.circleEntropy = 0.0;
   this.frameCount = 0;
   this.onFrame = 0;
   this.offFrame = 0;
   this.Ionian = [];
   this.Aeolian = [];
    this.savedCircleData = {'data':[]};
    this.savedCircleRedData = {'data':[]};
    this.savedCircleGreenData = {'data':[]};
    this.savedCircleBlueData = {'data':[]};
   this.oldButtonData = {'data':[]};
   this.makeScales();
   this.tone = tone * Math.pow(1.05946,this.Aeolian[tol2]);
   this.haveSavedCircle = false;
   this.haveOldButtonData = false;
   this.sbbox = {'x':580, 'y':450, 'width':50, 'height':20};
    this.currentOriginX = 320;
    this.currentOriginY = 240;
    this.diffTol = 250000;
    this.circleSum = 0;
    this.pushedButton = false;
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
  }
}

SoundShape.prototype.drawSaveButton = function () {
  this.setButtonFillStyle();
  this.drawContext.fillRect(this.sbbox.x,this.sbbox.y,
    this.sbbox.width,this.sbbox.height);
}

SoundShape.prototype.setFillStyle = function() {

 if (!this.playing) {
    this.drawContext.fillStyle = 'rgba(30,100,80,0.8)';
  } else {
    this.drawContext.fillStyle = 'rgba(30, 240, 180, 0.8)';
  }

}

SoundShape.prototype.setButtonFillStyle = function() {
    
    if (!this.pushedButton) {
        this.drawContext.fillStyle = 'rgba(30,100,80,0.8)';
    } else {
        this.drawContext.fillStyle = 'rgba(30, 240, 180, 0.8)';
    }
    
}


SoundShape.prototype.saveCircle = function(imgData) {
  var sum = 0;
  var pcount = 0;
  var yStart = Math.round(this.center.y - this.radius) 
  var yEnd  = Math.round(this.center.y + this.radius);
  var xStart = Math.round(this.center.x - this.radius);
  var xEnd  = Math.round(this.center.x + this.radius);

    
    for(var i=yStart; i<yEnd; i++) {
        for(var j=xStart; j<xEnd; j++) {
            var idx = (j + (i * output.width))*4;
            if (this.isIn(j,i)) {
                this.savedCircleRedData.data[pcount] = imgData.data[idx];
                this.savedCircleGreenData.data[pcount] = imgData.data[idx+1];
                this.savedCircleBlueData.data[pcount] = imgData.data[idx+2];
                pcount++;
            }
        }
    }
    this.haveSavedCircle = true;
    console.log("Saved circle NumPoints: ",pcount);
}


SoundShape.prototype.findSavedCircleByEntropy = function(imgData) {
    var numPixels = 0;
    var yStarts = {'data':[]};
    var xStarts = {'data':[]};
    var yEnds = {'data':[]};
    var xEnds = {'data':[]};
    var st = 9;
    var newXOrig = 0;
    var newYOrig = 0;
    var min = 9999999999.0;
    var max = -9999999999.0;
    
    var RED = new Array();
    var GREEN = new Array();
    var BLUE = new Array();


    //n1
    yStarts.data[0] = Math.round((this.center.y+st) - this.radius);
    yEnds.data[0]  = Math.round((this.center.y+st) + this.radius);
    xStarts.data[0] = Math.round(this.center.x - this.radius);
    xEnds.data[0]  = Math.round(this.center.x + this.radius);
    //n2
    yStarts.data[1] = Math.round((this.center.y-st) - this.radius);
    yEnds.data[1]  = Math.round((this.center.y-st) + this.radius);
    xStarts.data[1] = Math.round(this.center.x - this.radius);
    xEnds.data[1]  = Math.round(this.center.x + this.radius);
    //n3
    yStarts.data[2] = Math.round(this.center.y - this.radius);
    yEnds.data[2]  = Math.round(this.center.y + this.radius);
    xStarts.data[2] = Math.round((this.center.x-st) - this.radius);
    xEnds.data[2]  = Math.round((this.center.x-st) + this.radius);
    //n4
    yStarts.data[3] = Math.round(this.center.y - this.radius);
    yEnds.data[3]  = Math.round(this.center.y + this.radius);
    xStarts.data[3] = Math.round((this.center.x+st) - this.radius);
    xEnds.data[3]  = Math.round((this.center.x+st) + this.radius);
    //n5
    yStarts.data[4] = Math.round((this.center.y+st) - this.radius);
    yEnds.data[4]  = Math.round((this.center.y+st) + this.radius);
    xStarts.data[4] = Math.round((this.center.x-st) - this.radius);
    xEnds.data[4]  = Math.round((this.center.x-st) + this.radius);
    //n6
    yStarts.data[5] = Math.round((this.center.y+st) - this.radius);
    yEnds.data[5]  = Math.round((this.center.y+st) + this.radius);
    xStarts.data[5] = Math.round((this.center.x+st) - this.radius);
    xEnds.data[5]  = Math.round((this.center.x+st) + this.radius);
    //n7
    yStarts.data[6] = Math.round((this.center.y-st) - this.radius);
    yEnds.data[6]  = Math.round((this.center.y-st) + this.radius);
    xStarts.data[6] = Math.round((this.center.x-st) - this.radius);
    xEnds.data[6]  = Math.round((this.center.x-st) + this.radius);
    //n8
    yStarts.data[7] = Math.round((this.center.y-st) - this.radius);
    yEnds.data[7]  = Math.round((this.center.y-st) + this.radius);
    xStarts.data[7] = Math.round((this.center.x+st) - this.radius);
    xEnds.data[7]  = Math.round((this.center.x+st) + this.radius);
    if(this.haveSavedCircle) {
        min = 9999999999.0;
        max = -9999999999.0;
        for(var c = 0; c<8; c++) {
            numPixels = 0;
            //zero out color arrays
            for(var i=0; i<256; i++) {
                RED[i] = 0;
                GREEN[i] = 0;
                BLUE[i] = 0;
            }
            //save circle data and calculate greyscale freqs
            for(var i=yStarts.data[c]; i<yEnds.data[c]; i++) {
                for(var j=xStarts.data[c]; j<xEnds.data[c]; j++) {
                    var idx = (j + (i * output.width))*4;
                    if (this.isIn(j,i)) {
                        RED[imgData.data[idx]] = RED[imgData.data[idx]] + 1;
                        GREEN[imgData.data[idx+1]] = GREEN[imgData.data[idx+1]] + 1;
                        BLUE[imgData.data[idx+2]] = BLUE[imgData.data[idx+2]] + 1;
                        numPixels++;
                    }
                }
            }
            var psum = 0.0;
            for(var index in RED) {
                if(RED[index] != 0) {
                    psum = psum +  ((RED[index]/numPixels) * Math.log(RED[index]/numPixels)/Math.log(2));
                }
            }
            for(var index in GREEN) {
                if(GREEN[index] != 0) {
                    psum = psum +  ((GREEN[index]/numPixels) * Math.log(GREEN[index]/numPixels)/Math.log(2));
                }
            }
            for(var index in BLUE) {
                if(BLUE[index] != 0) {
                    psum = psum +  ((BLUE[index]/numPixels) * Math.log(BLUE[index]/numPixels)/Math.log(2));
                }
            }
            var entropy = -1.0*psum;
            if(Math.abs(entropy-this.circleEntropy) < min) {
                min = Math.abs(entropy-this.circleEntropy);
                newXOrig = xStarts.data[c] + this.radius;
                newYOrig = yStarts.data[c] + this.radius;
            }
            
        }
        if(newXOrig != this.currentOriginX) {
            
            this.currentOriginX = newXOrig;
            this.currentOriginY = newYOrig;
            this.setCenter({'x':newXOrig,'y':newYOrig});
            this.drawCircle();
           // console.log("Move Circle: ",newXOrig,newYOrig,entropy,this.circleEntropy);
        }
    } //if have saved circle
 } //emd proto

SoundShape.prototype.findSavedCircleByDiff = function(imgData) {
    var numPixels = 0;
    var yStarts = {'data':[]};
    var xStarts = {'data':[]};
    var yEnds = {'data':[]};
    var xEnds = {'data':[]};
    var st = 8;
    var newXOrig = 0;
    var newYOrig = 0;
    var min = 9999999999.0;
    var max = -9999999999.0;
    
    //n1
    yStarts.data[0] = Math.round((this.center.y+st) - this.radius);
    yEnds.data[0]  = Math.round((this.center.y+st) + this.radius);
    xStarts.data[0] = Math.round(this.center.x - this.radius);
    xEnds.data[0]  = Math.round(this.center.x + this.radius);
    //n2
    yStarts.data[1] = Math.round((this.center.y-st) - this.radius);
    yEnds.data[1]  = Math.round((this.center.y-st) + this.radius);
    xStarts.data[1] = Math.round(this.center.x - this.radius);
    xEnds.data[1]  = Math.round(this.center.x + this.radius);
    //n3
    yStarts.data[2] = Math.round(this.center.y - this.radius);
    yEnds.data[2]  = Math.round(this.center.y + this.radius);
    xStarts.data[2] = Math.round((this.center.x-st) - this.radius);
    xEnds.data[2]  = Math.round((this.center.x-st) + this.radius);
    //n4
    yStarts.data[3] = Math.round(this.center.y - this.radius);
    yEnds.data[3]  = Math.round(this.center.y + this.radius);
    xStarts.data[3] = Math.round((this.center.x+st) - this.radius);
    xEnds.data[3]  = Math.round((this.center.x+st) + this.radius);
    //n5
    yStarts.data[4] = Math.round((this.center.y+st) - this.radius);
    yEnds.data[4]  = Math.round((this.center.y+st) + this.radius);
    xStarts.data[4] = Math.round((this.center.x-st) - this.radius);
    xEnds.data[4]  = Math.round((this.center.x-st) + this.radius);
    //n6
    yStarts.data[5] = Math.round((this.center.y+st) - this.radius);
    yEnds.data[5]  = Math.round((this.center.y+st) + this.radius);
    xStarts.data[5] = Math.round((this.center.x+st) - this.radius);
    xEnds.data[5]  = Math.round((this.center.x+st) + this.radius);
    //n7
    yStarts.data[6] = Math.round((this.center.y-st) - this.radius);
    yEnds.data[6]  = Math.round((this.center.y-st) + this.radius);
    xStarts.data[6] = Math.round((this.center.x-st) - this.radius);
    xEnds.data[6]  = Math.round((this.center.x-st) + this.radius);
    //n8
    yStarts.data[7] = Math.round((this.center.y-st) - this.radius);
    yEnds.data[7]  = Math.round((this.center.y-st) + this.radius);
    xStarts.data[7] = Math.round((this.center.x+st) - this.radius);
    xEnds.data[7]  = Math.round((this.center.x+st) + this.radius);
    if(this.haveSavedCircle) {
        min = 9999999999.0;
        max = -9999999999.0;
        for(var c = 0; c<8; c++) {
            sum = 0;
            //save circle data and calculate greyscale freqs
            var pcount = 0;
            for(var i=yStarts.data[c]; i<yEnds.data[c]; i++) {
                for(var j=xStarts.data[c]; j<xEnds.data[c]; j++) {
                    var idx = (j + (i * output.width))*4;
                    if (this.isIn(j,i)) {
                        sum += Math.sqrt(Math.pow((imgData.data[idx]-this.savedCircleRedData.data[pcount]),2)+
                                         Math.pow((imgData.data[idx+1]-this.savedCircleGreenData.data[pcount]),2)+
                                         Math.pow((imgData.data[idx+2]-this.savedCircleBlueData.data[pcount]),2));
                        pcount++;
                    }
                }
            }
            if(sum < min && sum < this.diffTol) {
                min = sum;
                newXOrig = xStarts.data[c] + this.radius;
                newYOrig = yStarts.data[c] + this.radius;
            }
        }
        if(newXOrig != this.currentOriginX && newXOrig != 0.0) {
            this.currentOriginX = newXOrig;
            this.currentOriginY = newYOrig;
            this.setCenter({'x':newXOrig,'y':newYOrig});
            this.drawCircle();
            //play tone continuously
            this.tone = Math.sqrt((this.currentOriginX*this.currentOriginX)+(this.currentOriginY*this.currentOriginY));
            this.PlayTone();
        } else {
            if(this.playing)
                this.PauseTone();
        }
    } //if have saved circle
} //emd proto


SoundShape.prototype.GetEntropy = function(imgData) {

  var skinTonePixel = 0;
  var notSkinTonePixel = 0;
    var numPixels = 0;
//  var yStart = Math.round(this.center.y - this.radius)
  //var yEnd  = Math.round(this.center.y + this.radius);
  //var xStart = Math.round(this.center.x - this.radius);
  //var xEnd  = Math.round(this.center.x + this.radius);
 var yStart = this.sbbox.y;
  var yEnd = this.sbbox.y + this.sbbox.height;
  var xStart = this.sbbox.x;
  var xEnd = this.sbbox.x + this.sbbox.width;

  var GreyScale = new Array(); 
  for(var i=0; i<256; i++) {
      GreyScale[i] = 0;
  }
  numPixels = 0;
  for(var i=yStart; i<yEnd; i++) {
    for(var j=xStart; j<xEnd; j++) {
      var idx = (j + (i * output.width))*4;
   //   if (this.isIn(j,i)) {
        var greyScale = 0.299*imgData.data[idx] + 0.587*imgData.data[idx+1] + 0.114*imgData.data[idx+2];
	GreyScale[Math.round(greyScale)] = GreyScale[Math.round(greyScale)] + 1;
	numPixels++;
    //  }
    }
  }
  //calculate entropy
  var psum = 0.0;
  for(var index in GreyScale) {
     if(GreyScale[index] != 0) {
	psum = psum +  ((GreyScale[index]/numPixels) * Math.log(GreyScale[index]/numPixels)/Math.log(2));
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
	    console.log("Base Entropy is:",this.tol,this.min,this.max,this.sigma,sigmaSum,numPixels);
	}
  } else {
   //console.log("Entropy:",this.center.x,this.center.y,entropy,this.prevEntropy,this.max);
   if(entropy > this.max+0.5) { // && entropy < this.tol + (this.max*0.5)) {
    if(!this.playing)
     //this.PlayTone();
     this.saveCircle(imgData);
     this.setCenter({'x':320, 'y':240});
     this.drawCircle();
     this.onFrame = this.frameCount;
    } else {
     if(this.playing)
      //this.PauseTone();
      this.offFrame = this.frameCount;
    }
  }
  this.prevEntropy = entropy;
  this.frameCount++;
  //console.log("Entropy: ",entropy,this.frameCount);
}

SoundShape.prototype.ProcessButtonEntropy = function(imgData) {
    
    var numPixels = 0;
    var yStart = this.sbbox.y;
    var yEnd = this.sbbox.y + this.sbbox.height;
    var xStart = this.sbbox.x;
    var xEnd = this.sbbox.x + this.sbbox.width;
    
    var GreyScale = new Array();
    for(var i=0; i<256; i++) {
        GreyScale[i] = 0;
    }
    numPixels = 0;
    for(var i=yStart; i<yEnd; i++) {
        for(var j=xStart; j<xEnd; j++) {
            var idx = (j + (i * output.width))*4;
            var greyScale = 0.299*imgData.data[idx] + 0.587*imgData.data[idx+1] + 0.114*imgData.data[idx+2];
            GreyScale[Math.round(greyScale)] = GreyScale[Math.round(greyScale)] + 1;
            numPixels++;
        }
    }
    //calculate entropy
    var psum = 0.0;
    for(var index in GreyScale) {
        if(GreyScale[index] != 0) {
            psum = psum +  ((GreyScale[index]/numPixels) * Math.log(GreyScale[index]/numPixels)/Math.log(2));
        }
    }
    
    var entropy = -1.0 * psum;
    if(this.gettingBaseLine && !isNaN(entropy)) {
        this.activatedCount++; //use count first to get to baseline (video delay problem)
        if(entropy < this.min)
            this.min = entropy;
        if(entropy > this.max)
            this.max = entropy;
        if(this.activatedCount == 150) {
            this.gettingBaseLine = false;
            console.log("Base Entropy is: ",entropy,this.min,this.max);
            this.activatedCount = 0;
        }
    } else {
        if((entropy > this.max+0.5 || entropy < this.min-0.5)) {
            this.setCenter({'x':320, 'y':240});
            this.drawCircle();
            this.saveCircle(imgData);
            this.onFrame = this.frameCount;
            this.activatedCount = 0;
            this.pushedButton = true;
        } else {
            this.offFrame = this.frameCount;
            this.activatedCount++;
            this.pushedButton = false;
        }
    }
    this.prevEntropy = entropy;
    this.frameCount++;
    //console.log("Entropy: ",entropy,this.frameCount);
}

SoundShape.prototype.SaveCircleEntropy = function(imgData) {
    
    var sum = 0;
    var pcount = 0;
    var yStart = Math.round(this.center.y - this.radius)
    var yEnd  = Math.round(this.center.y + this.radius);
    var xStart = Math.round(this.center.x - this.radius);
    var xEnd  = Math.round(this.center.x + this.radius);
    var numPixels = 0;

    var RED = new Array();
    var GREEN = new Array();
    var BLUE = new Array();
    for(var i=0; i<256; i++) {
        RED[i] = 0;
        GREEN[i] = 0;
        BLUE[i] = 0;
    }
    //save circle data and calculate greyscale freqs
    for(var i=yStart; i<yEnd; i++) {
        for(var j=xStart; j<xEnd; j++) {
            var idx = (j + (i * output.width))*4;
            if (this.isIn(j,i)) {
                this.savedCircleData.data[numPixels] = imgData.data[idx];
                var greyScale = 0.299*imgData.data[idx] + 0.587*imgData.data[idx+1] + 0.114*imgData.data[idx+2];
                RED[imgData.data[idx]] = RED[imgData.data[idx]] + 1;
                GREEN[imgData.data[idx+1]] = GREEN[imgData.data[idx+1]] + 1;
                BLUE[imgData.data[idx+2]] = BLUE[imgData.data[idx+2]] + 1;
                numPixels++;
            }
        }
    }
    this.haveSavedCircle = true;
    //calculate entropy
    var psum = 0.0;
    for(var index in RED) {
        if(RED[index] != 0) {
            psum = psum +  ((RED[index]/numPixels) * Math.log(RED[index]/numPixels)/Math.log(2));
        }
    }
    for(var index in GREEN) {
        if(GREEN[index] != 0) {
            psum = psum +  ((GREEN[index]/numPixels) * Math.log(GREEN[index]/numPixels)/Math.log(2));
        }
    }
    for(var index in BLUE) {
        if(BLUE[index] != 0) {
            psum = psum +  ((BLUE[index]/numPixels) * Math.log(BLUE[index]/numPixels)/Math.log(2));
        }
    }
    
    var entropy = -1.0 * psum;
    this.circleEntropy = entropy;
    console.log("Saved Circle Data! Entropy: ",this.circleEntropy,this.frameCount);
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
  var numPixels = 0;
  for(var i=yStart; i<yEnd; i++) {
    for(var j=xStart; j<xEnd; j++) {
      var idx = (j + (i * output.width))*4;
      if (this.isIn(j,i)) {
        var greyScale = 0.299*imgData.data[idx] + 0.587*imgData.data[idx+1] + 0.114*imgData.data[idx+2];
        GreyScale[Math.round(greyScale)] = GreyScale[Math.round(greyScale)] + 1;
        numPixels++;
      }
    }
  }
  //calculate entropy
  var psum = 0.0;
  for(var index in GreyScale) {
     if(GreyScale[index] != 0) {
        psum = psum +  ((GreyScale[index]/numPixels) * Math.log(GreyScale[index]/numPixels)/Math.log(2));
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
       console.log("Base Entropy is:",this.tol,this.min,this.max,this.sigma,sigmaSum,numPixels);
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
