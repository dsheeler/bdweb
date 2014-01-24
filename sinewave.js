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

  this.masterGain = this.context.createGain();
  this.osc = this.context.createOscillator();
  this.osc.frequency.value = this.frequency;
  this.gain = this.context.createGain();
  this.gain.gain.value = 0;
  this.gain.connect(this.masterGain);
  this.osc.connect(this.gain);
}

SineWave.prototype.setAmplitude = function(amplitude) {
  this.amplitude = amplitude;
}

SineWave.prototype.setFrequency = function(freq) {
  this.frequency = freq;
  this.osc.frequency.value = this.frequency;
}

SineWave.prototype.play = function() {
  console.log('play called');
  if (!this.playing) {
    console.log('play: inside'); 
    this.playing = true;
    this.osc.start(this.context.currentTime);
    this.gain.gain.cancelScheduledValues(0.0);
    this.gain.gain.setValueAtTime(0.0, 0.000001 + this.context.currentTime);

    //this.gain.gain.linearRampToValueAtTime(0.1, 0.2 + this.context.currentTime);
    //his.gain.gain.linearRampToValueAtTime(0, 0.1 + this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(0.15, 0.1 + this.context.currentTime);
    this.gain.gain.linearRampToValueAtTime(0.1, 0.2 + this.context.currentTime);
  }
}

SineWave.prototype.pause = function() {
  console.log('pause called');
  if (this.playing) {
    console.log('inside pause');
    var release = 10;
    var oldGain = this.gain;
    var oldOsc = this.osc;
    oldGain.gain.cancelScheduledValues(0);
    oldGain.gain.setValueAtTime(this.amplitude, 0.0001 + this.context.currentTime);
    oldGain.gain.linearRampToValueAtTime(0.000000000001, release + this.context.currentTime);
    this.playing = false;
    this.osc = this.context.createOscillator();
    this.osc.frequency.value = this.frequency;
    this.gain = this.context.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.masterGain);
    this.osc.connect(this.gain);
  }
}

SineWave.prototype.getOutNode = function() {
  return this.masterGain;
}
