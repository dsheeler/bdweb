fork{
	// notes sequence
	var seq = Pxrand([0,3,5,7,8],inf).asStream;
	var apg = Pseq([0,4,5,7,10,12,10,7,5,4],inf).asStream;
	var apgRnd = Pxrand([0,4,6,7,10,12,10,7,5,4],inf).asStream;
	var major = Pseq([0, 4, 7,12],inf).asStream;
	var minor = Pseq([0, 3, 7,12],inf).asStream;
	var augmented = Pseq([0, 4, 8,12],inf).asStream;
	var diminished = Pseq([0, 3, 6,12],inf).asStream;
	var roots = Pxrand([20,32,44,27,39,51],inf).asStream;

	loop{
		var dur = 32;
		var num = 8;
		var root = roots.next;
		var freq = (root-12).midicps;
		var freq2 = (root+7).midicps;
		var spread = rrand(0.4,0.8);
		var attack = rrand(0.05, 0.3);
		r = Task({
			var delta,aFreq,durSeq,anApg,chords,ha1,ha2,anApg2,semiTones;
			if(0.5.coin, {
				durSeq = Pseq([rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75)],1).asStream;
				anApg = Pxrand([0,4,5,7,11],inf).asStream;
				}, {
				durSeq = Pseq([rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75),rrand(0.25,0.75)],1).asStream;
				anApg = Pxrand([0,4,5,7,11,12],inf).asStream;
			});

			aFreq = root;
			while {
				delta = durSeq.next;
				delta.notNil;
			} {
				semiTones = anApg.next;
				if(semiTones % 2 == 0, {
					Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+semiTones).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
					Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+semiTones+7).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
					"Harmoney".postln;
					}, {
						if(semiTones == 7, {
							Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+semiTones).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
							Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+semiTones+9).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
							"Min Harm 7/9".postln;
							},{
							Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+semiTones).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
							Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+semiTones+12).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
							"Min Harm odd/12".postln;
						});
				});
				delta.wait;
			}
		}).play();
		rrand(1.0,5.0).wait;
		q = Task({
			var delta,aFreq,durSeq,anApg,chords,ha1,ha2,anApg2;
			if(0.5.coin, {
				durSeq = Pseq([rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75)],1).asStream;
				anApg = Pxrand([0,4,5,7,11],inf).asStream;
				}, {
				durSeq = Pseq([rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75),rrand(0.75,2.75)],1).asStream;
				anApg = Pxrand([0,4,5,7,11,12],inf).asStream;
			});

			aFreq = root;
			while {
				delta = durSeq.next;
				delta.notNil;
			} {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next+12).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
				delta.wait;
			}
		}).play();
		rrand(1.0,7.0).wait;
	};
};
