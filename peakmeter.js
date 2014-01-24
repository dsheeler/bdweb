requestAnimationFrame = window.mozRequestAnimationFrame
 || window.webkitRequestAnimationFrame
 || window.msRequestAnimationFrame
 || window.oRequestAnimationFrame;

var BufSize = 2048;
PeakMeter = function(canvasId, audioContext) {
  this.aContext = audioContext;
  this.node = this.aContext.createScriptProcessor(BufSize);
  this.bufSize = this.node.bufferSize;
  this.sampleRate = this.aContext.sampleRate;
  this.canvas = document.getElementById(canvasId);
  this.cContext = this.canvas.getContext('2d');
  this.canvas.width = 80;
  this.canvas.height = 480;
  if (this.canvas.style.height == 0) {
    this.canvas.style.height = this.canvas.height + 'px';
  }

  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.headerHeight = 20;
  this.footerHeight = 10;
  this.barWidth = 6;
  this.tickWidth = 4;

  var barLength = this.height - this.headerHeight - this.footerHeight;
  this.gradient = this.cContext.createLinearGradient(0,0,0,barLength);
  this.gradient.addColorStop(1,'#0000ff');
  this.gradient.addColorStop(0.5,'#00ff00');
  this.gradient.addColorStop(0.38, '#ffff00');
  this.gradient.addColorStop(0,'#ff0000');

  this.dgradient = this.cContext.createLinearGradient(0,0,0,barLength);
  this.dgradient.addColorStop(1,'#000066');
  this.dgradient.addColorStop(0.5,'#006600');
  this.dgradient.addColorStop(0.38, '#666600');
  this.dgradient.addColorStop(0,'#660000');

  var NCHAN = 2;
  this.flag = new Array(NCHAN);
  this.rms = new Array(NCHAN);
  this.dpk = new Array(NCHAN);
  this.z1 = new Array(NCHAN);
  this.z2 = new Array(NCHAN);
  this.cnt = new Array(NCHAN);
  this.allTimePeak = 0;
  for (var i = 0; i < NCHAN; i++) {
    this.flag[i] = 0;
    this.rms[i] = 0;
    this.dpk[i] = 0;
    this.z1[i] = 0;
    this.z2[i] = 0;
    this.cnt[i] = 0;
  }
  this.NCHAN = NCHAN;

  this.omega = 9.72 / this.sampleRate;
  var t = this.bufSize/this.sampleRate;
  var holdTime = 0.33;
  var fallbackRate = 20; /*dB/s*/
  this.hold = Math.round(holdTime/t + 0.5);
  this.fall = Math.pow(10.0, -0.05 * fallbackRate * t);

  $('#' + canvasId).draggable();

  $('#' + canvasId).on('mousedown', { 'me': this }, function(e) {
    var position = $('#' + canvasId).position();
    var y = e.pageY - position.top;
    var yCanvasCoords = y / $(this).height() * e.data.me.height;
    if (yCanvasCoords <= e.data.me.headerHeight) {
      e.data.me.allTimePeak = 0;
    }
  });

  this.makeBackground();
  var me = this;
  requestAnimationFrame(function(timestamp) {
    me.update(timestamp);
  });

  this.node.onaudioprocess = function(e) {
    me.process(e);
  }
}

PeakMeter.prototype.connectNodeToInput = function(audioNode) {
  this.audioInputNodes.push(audioNode);
  audioNode.connect(this.node);
}

PeakMeter.prototype.drawData = function(x, chanNum) {
  var w = this.canvas.width;
  var h = this.canvas.height - this.headerHeight - this.footerHeight;
  var bottom = h;
  var kr = this.mapk20(this.rms[chanNum]);
  var kp = this.mapk20(this.dpk[chanNum]);
  var dp = kp - kr;

  var y = bottom - kr;
  this.cContext.fillStyle = this.gradient;
  this.cContext.fillRect(x,y,this.barWidth, bottom - y);

  y = bottom - kp;
  if (y < bottom - 1) {
    this.cContext.fillStyle = '#ffffff';
    this.cContext.fillRect(x, y, this.barWidth, 3);
  }
  this.flag[chanNum] = 1;
}


PeakMeter.prototype.drawBar = function(x, chanNum, tickSide) {
  var w = this.canvas.width;
  var h = this.canvas.height - this.headerHeight - this.footerHeight;
  var bottom = h;

  this.cContext.fillStyle = this.dgradient;
  this.cContext.fillRect(x, 0, this.barWidth, bottom);

  this.cContext.fillStyle = this.gradient;

  this.drawTick(h, 1e-10, "", "#6666ff");
  this.drawTick(h, 0.001, "-40", "#6666ff");
  this.drawTick(h, 0.001778, "", "#6666ff");
  this.drawTick(h, 0.003162, "-30", "#6666ff");
  this.drawTick(h, 0.00562, "", "#00ff00");
  this.drawTick(h, 0.01, "-20", "#00ff00");
  this.drawTick(h, 0.01778, "", "#00ff00");
  this.drawTick(h, 0.03162, "-10", "#00ff00");
  this.drawTick(h, 0.05, "-6", "#00ff00");
  this.drawTick(h, 0.0708, "-3", "#00ff00");
  this.drawTick(h, 0.1, "0", "#ffff00");
  this.drawTick(h, 0.1413, "3", "#FF4C00");
  this.drawTick(h, 0.1995, "6", "#FF4C00");
  this.drawTick(h, 0.3162, "10", "#FF4C00");
  this.drawTick(h, 0.562, "15", "#FF4C00");
  this.drawTick(h, 1, "20", "#FF4C00");
}

