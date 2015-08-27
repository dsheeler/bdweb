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
	var chord1 = Pxrand([30,42,54],inf).asStream;
	var chord2 = Pxrand([34,46,58],inf).asStream;
	var chord3 = Pxrand([23,35,47],inf).asStream;
	var chord4 = Pxrand([35,47,59],inf).asStream;
	var chord5 = Pxrand([27,39,51],inf).asStream;
	var mainTempos = Pxrand([1,2,4,8],inf).asStream;
	var mainTemposTwo = Pxrand([1,2,4,8],inf).asStream;
	var root,delta,deltaTwo,aFreq,aFreqTwo,durSeq,anApg,anApgTwo;
	var t,tc,startTime,tcTempo,tTempo,startTimeTwo,keyCoinToss,soloDrums,crazyDrums;

	soloDrums = 0;
	crazyDrums = 0;
	startTime = Main.elapsedTime.ceil;
	startTimeTwo = Main.elapsedTime.ceil;
	anApg = Pxrand([0,4,5,7,11,12,17],inf).asStream;
	anApgTwo = Pxrand([12,16,17,19,23,24,28,29,31,35,36,41],inf).asStream;
	tcTempo = mainTempos.next;
	tTempo = mainTemposTwo.next;
	t = TempoClock.new(tTempo,0,startTime);
	tc = TempoClock.new(tcTempo,0,startTimeTwo+tTempo);
	t.schedAbs(0, { arg beat, sec;
		if((beat % 128 == 0), {
			"Tempo Clock One Root Change.".postln;
			//change key
			keyCoinToss = rrand(1,100);
			if( (keyCoinToss > 0) && (keyCoinToss <= 20), {
				aFreq = chord1.next;
				aFreqTwo = chord1.next;
				"Change to chord1!".postln;
			});
			if( (keyCoinToss > 20) && (keyCoinToss <= 40), {
				aFreq = chord2.next;
				aFreqTwo = chord2.next;
				"Change to chord2!".postln;
			});
			if( (keyCoinToss > 40) && (keyCoinToss <= 60), {
				aFreq = chord3.next;
				aFreqTwo = chord3.next;
				"Change to chord3!".postln;
			});
			if( (keyCoinToss > 60) && (keyCoinToss <= 80), {
				aFreq = chord4.next;
				aFreqTwo = chord4.next;
				"Change to chord4!".postln;
			});
			if( (keyCoinToss > 80) && (keyCoinToss <= 100), {
				aFreq = chord5.next;
				aFreqTwo = chord5.next;
				"Change to chord5!".postln;
			});
			if(beat == 0, {
				aFreq = chord1.next;
				aFreqTwo = chord1.next;
			});
			aFreq.postln;
			aFreqTwo.postln;
			soloDrums = rrand(0,3);
			soloDrums.postln;
			crazyDrums = rrand(0,3);
			crazyDrums.postln;
		  });
		if(Main.elapsedTime.ceil - startTime > 32, {
			tTempo = mainTemposTwo.next;
			t.tempo_(tTempo);
			"RESTART TC 1".postln;
			tTempo.postln;
			startTime = Main.elapsedTime;
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
	if(crazyDrums < 2, {
		if(soloDrums < 2 , {
		   Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
		   if(beat % 2 == 0, {
				Synth(\bassDrum, [\freq, aFreq, \dur, delta, \amp, 0.5]);
				Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
			if(beat % 3 == 0, {
				if(delta < 4, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
				    });
			});
		    if(beat % 4 == 0, {
			    Synth(\closedhat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
		    });
		    if(beat % 5 == 0, {
				Synth(\kick, [\freq, aFreq, \dur, delta, \amp, 0.001]);
				//Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
		    if(beat % 7 == 0, {
				if(delta < 4, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
				    });
			});
			}, {
			if(beat % 1.5 == 0, {
				Synth(\bassDrum, [\freq, aFreq, \dur, delta, \amp, 0.5]);
				Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
			if(beat % 2.5 == 0, {
				if(delta < 4, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
				    });
			});
		    if(beat % 3.5 == 0, {
			    Synth(\closedhat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
		    });
		    if(beat % 4.5 == 0, {
				Synth(\kick, [\freq, aFreq, \dur, delta, \amp, 0.001]);
				//Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
		    if(beat % 6.5 == 0, {
				if(delta < 4, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
				    });
			});
		});
			}, {
		    if(beat % rrand(1,3) == 0, {
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
		    if(beat % rrand(1,3) == 0, {
			 if(0.3.coin, {
				Synth(\hat, [\freq, aFreq+100, \dur, delta, \amp, 1.0]);
			 });
			 if(0.9.coin, {
				Synth(\bassDrum, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			 });
		    });
			if(0.75.coin, {
				if(0.5.coin, {
					Synth(\hat, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
					if(0.9.coin, {
						Synth(\bass, [\freq, aFreq, \dur, delta, \amp, 0.5]);
						}, {
						Synth(\kick, [\freq, aFreq, \dur, delta, \amp, 0.5]);
					});
					}, {
					//Synth(\snare, [\freq, aFreq+100, \dur, delta, \amp, 0.5]);
					Synth(\bassDrum, [\freq, aFreq, \dur, delta, \amp, 0.5]);
				});
			});
			if(0.9.coin, {
			  if(0.5.coin, {
				Synth(\tom, [\freq, aFreq, \dur, delta, \amp, 0.5]);
				}, {
				Synth(\snare2, [\freq, aFreq+100, \amp, 0.5]);
				});
			});
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
			if(0.5.coin, {
				anApgTwo = Pxrand([12,16,17,19,23,24,29,24,28,29],inf).asStream;
				}, {
				if(0.5.coin, {
					"TC2 Ascending..".postln;
					anApgTwo = Pseq([12,16,17,19,23,24,28,29],inf).asStream;
					}, {
					"TC2 Descending..".postln;
					anApgTwo = Pseq([29,28,24,23,19,17,16,12],inf).asStream;
				});
			});
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
		if(crazyDrums < 2, {
		if(soloDrums < 2 , {
		   Synth(\hat, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
		   if(beatTwo % 2 == 0, {
				Synth(\bassDrum, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
				Synth(\hat, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
			});
			if(beatTwo % 3 == 0, {
				if(deltaTwo < 4, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
				    });
			});
		    if(beatTwo % 4 == 0, {
			    Synth(\closedhat, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
		    });
		    if(beatTwo % 5 == 0, {
				Synth(\kick, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.001]);
				//Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
		    if(beatTwo % 7 == 0, {
				if(deltaTwo < 4, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
				    });
			});
			}, {
			if(beatTwo % 1.5 == 0, {
				Synth(\bassDrum, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
				Synth(\hat, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
			});
			if(beatTwo % 2.5 == 0, {
				if(deltaTwo < 4, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
				    });
			});
		    if(beatTwo % 3.5 == 0, {
			    Synth(\closedhat, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
		    });
		    if(beatTwo % 4.5 == 0, {
				Synth(\kick, [\freq, aFreq, \dur, delta, \amp, 0.001]);
				//Synth(\hat, [\freq, aFreq, \dur, delta, \amp, 0.5]);
			});
		    if(beatTwo % 6.5 == 0, {
				if(deltaTwo < 4, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo/4, \amp, 0.5]);
					}, {
					Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
				    });
			});
		});
			}, {
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
		    if(beatTwo % rrand(1,3) == 0, {
			 if(0.3.coin, {
				Synth(\hat, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 1.0]);
			 });
			 if(0.9.coin, {
				Synth(\bassDrum, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
			 });
		    });
			if(0.75.coin, {
				if(0.5.coin, {
					Synth(\hat, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
					if(0.9.coin, {
						Synth(\bass, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
						}, {
						Synth(\kick, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
					});
					}, {
					//Synth(\snare, [\freq, aFreqTwo+100, \dur, deltaTwo, \amp, 0.5]);
					Synth(\bassDrum, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
				});
			});
			if(0.9.coin, {
			  if(0.5.coin, {
				Synth(\tom, [\freq, aFreqTwo, \dur, deltaTwo, \amp, 0.5]);
				}, {
				Synth(\snare2, [\freq, aFreqTwo+100, \amp, 0.5]);
				});
			});
		});
		1;
	});
};
