


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
    this.diffTol = 65000;
    this.circleSum = 0;
    this.pushedButton = false;
    this.redRGBRatio = 0;
    this.greenRGBRatio = 0;
    this.blueRGBRatio = 0;
    
    this.acceleration = 0.0;
    this.originX = this.center.x;
    this.originY = this.center.y;
    this.startTime = 0;
}


SoundShape.prototype.setDefaults = function(sTime) {
    this.center.x = this.originX;
    this.center.y = this.originY;
    this.acceleration = (Math.random()*0.05)+0.05;
    this.startTime = sTime;
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

SoundShape.prototype.setRGBRatio = function(rSum,gSum,bSum) {
    this.redRGBRatio = rSum/(bSum+gSum);
    this.greenRGBRatio = gSum/(rSum+bSum);
    this.blueRGBRatio = bSum/(rSum+gSum);
    this.RGBRatio = this.redRGBRatio+this.greenRGBRatio+this.blueRGBRatio;
}

SoundShape.prototype.saveCircle = function(imgData) {
    var sum = 0;
    var rSum = 0;
    var gSum = 0;
    var bSum = 0;
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
                rSum += this.savedCircleRedData.data[pcount];
                bSum += this.savedCircleBlueData.data[pcount];
                gSum += this.savedCircleGreenData.data[pcount];
                
                sum += (this.savedCircleRedData.data[pcount]+this.savedCircleGreenData.data[pcount]+this.savedCircleBlueData.data[pcount]);
                pcount++;
            }
        }
    }
    this.diffTol = sum*0.2;
    this.setRGBRatio(rSum,gSum,bSum);
    this.haveSavedCircle = true;
    console.log("Saved circle NumPoints: ",pcount,this.RGBRatio,this.redRGBRatio,this.greenRGBRatio,this.blueRGBRatio);
}

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

SoundShape.prototype.findSavedCircleByPercMag = function(imgData) {
    var numPixels = 0;
    var yStarts = {'data':[]};
    var xStarts = {'data':[]};
    var yEnds = {'data':[]};
    var xEnds = {'data':[]};
    var st = 6;
    var newXOrig = 0;
    var newYOrig = 0;
    var min = 9999999999.0;
    var max = -9999999999.0;
    var rSum = 0;
    var gSum = 0;
    var bSum = 0;
    var movedOn = -1;
    var selfIndex = 8;
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
    //self
    yStarts.data[8] = Math.round((this.center.y) - this.radius);
    yEnds.data[8]  = Math.round((this.center.y) + this.radius);
    xStarts.data[8] = Math.round((this.center.x) - this.radius);
    xEnds.data[8]  = Math.round((this.center.x) + this.radius);

    if(this.haveSavedCircle) {
        min = 9999999999.0;
        max = -9999999999.0;
        movedOn = -1;
        for(var c = 0; c<9; c++) {
            sum = 0;
            //save circle data and calculate greyscale freqs
            var pcount = 0;
            for(var i=yStarts.data[c]; i<yEnds.data[c]; i++) {
                for(var j=xStarts.data[c]; j<xEnds.data[c]; j++) {
                    var idx = (j + (i * output.width))*4;
                    if (this.isIn(j,i)) {
                        rSum += imgData.data[idx];
                        bSum += imgData.data[idx+1];
                        gSum += imgData.data[idx+2];
                        pcount++;
                    }
                }
            }
            var rDiff = (rSum/(gSum+bSum)) - this.redRGBRatio;
            var gDiff = (gSum/(rSum+bSum)) - this.greenRGBRatio;
            var bDiff = (bSum/(rSum+gSum)) - this.blueRGBRatio;
            var rgbDiffMagnitude = Math.sqrt((rDiff*rDiff)+(gDiff*gDiff)+(bDiff*bDiff));
          //  console.log("DATA: ",c,rDiff,gDiff,bDiff,rgbDiffMagnitude);
            if(rgbDiffMagnitude < this.diffTol) {
                if(rgbDiffMagnitude < min) {
                    min = rgbDiffMagnitude;
                    newXOrig = xStarts.data[c] + this.radius;
                    newYOrig = yStarts.data[c] + this.radius;
                    movedOn = c;
                }
            }
        }
        if(movedOn != selfIndex) {
            newXOrig = xStarts.data[movedOn] + this.radius;
            newYOrig = yStarts.data[movedOn] + this.radius;
            this.currentOriginX = newXOrig;
            this.currentOriginY = newYOrig;
            this.setCenter({'x':newXOrig,'y':newYOrig});
            this.drawCircle();
            //play tone continuously
            this.tone = Math.sqrt((this.currentOriginX*this.currentOriginX)+(this.currentOriginY*this.currentOriginY));
            this.PlayTone();
            console.log("DATA: ",movedOn,rDiff,gDiff,bDiff,rgbDiffMagnitude);
        } else {
            if(this.playing)
                this.PauseTone();
        }
    } //if have saved circle
} //emd proto

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


