var BASS_DRUM = 1;
var SINE_WAVE = 2;
var BELL = 3;

var connectDragging = null;
var mousePressed = false;

//sound shape takes a canvas drawling context and an audio context and x y point
SoundShape = function(shapes_layer, aContext, center, instrumentOptions, tone, radius, label) {
  this.instrumentOptions = instrumentOptions;
  this.label = label;
   this.center = center;
   this.radius = radius;
   this.amplitude = 0;
   this.shapes_layer = shapes_layer;
   this.audioContext = aContext;
   this.tol = 0;
   this.tol2 = 0;
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
   this.Ionian = [0,2,4,5,7,9,11,12];
   this.Aeolian = [0,2,3,5,7,9,10,12];
   this.Chromatic = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
   this.makeScales();
   this.tone = tone;
   this.bell = new Bell(aContext);
   this.bassDrum = null;
   this.connections = [];
   this.kgroup = new Kinetic.Group({
  });
   this.soundShapesToTrigger = [];
  this.foreignTriggers = [];
  this.lines = [];
  this.triggersActive = false;
  this.cPressed = false;
  this.timeouts = [];
  this.tempLine = null;

  this.kshape = new Kinetic.Circle({
    x: this.center.x,
    y: this.center.y,
    fill: 'red',
    opacity: 0.5,
    radius: this.radius,
  });

  this.text = new Kinetic.Text({
    text: this.label,
    x: this.center.x - 2 * this.radius,
    y: this.center.y - 0.5 * this.radius,
    width: 4 * this.radius,
    offsetY: 9,
    fontSize: 18,
    fontFamily: 'Calibri',
    fill: '#AAA',
    //width: 380,
    //padding: 20,
    align: 'center'
  });

  this.kgroup = new Kinetic.Group({
    draggable: true
  });

  this.kgroup.add(this.kshape);
  this.kgroup.add(this.text);

  var me = this;

  this.kgroup.on('dblclick', function() {
    me.cancelTriggers();
    me.pause(me.player);
  });

  this.kgroup.on('mousedown', function() {
    mousePressed = true;
    if (me.cPressed) {
      connectDragging = me;
      this.setDraggable(false);
    } else {
      this.setDraggable(true);
    }
  });

  this.kgroup.on('mouseup', function() {
    mousePressed = false;
    if (me.cPressed) {
      if (connectDragging != null) {
        connectDragging.kgroup.setDraggable(true);
        if (connectDragging.hasSoundShapeToTrigger(me) > -1) {
          connectDragging.removeSoundShapeToTrigger(me);
        } else {
          connectDragging.addSoundShapeToTrigger(me, 0.2);
        }
        if (connectDragging.tempLine) {
          connectDragging.tempLine.destroy();
          me.shapes_layer.draw();
        }
        connectDragging = null;
      }
    }

      /*this.dragBoundFunc(function() {
        return { 
          x: this.getAbsolutePosition().x,
          y: this.getAbsolutePosition().y
        }
      });
    } else {
      this.dragBoundFunc(
        function() {
        return {
          x: this.pos.x,
          y: this.pos.y
        }
      });*/
    }
  );

  this.kgroup.on('dragmove', function(e) {
    if (!me.cPressed) {
      me.center.x = this.x() + me.kshape.x();
      me.center.y = this.y() + me.kshape.y();
      var newlines = [];
      for (var i = 0; i < me.foreignTriggers.length; i++) {
        me.foreignTriggers[i].reDrawLine(me);
      }
      while (me.lines.length) {
        var oldline = me.lines.pop();
        oldline.kline.destroy();
      }
      for (var i = 0; i < me.soundShapesToTrigger.length; i++) {
        var ss = me.soundShapesToTrigger[i].ss;
        var line = { from: me, to: ss, kline: new Kinetic.Line({
          points: [me.center.x, me.center.y, ss.center.x, ss.center.y],
          stroke: '#00b0a0',
          lineCap: 'round'
        })};
        me.shapes_layer.add(line.kline);
        newlines.push(line);
      }
      me.lines = newlines;
    }
  });

  this.shapes_layer.add(this.kgroup);

}

