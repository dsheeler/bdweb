Pdef(\x,Pbind(\midinote,60)).play;
Pdef(\x,Pbind(\midinote,67));
Pdef(\x,Pbind(\midinote,Pseq([60,67],inf)));
Pdef(\x,Pbind(\midinote,Pseq([60,67],inf),\dur,0.5));
Pdef(\x,Pbind(\midinote,Pseq([60,67],inf),\dur,0.25));
Pdef(\x,Pbind(\midinote,Pseq([60,67,68],inf),\dur,Pseq([0.25,0.125],inf)));
Pdef(\x,Pbind(\midinote,Pseq([60,67,68],inf)+12,\dur,Pseq([0.25,0.125],inf)));
Pdef(\x,Pbind(\midinote,Pseq([60,67,68],inf)+24,\dur,Pseq([0.25,0.125],inf)));
Pdef(\x,Pbind(\midinote,Pseq([60,67,68],inf)+Pxrand([0,12,24],inf),\dur,Pseq([0.25,0.125],inf)));


(
// long enough for one line, time to put it in a region...
p = Pbind(
	\instrument, \fatsaw,
	\midinote,Pseq([40, 44, 47, 51],inf)+Pxrand([0],inf),
	\dur,Pseq([1,1],inf),
	\legato,2
).play);
)

( p = Pbind( \instrument, Pseq([\snare, \bassDrum], inf),

).play
)


(
Pdef(\x,Pbind(
\instrument,\burst, // using my own SynthDef
\midinote,Pseq([60,67,68],inf)+Pxrand([0,12,24],inf),
\dur,Pseq([,0.125],inf),
\legato,2
));
)
p.stop;

