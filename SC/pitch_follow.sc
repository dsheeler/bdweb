(

SynthDef(\pitch_follow, { arg out_bus;
  var amp, in, signal, freq, has_freq;
  in = Mix.new(SoundIn.ar([0, 1]));
  amp = Amplitude.kr(in, 0.05, 0.05);
  #freq, has_freq = Pitch.kr(in, ampThreshold: 0.02, median: 7);
  //freq.plot();
  Out.kr(out_bus, freq);
}).load(s);

b = Bus.control(s, 1);

)

(
c = Synth(\pitch_follow, b);
f = nil;
t = Task({
  inf.do({
    b.get({arg val; f = val;});
    f.postln;
    0.1.wait();
  });
});

t.play();

)