SoundShape.prototype.cancelTriggers = function() {
  if (this.triggersActive) {
    this.triggersActive = false;
    for (var i = 0; i < this.soundShapesToTrigger.length; i++) {
      this.soundShapesToTrigger[i].ss.cancelTriggers();
      this.soundShapesToTrigger[i].ss.pause(this);
      while (this.soundShapesToTrigger[i].ss.timeouts.length) {
        var timeout = this.soundShapesToTrigger[i].ss.timeouts.pop();
        clearTimeout(timeout);
      }
    }
  }
}

SoundShape.prototype.reDrawLine = function(to) {
  for (var i = 0; i < this.lines.length; i++) {
    if (this.lines[i].to == to) {
      var oldkline = this.lines[i].kline;
      oldkline.destroy();
      this.lines.splice(i, 1);
      var kline = new Kinetic.Line({
        points: [this.center.x, this.center.y, to.center.x, to.center.y],
        stroke: '#00b0a0',
        lineCap: 'round'
      });
      var newline = { from: this, to: to, kline: kline };
      this.lines.push(newline);
      this.shapes_layer.add(newline.kline);
    }
  }
}

SoundShape.prototype.play = function(caller) {
  if(!this.playing) {
    this.player = caller;
    this.playing = true;
    if (this.instrumentOptions.instrument == BASS_DRUM) {
      this.bassDrum = new BassDrum(aContext, this.instrumentOptions);
      for (var i = 0; i < this.connections.length; i++) {
        this.bassDrum.connect(this.connections[i]);
      }
      this.bassDrum.trigger();
      this.setFillStyle();
      this.onFrame = this.frameCount;
    } else {
      this.aSineWave = new SineWave(aContext);
      this.aSineWave.setFrequency(this.tone);
      this.aSineWave.setAmplitude(this.amplitude);
      for (var i = 0; i < this.connections.length; i++) {
        this.aSineWave.getOutNode().connect(this.connections[i]);
      }
      this.aSineWave.play();
      //this.bell.play();
      this.setFillStyle();
      this.onFrame = this.frameCount;
    }
    var self = this;
    this.triggersActive = true;
    for (var i = 0; i < this.soundShapesToTrigger.length; i++) {
      var ss = this.soundShapesToTrigger[i].ss;
      var dt = this.soundShapesToTrigger[i].delaySeconds;
      var dx = this.center.x - ss.center.x;
      var dx2 = dx * dx;
      var dy = this.center.y - ss.center.y;
      var dy2 = dy * dy; 
      var dist = Math.sqrt(dx2 + dy2);
      this.factor = dist/this.radius;
      this.timeouts.push(setTimeout(function(soundshape) {
       soundshape.play(self); 
      }, this.factor * dt * 1000, ss));
    }
  }
}

SoundShape.prototype.pause = function(caller) {
  if(this.playing) {
    if (this.player == caller) {

    this.playing = false;
    if (this.instrumentOptions.instrument == BASS_DRUM) {
      this.setFillStyle();
      this.offFrame = this.frameCount;
    } else {
      this.offFrame = this.frameCount;
      this.setFillStyle();
      this.aSineWave.pause();
    }
    var self = this;
    for (var i = 0; i < this.soundShapesToTrigger.length; i++) {
      var ss = this.soundShapesToTrigger[i].ss;
      var dt = this.soundShapesToTrigger[i].delaySeconds;
      var dx = this.center.x - ss.center.x;
      var dx2 = dx * dx;
      var dy = this.center.y - ss.center.y;
      var dy2 = dy * dy; 
      var dist = Math.sqrt(dx2 + dy2);
      this.factor = dist/this.radius;
      this.timeouts.push(setTimeout(function(soundshape) {
        soundshape.pause(self);
      }, this.factor * dt * 1000, ss));
    }
  }
  }
}

