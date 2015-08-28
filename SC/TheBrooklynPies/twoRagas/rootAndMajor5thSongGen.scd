fork{
	// notes sequence
	var roots = Pxrand([30,42,54],inf).asStream;
	var chord1 = Pseq([42,49],inf).asStream;
	var chord2 = Pseq([46,53],inf).asStream;
	var chord3 = Pseq([49,56],inf).asStream;
	var chord4 = Pseq([53,60],inf).asStream;
	var chord5 = Pseq([27,32],inf).asStream;
	var mainTempos = Pxrand([1.5,3,6],inf).asStream;
	var mainTemposTwo = Pxrand([1.5,3,6],inf).asStream;
	var root,delta,deltaTwo,aFreq,aFreqTwo,durSeq,anApg,anApgTwo;
	var t,tc,startTime,tcTempo,tTempo,startTimeTwo,keyCoinToss,keyCoinTossTwo,soloDrums,crazyDrums,mBeats,mTwoBeats,localbeat,localBeatTwo;

	soloDrums = 0;
	crazyDrums = 0;
	localbeat = 0;
	localBeatTwo = 0;
	startTime = Main.elapsedTime.ceil;
	startTimeTwo = Main.elapsedTime.ceil;
	anApg = Pxrand([0,4,5,7,11,12],inf).asStream;
	anApgTwo = Pxrand([0,4,7,9,10,12],inf).asStream;
	tcTempo = mainTempos.next;
	tTempo = mainTempos.next;
	t = TempoClock.new(tTempo,0,startTime);
	tc = TempoClock.new(tcTempo,0,startTimeTwo);
	aFreq = chord1.next;
	aFreqTwo = chord1.next;
	"TEMPOS:".postln;
	tTempo.postln;
	tcTempo.postln;
	"FREQS:".postln;
	aFreq.postln;
	aFreqTwo.postln;
	if(tTempo == 6, {
		mBeats = 162;
	});
	if(tTempo == 3, {
		mBeats = 108;
	});
	if(tTempo == 1.5, {
		mBeats = 27;
	});
	if(tcTempo == 6, {
		mTwoBeats = 162;
	});
	if(tcTempo == 3, {
		mTwoBeats = 108;
	});
	if(tcTempo == 1.5, {
		mTwoBeats = 27;
	});
	"MOD BEATS".postln;
	mBeats.postln;
	mTwoBeats.postln;
	t.schedAbs(0, { arg beat, sec;
		if((localbeat % mBeats == 0) && (localbeat != 0), {
			tTempo = mainTempos.next;
			t.tempo_(tTempo);
			" ".postln;
			" ".postln;
			"TEMPO_CLOCK #1 MSG:".postln;
			" ".postln;
			"RESTART TC 1".postln;
			tTempo.postln;
			startTime = Main.elapsedTime;
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
			aFreq.postln;
			aFreqTwo.postln;
			localbeat = 0;
			if(tTempo == 6, {
				mBeats = 162;
			});
			if(tTempo == 3, {
				mBeats = 108;
			});
			if(tTempo == 1.5, {
				mBeats = 27;
			});
			mBeats.postln;
		  });
		 delta = t.beatDur;
		if(beat % rrand(1,3) == 0, {
			//Synth(\bass, [\freq, (aFreq+(anApg.next)), \dur, delta, \amp, 0.5]);
			if(0.5.coin, {
				Synth(\bass, [\freq, (aFreq+(anApg.next)), \dur, delta, \amp, 0.5]);
				}, {
				Synth(\ks_guitar, [\note, (aFreq+(anApg.next)).midicps, \rand, 0.666]);
			});
		});
		if(beat % rrand(1,3) == 0, {
			Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 1.0, \dur, delta, \amp, 2.5]);
			Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreq+anApg.next).midicps, \pan, 1.0, \dur, delta, \amp, 2.5]);
		});
		localbeat = localbeat + 1;
		1;
	});
	    tc.schedAbs(0, { arg beatTwo, sec;
		if((localBeatTwo % mTwoBeats == 0) && (localBeatTwo != 0), {
			tcTempo = mainTempos.next;
			tc.tempo_(tcTempo);
			"RESTART TC 2".postln;
			tcTempo.postln;
		    keyCoinTossTwo = rrand(1,100);
			if( (keyCoinTossTwo > 0) && (keyCoinTossTwo <= 50), {
				anApgTwo = Pxrand([0,4,7,9,10,12], inf).asStream;
				"apgTwo Major #1".postln;
			});
			if( (keyCoinTossTwo > 25) && (keyCoinTossTwo <= 50), {
				anApgTwo = Pxrand([0,2,4,7,10,12], inf).asStream;
				"apgTwo Minor #1".postln;
			});
			if( (keyCoinTossTwo > 50) && (keyCoinTossTwo <= 75), {
				anApgTwo = Pxrand([0,4,5,7,9,10], inf).asStream;
				"apgTwo Major #2".postln;
			});
			if( (keyCoinTossTwo > 75) && (keyCoinTossTwo <= 100), {
				anApgTwo = Pxrand([0,2,4,5,9,10], inf).asStream;
				"apgTwo Minor #2".postln;
			});
			if(tcTempo == 6, {
				mTwoBeats = 162;
			});
			if(tcTempo == 3, {
				mTwoBeats = 108;
			});
			if(tcTempo == 1.5, {
				mTwoBeats = 27;
			});
			localBeatTwo = -1;
		});
		deltaTwo = tc.beatDur;
		if(beatTwo % rrand(1,3) == 0, {
			//Synth(\ks_guitar, [\note, (aFreqTwo+(anApgTwo.next+12)).midicps, \rand, 0.666]);
			if(0.5.coin, {
				Synth(\bass, [\freq, (aFreqTwo+(anApgTwo.next+12)), \dur, delta, \amp, 0.5]);
				}, {
				Synth(\ks_guitar, [\note, (aFreqTwo+(anApgTwo.next+12)).midicps, \rand, 0.666]);
			});
		});
		if(beatTwo % rrand(1,3) == 0, {
				Synth(\simpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, -1.0, \dur, deltaTwo, \amp, 2.5]);
				Synth(\detunedSimpleSynth, [\out, ~omgflange, \freq, (aFreqTwo+anApgTwo.next).midicps, \pan, -1.0, \dur, deltaTwo, \amp, 2.5]);
		    });
		localBeatTwo = localBeatTwo + 1;
		1;
	});
};
