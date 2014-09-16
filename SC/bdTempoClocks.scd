//dans joy
(

var tc,tc2,fastBeatCount,upTempoCount,beatChangeCount;
var freq,amp,dur,freqs1,freqs2,boobs,freq2,ltemps,htemps;
var d;

d = Bus.audio(s,2);
//Synth(\omgflange, [\in, d, \out, 0, \amp, 0.02, \center, 0.4, \freq, 66], addAction: \addToTail);

s.sendMsg("\s_new", "omgflange", a = s.nextNodeID, 1, 1, "in", d, "out", 0, "amp", 0.02, "center", 0.4, "freq", 66);
htemps = List[7,10];
ltemps = List[3.5,5];
//freqs1 = List[60,62,64,65,67,69,71,72].midicps;
freqs1 = List[60,64,67,71,72].midicps;
//freqs2 = List[48,50,52,53,55,57,59,60].midicps;
//freqs2 = List[69,71,72,74,76,78,80,81].midicps;
freqs2 = List[69,72,74,76,81].midicps;
fastBeatCount = 0;
upTempoCount = 7;
boobs = 25.0;
beatChangeCount = 100;

t = TempoClock.new(4*72/60,3);
t.tempo = 4*72/60;

t.schedAbs(t.beats.ceil, { arg beat, sec;
	if(beat % 0.5 == 0, {
		s.sendMsg("\s_new", "hat", c = s.nextNodeID, 1, 1, "amp", 0.9);
	});

	if(beat % 16 == 0, {
		{
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 40.midicps, "rand", 0.6, "delayTime", 10.0, "out", 2);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 44.midicps, "rand", 0.6, "delayTime", 10.0, "out", 2);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", 2);
		}.fork
	});

	if((beat +8) % 16 == 0, {
		{
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", d);
		0.01.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 50.midicps, "rand", 0.6, "delayTime", 10.0, "out", d);
	    0.01.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 54.midicps, "rand", 0.6, "delayTime", 10.0, "out", d);
		}.fork
	});

	if((beat % 8 == 4) || (beat % 8 == 6), {

			s.sendMsg("\s_new", "bassDrum", a = s.nextNodeID, 1, 1, "amp", 0.86);
			s.sendMsg("\s_new", "ws_drum", b = s.nextNodeID, 1, 1, "freq", 50, "amp", 0.86);
	});

	if((beat % 8 == 0) || (beat % 32 == 1) || (beat % 32 == 2) || (beat % 32 == 3), {
		s.sendMsg("\s_new", "snare", d = s.nextNodeID, 1, 1, "amp", 0.96);
	});

	/*

	if(beat % 4 == 0, {
		freq = freqs2.at(freqs2.size.rand());
		freq2 = freqs1.at(freqs1.size.rand());
		if(50.rand() > boobs, {
		//	s.sendMsg("\s_new", "snare", d = s.nextNodeID, 1, 1, "amp", 0.86);
			}, {
				if(fastBeatCount != 0, {
					s.sendMsg("\s_new", "ks_guitar", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(1.3,1.3), "freq", (freq*pow(2,(7/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(1.3,1.3), "freq", (freq*pow(2,(19/12))));
					}, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(1.2,4.8), "freq", (freq*pow(2,(-5/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(1.3,4.8), "freq", (freq*pow(2,(-17/12))));
				});
		});
	});

	if(beat % 16 == 0, {
		freq = freqs2.at(freqs2.size.rand());
		freq2 = freqs1.at(freqs1.size.rand());
		if(50.rand() > boobs, {
//			s.sendMsg("\s_new", "snare", d = s.nextNodeID, 1, 1, "amp", 0.86);
			}, {
				if(fastBeatCount == 0, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(1.2,4.8), "freq", (freq*pow(2,(7/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(1.2,4.8), "freq", (freq*pow(2,(19/12))));
					}, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(0.3,0.3), "freq", (freq*pow(2,(-5/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.16, "dur", rrand(0.3,0.3), "freq", (freq*pow(2,(-17/12))));
				});
		});
	});
	if(beat % beatChangeCount == 0, {
		fastBeatCount = beat;
		boobs = rrand(45,50);
		beat.postln;
		freq = freqs2.at(freqs2.size.rand());
		"Up Tempo".postln;
	});
	if(fastBeatCount != 0, {
		t.tempo_(htemps.at(htemps.size.rand()));
		if(beat > (fastBeatCount+rrand(45,beatChangeCount)), {
			fastBeatCount = 0;
			beatChangeCount = 100.rand()+51;
			boobs = 25.0;
			t.tempo_(ltemps.at(ltemps.size.rand()));
			"Down Tempo".postln;
			beatChangeCount.postln;
		});
	});
	if(fastBeatCount == 0, {
		if(beat % 25 == 0, {
			freq = freqs1.at(freqs1.size.rand());
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-12/12)),"pan", -1.0,"dur",15.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-24/12)),"pan", -1.0,"dur",15.rand()+5,"amp",10.0);
		});
		if(beat % 27 == 0, {
			s.sendMsg("\s_new", "simpleSynth", i = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(7/12)),"pan", 1.0,"dur",7.5.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-5/12)),"pan", -1.0,"dur",7.5.rand()+5,"amp",10.0);
		});
		if(beat % 29 == 0, {
			s.sendMsg("\s_new", "simpleSynth", i = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(5/12)),"pan", 1.0,"dur",3.25.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-7/12)),"pan", -1.0,"dur",3.25.rand()+5,"amp",10.0);
		});
		if(beat % 33 == 0, {
			s.sendMsg("\s_new", "simpleSynth", i = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-5/12)),"pan", 1.0,"dur",1.75.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-17/12)),"pan", -1.0,"dur",1.75.rand()+5,"amp",10.0);
		});
	});*/
	0.5;
});

)
//bdj 2
(

var istep = 0.5;
var sPar,aPar,xVar,yVar,gcount,freqs1,freqs2,freq,chaosNotes,icount,newFreq,dur;
var st1= 1;
freqs1 = List[60,64,67,69,72,74].midicps;
//freqs2 = List[48,50,52,53,55,57,59,60].midicps;
//freqs2 = List[69,71,72,74,76,78,80,81].midicps;
freqs2 = List[69,72,74,76,81].midicps;
chaosNotes = List.new;
aPar = 2.5;
xVar = 0.33;
sPar = aPar;
gcount = 1;
icount = 1;
//istep = (aPar - 0.15)/1000.0;
istep = (4.0-aPar)/1000.0;
istep.postln;
st1 = 1550.5;
t = TempoClock.new(st1);



t.schedAbs(t.beats.ceil, {arg beat, sec;
	if(gcount == 1000, {
		gcount = 1;
	}, {
		aPar = sPar + (istep*gcount);

		250.do {
			//yVar = pow((aPar + 1.0/xVar),(xVar/aPar));
				yVar = aPar*xVar*(1.0-xVar);
			if(icount > 230, {
				if(chaosNotes.size() == 0, {
					chaosNotes.add(xVar);
					},{
					newFreq = 1;
					chaosNotes.do({arg aFreq; if(abs(xVar-aFreq) < 0.1, {newFreq = -1;});});
					if(newFreq == 1, {
						chaosNotes.add(xVar);
					});
				});
			});
			xVar = yVar;
			icount = icount+1;
		};
		freq = 666; //freqs1.at(freqs1.size.rand());
		chaosNotes.do({arg aFreq;
			dur = t.beatDur;
			//freq = freqs1.at(freqs1.size.rand());
				s.sendMsg("\s_new", "simpleSynth", d = s.nextNodeID, 1, 1, "out", ~dryout, "freq",freq*aFreq,"pan",0.0,"dur",dur, "amp",5.0);
			//dur.wait();
		});
			/*if(xVar > 0.5, {
				t.tempo_((xVar*2.0));
			});*/
			xVar.postln;
			aPar.postln;
		gcount = gcount +1;
		chaosNotes.clear;
		icount=0;
	});
	1;
});

)

