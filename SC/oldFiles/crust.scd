(
	SynthDef(\closedhat, {

		var hatosc, hatenv, hatnoise, hatoutput;

		hatnoise = {LPF.ar(WhiteNoise.ar(1),6000)};

		hatosc = {HPF.ar(hatnoise,2000)};
		hatenv = {Line.ar(1, 0, 0.1)};

		hatoutput = (hatosc * hatenv);

		Out.ar(0,
			Pan2.ar(hatoutput, 0)
		)
	}).send(s);

	Synth(\inout);

	SynthDef(\inout, {
		var in;
		in = In.ar(1, 1);
		Out.ar(0,in);
	}).send(s);

	SynthDef(\openhat, {

		var hatosc, hatenv, hatnoise, hatoutput;

		hatnoise = {LPF.ar(WhiteNoise.ar(1),6000)};

		hatosc = {HPF.ar(hatnoise,2000)};
		hatenv = {Line.ar(1, 0, 0.3)};

		hatoutput = (hatosc * hatenv);

		Out.ar(0,
			Pan2.ar(hatoutput, 0)
		);
	}).send(s);

	SynthDef("risset_clarinet_pg_153", { arg freq=440, amp=0.2, gate;
		var osc, ampenv, ampenvctl, tfuncenv, buf, tfuncstream;

		tfuncenv = Env.new([-0.8, -0.8, -0.5, 0.5, 0.8, 0.8], [0.39, 0, 0.22, 0, 0.39]);

		buf = Buffer.alloc(s,1024,1);

		t = Signal.fill(512, {arg i; tfuncenv.at(i/512.0)});
		//t.plot;
		buf.loadCollection(t.asWavetable);

		ampenv = Env.newClear(3);
		ampenvctl = Control.names([\ampenv]).kr( ampenv.asArray );

		osc = amp * Shaper.ar(buf, SinOsc.ar(freq, 0, EnvGen.kr(ampenvctl, gate)));

		osc.scope;
		Out.ar(0, osc)
	}).writeDefFile;
	Server.local.sendMsg("/d_load", SynthDef.synthDefDir ++ "risset_clarinet_pg_153.scsyndef");


Synth(\sineSynthDef(\fullkickdrum, {

		var subosc, subenv, suboutput, clickosc, clickenv, clickoutput;

		subosc = {SinOsc.ar(60)};
		subenv = {Line.ar(1, 0, 1, doneAction: 2)};

		clickosc = {LPF.ar(WhiteNoise.ar(1),1500)};
		clickenv = {Line.ar(1, 0, 0.02)};

		suboutput = (subosc * subenv);
		clickoutput = (clickosc * clickenv);

		Out.ar(0,
			Pan2.ar(suboutput + clickoutput, 0);
		)

	}).send(s);

	SynthDef(\looch, {|freq=75.0, amp=1, pan=0.0, dur=1|
		var signal, env;
		env = EnvGen.ar(Env.perc(level:amp, attackTime:0.0001, releaseTime:dur), doneAction:2);
		signal = env*SinOsc.ar(Line.kr(1, 0, 0.05, 2*freq, freq));
		signal = Pan2.ar(signal, pan);
		Out.ar(0, signal);
	}).send(s);

SynthDef(\snare, {|freq=180, amp=1, dur=0.2, cutoff=6000|
	var snarenoise, snareosc, snareenv, snareout, env, signal;
	env = EnvGen.ar(Env.perc(level:amp, attackTime:0.0001, releaseTime:dur), doneAction:2);
	signal = SinOsc.ar(freq);
	//snareenv = EnvGen.ar(Env.new([0,1,0.25,0.25,0], [0.01,0.02,0.2,0.1]), doneAction:2);
	snareout = env * (signal + LPF.ar(WhiteNoise.ar(amp),cutoff));
	Out.ar(0, Pan2.ar(snareout, 0));
}).send(s);

a = Synth(\snare, [\freq, 126, \cutoff, 4000, \dur, 0.4]);
b = Synth(\bassDrum);
SynthDef(\bassDrum, {|freq=75.0, amp=1, pan=0.0, dur=1, out=0|
			var signal, env;
			env = EnvGen.ar(Env.perc(level:amp, attackTime:0.0001, releaseTime:dur), doneAction:2);
			signal = env*SinOsc.ar(Line.kr(1, 0, 0.05, 2*freq, freq));
			signal = Pan2.ar(signal, pan);
			Out.ar(out, signal);
		}).send(s);
SynthDef(\omgcompress, {|in=2, out=0|
			Out.ar(out, Compander.ar(In.ar(in,2), In.ar(in, 2), thresh: 0.7, slopeBelow: 1, slopeAbove: 0.2, clampTime: 0.01, relaxTime:0.01));
		}).send(s);
SynthDef(\omgverb, {|in=2, out=0|
      Out.ar(out, FreeVerb.ar(In.ar(in, 2), 0.9, 0.8, 0.2));
		}).send(s);
SynthDef(\omgflange, {|in=2, out=0, freq=0.2, amp=0.0025, center=0.009325|
			Out.ar(out, 1* In.ar(in,2) +  DelayC.ar(In.ar(in,2), 0.2, SinOsc.kr(freq, 0, amp, center)));
			}).send(s);
SynthDef(\simpleSynth, {|freq=220.0, amp=0.2, dur=1.0, pan=0.0, out=0|
	var signal, env, harmonics;
	harmonics = 12;
			env = EnvGen.ar(Env.new(levels: [0, 0.8, 0.8, 0], times: [0.01, dur-0.02, 1]), doneAction:2);
	signal = Mix.fill(harmonics, {|i|
				env * SinOsc.ar(freq*(i+1), 1.0.rand, amp * harmonics.reciprocal * harmonics.reciprocal/(i+1));
			});
	signal = LPF.ar(signal, SinOsc.kr(rrand(0.1,1.0), 1.0.rand, 2000, )+2100);
	signal = Pan2.ar(signal, pan);
	Out.ar(out, signal);
}).send(s);

SynthDef(\detunedSimpleSynth, {|freq=220.0, amp=0.01, dur=0.5, pan=0.0|
	var signal, env, harmonics, freq1, freq2, freq3;
	harmonics = 6;
	freq1 = freq + (rrand(-1.0, 1.0) * freq * 0.0069);
	freq2 = freq1 + (rrand(-1.0, 1.0) * freq1 * 0.0069);
	freq3 = freq2 + (rrand(-1.0, 1.0) * freq2 * 0.0069);
	env = EnvGen.ar(Env.new(levels: [0, 0.8, 0.8, 0.8, 0], times:[0.01, 0.01, dur-0.03, 0.01]), doneAction:2);
	//env = EnvGen.ar(Env.new([0, 1, 0.75, 0.75, 0], [0.01*dur, 0.01*dur, 0.97*dur, 0.01*dur], \cubed), doneAction:2);
	signal = Mix.fill(harmonics, {|i|
		env * (
			SinOsc.ar(freq*(i+1), 1.0.rand, amp * harmonics.reciprocal * harmonics.reciprocal/(i+1)) +
			SinOsc.ar(freq1*(i+1), 1.0.rand, amp * harmonics.reciprocal * harmonics.reciprocal/(i+1)) +
			SinOsc.ar(freq2*(i+1), 1.0.rand, amp * harmonics.reciprocal * harmonics.reciprocal/(i+1)) +
			SinOsc.ar(freq3*(i+1), 1.0.rand, amp * harmonics.reciprocal * harmonics.reciprocal/(i+1)));

	});

	signal = Pan2.ar(signal, pan);
	Out.ar(0, signal);
}).send(s);

SynthDef(\grains, {arg freq, amp, grain_dur, dur=1, grain_freq=2, gate=1;
	var signal, env, envEnv;
	envEnv = EnvGen.ar(Env.sine(dur,1.0), gate, doneAction:2);
	env = EnvGen.ar(Env.sine(grain_dur, amp), Impulse.ar(Line.ar(grain_freq, grain_freq*1.6, dur)), doneAction:0);
	signal = SinOsc.ar(freq) * env * envEnv;
	Out.ar(0, signal ! 2);
}).load();

SynthDef(\up_whistle, {arg freqlo, freqhi, dur=0.1, amp=0.5, pan = 0.0;
	var signal, env;
	env = EnvGen.ar(Env.linen(0.1, dur, 0.1, amp), doneAction:2);

	signal = SinOsc.ar(XLine.ar(freqlo,freqhi, dur)) * env;
	signal = Pan2.ar(signal, pan);
	Out.ar(0, signal);
}).load();

SynthDef(\up_trill, {arg freqlo, freqhi, freqtrill=25, dur=0.1, amp=0.5, pan=0.0, out=0;
	var signal, env, envEnv;
	env = EnvGen.ar(Env.perc(0.1, dur), doneAction:2);

	envEnv = SinOsc.ar(freqtrill, 1.0.rand, 0.5, 0.5);

	signal = SinOsc.ar(XLine.ar(freqlo,freqhi, dur)) * amp* env *envEnv;

	signal = Pan2.ar(signal, pan);
	Out.ar(out, signal);

}).load();

SynthDef(\cricket, {arg freq, freqtrill=30, dur=10.0, amp=0.1, pan=0.0, out=0;
	var signal, env, envEnv;
	env = EnvGen.ar(Env.linen(0.001, dur-0.002, 0.001), doneAction:2);

	envEnv = SinOsc.ar(freqtrill, 1.0.rand, 0.5, 0.5);

	signal = SinOsc.ar(freq, 0, amp) * env *envEnv;

	signal = Pan2.ar(signal, pan);
	Out.ar(out, signal);

}).load();
SynthDef(\ks_guitar2, { arg note, pan=0.0, rand=160, delayTime=20, noiseType=1;
	var signal, x, y, env, specs, freqs, res, dec;
	//env = Env.new(#[1.9, 1.9, 0],#[10, 0.001]);
	// A simple exciter x, with some randomness.
	signal = Decay.ar(Impulse.ar(0, 0, rand), 1+rand, WhiteNoise.ar);
 	signal = CombL.ar(signal, 0.05, note.reciprocal, delayTime);
	//freqs = [163, 121, 257, 326, 383, 431, 369, 504];
	//res = 0.1*[0.0005, 0.0005, 0.0002, 0.0005, 0.0001, 0.0005, 0.00010, 0.000010];
	//dec = delayTime * [1, 1, 1, 1, 1, 1, 1, 1];
	//specs = [freqs, res, dec];
	signal = LPF.ar(signal, 10000);
	//x = Klank.ar(`specs, signal) * EnvGen.ar(Env.perc, doneAction:2);
	//	x = CombC.ar(signal, 0.6, 0.25, 10.0, EnvGen.ar(env, doneAction:2));
	x = Pan2.ar(signal, pan);

	Out.ar(0, LeakDC.ar(x));
}).store;

SynthDef(\ks_guitar, { arg note, pan=0.0, rand=160, delayTime=20, noiseType=1, out=0;
	var signal, x, y, env, specs, freqs, res, dec;
	//env = Env.new(#[1.9, 1.9, 0],#[10, 0.001]);
	// A simple exciter x, with some randomness.
	signal = Decay.ar(Impulse.ar(0, 0, rand), 1+rand, WhiteNoise.ar);
 	signal = CombL.ar(signal, 0.05, note.reciprocal, delayTime);
	freqs = [102,  204, 376, 436];
	res = 0.1*[0.0005, 0.0005, 0.0002, 0.0005];
	dec = delayTime * [1, 1, 1, 1];
	specs = [freqs, res, dec];
	signal = LPF.ar(signal, 10000);
	x = Klank.ar(`specs, signal) * EnvGen.ar(Env.perc, doneAction:2);
	//	x = CombC.ar(signal, 0.6, 0.25, 10.0, EnvGen.ar(env, doneAction:2));
	x = Pan2.ar(x, pan);

	Out.ar(out, LeakDC.ar(x));
}).store;

SynthDef(\sin_grain_random, {arg freq, amp, grain_dur, dur=1, grain_freq, gate=1;
	var pan, env, freqdev, freqs, freqIndex;
	var varying_grain_freq, trig, varying_freq;
	f = Drand([
		2677.777, 2700.0, 2728.0, 2766.666, 2800.0, 2850.0, 2900.0, 2950.0, 3000.0, 3050.0, 3100.0], inf);
	varying_grain_freq = Line.kr(grain_freq*10.0.rand(),grain_freq*10.0.rand(), dur);
	pan =  1;//WhiteNoise.ar(2.0, -1.0); //SinOsc.kr(0.1, 1.rand, 1);
	env = EnvGen.kr(Env.linen(1.0, dur, 1.0), gate, levelScale: amp, doneAction: 2);
	trig =  Impulse.kr(varying_grain_freq);
	varying_freq = Demand.kr(trig, 0, f);
	Out.ar(0, GrainSin.ar(2, trig, WhiteNoise.ar(1.0, 2.0) * grain_dur, varying_freq, pan) * env)
}).load();

//SynthDef(
SynthDef(\sin_grain, {arg freq, amp, grain_dur, dur=1, grain_freq, gate=1, out=0;
var pan, env, freqdev;
pan = SinOsc.kr(rrand(0.8,1.8), rand(2*3.14));
env = EnvGen.kr(Env.sine(dur, amp), gate, doneAction: 2);

Out.ar(out, GrainSin.ar(2, Impulse.ar(grain_freq), grain_dur, freq, pan, -1, 2048) * env)
}).load();

SynthDef(\perc_grain, {arg freq=80, amp=0.1, grain_dur=1/30.0, dur=1, grain_freq=15, gate=1, out=0;
var pan, env, freqdev;
pan = 0.0;
env = EnvGen.kr(Env.perc(releaseTime:dur, level:amp), gate, doneAction: 2);

Out.ar(out, GrainSin.ar(2, Impulse.ar(grain_freq), grain_dur, freq, pan, -1, 2048) * env)
}).load();


SynthDef(\chimes, { arg dur=6.0, amp=1.0, dens=1.0;
	var signal, env;
	var chime, freqSpecs, freqSpecs2, burst, burst2, harmonics = 10;
	var burstEnv, burstLength = 0.002;

	env = EnvGen.ar(Env.new([0.00001, amp, amp, 0.00001], [0.15, dur-0.3, 0.15], \exponential), gate: 1,  doneAction:2);
	freqSpecs = `[
		{exprand(70.0, 2666.0)}.dup(harmonics), //freq array
		{rrand(0.3, 5.0)}.dup(harmonics).normalizeSum, //amp array
		{rrand(2.0, 8.0)}.dup(harmonics)]; //decay rate array

	freqSpecs2 = `[
		{exprand(300.0, 2666.0)}.dup(harmonics), //freq array
		{rrand(0.3, 5.0)}.dup(harmonics).normalizeSum, //amp array
		{rrand(2.0, 8.0)}.dup(harmonics)]; //decay rate array

	burstEnv = Env.sine(0.01, burstLength); //envelope times
	burst = PinkNoise.ar(EnvGen.kr(burstEnv, gate: Dust.kr(dens))*0.15); //Noise burst
	burst2 = PinkNoise.ar(EnvGen.kr(burstEnv, gate: Dust.kr(dens))*0.15); //Noise burst

	signal = env * Klank.ar(freqSpecs, burst) - burst + env * Klank.ar(freqSpecs2, burst2) - burst2;
	signal = LPF.ar(signal, 666);
	Out.ar(0, signal ! 2);
}).store;

SynthDef(\wind, { arg amp=1.0, dur=6.0, freqlo=400, freqhi=880;
	var freqenv, sig, env;
	env = EnvGen.ar(Env.sine(dur,amp), gate:1, doneAction:2);
	freqenv = Env.new([freqlo, freqhi, freqlo], [0.5*dur, 0.5*dur], \exponential);
	sig = env * BPF.ar(WhiteNoise.ar(0.4), EnvGen.ar(freqenv), 0.1);
	Out.ar(0, sig ! 2);
}).store;
)

//SynthDef(\resonators, { arg f=40, n=50;
//	var signal = [];

		signal = Mix.fill(n, {|i| Resonz.ar(Dust2.ar(5), f * (i + 1), 0.001, 100)}) * n.reciprocal; // scale to ensure no clipping
	 Mix.fill(n, {|i| Resonz.ar(Dust2.ar(5), f * (i + 1), 0.001, 100)}) * n.reciprocal; // scale to ensure no clipping

//}).store;

)

//cruiselooch
(
t = Task({
	var dur, freq, freqs, freqs1, freqs2, lowfreqs, waitTime, amp, index, guitarPlayed=0;
	var repsOfSameTones = 2;
	var toneCount = 0;
	var steps;
	amp = 80;
	freqs1 = List[60, 64, 67]; // we fill an array with a scale;
	freqs2 = List[72, 76, 79, 81, 83];
	lowfreqs = List[1, 2, 3, 4, 5];
	~dryout = Bus.audio(s,2);
	~flange = Bus.audio(s,2);
	~master = Bus.audio(s,2);


	Synth(\omgflange, [\in, ~dryout, \out, 0, \amp, 0.02, \center, 0.04, \freq, 0.1], addAction: \addToTail);
    //Synth(\omgverb, [\in, ~flange, \out, ~master], addAction: \addToTail);

	//Synth(\omgcompress, [\in, ~master], addAction: \addToTail);

	freqs = (72.rand + lowfreqs).midicps;
	inf.do({(
		8.do({
				(
				if (0.3.coin, {
				{

					var grain_dur, grain_freq, sin_freq, sin_dur, env_amp;
					rrand(0,5).sleep();
					sin_freq = exprand(66.6, 1604.0);
			 		sin_dur = rrand(10,25);//25.0.rand() + 5.0;
					grain_dur = exprand(0.001, 0.01); // rrand(0.0001, 0.002);//0.008);
					grain_freq = 266*pow(1.059463,rrand(1,2));// exprand(66,66);// rand2(5.0) + 22.0;
			 		env_amp = 0.0001 / (grain_dur ** (2/3) * log(sin_freq) ** 3);
					"medamp % freq % grain_dur % grain_freq % dur %\n".postf(env_amp, sin_freq, grain_dur, grain_freq, sin_dur);
					Synth(\sin_grain, [\out, ~dryout, \amp,  env_amp, \grain_dur, grain_dur, \grain_freq, grain_freq, \dur, sin_dur, \freq, sin_freq]);
					//s.sendMsg("\s_new", "sin_grain", c = s.nextNodeID,1,1, "out", ~dryout, "amp", env_amp, "grain_dur", grain_dur, "grain_freq", grain_freq, "dur", sin_dur, "freq", sin_freq);
			 	}.fork();
				});
			if (0.3.coin, {
				{

					var grain_dur, grain_freq, sin_freq, sin_dur, env_amp;
					rrand(0,5).sleep();
					sin_freq = exprand(66.6, 1604.0);
			 		sin_dur = rrand(10,25);//25.0.rand() + 5.0;
					grain_dur = exprand(0.001, 0.01); // rrand(0.0001, 0.002);//0.008);
					grain_freq = 267*pow(1.059463,rrand(2,3));// exprand(66,66);// rand2(5.0) + 22.0;
			 		env_amp = 0.0001 / (grain_dur ** (2/3) * log(sin_freq) ** 3);
					"highamp % freq % grain_dur % grain_freq % dur %\n".postf(env_amp, sin_freq, grain_dur, grain_freq, sin_dur);
					Synth(\sin_grain, [\out, ~dryout, \amp,  env_amp, \grain_dur, grain_dur, \grain_freq, grain_freq, \dur, sin_dur, \freq, sin_freq]);
					//s.sendMsg("\s_new", "sin_grain", d = s.nextNodeID,1,1,"out", ~dryout, "amp", env_amp, "grain_dur", grain_dur, "grain_freq", grain_freq, "dur", sin_dur, "freq", sin_freq);
			 	}.fork();
				});
				if (0.3.coin, {
				{

					var grain_dur, grain_freq, sin_freq, sin_dur, env_amp;
					rrand(0,5).sleep();
					sin_freq = exprand(66.6, 1604.0);
			 		sin_dur = rrand(10,25);//25.0.rand() + 5.0;
					grain_dur = exprand(0.01, 0.1); // rrand(0.0001, 0.002);//0.008);
						steps = rrand(1,13);
						steps = steps * -1;
						grain_freq = 268*pow(1.059463,rrand(3,4));// exprand(66,66);// rand2(5.0) + 22.0;
			 		env_amp = 0.0001 / (grain_dur ** (2/3) * log(sin_freq) ** 3);
					"lowamp % freq % grain_dur % grain_freq % dur %\n".postf(env_amp, sin_freq, grain_dur, grain_freq, sin_dur);
					Synth(\sin_grain, [\out, ~dryout, \amp,  env_amp, \grain_dur, grain_dur, \grain_freq, grain_freq, \dur, sin_dur, \freq, sin_freq]);
					//s.sendMsg("\s_new", "sin_grain", d = s.nextNodeID,1,1,"out", ~dryout, "amp", env_amp, "grain_dur", grain_dur, "grain_freq", grain_freq, "dur", sin_dur, "freq", sin_freq);
			 	}.fork();
				});
			 	);
		});
		(1.0.rand() + 6.66).wait();
	)});
});
t.play();
)


