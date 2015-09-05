(
SynthDef(\fatsaw,
	{
		arg freq=440, amp=0.3, fat=0.0033, ffreq=2000, atk=0.001, dec=0.3, sus=0.5, rls=0.1,gate=1;

		var f1,f2,f3,f4,synth;

		f1=freq-(freq*fat);
		f2=freq-(freq*fat/2);
		f3=freq+(freq*fat/2);
		f4=freq+(freq*fat);

		synth = LFSaw.ar([f1,f2,f3,f4],[0,0.001,0.002,0.004,0.008]);
		synth = synth * EnvGen.kr(Env([0,1,sus,0],[atk,dec,rls],'lin',2),gate,doneAction:0);
		synth=Splay.ar(synth,0.7);
		synth=RLPF.ar(synth,ffreq*Linen.kr(gate,0.1,0.4,0.2,0),0.4);
		Out.ar([0,1],synth*amp);
},[0.1,0.3,4,2]).add;
)
(
TempoClock.default = TempoClock.new(2);
fork{

	z = Synth(\fatsaw,[\gate,0,\ffreq,500,\fat,0.5]);

	a=Pseq([0,7,12,5],inf).asStream; // musical degrees
	c = Pseq([40,38,45,47],inf).asStream; // root midi notes
	e = Pseq([0.825,0.375,0.25,0.25],inf).asStream; // note durations
	f = Pseq([1000,1500,2000,2500],inf).asStream; // filter freq value

	0.1.wait;
	z.set(\gate,1);

	//set first root note
	d = c.next;

	8.do{

		// move filter freq once every 4 notes
		z.set(\ffreq, f.next);
		4.do {
			z.set(\gate,1);
			z.set(\freq,(a.next + d).midicps);
			x=[0.451,0.45,0.449].choose;
			x.wait;
			z.set(\gate,0);

			e.next.wait;
		};

		d = c.next;
	};
	2.wait;
	z.free;
};
)