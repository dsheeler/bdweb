a = Synth(\MoaningDialogue)

//COOL TWEAKS
//AngryTweak
a.set(\feedback, 29,\freq, 6)
//CalmTweak
a.set(\feedback, 60, \freq, 0.8)
//WeirdTweak
a.set(\feedback, 60, \freq, 10, \lpfreq, 6000)

(
SynthDef(\MoaningDialogue, {
	|rateL = 0.2, rateR = 0.3, freq = 2, feedback = 50, mul = 1 , lpfreq = 2500|
	Out.ar(0,
		FreeVerb.ar(
			BLowPass.ar(
				SinOscFB.ar(
					LFDNoise1.kr([rateL, rateR], freq), feedback;
				, mul),
				lpfreq,
				0.2
			),
			0.3,
			0.0
		)
	)}
).add
)