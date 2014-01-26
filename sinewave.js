/*
Sine Wave Generator for Web Audio API.
Currently works on Chrome.

Mohit Cheppudira - http://0xfe.blogspot.com
*/

/* Create a generator for the given AudioContext. */
SineWave = function(context) {
  this.context = context;
  this.frequency = 440;
  this.amplitude = 0.4;
  this.playing = false;

  this.masterGain = this.context.createGain();
  this.osc = this.context.createOscillator();
  this.osc.frequency.value = this.frequency;
  this.gain = this.context.createGain();
  this.gain.gain.value = 0;
  this.gain.connect(this.masterGain);
  this.osc.connect(this.gain);
  this.osc.start(this.context.currentTime);
}

SineWave.prototype.setAmplitude = function(amplitude) {
  this.amplitude = amplitude;
}

SineWave.prototype.setFrequency = function(freq) {
  this.frequency = freq;
  this.osc.frequency.value = this.frequency;
}

SineWave.prototype.play = function() {
  if (!this.playing) {
    var delay = 1;
    this.gain.gain.cancelScheduledValues( this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(0.0, 0.1 + this.context.currentTime);
    //this.gain.gain.linearRampToValueAtTime(0.1, 0.2 + this.context.currentTime);
    //his.gain.gain.linearRampToValueAtTime(0, 0.1 + this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(this.amplitude*1.5, 0.101 + this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(this.amplitude,  0.102 + this.context.currentTime);
    this.playing = true;
  }
}

SineWave.prototype.pause = function() {
  if (this.playing) {
    var delay = 0.1;
    var release = 2.0;
    var oldGain = this.gain;
    var oldOsc = this.osc;
    var g = oldGain.gain.value;
    oldGain.gain.cancelScheduledValues(this.context.currentTime);
    oldGain.gain.linearRampToValueAtTime(this.amplitude, this.context.currentTime);
    oldGain.gain.linearRampToValueAtTime(0.0, release + this.context.currentTime);
    this.osc = this.context.createOscillator();
    this.osc.frequency.value = this.frequency;
    this.gain = this.context.createGain();
    this.gain.gain.linearRampToValueAtTime(0, this.context.currentTime);
    this.gain.connect(this.masterGain);
    this.osc.connect(this.gain);
    this.osc.start(this.context.currentTime);
    this.playing = false;
  }
}

SineWave.prototype.getOutNode = function() {
  return this.masterGain;
}