PeakMeter.prototype.makeBackground = function() {
  var w = this.canvas.width;
  var h = this.canvas.height - this.headerHeight - this.footerHeight;

  this.cContext.clearRect(0, 0, w, this.canvas.height);
  this.cContext.fillStyle = 'rgba(0, 0, 0, 0.6)';
  this.cContext.fillRect(0, 0, w, h + this.headerHeight + this.footerHeight);

  this.cContext.save();
  this.cContext.translate(0, this.headerHeight);

  var x = w/2 - this.tickWidth/2 - this.barWidth;
  this.drawBar(x, 0);
  x = w/2 + this.tickWidth/2;
  this.drawBar(x, 1);
  this.cContext.restore();
  this.backgroundImage = this.cContext.getImageData(0, 0, this.canvas.width,
   this.canvas.height);
}

PeakMeter.prototype.update = function(timestamp) {
  var w = this.canvas.width;
  var h = this.canvas.height - this.headerHeight - this.footerHeight;

  this.cContext.putImageData(this.backgroundImage, 0, 0);
  this.cContext.save();
  this.cContext.translate(0, this.headerHeight);

  var x = w/2 - this.tickWidth/2 - this.barWidth;
  this.drawData(x, 0);
  x = w/2 + this.tickWidth/2;
  this.drawData(x, 1);
  this.cContext.restore();

  this.drawMaxPeak();
  var me = this;
  requestAnimationFrame(function(timestamp) {
    me.update(timestamp);
  });

}

PeakMeter.prototype.drawMaxPeak = function() {
  this.cContext.fillStyle = '#ffffff';
  var peakdb = new Number(20 * Math.log(this.allTimePeak) / Math.log(10));
  if (peakdb <= -85) return;
  this.cContext.font = '16px sans';
  this.cContext.textBaseline = "middle";
  x = this.width/2;
  y = this.headerHeight/2;

  this.cContext.save();
  this.cContext.translate(x, y);
  this.cContext.scale(1/1.6, 1/1.6);
  this.cContext.translate(-x, -y);
  this.cContext.textAlign="center";
  this.cContext.fillText(peakdb.toPrecision(2), x, y);
  this.cContext.restore();


}

PeakMeter.prototype.drawTick = function(h, v, text, color) {
  var mapped = this.mapk20(v);
  if (mapped < 1) mapped = 1;
  var y = h - mapped;
  this.cContext.fillStyle = color;
  var xl = this.width/2 - 1.5*this.tickWidth - this.barWidth;
  this.cContext.fillRect(xl, y, this.tickWidth, 1);
  var xc = this.width/2 - 0.5*this.tickWidth;
  this.cContext.fillRect(xc, y, this.tickWidth, 1);
  var xr = this.width/2 + 0.5*this.tickWidth + this.barWidth;
  this.cContext.fillRect(xr, y, this.tickWidth, 1);
  this.cContext.font = '16px sans';
  this.cContext.textBaseline = "middle";
  x = xl - this.tickWidth - 2;
  y = y + 2;
  this.cContext.save();
  this.cContext.translate(x, y);
  this.cContext.scale(1/1.6, 1/1.6);
  this.cContext.translate(-x, -y);
  this.cContext.textAlign="end";
  this.cContext.fillText(text, x, y);
  this.cContext.restore();

  x = xr + this.tickWidth + 4;
  this.cContext.save();
  this.cContext.translate(x, y);
  this.cContext.scale(1/1.6, 1/1.6);
  this.cContext.translate(-x, -y);
  this.cContext.textAlign="start";
  this.cContext.fillText(text, x, y);
  this.cContext.restore();
}


PeakMeter.prototype.process = function(e) {
  var bufs = new Array();

  for (var i = 0; i < this.NCHAN; i++ ) {
    bufs[i] = e.inputBuffer.getChannelData(i);

    var s, t, z1, z2;

    if (this.flag[i]) {
      this.rms[i] = 0;
      this.flag[i] = 0;
    }

    z1 = this.z1[i];
    z2 = this.z2[i];

    t = 0;
    var n = bufs[i].length / 4;
    var p = 0;
    while (n--) {
      s = bufs[i][p++];
      s *= s;
      if (t < s) t = s;
      z1 += this.omega * (s - z1);

      s = bufs[i][p++];
      s *= s;
      if (t < s) t = s;
      z1 += this.omega * (s - z1);

      s = bufs[i][p++];
      s *= s;
      if (t < s) t = s;
      z1 += this.omega * (s - z1);

      s = bufs[i][p++];
      s *= s;
      if (t < s) t = s;
      z1 += this.omega * (s - z1);
      z2 += 4 * this.omega * (z1 - z2);
    }

    t = Math.sqrt(t);

    this.z1[i] = z1 + 1e-20;
    this.z2[i] = z2 + 1e-20;

    s = Math.sqrt(2 * z2);
    if (s > this.rms[i]) this.rms[i] = s;

    if (t > this.allTimePeak) this.allTimePeak = t;

    if (t > this.dpk[i]) {
      this.dpk[i] = t;
      this.cnt[i] = this.hold;
    } else if (this.cnt[i]) {
      this.cnt[i]--;
    } else {
      this.dpk[i] *= this.fall;
      this.dpk[i] += 1e-10;
    }
  }
}

PeakMeter.prototype.mapk20 = function(v) {
  if (v < 0.001) return (24000 * v);
  v = Math.log (v) / Math.log(10) + 3;
  if (v < 2.0) return (24.3 + v * (100 + v * 16));
  if (v > 3.0) v = 3.0;

  return (v * 161.7 - 35.1);
}


PeakMeter.prototype.getAudioNode = function () {
  return this.node;
}

PeakMeter.prototype.getCanvasContext = function() {
  return this.cContext;
}
