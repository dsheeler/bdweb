var myself;

PeakMeter = function(canvasId, audioContext, channelNum) {
  myself = this;
  this.aContext = audioContext;
  this.node = this.aContext.createScriptProcessor(2048);
  this.bufSize = this.node.bufferSize;
  this.sampleRate = this.aContext.sampleRate;
  this.canvas = document.getElementById(canvasId);
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.cContext = this.canvas.getContext('2d');
  this.channelNum = channelNum;

  this.gradient = this.cContext.createLinearGradient(0,0,0,this.height);
  this.gradient.addColorStop(1,'#0000ff');
  this.gradient.addColorStop(0.5,'#00ff00');
  this.gradient.addColorStop(0.38, '#ffff00');
  this.gradient.addColorStop(0,'#ff0000');

  this.dgradient = this.cContext.createLinearGradient(0,0,0,this.height);
  this.dgradient.addColorStop(1,'#000066');
  this.dgradient.addColorStop(0.5,'#006600');
  this.dgradient.addColorStop(0.38, '#666600');
  this.dgradient.addColorStop(0,'#660000');

  this.flag = 0;
  this.rms = 0;
  this.dpk = 0;
  this.z1 = 0;
  this.z2 = 0;
  this.cnt = 0;
  this.allTimePeak = 0;

  this.omega = 9.72 / this.sampleRate;
  var t = this.bufSize/this.sampleRate;
  var holdTime = 0.33;
  var fallbackRate = 10; /*dB/s*/
  this.hold = Math.round(holdTime/t + 0.5);
  this.fall = Math.pow(10.0, -0.05 * fallbackRate * t);

  this.lineWidth = 6;

  var me = this;
  this.node.onaudioprocess = function(e) {
    me.process(e);
  }
}

PeakMeter.prototype.update = function(timestamp) {
  
  var w = this.canvas.width;
  var h = this.canvas.height;
  var bottom = h - 11 - this.mapk20(1e-10);

  this.cContext.fillStyle = '#000000';
  this.cContext.fillRect(0, 0, 60, h);

  this.cContext.fillStyle = this.dgradient;
  this.cContext.fillRect(4, 20, this.lineWidth, bottom - 20 + 1);

  var kr = this.mapk20(this.rms);
  var kp = this.mapk20(this.dpk);
  var dp = kp - kr;

  var y = h - 11 - kr;
  this.cContext.fillStyle = this.gradient;
  this.cContext.fillRect(4,y,this.lineWidth, bottom - y + 1);

  y = h - 11 - kp;
  if (y < bottom - 1) {
    this.cContext.fillStyle = '#ffffff';
    this.cContext.fillRect(4, y, this.lineWidth, 3);
  }

  this.cContext.fillStyle = this.gradient;

  this.drawTick(h, 1e-10, "");
  this.drawTick(h, 0.001, "-40");
  this.drawTick(h, 0.003162, "-30");
  this.drawTick(h, 0.01, "-20");
  this.drawTick(h, 0.03162, "-10");
  this.drawTick(h, 0.05, "-6");
  this.drawTick(h, 0.0708, "-3");
  this.drawTick(h, 0.1, "0");
  this.drawTick(h, 0.1413, "3");
  this.drawTick(h, 0.1995, "6");
  this.drawTick(h, 0.3162, "10");
  this.drawTick(h, 0.55, "15");
  this.drawTick(h, 1, "20");

  this.cContext.fillStyle = '#ffffff';
  var peakdb = 20 * Math.log(this.allTimePeak) / Math.log(10);
  peakdb = Math.floor(peakdb * 10) / 10;
  this.cContext.fillText(peakdb, 0, 10);

  this.flag = 1;
  var me = this;
  requestAnimationFrame(function(timestamp) {
    me.update(timestamp);
  });

}

PeakMeter.prototype.process = function(e) {
  var in1 = e.inputBuffer.getChannelData(this.channelNum);

  var s, t, z1, z2;

  if (this.flag) {
    this.rms = 0;
    this.flag = 0;
  }

  z1 = this.z1;
  z2 = this.z2;

  t = 0;
  var n = in1.length / 4;
  var p = 0;
  while (n--) {
    s = in1[p++];
    s *= s;
    if (t < s) t = s;
    z1 += this.omega * (s - z1);

    s = in1[p++];
    s *= s;
    if (t < s) t = s;
    z1 += this.omega * (s - z1);

    s = in1[p++];
    s *= s;
    if (t < s) t = s;
    z1 += this.omega * (s - z1);

    s = in1[p++];
    s *= s;
    if (t < s) t = s;
    z1 += this.omega * (s - z1);
    z2 += 4 * this.omega * (z1 - z2);
  }

  t = Math.sqrt(t);

  this.z1 = z1 + 1e-20;
  this.z2 = z2 + 1e-20;

  s = Math.sqrt(2 * z2);
  if (s > this.rms) this.rms = s;

  if (t > this.allTimePeak) this.allTimePeak = t;

  if (t > this.dpk) {
    this.dpk = t;
    this.cnt = this.hold;
  } else if (this.cnt) {
    this.cnt--;
  } else {
    this.dpk *= this.fall;
    this.dpk += 1e-10;
  }

}

PeakMeter.prototype.drawTick = function(h, v, text) {
  var mapped = this.mapk20(v);
  var y = h - 11 - mapped;
  this.cContext.fillRect(10, y, 10, 1);
  this.cContext.fillText(text, 20, y+2);
}

PeakMeter.prototype.mapk20 = function(v) {
  if (v < 0.001) return (24000 * v);
  v = Math.log (v) / Math.log(10) + 3;
  if (v < 2.0) return (24.3 + v * (100 + v * 16));
  if (v > 3.0) v = 3.0;
  return (v * 160 - 31.7);
}


PeakMeter.prototype.getAudioNode = function () {
  return this.node;
}

PeakMeter.prototype.getCanvasContext = function() {
  return this.cContext;
}
