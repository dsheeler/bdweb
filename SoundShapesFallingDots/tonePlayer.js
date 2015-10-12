/*
Sine Wave Generator for Web Audio API.
Currently works on Chrome.

Mohit Cheppudira - http://0xfe.blogspot.com
*/

/* Create a generator for the given AudioContext. */
TonePlayer = function(context) {
  this.x = 0;
  this.context = context;
  this.sampleRate = this.context.sampleRate;
  this.frequency = 440;
  this.next_frequency = this.frequency;
  this.amplitude = 0.125;
  this.playing = false;
  this.nr = true; // noise reduction

  // Create an audio node for the tone generator
  this.node = context.createScriptProcessor(1024);

  // Setup audio data callback for this node. The callback is called
  // when the node is connected and expects a buffer full of audio data
  // in return.
  var that = this;
  this.node.onaudioprocess = function(e) { that.process(e) };
}

TonePlayer.prototype.setAmplitude = function(amplitude) {
  this.amplitude = amplitude;
}

// Enable/Disable Noise Reduction
TonePlayer.prototype.setNR = function(nr) {
  this.nr = nr;
}

TonePlayer.prototype.setFrequency = function(freq) {
  this.next_frequency = freq;

  // Only change the frequency if not currently playing. This
  // is to minimize noise.
  if (!this.playing) this.frequency = freq;
}

TonePlayer.prototype.process = function(e) {
  // Get a reference to the output buffer and fill it up.
  var right = e.outputBuffer.getChannelData(0),
      left = e.outputBuffer.getChannelData(1);

  // We need to be careful about filling up the entire buffer and not
  // overflowing.
  //amplitude ramp
  var rampAmp = []; 
  rampAmp[0] = 0.0001;
  rampAmp[1] = 0.0005;
  rampAmp[2] = 0.001;
  rampAmp[3] = 0.005;
  rampAmp[4] = 0.01;
  rampAmp[5] = 0.1;
  rampAmp[6] = 0.125;
  var rIdx = 0;
  for (var i = 0; i < right.length; ++i) {
    if(i < 7)
      rIdx = i; 
    right[i] = left[i] = rampAmp[rIdx] * Math.sin(
        this.x++ / (this.sampleRate / (this.frequency * 2 * Math.PI)));

    // A vile low-pass-filter approximation begins here.
    //
    // This reduces high-frequency blips while switching frequencies. It works
    // by waiting for the sine wave to hit 0 (on it's way to positive territory)
    // before switching frequencies.
    if (this.next_frequency != this.frequency) {
      if (this.nr) {
        // Figure out what the next point is.
        next_data = this.amplitude * Math.sin(
          this.x / (this.sampleRate / (this.frequency * 2 * Math.PI)));

        // If the current point approximates 0, and the direction is positive,
        // switch frequencies.
        if (right[i] < 0.00001 && right[i] > -0.00001 && right[i] < next_data) {
          this.frequency = this.next_frequency;
          this.x = 0;
        }
      } else {
        this.frequency = this.next_frequency;
        this.x = 0;
      }
    }
  }
}

TonePlayer.prototype.play = function() {
  // Plug the node into the output.
  this.node.connect(this.context.destination);
  this.playing = true;
}

TonePlayer.prototype.pause = function() {
  // Unplug the node.
  this.node.disconnect();
  this.playing = false;
}
