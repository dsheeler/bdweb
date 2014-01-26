/* Create a generator for the given AudioContext. */
Bell = function(context) {
  this.context = context;
  this.frequencies = [521, 732, 934];
  this.amps = [0.07, 0.045, 0.025];
  this.decays = [0.8, 0.8, 0.8];
  this.oscs = [];
  this.gains = [];
  this.playing = false;

  this.masterGain = this.context.createGain();
  for (var i = 0; i < this.frequencies.length; i++) {
    this.oscs[i] = this.context.createOscillator();
    this.oscs[i].frequency.value = this.frequencies[i];
    this.gains[i]= this.context.createGain();
    this.gains[i].gain.value = 0;
    this.gains[i].connect(this.masterGain);
    this.oscs[i].connect(this.gains[i]);
    this.oscs[i].start(this.context.currentTime);
  }
}

Bell.prototype.play = function() {
  for (var i = 0; i < this.oscs.length; i++) {
    this.gains[i].gain.cancelScheduledValues( this.context.currentTime);
    this.gains[i].gain.value = 0;
    //this.gain.gain.linearRampToValueAtTime(0.1, 0.2+ this.context.currentTime);
    //his.gain.gain.linearRampToValueAtTime(0, 0.1 + this.context.currentTime);
    this.gains[i].gain.linearRampToValueAtTime(this.amps[i], 0.001 + this.context.currentTime);
    this.gains[i].gain.setTargetAtTime(0, 0.001 + this.context.currentTime, this.decays[i]);
  }
}

Bell.prototype.getOutNode = function() {
  return this.masterGain;
}
