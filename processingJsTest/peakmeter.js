PeakMeter = function(context) {
  this.context = context;
  this.node = context.createScriptProcessor(1024);
  var me = this;
  this.node.onaudioprocess = function(e) {
    me.process(e);
  }
}

PeakMeter.prototype.process = function(e) {
  in1 = e.inputBuffer.getChannelData(0);
  console.log(in1[0]);
}

PeakMeter.prototype.getAudioNode = function () {
  return this.node;
}

