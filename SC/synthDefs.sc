//server line for sendMsg usage
s = Server("aServer"); //,NetAddr("192.168.1.66",57110));
s.boot();
//SynthDefs
(
SynthDef(\pitch_follow, { arg out_bus;
  var amp, in, signal, freq, has_freq;
  in = Mix.new(SoundIn.ar([0, 1]));
  amp = Amplitude.kr(in, 0.05, 0.05);
  #freq, has_freq = Pitch.kr(in, ampThreshold: 0.02, median: 7);
  //freq.plot();
  Out.kr(out_bus, freq);
}).load(s);

SynthDef(\fatsaw,
	{
		arg freq=440, amp=0.3, fat=0.0033, ffreq=2000, atk=0.001, dec=0.3, sus=0.5, rls=0.1,gate=1;

		var f1,f2,f3,f4,synth;

		f1=freq-(freq*fat);
		f2=freq-(freq*fat/2);
		f3=freq+(freq*fat/2);
		f4=freq+(freq*fat);

		synth = LFSaw.ar([f1,f2,f3,f4],[0,0.001,0.002,0.004,0.008]);
		synth = synth * EnvGen.kr(Env([0,1,sus,0],[atk,dec,rls],'lin',2),gate,doneAction:2);
		synth=Splay.ar(synth,0.7);
		synth=RLPF.ar(synth,ffreq*Linen.kr(gate,0.1,0.4,0.2,0),0.4);
		Out.ar([0,1],synth*amp);
},[0.1,0.3,4,2]).add;

SynthDef(\kick, {|out = 0, amp = 0, pan|
var env, bass;
env = EnvGen.kr(Env.perc(0.001, 0.2, 1, -4), 1, doneAction:2);
bass = SinOsc.ar(80) + Crackle.ar(1, 0.5);
Out.ar(out, Pan2.ar(bass*env, pan, amp));
}).add;

SynthDef(\snare2, {|out = 0, amp = 0, pan|
var env, snare;
env = EnvGen.kr(Env.perc(0.001, 0.1, 1, -5), 1, doneAction:2);
snare = SinOsc.ar(120) - WhiteNoise.ar(0.5, 0.5);
Out.ar(out, Pan2.ar(snare*env, pan, amp));
}).add;

SynthDef(\hat, {|out = 0, amp = 1, pan|
var env, hat;
env = EnvGen.kr(Env.perc(0.002, 0.3, 1, -2), 1, doneAction:2);
hat = Klank.ar(`[ [ 6563, 9875 ],
[ 0.6, 0.5 ],
[ 0.002, 0.003] ], PinkNoise.ar(1));
Out.ar(out, Pan2.ar(hat*env, pan, amp));
}).add;

SynthDef(\tom, {|out = 0, amp = 0, pan|
var env, tom;
env = EnvGen.kr(Env.perc(0.001, 0.1, 1, -5), 1, doneAction:2);
tom = SinOsc.ar(440);
Out.ar(out, Pan2.ar(tom*env, pan, amp));
}).add;

SynthDef("ws_drum", { arg freq=40, amp=0.9, gate = 1;
	var osc, ampenv, ampenvctl, tfuncenv, buf, tfuncstream, f1, f2, t, f1envctl;

	b = Buffer.alloc(s,1024,1);
	t = Signal.fill(512, { arg i; var j = i / 511.0;
		1 + (0.841 * j) - (0.707 * (j**2)) - (0.595 * (j**3)) + (0.5 * (j**4)) +( 0.42 * (j**5)) - (0.354 * (j**6)) - (0.297 * (j**7)) + (0.25 * (j**8)) + (0.21*(j**9))});
	t.plot;
	b.loadCollection(t.asWavetable);
	b.plot;

	f1 = Env.new([1, 0, 0], [0.04, 0.16]);
	f2 = Env.new([0, 0.9, 1, 0.9, 0], [0.01, 0.01, 0.01, 0.17], [-1, -3, 3, -5]);
	f1.plot;
	f2.plot;

	osc = amp * SinOsc.ar(freq, 0, EnvGen.kr(f2,gate)) * Shaper.ar(b, SinOsc.ar(0.7071*freq, 0, EnvGen.kr(f1, gate, doneAction: 2)));
	Out.ar(0, Pan2.ar(osc, 0, 1));
}).load(s);

SynthDef(\voice, {|out = 0, amp = 1, pan = 0|

		// modulating formant frequency
		var signal, osc;
	osc =  SinOsc.kr(5,0, 1000, 3000);
		signal = Formant.ar(440,osc, 0.5*osc);
		Out.ar(out, Pan2.ar(signal, pan, amp));
}).add;

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


SynthDef(\bass, { | atk = 0.01, dur = 0.15, freq = 50, amp=0.8, out=0 |
	var signal = SinOsc.ar(freq, mul: amp * EnvGen.kr( Env.new( [0.000001, 1, 0.8, 0.8, 0.00000001], [atk, 2*atk, dur-(3*atk+0.25*dur), 0.25*dur], 'exp'), doneAction: 2 )) ! 2;
	Out.ar(out, signal);
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

	SynthDef(\fullkickdrum, {

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

SynthDef(\snare, {|freq=180, amp=1, dur=0.2, cutoff=6000, out=0|
	var snarenoise, snareosc, snareenv, snareout, env, signal;
	env = EnvGen.ar(Env.perc(level:amp, attackTime:0.0001, releaseTime:dur), doneAction:2);
	signal = SinOsc.ar(freq);
	//snareenv = EnvGen.ar(Env.new([0,1,0.25,0.25,0], [0.01,0.02,0.2,0.1]), doneAction:2);
	snareout = env * (signal + LPF.ar(WhiteNoise.ar(1),cutoff));
	Out.ar(out, Pan2.ar(snareout, 0));
}).send(s);

SynthDef(\risset, {|out= 0, pan= 0, freq= 400, amp= 0.1, dur= 2, t_trig= 1|
		var amps= #[1, 0.67, 1, 1.8, 2.67, 1.67, 1.46, 1.33, 1.33, 1, 1.33];
		var durs= #[1, 0.9, 0.65, 0.55, 0.325, 0.35, 0.25, 0.2, 0.15, 0.1, 0.075];
		var frqs= #[0.56, 0.56, 0.92, 0.92, 1.19, 1.7, 2, 2.74, 3, 3.76, 4.07];
		var dets= #[0, 1, 0, 1.7, 0, 0, 0, 0, 0, 0, 0];
		var src= Mix.fill(11, {|i|
			var env= EnvGen.ar(Env.perc(0.005, dur*durs[i], amps[i], -4.5), t_trig);
			SinOsc.ar(freq*frqs[i]+dets[i], 0, amp*env);
		});
		Out.ar(out, Pan2.ar(src, pan));
}).send(s);

SynthDef(\bassDrum, {|freq=35.0, amp=1, pan=0.0, dur=1, out=0|
			var signal, env;
			env = EnvGen.ar(Env.perc(level:amp, attackTime:0.0001, releaseTime:dur), doneAction:2);
			signal = env*SinOsc.ar(Line.kr(1, 0, 0.05, 2*freq, freq));
			signal = Pan2.ar(signal, pan);
			Out.ar(out, signal);
		}).send(s);

SynthDef(\feedback_delay, {|in=2, out=0, delay=0.2, decay=6|
	Out.ar(out, In.ar(in, 2) + CombL.ar(In.ar(in, 2), delay, delay, decay));
		}).send(s);
SynthDef(\omgcompress, {|in=2, out=0|
			Out.ar(out, Compander.ar(In.ar(in,2), In.ar(in, 2), thresh: 0.7, slopeBelow: 1, slopeAbove: 0.2, clampTime: 0.01, relaxTime:0.01));
		}).send(s);
SynthDef(\omgverb, {|in=2, out=0|
      Out.ar(out, FreeVerb.ar(In.ar(in, 2), 0.9, 0.8, 0.2));
		}).send(s);

SynthDef(\omgdist, {|in=2, out=0|
	var b, signal;
	b = Buffer.alloc(s, 1024, 1);
	b.cheby([1, 0.5, 1, 0.125]);
	signal = Shaper.ar(b, 10*In.ar(in,2));
	    Out.ar(out, signal);
}).send(s);

SynthDef("omgdist2", {|out=0,in=4,drive=0.3,type=0,amp=1|
   var sig;
   sig = In.ar(in, 2)*(((drive**2)+0.02)*50);
   sig = SelectX.ar(type,[sig.softclip,sig.distort,sig.clip(-1,1),sig.fold(-1,1)]);
   sig = sig * ((amp**2)*(1-(drive/2.6)));
   Out.ar(out,sig);
}).send(s);

SynthDef("omgdist3", {|out=0,in=4,drive=0.3,type=0,amp=1|
   var sig;
   sig = In.ar(in, 2)*(((drive**2)+0.02)*50);
	sig = tanh(sig);
   sig = sig * ((amp**2)*(1-(drive/2.6)));
   Out.ar(out,sig);
}).send(s);

SynthDef(\omgflange, {|in=2, out=0, freq=0.2, amp=0.0025, center=0.009325|
			Out.ar(out, 1* In.ar(in,2) +  DelayC.ar(In.ar(in,2), 0.2, SinOsc.kr(freq, 0, amp, center)));
			}).send(s);

SynthDef(\freqySynth, {| freq=220.0, wahfreq=1, attack=0.01, amp=0.2, dur=1.0, pan=0.0, out=0, harm=10|
	var signal, env, harmonics = 50;
	env = EnvGen.ar(Env.perc(attack, dur), doneAction:2);
	signal = Klang.ar(`[ Array.fill(harmonics, {arg i; freq * (i+1)}), Array.fill(harmonics, {arg i; amp / (i+1)}), Array.fill(harmonics, {arg i; 6.28.rand()})]);
	signal = BPeakEQ.ar(signal, SinOsc.ar(wahfreq, 6.28.rand, 200, 640), 0.2, 18);
	signal = env * Pan2.ar(signal, pan);
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

SynthDef(\ks_guitar, { arg note, pan=0.0, rand=0.1, delayTime=1, noiseType=1, out=0;
	var signal, x, y, env, specs, freqs, res, dec;
	env = Env.new([1, 1], [4*delayTime]);
	// A simple exciter x, with some randomness.
	signal = Decay.ar(Impulse.ar(0, 0, rand), 1+rand, PinkNoise.ar);
 	signal = CombL.ar(signal, 0.05, note.reciprocal, delayTime);
	freqs = [102,  204, 376, 436];
	res = 0.1*[0.0005, 0.0005, 0.0002, 0.0005];
	dec = delayTime * [1, 1, 1, 1];
	specs = [freqs, res, dec];
	signal = LPF.ar(signal, 10000);
	signal = signal * EnvGen.ar(env, doneAction:2);
	//	x = CombC.ar(signal, 0.6, 0.25, 10.0, EnvGen.ar(env, doneAction:2));
	x = Pan2.ar(signal, pan);

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

SynthDef(\drone, { arg freq1=30.midicps, freq2=30.midicps;
	var droneOsc1, droneOsc2, sig, env, filterEnv;
	env = Env.new([0, 1, 0], [15, 15]);
	filterEnv = Env.new([0, 500, 50], [15, 15]);
	a = FloatArray.fill(256, {1.0.rand2});
	c = Buffer.loadCollection(s, a);
	d = Buffer.loadCollection(s, a);
	droneOsc1 = DelayN.ar(Osc.ar(c.bufnum, freq1), 0.35, 0.35, 0.1);
	droneOsc2 = DelayN.ar(Osc.ar(d.bufnum, freq2), 0.49, 0.49, 0.1);
	sig = [ droneOsc1, droneOsc2 ];
	sig = LPF.ar(sig, EnvGen.kr(filterEnv), EnvGen.ar(env, doneAction:2));
	sig = CombL.ar(sig, 0.9, 0.9);
	Out.ar(0, sig);
}).send(s);

)

(

t = Task({
	inf.do({

		var freqs = [30, 34, 37, 42, 46, 49];
		var f1, f2, f3, index;
		index = freqs.size.rand();
		f1 = freqs.at(index);
		index = freqs.size.rand();
		f2 = freqs.at(index);
		index = freqs.size.rand();
		f3 = freqs.removeAt(index);
		Synth(\drone, [\freq1, f1.midicps(1+0.002.rand2()), \freq2, f1.midicps*(1+0.002.rand2())]);
		Synth(\drone, [\freq1, f2.midicps(1+0.002.rand2()), \freq2, f2.midicps*(1+0.002.rand2())]);
		Synth(\drone, [\freq1, f3.midicps(1+0.002.rand2()), \freq2, f3.midicps*(1+0.002.rand2())]);
		25.wait;

	});
});
t.play();
)
