fork{
	// notes sequence
	var seq = Pxrand([0,3,5,7,8],inf).asStream;
	loop{
		var dur = 8;
		var num = 8;
		var root = 36;
		var freq = (seq.next+root).midicps;
		var spread = rrand(0.4,0.8);
		var attack = rrand(0.05, 0.3);

		// play the cluster
		play{
			var harm = Array.geom(num, 1, 1.5);
			var harma = Array.geom(num, 0.5, 0.8);
			var detune = Array.fill(num, { LFNoise2.kr(1,0.01,1) });
			var source = PinkNoise.ar;
			var bandwidth = Rand(0.001,0.01);
			var generator = [
				SinOsc.ar(freq*harm*detune, mul:harma*0.3).scramble,
				Resonz.ar(source, freq*harm*detune, bandwidth, mul:harma).scramble * 50
			].wchoose([0.2,0.8]);
			var snd = Splay.ar(generator,spread);
			snd * LFGauss.ar(dur, attack, loop:0, doneAction:2);
		};
		dur.wait;
	};

};

// global triple super gverb
{
	var in = In.ar(0,2);
	in = (in*0.2) + GVerb.ar(in, 220, 12, mul:0.6);
	in = (in*0.2) + GVerb.ar(in, 220, 12, mul:0.6);
	in = (in*0.2) + GVerb.ar(in, 220, 12, mul:0.6);
	ReplaceOut.ar(0, Limiter.ar(LeakDC.ar(in)))
}.play(addAction:\addToTail)