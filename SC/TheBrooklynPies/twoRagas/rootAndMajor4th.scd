fork{
	// notes sequence
	var roots = Pxrand([30,42,54],inf).asStream;
	var chord1 = Pseq([42,47],inf).asStream;
	var chord2 = Pseq([46,51],inf).asStream;
	var chord3 = Pseq([49,53],inf).asStream;
	var chord4 = Pseq([53,58],inf).asStream;
	var chord5 = Pseq([27,32],inf).asStream;
	var mainTempos = Pxrand([1,2,4,8],inf).asStream;
	var mainTemposTwo = Pxrand([1,2,4,8],inf).asStream;
	var root,delta,deltaTwo,aFreq,aFreqTwo,durSeq,anApg,anApgTwo;
	var t,tc,startTime,tcTempo,tTempo,startTimeTwo,keyCoinToss,soloDrums,crazyDrums;

	soloDrums = 0;
	crazyDrums = 0;
	startTime = Main.elapsedTime.ceil;
	startTimeTwo = Main.elapsedTime.ceil;
	anApg = Pxrand([0,4,5,7,11,12],inf).asStream;
	anApgTwo = Pxrand([0,2,6,7,9,11],inf).asStream;
	tcTempo = mainTempos.next;
	tTempo = mainTemposTwo.next;
	t = TempoClock.new(tTempo,0,startTime);
	tc = TempoClock.new(tcTempo,0,startTimeTwo+tTempo);
	t.schedAbs(0, { arg beat, sec;
		if(Main.elapsedTime.ceil - startTime > 32, {
			tTempo = mainTemposTwo.next;
			t.tempo_(tTempo);
			"RESTART TC 1".postln;
			tTempo.postln;
			startTime = Main.elapsedTime;
		});
		if((beat % 64 == 0), {
			"Tempo Clock One Root Change.".postln;
			//change key
			keyCoinToss = rrand(1,100);
			if( (keyCoinToss > 0) && (keyCoinToss <= 25), {
				aFreq = chord1.next;
				aFreqTwo = chord1.next;
				"Change to chord1!".postln;
			});
			if( (keyCoinToss > 25) && (keyCoinToss <= 50), {
				aFreq = chord2.next;
				aFreqTwo = chord2.next;
				"Change to chord2!".postln;
			});
			if( (keyCoinToss > 50) && (keyCoinToss <= 75), {
				aFreq = chord3.next;
				aFreqTwo = chord3.next;
				"Change to chord3!".postln;
			});
			if( (keyCoinToss > 75) && (keyCoinToss <= 100), {
				aFreq = chord4.next;
				aFreqTwo = chord4.next;
				"Change to chord4!".postln;
			});
			if(beat == 0, {
				aFreq = chord4.next;
				aFreqTwo = chord4.next;
			});
			aFreq.postln;
			aFreqTwo.postln;
		  });
		 delta = t.beatDur;
		if(beat % rrand(1,3) == 0, {
			 	Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
		     });
		if(beat % rrand(2,7) == 0, {
			 	Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
			Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 0.0, \dur, delta, \amp, 1.0]);
		});
		1;
	});
	    tc.schedAbs(0, { arg beatTwo, sec;
		if(Main.elapsedTime.ceil - startTimeTwo > 16, {
			tcTempo = mainTempos.next;
			tc.tempo_(tcTempo);
			"RESTART TC 2".postln;
			tcTempo.postln;
			startTimeTwo = Main.elapsedTime;
		});
		deltaTwo = tc.beatDur;
		if(beatTwo % rrand(1,3) == 0, {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
		     });
		if(beatTwo % rrand(2,7) == 0, {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, 0.0, \dur, deltaTwo, \amp, 1.0]);
		    });

		1;
	});
};
