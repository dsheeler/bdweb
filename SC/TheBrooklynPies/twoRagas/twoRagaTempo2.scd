fork{
	// notes sequence
	var seq = Pxrand([0,3,5,7,8],inf).asStream;
	var apg = Pseq([0,4,5,7,10,12,10,7,5,4],inf).asStream;
	var apgRnd = Pxrand([0,4,6,7,10,12,10,7,5,4],inf).asStream;
	var major = Pseq([0, 4, 7,12],inf).asStream;
	var minor = Pseq([0, 3, 7,12],inf).asStream;
	var augmented = Pseq([0, 4, 8,12],inf).asStream;
	var diminished = Pseq([0, 3, 6,12],inf).asStream;
	var roots = Pxrand([30,42,54],inf).asStream;
	var mainTempos = Pxrand([1,2,4,8],inf).asStream;
	var mainTemposTwo = Pxrand([1,2,4,8],inf).asStream;
	var root,delta,deltaTwo,aFreq,aFreqTwo,durSeq,anApg,anApgTwo,t,tc,startTime,tcTempo,tTempo,startTimeTwo;

	startTime = Main.elapsedTime.ceil;
	startTimeTwo = Main.elapsedTime.ceil;
	anApg = Pxrand([0,4,5,7,11,12,17],inf).asStream;
	anApgTwo = Pxrand([12,16,17,19,23,24,29,24,28,29,31,35,36,41],inf).asStream;
	tcTempo = mainTempos.next;
	tTempo = mainTemposTwo.next;
	t = TempoClock.new(tTempo,0,startTime);
	tc = TempoClock.new(tcTempo,0,startTimeTwo+tTempo);
	t.schedAbs(0, { arg beat, sec;
		  if(beat % 100 == 0, {
			"Tempo Clock One Root Change.".postln;
			aFreq = roots.next;
			aFreq.postln;
		  });
		if(Main.elapsedTime.ceil - startTime > 32, {
			tTempo = mainTemposTwo.next;
			t.tempo_(tTempo);
			"RESTART TC 1".postln;
			tTempo.postln;
			startTime = Main.elapsedTime;
		});
		 delta = t.beatDur;
		if(beat % rrand(4,6) == 0, {
			 	Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
		     });
		if(beat % rrand(5,7) == 0, {
			 	Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
		    });
		if(beat % rrand(3,5) == 0, {
			if(0.666.coin, {
				if(delta < 4, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
				    });
				}, {
				Synth(\kick, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
		});
		if(beat % rrand(2,4) == 0, {
			if(0.3.coin, {
				Synth(\hat, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
			});
			if(0.9.coin, {
				Synth(\bassDrum, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
		});
		1;
	});
	    tc.schedAbs(0, { arg beatTwo, sec;
		  if(beatTwo % 100 == 0, {
			"Tempo Clock Two Root Change.".postln;
			aFreqTwo = roots.next;
			aFreqTwo.postln;
		  });
		if(Main.elapsedTime.ceil - startTimeTwo > 16, {
			tcTempo = mainTempos.next;
			tc.tempo_(tcTempo);
			"RESTART TC 2".postln;
			tcTempo.postln;
			startTimeTwo = Main.elapsedTime;
		});
		deltaTwo = tc.beatDur;
		if(beatTwo % rrand(2,4) == 0, {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
		     });
		if(beatTwo % rrand(3,5) == 0, {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
		    });
		if(beatTwo % rrand(1,3) == 0, {
			if(0.666.coin, {
				if(deltaTwo < 4, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
				    });
				}, {
				Synth(\kick, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
			});
		});
		if(beatTwo % rrand(1,2) == 0, {
			if(0.3.coin, {
				Synth(\hat, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
			});
			if(0.9.coin, {
				Synth(\bassDrum, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
			});
		});
		1;
	});
};