SoundShape.prototype.addForeignTrigger = function(ss) {
  this.foreignTriggers.push(ss);
}

SoundShape.prototype.addSoundShapeToTrigger = function(ss, delaySeconds) {
  var line = { from: this, to: ss, kline: new Kinetic.Line({
    points: [this.center.x, this.center.y, ss.center.x, ss.center.y],
    stroke: '#00b0a0',
    lineCap: 'round'
  })};
  this.lines.push(line);
  this.shapes_layer.add(line.kline);
  this.shapes_layer.draw();
  this.soundShapesToTrigger.push({'ss':ss, 'delaySeconds':delaySeconds});
  ss.addForeignTrigger(this);
}

SoundShape.prototype.hasSoundShapeToTrigger = function(ss) {
  for (var i = 0; i < this.soundShapesToTrigger.length; i++) {
    if (this.soundShapesToTrigger[i].ss == ss) {
      break;
    }
  }
  if (i < this.soundShapesToTrigger.length) {
    return i;
  } else {
    return -1;
  }
}

SoundShape.prototype.removeSoundShapeToTrigger = function(ss) {
  var index = this.hasSoundShapeToTrigger(ss);
  if (index > -1) {
    this.soundShapesToTrigger.splice(index,1);
  }
}

SoundShape.prototype.connect = function(node) {
  this.connections.push(node);
}

SoundShape.prototype.setCenter = function(p) {
  this.center = p;
}

SoundShape.prototype.setAmplitude = function(a) {
  this.amplitude = a;
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

SoundShape.prototype.setFillStyle = function() {

 if (!this.playing) {
    this.kshape.setFill('rgb(30,100,80)');
  } else {
    this.kshape.setFill('rgb(30, 240, 180)');
  }
  this.shapes_layer.draw();
}

SoundShape.prototype.processDiff = function(diffData, width) {
  this.frameCount++;
  if (!this.triggersActivated) {
    var sum = 0;
    var yStart = Math.round(this.center.y - this.radius) 
    var yEnd  = Math.round(this.center.y + this.radius);
    var xStart = Math.round(this.center.x - this.radius);
    var xEnd  = Math.round(this.center.x + this.radius);
    for(var i=yStart; i<yEnd; i++) {
      for(var j=xStart; j<xEnd; j++) {
        var idx = (j + (i * width))*4;
        if (this.isIn(j,i)) {
          sum += diffData.data[idx]*diffData.data[idx];
        }
      }
    }
    if(sum == 0 || isNaN(sum)) {
      return;
    }
    this.activatedSum = this.activatedSum + Math.sqrt(sum);

    if(this.gettingBaseLine) {
      if(this.activatedCount == 100) {
	      this.basis = this.activatedSum/this.activatedCount;
        this.activatedCount = 0;
        this.gettingBaseLine = false;
        this.tol = this.basis * 1.5;
        this.tol2 = this.basis * 1.55;
        console.log("Basis, Tol, Tol2:",this.activatedSum,this.basis,this.tol,this.tol2);
      } else {
        this.activatedCount++;
      }
    } else {
      if(this.activatedCount == this.activatedCountTol) {
        if(this.activatedSum/this.activatedCountTol > this.tol) {
          this.play(this);
        } else if(this.activatedSum/this.activatedCountTol < this.tol2) {
          this.pause(this);
        }
        this.activatedSum = 0.0;
        this.activatedCount = 0;
      } else {
        this.activatedCount++;
      }
    }
  }
}

SoundShape.prototype.GetEntropy = function(imgData, width) {

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
      var idx = (j + (i * width))*4;
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

SoundShape.prototype.GetEntropyChange = function(imgData, width) {
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
      var idx = (j + (i * width))*4;
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
