function BassDrum(context) {
  this.osc = context.createOscillator();
  this.osc.frequency.value = 45
  this.osc.type = this.osc.SINE;
  this.osc.start(0);

  //envelope with 0.001 sec attack and 0.5 sec decay
  this.envelope = context.createEnvelope(0.05, 0.08, 0.6,0.09);

  this.waveShaper = context.createWaveShaper();
  this.numpts = 2048;
  this.wsCurve = new Float32Array(this.numpts);

  for (var i = 0; i < this.numpts; i++) {
    this.wsCurve[i] = Math.atan(2*i/this.numpts - 1);
  }

  this.waveShaper.curve = this.wsCurve;

  this.g = context.createGain();
  this.g.gain.value = 0.7;
  this.osc.connect(this.g);
  this.g.connect(this.envelope);

  this.envelope.connect(this.waveShaper);

}

BassDrum.prototype.trigger = function(){
  this.envelope.trigger(0.4);
}

BassDrum.prototype.connect = function(dest){
  this.waveShaper.connect(dest);
}

/*
Sine Wave Generator for Web Audio API.
Currently works on Chrome.

Mohit Cheppudira - http://0xfe.blogspot.com
*/

/* Create a generator for the given AudioContext. */
SineWave = function(context) {
  this.context = context;
  this.frequency = 440;
  this.amplitude = 0.1;
  this.playing = false;
  this.osc = this.context.createOscillator();
  this.gain = this.context.createGain();
  this.gain.gain.value = 0;
  this.osc.connect(this.gain);
  this.osc.start(0);
  this.fmosc = this.context.createOscillator();
  this.fmosc.frequency.value = 5;
  this.fmosc.start(0);
  this.fmgain = this.context.createGain();
  this.fmgain.gain.value = this.osc.frequency.value * 0.015;
  this.fmosc.connect(this.fmgain);
  this.fmgain.connect(this.osc.frequency);
}

SineWave.prototype.setAmplitude = function(amplitude) {
  this.amplitude = amplitude;
}

SineWave.prototype.setFrequency = function(freq) {
  this.frequency = freq;
  if (this.osc) this.osc.frequency.value = this.frequency;
}

SineWave.prototype.play = function() {
  if (!this.playing) {
    this.osc.frequency.value = this.frequency;
    this.gain.gain.setValueAtTime(0, this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(this.amplitude*1.5, 0.001 + this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(this.amplitude,  0.1 + this.context.currentTime);
    this.playing = true;
  }
}

SineWave.prototype.pause = function() {
  if (this.playing) {
    var delay = 0.1;
    var release = 1.50;
    this.gain.gain.cancelScheduledValues(this.context.currentTime);
    this.gain.gain.value = this.amplitude;
    this.gain.gain.setValueAtTime(this.amplitude, 0.001 + this.context.currentTime);
    this.gain.gain.setTargetAtTime(0, this.context.currentTime+0.01, release);
    var self = this;
    setTimeout(function() { self.fmosc.stop(0); self.osc.stop(0); }, 10*release*1000);
    this.playing = false;
  }
}

SineWave.prototype.getOutNode = function() {
  return this.gain;
}