//chaos forked
(

var istep = 0.5;
var sPar,aPar,xVar,yVar,gcount,freqs1,freqs2,freq,chaosNotes,icount,newFreq,dur,ccount;
var st1= 1;
//jazz chords
freqs1 = List[36,43,60,77].midicps;
//freqs1 = List[60,65,70,75,80].midicps;
//freqs2 = List[48,50,52,53,55,57,59,60].midicps;
//freqs2 = List[69,71,72,74,76,78,80,81].midicps;
freqs2 = List[69,72,74,76,81].midicps;
chaosNotes = List.new;
aPar = 1.1;
xVar = 0.33;
sPar = aPar;
gcount = 1;
icount = 1;
istep = (aPar - 0.15)/1000.0;
istep.postln;
st1 = 13;
t = TempoClock.new(st1);

t.schedAbs(t.beats.ceil, {arg beat, sec;
	if(gcount == 1000, {
		gcount = 1;
	}, {
		aPar = sPar - (istep*gcount);

		250.do {
			yVar = pow((aPar + 1.0/xVar),(xVar/aPar));
			if(icount > 230, {
				if(chaosNotes.size() == 0, {
					chaosNotes.add(xVar);
					},{
					newFreq = 1;
					chaosNotes.do({arg aFreq; if(abs(xVar-aFreq) < 0.1, {newFreq = -1;});});
					if(newFreq == 1, {
						chaosNotes.add(xVar);
					});
				});
			});
			xVar = yVar;
			icount = icount+1;
		};
		t.tempo_(st1/chaosNotes.size());
		freq = freqs1.at(freqs1.size.rand());
		Task({
			chaosNotes.do({arg aFreq;
				dur = t.beatDur*aFreq;
				//freq = freqs1.at(freqs1.size.rand());
				freq = (freq*aFreq)*pow(2,(-7/12));
				s.sendMsg("\s_new", "simpleSynth", d = s.nextNodeID, 1, 1, "out", ~dryout, "freq",freq,"pan",0.0,"dur",dur, "amp",10.0);
				dur.wait();
			});
			chaosNotes.clear;
			icount = 0;
			}).play;

		aPar.postln;
		gcount = gcount + 1;
	});
	1;
});

)
//brads joy
(
var tc,tc2,fastBeatCount,upTempoCount,beatChangeCount;
var freq,amp,dur,freqs1,freqs2,boobs,freq2,ltemps,htemps;
htemps = List[6,9];
ltemps = List[5,3];
//freqs1 = List[60,62,64,65,67,69,71,72].midicps;
freqs1 = List[60,64,67,71,72].midicps;
//freqs2 = List[48,50,52,53,55,57,59,60].midicps;
//freqs2 = List[69,71,72,74,76,78,80,81].midicps;
freqs2 = List[69,72,74,76,81].midicps;
fastBeatCount = 0;
upTempoCount = 7;
boobs = 25.0;
beatChangeCount = 100;

t = TempoClock.new(5);

t.schedAbs(t.beats.ceil, { arg beat, sec;
	if(beat % 1 == 0, {
		s.sendMsg("\s_new", "closedhat", c = s.nextNodeID, 1, 1, "amp", 0.9);
	});
	if(beat % (2.rand() + 2) == 0, {
		if(50.rand() > 25.0, {
			s.sendMsg("\s_new", "bassDrum", a = s.nextNodeID, 1, 1, "amp", 0.86);
			}, {
			s.sendMsg("\s_new", "fullkickdrum", b = s.nextNodeID, 1, 1, "amp", 0.86);
		});
	});
	if(beat % 7 == 0, {
		s.sendMsg("\s_new", "closedhat", c = s.nextNodeID, 1, 1, "amp", 0.9);
	});
	if(beat % 6 == 0, {
		freq = freqs2.at(freqs2.size.rand());
		freq2 = freqs1.at(freqs1.size.rand());
		if(50.rand() > boobs, {
			s.sendMsg("\s_new", "snare", d = s.nextNodeID, 1, 1, "amp", 0.86);
			}, {
				if(fastBeatCount != 0, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(7/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(19/12))));
					}, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(-5/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(-17/12))));
				});
		});
	});
	if(beat % 11 == 0, {
		freq = freqs2.at(freqs2.size.rand());
		freq2 = freqs1.at(freqs1.size.rand());
		if(50.rand() > boobs, {
			s.sendMsg("\s_new", "snare", d = s.nextNodeID, 1, 1, "amp", 0.86);
			}, {
				if(fastBeatCount == 0, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(7/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(19/12))));
					}, {
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(-5/12))));
					s.sendMsg("\s_new", "snare", e = s.nextNodeID, 1, 1, "amp", 0.66, "dur", rrand(0.3,1.3), "freq", (freq*pow(2,(-17/12))));
				});
		});
	});
	if(beat % beatChangeCount == 0, {
		fastBeatCount = beat;
		boobs = rrand(45,50);
		beat.postln;
		freq = freqs2.at(freqs2.size.rand());
		"Up Tempo".postln;
	});
	if(fastBeatCount != 0, {
		t.tempo_(rrand(6,9));
		if(beat > (fastBeatCount+rrand(45,beatChangeCount)), {
			fastBeatCount = 0;
			beatChangeCount = 100.rand()+51;
			boobs = 25.0;
			t.tempo_(rrand(3,6));
			"Down Tempo".postln;
			beatChangeCount.postln;
		});
	});
	if(fastBeatCount == 0, {
		if(beat % 25 == 0, {
			freq = freqs1.at(freqs1.size.rand());
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-12/12)),"pan", -1.0,"dur",15.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-24/12)),"pan", -1.0,"dur",15.rand()+5,"amp",10.0);
		});
		if(beat % 27 == 0, {
			s.sendMsg("\s_new", "simpleSynth", i = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(7/12)),"pan", 1.0,"dur",7.5.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-5/12)),"pan", -1.0,"dur",7.5.rand()+5,"amp",10.0);
		});
		if(beat % 29 == 0, {
			s.sendMsg("\s_new", "simpleSynth", i = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(5/12)),"pan", 1.0,"dur",3.25.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-7/12)),"pan", -1.0,"dur",3.25.rand()+5,"amp",10.0);
		});
		if(beat % 33 == 0, {
			s.sendMsg("\s_new", "simpleSynth", i = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-5/12)),"pan", 1.0,"dur",1.75.rand()+5,"amp",10.0);
			s.sendMsg("\s_new", "simpleSynth", h = s.nextNodeID, 1, 1, "out", ~dryout, "freq", freq*pow(2,(-17/12)),"pan", -1.0,"dur",1.75.rand()+5,"amp",10.0);
		});
	});
	1;
});

)