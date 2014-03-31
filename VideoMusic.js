function VideoMusic(container_sel) {
  this.oldData;
  this.newData;
  this.threshold = 75;
  this.aContext;
  this.localVideo;
  this.soundShapes = [];
  this.oldDataCheck = -1;
  this.frameCount = 0;
  this.meter = null;
  this.stage;
  this.shapes_layer;
  this.video_layer;
  this.videoImg;
  this.cPressed = false;

  this.feedbackDelay = 0;
  this.compressor = 0;
  this.convolver = 0;
  this.masterBus = 0;
  this.width = 640;
  this.height = 480;
  this.ionian = [0,2,4,5,7,9,11,12];
  this.aeolian = [0,2,3,5,7,9,10,12];
  this.chromatic = [0,1,2,3,4,5,6,7,8,9,10,11,12];

  this.sel = container_sel;
  this.kcontainer_id = 'kinetic_container';
  this.local_video_id = 'localVideo';
  this.master_bus_id = 'masterBus';
  this.master_volume_gain_value_id = 'master_volume_gain';
  this.delay_id = 'delay';
  this.delay_time_id = 'delay_time';
  this.feedback_id = 'feedback';
  this.delay_gain_id = 'delay_gain';
  this.controls_class = 'controls';
  this.peak_id = 'peak';

  $(this.sel).append('\
  <div style="float:left" id="' + this.kcontainer_id + '"></div>\
    <canvas id="' + this.peak_id + '"></canvas>\
    <div class="' + this.controls_class + '">\
      <div class="control">\
        <div class="control_label">Master Volume </div>\
        <div class="control_sub_label">Gain: <span\
         id="' + this.master_volume_gain_value_id + '"></span></div>\
        <div id="'+ this.master_bus_id + '" class="slider"></div>\
      </div>\
      <div class="control">\
        <div class="control_label">Delay</div>\
        <div class="control_sub_label">Time: <span id="delay_time"></span></div>\
        <div id="' + this.delay_id + '" class="slider"></div>\
        <div class="control_sub_label">Feedback: <span id="delay_gain"></span></div>\
        <div id="' + this.feedback_id + '" class="slider"></div>\
      </div>\
    </div>\
    <div id="videos">\
      <video id="' + this.local_video_id + '" muted  autoplay style="visibility:hidden"></video>\
    </div>');

  $('#' + this.kcontainer_id).css('height', this.height + 'px');

  this.localVideo = document.querySelector('#' + this.local_video_id);
  var localStream;

  var actxCall = window.webkitAudioContext || window.AudioContext;
  this.aContext = new actxCall();
  this.meter = new PeakMeter('peak', this.aContext);
  this.masterBus = this.aContext.createGain();
  $('#' + this.master_bus_id).slider({
    range: 'min',
    min: 0,
    max: 100,
    value: 75,
    slide: function(event, ui) {
      this.masterBus.gain.value = ui.value/100;
      $('#' + this.master_volume_gain_value_id).html(this.masterBus.gain.value.toPrecision(3));
    }.bind(this)
  });
  this.masterBus.gain.value = $('#' + this.master_bus_id).slider('value')/100;
  $('#' + this.master_volume_gain_value_id).html(this.masterBus.gain.value.toPrecision(3));

  this.stage = new Kinetic.Stage({
    container: this.kcontainer_id,
    width: this.width,
    height: this.height,
  });

  this.shapes_layer = new Kinetic.Layer();
  this.video_layer = new Kinetic.Layer();
  var bg = new Kinetic.Rect({
    x: 0,
    y: 0,
    width: this.stage.getWidth(),
    height: this.stage.getHeight(),
    id: 'bg'
  });

  this.stage.add(this.video_layer);
  this.stage.add(this.shapes_layer);
  this.shapes_layer.add(bg);

  this.convolver = this.aContext.createConvolver();
  var noiseBuffer = this.aContext.createBuffer(2, 1 * this.aContext.sampleRate,
   this.aContext.sampleRate),
   left = noiseBuffer.getChannelData(0),
   right = noiseBuffer.getChannelData(1);
  for (var i = 0; i < noiseBuffer.length; i++) {
    left[i] = Math.random() * 2 - 1;
    right[i] = Math.random() * 2 - 1;
  }
  this.convolver.buffer = noiseBuffer;
  this.compressor = this.aContext.createDynamicsCompressor();
  this.feedbackDelay = this.aContext.createFeedbackDelay(0.2, 0.5);
  $('#' + this.delay_id).slider({
    range: 'min',
    min: 0,
    max: 100,
    value: 40,
    slide: function(event, ui) {
      this.feedbackDelay.delayTime.value = ui.value/100;
      $('#' + this.delay_time_id).html(this.feedbackDelay.delayTime.value.toPrecision(3));
    }.bind(this)
  });
  this.feedbackDelay.delayTime.value = $('#' + this.delay_id).slider('value')/100;
  $('#' + this.delay_time_id).html(this.feedbackDelay.delayTime.value.toPrecision(3));

  $('#' + this.feedback_id).slider({
    range: 'min',
    min: 0,
    max: 100,
    value: 50,
    slide: function(event, ui) {
      this.feedbackDelay.gainNode.gain.value = ui.value/100;
      $('#' + this.delay_gain_id).html(this.feedbackDelay.gainNode.gain.value.toPrecision(3));
    }.bind(this)
  });
  this.feedbackDelay.gainNode.gain.value = $('#' + this.feedback_id).slider('value')/100;
  $('#' + this.delay_gain_id).html(this.feedbackDelay.gainNode.gain.value.toPrecision(3));

  this.feedbackDelay.connect(this.compressor);
  this.convolver.connect(this.compressor);
  this.compressor.connect(this.masterBus);
  this.masterBus.connect(this.aContext.destination);
  this.masterBus.connect(this.meter.getAudioNode());
  var numNotes = this.ionian.length;
  var xDelta = 1/(numNotes + 1);


  for(var i = 0; i < numNotes; i++) {
    var k = 0;
    var idx = i;
    var freq = 440 * Math.pow(1.05946,this.ionian[i]);

    var ss = new SoundShape(this.shapes_layer, this.aContext,
     {'x':xDelta*(i+1)*this.width, 'y':this.height/4},
     SINE_WAVE,
     freq,
     this.width/(numNotes*3),
     (i+1) + "\n" + freq.toPrecision(4));

    this.soundShapes.push(ss);
    ss.connect(this.feedbackDelay);
    //convolver.connect(masterBus);
    //ss.aSineWave.getOutNode().connect(convolver);
    ss.setAmplitude(0.1);
  }

  numNotes = this.aeolian.length;
  var xDelta = 1/(numNotes + 1);
  for(var i = 0; i < numNotes; i++) {
    var k = 0;
    var idx = i;
    var freq = 220 * Math.pow(1.05946,this.aeolian[i]);

    var ss = new SoundShape(this.shapes_layer, this.aContext,
     {'x':xDelta*(i+1)*this.width, 'y':this.height/2.5},
     SINE_WAVE,
     freq,
     this.width/(numNotes *3),
     (i+1) + "\n" + freq.toPrecision(4));

    ss.setAmplitude(0.5);
    this.soundShapes.push(ss);
    ss.connect(this.convolver);
  }

  var bassSs = new SoundShape(this.shapes_layer, this.aContext,
      {'x':this.width/4, 'y':this.height/2},
      {'instrument': BASS_DRUM, 'frequency': 75, 'att': 0.0001, 'dec': 0.0008,
       'sus': 0.99, 'rel': 0.01, 'dur': 0.05},
      0,
      this.width/10,
      "Bass High"
      );
  bassSs.connect(this.compressor);
  this.soundShapes.push(bassSs);

  var bassSs2 = new SoundShape(this.shapes_layer, this.aContext,
      {'x':3*this.width/4, 'y':this.height/2},
      {'instrument': BASS_DRUM, 'frequency': 45, 'att': 0.00001, 'dec': 0.00018,
       'sus': 0.8, 'rel': 0.09, 'dur': 0.1},
      0,
      this.width/10,
      "Bass Low"
      );
  bassSs2.connect(this.compressor);
  this.soundShapes.push(bassSs2);
  console.log("Made soundShapes:",this.soundShapes.length);

  this.shapes_layer.on('mousemove', function(e) {
    if (!this.connectDragging) return;
    if (this.connectDragging.cPressed && this.mousePressed) {
      var offsetX = e.offsetX || e.layerX,
          offsetY = e.offsetY || e.layerY;
      if (this.connectDragging.tempLine != null) {
        this.connectDragging.tempLine.destroy();
      }
      this.connectDragging.tempLine = new Kinetic.Line({
        points: [this.connectDragging.center.x, this.connectDragging.center.y,
         offsetX, offsetY],
        stroke: '#00b0a0',
        lineCap: 'round'
      })
      this.connectDragging.tempLine.listening(false);
      this.shapes_layer.add(this.connectDragging.tempLine);
      this.shapes_layer.draw();
    }
  });

  window.onkeypress = function(e) {
    var unicode = e.charCode ? e.charCode : e.keyCode;
    var actualkey = String.fromCharCode(unicode);
    if (actualkey == "c") {
      this.cPressed = !this.cPressed;
      for (var i = 0; i < this.soundShapes.length; i++) {
        this.soundShapes[i].cPressed = this.cPressed;
        this.connectDragging = null;
      }
    }
  }

  $('.' + this.controls_class).css('width', this.width + 'px');
  $('#' + this.kinetic_container_id).css('height', this.height + 'px');

  this.startMedia();

}

