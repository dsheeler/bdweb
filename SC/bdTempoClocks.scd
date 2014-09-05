//dans joy
~d = Bus.audio(s,2);
~d;
(

var tc,tc2,fastBeatCount,upTempoCount,beatChangeCount;
var freq,amp,dur,freqs1,freqs2,boobs,freq2,ltemps,htemps;



//s.sendMsg("\s_new", "omgdist", a = s.nextNodeID, 1, 1, "in", ~d, "out", 0);

Synth(\omgdist2, [\in, ~d, \out, 0, \type, 1, \drive, 3, \amp, 1]);



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

t = TempoClock.new(4*72/60);
t.tempo = 4*72/60;

t.schedAbs(t.beats.ceil, { arg beat, sec;
	beat.postln();
	if(beat % 0.5 == 0, {
		s.sendMsg("\s_new", "hat", c = s.nextNodeID, 1, 1, "amp", 0.6);
	});
	0.5
});

t.schedAbs(t.beats.ceil, { arg beat, sec;

	if(beat < 64, {
	if((beat % 2 == 0) , {
		{
		Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, t.beatDur,\note, 50.midicps]);
	    0.1.wait;
		Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, t.beatDur,\note, 57.midicps]);
			/*s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 40.midicps, "rand", 1.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 44.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);*/
		}.fork
	});
	if(((beat + 2) % 8 == 0) , {
		{
		Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 4,\note, 57.midicps]);
			0.1.wait;
		Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 4,\note, 64.midicps]);
			/*s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 40.midicps, "rand", 1.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 44.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);*/
		}.fork
	});
	if((beat + 8) % 16 == 0, {
		{
			/*
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
		0.01.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 50.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
	    0.01.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 54.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);*/
		}.fork
	});

	});

if(beat > 64, {
	if((beat % 2 == 0) , {
		{
		Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 0.5,\note, 50.midicps]);
	    0.1.wait;
		Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 0.5,\note, 57.midicps]);
			/*s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 40.midicps, "rand", 1.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 44.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);*/
		}.fork
	});
	if(((beat + 2) % 8 == 0) , {
		{
			Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 4,\note, 67.midicps]);
		    t.beatDur.wait;
			Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 4,\note, 60.midicps]);
			t.beatDur.wait;
			Synth(\ks_guitar, [\out, ~d, \rand, 0.2, \delayTime, 4,\note, 65.midicps]);
			/*s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 40.midicps, "rand", 1.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 44.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
		0.02.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);*/
		}.fork
	});
	if((beat + 8) % 16 == 0, {
		{
			/*
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 47.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
		0.01.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 50.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);
	    0.01.wait;
		s.sendMsg("\s_new", "ks_guitar", a = s.nextNodeID, 1, 1, "note", 54.midicps, "rand", 0.6, "delayTime", 10.0, "out", ~d);*/
		}.fork
	});

	});
	if(((beat + 4) % 8 == 0) || (beat % 8 == 2), {

			s.sendMsg("\s_new", "bassDrum", a = s.nextNodeID, 1, 1, "amp", 0.86);
			s.sendMsg("\s_new", "ws_drum", b = s.nextNodeID, 1, 1, "freq", 50, "amp", 0.86);
	});

	if((beat % 8 == 0) || (beat % 32 == 1) || (beat % 32 == 2) || (beat % 32 == 3), {
		s.sendMsg("\s_new", "snare", d = s.nextNodeID, 1, 1, "amp", 0.96);
	});


	0.5;
});

)
//bdj 2
(

var istep = 0.5;
var sPar,aPar,xVar,yVar,gcount,freqs1,freqs2,freq,chaosNotes,icount;
var st1= 1;
freqs1 = List[60,64,67,71,72].midicps;
//freqs2 = List[48,50,52,53,55,57,59,60].midicps;
//freqs2 = List[69,71,72,74,76,78,80,81].midicps;
freqs2 = List[69,72,74,76,81].midicps;
chaosNotes = List.new;
aPar = 0.52;
xVar = 0.33;
sPar = aPar;
gcount = 1;
icount = 1;
istep = (0.52 - 0.15)/1000.0;
istep.postln;
st1 = 5;
t = TempoClock.new(st1,4);
t.schedAbs(t.beats.ceil, {arg beat, sec;
	if(beat % 0.5 == 0, {
		s.sendMsg("\s_new", "hat", a = s.nextNodeID, 1, 1, "amp", 0.9);
	});

	0.5;
});

t.schedAbs(t.beats.ceil, {arg beat, sec;
	if(beat % 2.0 == 0, {
		s.sendMsg("\s_new", "kick", b = s.nextNodeID, 1, 1, "amp", 0.9);
	});
	1;
});

t.schedAbs(t.beats.ceil, {arg beat, sec;
	if(beat % 9 == 0, {
		s.sendMsg("\s_new", "snare", c = s.nextNodeID, 1, 1, "amp", 0.9);
	});
	if(gcount == 1000, {
		gcount = 1;
	}, {
		aPar = sPar - (istep*gcount);
		freq = freqs1.at(freqs1.size.rand());
		250.do {
			yVar = pow((aPar + 1.0/xVar),(xVar/aPar));
			if(icount > 230, {
				if(abs(xVar-yVar) > 0.5, {
					chaosNotes.add(freq*pow(2,xVar));
				});
			});
			xVar = yVar;
			icount = icount+1;
		};
			chaosNotes.size.postln;
			chaosNotes.do({arg aFreq; s.sendMsg("\s_new", "simpleSynth", d = s.nextNodeID, 1, 1, "out", ~dryout, "freq",freq*pow(2,(-1.0*xVar)),"pan",0.0,"dur",rrand(0.1,0.3), "amp",10.0);});
		gcount = gcount +1;
		gcount.postln;
		aPar.postln;
		chaosNotes.clear;
			icount=0;
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

t = TempoClock.new(5,9);

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
	});
	1;
});

)