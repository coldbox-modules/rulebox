#!/usr/bin/env python3
"""
Original background music for the Visualizer intro video, synthesized from scratch
(no samples, no third-party audio), so the docs carry no music licensing questions.

123 BPM in C major over Am F C G. The sections line up with the video cut in edit.sh:
a filtered intro under the title card, the groove dropping in as the tour starts, a lead
motif from bar 11, then a breakdown and an F G C cadence under the outro and end screen.

Usage: python3 build/video/music.py <out.wav> [durationSeconds]   (needs numpy)
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 123
BEAT = 60 / BPM
BAR = 4 * BEAT
DROP = 2 * BAR          # 4s: the tour starts
BREAK = 26 * BAR        # 52s: outro card, drums stop
CADENCE = [ "F", "G", "C" ]

CHORDS = {
	# name: ( bass midi, pad voicing midi, arp tones midi )
	"Am": ( 45, [ 57, 60, 64 ], [ 69, 72, 76, 81 ] ),
	"F": ( 41, [ 53, 57, 60 ], [ 65, 69, 72, 77 ] ),
	"C": ( 48, [ 55, 60, 64 ], [ 67, 72, 76, 79 ] ),
	"G": ( 43, [ 55, 59, 62 ], [ 67, 71, 74, 79 ] ),
}
LOOP = [ "Am", "F", "C", "G" ]
# Lead motif, one bar per chord, quarter notes (None = rest)
MOTIF = [
	[ 76, 74, 72, 69 ],
	[ 77, 76, 72, 69 ],
	[ 79, 76, 72, 76 ],
	[ 74, 71, 67, None ],
]

rng = np.random.default_rng( 7 )


def hz( midi ):
	"""MIDI note number to frequency."""
	return 440.0 * 2 ** ( ( midi - 69 ) / 12 )


def env( n, attack, release, sustain=1.0 ):
	"""Linear attack, flat sustain, exponential tail over n samples."""
	t = np.arange( n ) / SR
	e = np.minimum( 1.0, t / max( attack, 1e-4 ) ) * sustain
	tail = np.exp( -np.maximum( 0, t - attack ) / max( release, 1e-4 ) )
	return e * tail


def saw( f, n, detune=0.0, phase=0.0 ):
	"""Naive saw (soft enough after the low-pass filters below)."""
	t = np.arange( n ) / SR
	x = ( t * f * 2 ** ( detune / 1200 ) + phase ) % 1.0
	return 2 * x - 1


def spectral( x, fn ):
	"""Filter a mono signal by shaping its spectrum: fn(freqs) -> gain."""
	X = np.fft.rfft( x )
	f = np.fft.rfftfreq( len( x ), 1 / SR )
	return np.fft.irfft( X * fn( f ), len( x ) )


def lowpass( x, fc ):
	return spectral( x, lambda f: 1 / np.sqrt( 1 + ( f / fc ) ** 4 ) )


def highpass( x, fc ):
	return spectral( x, lambda f: 1 / np.sqrt( 1 + ( fc / np.maximum( f, 1e-3 ) ) ** 4 ) )


def place( buf, sig, start ):
	"""Mix sig into buf at a time in seconds (clipped to the buffer)."""
	i = int( round( start * SR ) )
	if i >= len( buf ):
		return
	j = min( len( buf ), i + len( sig ) )
	buf[ i:j ] += sig[ : j - i ]


def chord_at( t ):
	"""Chord name sounding at time t."""
	bar = int( t // BAR )
	if t >= BREAK:
		return CADENCE[ min( bar - 26, len( CADENCE ) - 1 ) ]
	return LOOP[ bar % 4 ]


def build( duration ):
	n = int( duration * SR )
	bars = int( np.ceil( duration / BAR ) )
	kick, clap, hats, bass, pad, arp, lead, fx = ( np.zeros( n ) for _ in range( 8 ) )
	kick_times = []

	for b in range( bars ):
		t0 = b * BAR
		name = chord_at( t0 )
		root, voicing, tones = CHORDS[ name ]
		last = t0 >= BREAK and name == "C"
		length = ( duration - t0 ) if last else BAR

		# Pad: detuned saws, slow swell
		pn = int( ( length + 1.5 ) * SR )
		chord = sum( saw( hz( m ), pn, d, rng.random() ) for m in voicing for d in ( -9, 0, 8 ) )
		place( pad, chord * env( pn, 0.35, 2.5 if last else 1.2 ) / 9, t0 )
		if last:
			break

		groove = DROP <= t0 < BREAK
		for beat in range( 4 ):
			tb = t0 + beat * BEAT
			if groove:
				# Kick: pitch-swept sine
				kn = int( 0.45 * SR )
				kt = np.arange( kn ) / SR
				freq = 45 + 85 * np.exp( -kt / 0.035 )
				place( kick, np.sin( 2 * np.pi * np.cumsum( freq ) / SR ) * np.exp( -kt / 0.16 ), tb )
				kick_times.append( tb )
				# Offbeat hat, plus a ghost 16th from bar 7
				hn = int( 0.06 * SR )
				hat = highpass( rng.standard_normal( hn ), 7000 ) * env( hn, 0.001, 0.018 )
				place( hats, hat, tb + BEAT / 2 )
				if t0 >= 6 * BAR:
					place( hats, hat * 0.45, tb + 3 * BEAT / 4 )
				# Clap on 2 and 4 from bar 5
				if beat in ( 1, 3 ) and t0 >= 4 * BAR:
					cn = int( 0.25 * SR )
					noise = spectral( rng.standard_normal( cn ), lambda f: np.exp( -( ( f - 1500 ) / 900 ) ** 2 ) )
					place( clap, noise * env( cn, 0.002, 0.07 ), tb )
			# Bass: 8th-note pulse on the root (sub + filtered saw)
			if groove:
				for half in ( 0, 1 ):
					bn = int( BEAT / 2 * SR )
					tone = 0.7 * np.sin( 2 * np.pi * hz( root ) * np.arange( bn ) / SR ) + 0.5 * lowpass( saw( hz( root + 12 ), bn ), 700 )
					place( bass, tone * env( bn, 0.005, 0.12 ), tb + half * BEAT / 2 )
			# Lead motif from bar 11 until the break
			if 10 * BAR <= t0 < BREAK:
				note = MOTIF[ b % 4 ][ beat ]
				if note:
					ln = int( 0.6 * SR )
					lt = np.arange( ln ) / SR
					vib = 1 + 0.004 * np.sin( 2 * np.pi * 5.5 * lt )
					ph = 2 * np.pi * np.cumsum( hz( note ) * vib ) / SR
					bell = np.sin( ph ) + 0.4 * np.sin( 2 * ph ) + 0.2 * np.sin( 3 * ph ) + 0.12 * np.sin( 4 * ph ) * np.exp( -lt / 0.08 )
					place( lead, bell * env( ln, 0.01, 0.28 ), tb )

		# Arp: 16ths through the chord tones, all the way to the end
		pattern = [ 0, 2, 1, 3, 2, 1, 0, 2, 1, 3, 2, 3, 1, 2, 0, 1 ]
		for s, k in enumerate( pattern ):
			an = int( 0.22 * SR )
			at = np.arange( an ) / SR
			f = hz( tones[ k ] )
			pluck = np.sin( 2 * np.pi * f * at ) + 0.3 * np.sin( 4 * np.pi * f * at ) + 0.35 * lowpass( saw( f, an ), 5000 )
			accent = 1.0 if s % 4 == 0 else 0.72
			place( arp, pluck * env( an, 0.002, 0.07 ) * accent, t0 + s * BEAT / 4 )

	# Riser into the drop, and an impact on it
	rn = int( DROP * SR )
	rise = np.linspace( 0, 1, rn ) ** 3
	place( fx, highpass( rng.standard_normal( rn ), 2500 ) * rise * 0.5, 0 )
	imp = int( 2.5 * SR )
	place( fx, highpass( rng.standard_normal( imp ), 3000 ) * env( imp, 0.003, 0.6 ) * 0.5, DROP )

	# Sidechain: duck pad, bass and arp under each kick
	duck = np.ones( n )
	t = np.arange( n ) / SR
	for k in kick_times:
		i = int( k * SR )
		j = min( n, i + int( 0.3 * SR ) )
		duck[ i:j ] = np.minimum( duck[ i:j ], 1 - 0.55 * np.exp( -( t[ i:j ] - k ) / 0.09 ) )

	# Intro: open the filter on pad and arp over the title card
	opening = np.clip( t / DROP, 0, 1 ) ** 2
	pad = lowpass( pad, 3800 )
	arp_dark = lowpass( arp, 900 )
	arp = arp_dark * ( 1 - opening ) + arp * opening

	# Without drums the pad and arp carry the track, so lift them there
	no_drums = 1 - np.clip( ( t - ( DROP - 0.3 ) ) / 0.3, 0, 1 ) + np.clip( ( t - BREAK ) / 0.5, 0, 1 )
	lift = 1 + 1.6 * np.clip( no_drums, 0, 1 )
	pad = pad * lift
	arp = arp * lift

	# Stereo: arp ping-pong delay, lead slightly right, pad wide
	d = int( 3 * BEAT / 4 * SR )
	left = arp.copy()
	right = np.zeros( n )
	for tap in range( 1, 5 ):
		g = 0.42 ** tap
		shifted = np.zeros( n )
		shifted[ tap * d : ] = arp[ : n - tap * d ] * g
		if tap % 2:
			right += shifted
		else:
			left += shifted
	pad_l = pad
	pad_r = np.roll( pad, int( 0.011 * SR ) )

	dry_l = 0.8 * kick + 0.36 * clap + 0.2 * hats + 0.28 * bass * duck + 0.2 * pad_l * duck + 0.13 * left * duck + 0.13 * lead + 0.12 * fx
	dry_r = 0.8 * kick + 0.36 * clap + 0.2 * np.roll( hats, 90 ) + 0.28 * bass * duck + 0.2 * pad_r * duck + 0.13 * ( right + 0.4 * arp ) * duck + 0.16 * lead + 0.12 * fx

	# Reverb send: convolve with decaying noise
	irn = int( 2.2 * SR )
	ir_t = np.arange( irn ) / SR
	send = 0.12 * pad + 0.1 * arp + 0.12 * lead + 0.15 * clap
	wet = []
	for ch in range( 2 ):
		ir = rng.standard_normal( irn ) * np.exp( -ir_t / 0.55 )
		ir = lowpass( ir, 5000 )
		size = 1 << int( np.ceil( np.log2( n + irn ) ) )
		w = np.fft.irfft( np.fft.rfft( send, size ) * np.fft.rfft( ir, size ), size )[ :n ]
		wet.append( w / np.max( np.abs( ir ) ) * 0.02 )

	mix = np.stack( [ highpass( dry_l + wet[ 0 ], 30 ), highpass( dry_r + wet[ 1 ], 30 ) ] )

	# Master: gentle saturation, fade in and out, -1 dBFS peak
	mix = np.tanh( 1.2 * mix ) / np.tanh( 1.2 )
	fade_in = np.clip( t / 0.8, 0, 1 )
	fade_out = np.clip( ( duration - t ) / 2.2, 0, 1 )
	mix *= fade_in * fade_out
	mix *= 10 ** ( -1 / 20 ) / np.max( np.abs( mix ) )
	return mix


def write_wav( path, stereo ):
	pcm = ( np.clip( stereo.T, -1, 1 ) * 32767 ).astype( "<i2" )
	with wave.open( path, "wb" ) as w:
		w.setnchannels( 2 )
		w.setsampwidth( 2 )
		w.setframerate( SR )
		w.writeframes( pcm.tobytes() )


if __name__ == "__main__":
	out = sys.argv[ 1 ] if len( sys.argv ) > 1 else "music.wav"
	seconds = float( sys.argv[ 2 ] ) if len( sys.argv ) > 2 else 60.8
	write_wav( out, build( seconds ) )
	print( "Wrote", out, seconds, "s" )