VideoMusic.prototype.startMedia = function() {
  var constraints = {video: {mandatory: {
    minWidth:this.width, minHeight:this.height}}, audio: true};
  getUserMedia(constraints, this.VideoMusicHandleUserMedia.bind(this), this.VideoMusicHandleUserMediaError.bind(this));
  console.log('Getting user media with constraints', constraints);
}

VideoMusic.prototype.VideoMusicHandleUserMedia = function(stream) {
  console.log('Adding local stream.');
  if (this.localVideo == null) {
    this.localVideo = document.querySelector('#' + this.local_video_id);
  }
  attachMediaStream(this.localVideo, stream);
  this.meter.getAudioNode().connect(this.aContext.destination);
  var streamAudio = this.aContext.createMediaStreamSource(stream);
  streamAudio.connect(this.meter.getAudioNode());
  this.localStream = stream;
  //streamAudio.connect(feedbackDelay);
  reqAnimFrame(this.draw.bind(this));

}


VideoMusic.prototype.draw = function(timestamp) {

  try {

    var tmpCanvas = this.video_layer.getCanvas();
    var tmpContext = tmpCanvas.getContext('2d');

    tmpContext.save();
    tmpContext.translate(this.width/2, this.height/2);
    tmpContext.scale(-1,1);
    tmpContext.translate(-this.width/2, -this.height/2);
    tmpContext.drawImage(this.localVideo,0,0,this.width,this.height);
    tmpContext.restore();
    var imgData = tmpContext.getImageData(0, 0, this.width,this.height);
        if(this.oldDataCheck != 1) {
	    this.oldData = {'data':[]};
        for(var i=0; i<this.width*this.height*4; i++) {
	        this.oldData.data[i] = imgData.data[i];
        }
    }
    for(var i=0; i < this.height; i++) {
      for(var j=0; j < this.width; j++) {
        var idx = (j + (i * this.width))*4;
        imgData.data[idx] = imgData.data[idx+1]
         = imgData.data[idx+2]
         = imgData.data[idx]*0.3+imgData.data[idx+1]*0.59
         +imgData.data[idx+2]*0.1;
	      var diff = imgData.data[idx] - this.oldData.data[idx];
	      this.oldData.data[idx] = this.oldData.data[idx+1] = this.oldData.data[idx+2] = imgData.data[idx];
	      imgData.data[idx] = imgData.data[idx+1] = imgData.data[idx+2] = diff;
	    }
    }
    var yCenterMin1 = 999999;
    var yCenterMin2 = 999999;
    var yCenterMin3 = 999999;
    var playCol1Idx = -1;
    var playCol2Idx = -1;
    var playCol3Idx = -1;
    for(var i = 0; i< this.soundShapes.length; i++) {
        var idx = i;
        this.soundShapes[idx].processDiff(imgData, this.width);
        //first column
	      if(j == 0) {
          if (this.soundShapes[idx].activated) {
            if (this.soundShapes[idx].center.y < yCenterMin1) {
		          yCenterMin1 = this.soundShapes[idx].center.y;
		          playCol1Idx = idx;
	          }
          }
        }
	      //second column
	      if(j == 1) {
          if (this.soundShapes[idx].activated) {
            if (this.soundShapes[idx].center.y < yCenterMin2) {
              yCenterMin2 = this.soundShapes[idx].center.y;
              playCol2Idx = idx;
            }
          }
        }
	      //third
	      if(j == 2) {
          if(this.soundShapes[idx].activated) {
            if(this.soundShapes[idx].center.y < yCenterMin3) {
              yCenterMin3 = this.soundShapes[idx].center.y;
              playCol3Idx = idx;
            }
          }
        }
    } //end for i
    //play highest Ys
    //if(frameCount % 10 == 0 ) {
      if(playCol1Idx != -1)
        this.soundShapes[playCol1Idx].playFromOutSide();
      if(playCol2Idx != -1)
        this.soundShapes[playCol2Idx].playFromOutSide();
      if(playCol3Idx != -1)
        this.soundShapes[playCol3Idx].playFromOutSide();

    //}
    this.oldDataCheck = 1;
  } catch (e) {
    if (e.name != "NS_ERROR_NOT_AVAILABLE") {
      throw e;
    }
  }
  this.frameCount++;
  reqAnimFrame(this.draw.bind(this));
  if(this.frameCount > 1000)
    this.frameCount = 0;
}

VideoMusic.prototype.VideoMusicHandleUserMediaError = function(error){
  console.log('navigator.getUserMedia error: ', error);
}


