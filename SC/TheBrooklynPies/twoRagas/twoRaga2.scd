fork{
	// notes sequence
	var seq = Pxrand([0,3,5,7,8],inf).asStream;
	var apg = Pseq([0,4,5,7,10,12,10,7,5,4],inf).asStream;
	var apgRnd = Pxrand([0,4,6,7,10,12,10,7,5,4],inf).asStream;
	var major = Pseq([0, 4, 7,12],inf).asStream;
	var minor = Pseq([0, 3, 7,12],inf).asStream;
	var augmented = Pseq([0, 4, 8,12],inf).asStream;
	var diminished = Pseq([0, 3, 6,12],inf).asStream;
	var roots = Pxrand([32,44,56],inf).asStream;

	loop{
		var dur = 32;
		var num = 8;
		var root = roots.next;
		var freq = (root-12).midicps;
		var freq2 = (root+7).midicps;
		var spread = rrand(0.4,0.8);
		var attack = rrand(0.05, 0.3);
		var waitTime = 0;
		r = Task({
			var delta,aFreq,durSeq,anApg,chords,ha1,ha2,anApg2;
			if(0.5.coin, {
				durSeq = Pseq([1.0,0.5,1.0,0.5,1.0],1).asStream;
				anApg = Pxrand([0,4,5,7,11],inf).asStream;
				waitTime = 4.0;
				}, {
				durSeq = Pseq([2.0,1.0,2.0,1.0,2.0,1.0],1).asStream;
				anApg = Pxrand([0,4,5,7,11,12],inf).asStream;
				waitTime = 9.0;
			});

			aFreq = root;
			while {
				delta = durSeq.next;
				delta.notNil;
			} {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 0.75]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 0.75]);
				delta.wait;
			}
		}).play();
		waitTime.wait;
		q = Task({
			var delta,aFreq,durSeq,anApg,chords,ha1,ha2,anApg2;
			if(0.75.coin, {
				durSeq = Pseq([1.0,1.0,1.0,1.0,1.0],1).asStream;
				anApg = Pxrand([0,4,5,7,11],inf).asStream;
				waitTime = 5.0;
				}, {
				durSeq = Pseq([0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],1).asStream;
				anApg = Pxrand([0,4,5,7,11,12,16,17,19,23],inf).asStream;
				waitTime = 2.5;
				"Run Seq".postln;
			});

			aFreq = root;
			while {
				delta = durSeq.next;
				delta.notNil;
			} {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next+12).midicps, \pan, 0.0, \dur, delta, \amp, 0.75]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 0.75]);
				delta.wait;
			}
		}).play();
		waitTime.wait;
	};
};
