SynthDef("omgdist4", {|out=0,in=4,drive=0.3,type=0,amp=1|
   var sig;
   sig = SoundIn.ar(0)*drive;
	sig = tanh(sig);
   sig = sig * ((amp**2)*(1-(drive/2.6)));
	Out.ar(out,[sig, sig]);
}).send(s);


Synth(\omgdist4, [\drive, 1]);
Synth(\omgdist4, [\drive, 2]);
Synth(\omgdist4, [\drive, 4]);
Synth(\omgdist4, [\drive, 8]);
Synth(\omgdist4, [\drive, 16]);
Synth(\omgdist4, [\drive, 32]);
Synth(\omgdist4, [\drive, 64]);