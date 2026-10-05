#!/bin/bash
# Cuts the raw Playwright recording into the published intro video (~61s):
# title card, the tour sped up 1.4x, outro and end screen, joined with
# crossfades, a fade in and out, and the original music from music.py.
#
# Usage: build/video/edit.sh <raw.webm> [outDir]
# The segment times below match one recording. Find yours with
#   ffmpeg -i raw.webm -vf "select='gt(scene,0.01)',showinfo" -f null - 2>&1 | grep pts_time
# and adjust SEGMENTS before encoding. Needs ffmpeg (libx264, aac), bc, python3 + numpy.
set -euo pipefail

RAW="$1"
OUT="${2:-docs/assets/video}"
FF="${FFMPEG:-ffmpeg}"
HERE="$( cd "$( dirname "$0" )" && pwd )"

# start:end:speed, in raw recording seconds
SEGMENTS=(
	"0:3.8:1"         # title card
	"13.6:80.6:1.4"   # Dashboard, Chain, Dry Run, Metrics, Live Tracker
	"80.72:84.62:1"   # outro: turn it on in one setting
	"85.64:92.64:1"   # end screen: rulebox.coldbox.org
)
XF=0.6         # crossfade length
FADE_IN=0.8
FADE_OUT=1.8

filter="[0:v]fps=25,format=yuv420p,split=${#SEGMENTS[@]}"
for i in "${!SEGMENTS[@]}"; do filter+="[s$i]"; done
filter+=";"
offset=0
total=0
for i in "${!SEGMENTS[@]}"; do
	IFS=: read -r start end speed <<< "${SEGMENTS[$i]}"
	filter+="[s$i]trim=$start:$end,setpts=(PTS-STARTPTS)/$speed,fps=25,settb=AVTB[v$i];"
	len=$( echo "( $end - $start ) / $speed" | bc -l )
	if [ "$i" = 0 ]; then
		prev="v0"
		total=$len
	else
		offset=$( echo "$total - $XF" | bc -l )
		filter+="[$prev][v$i]xfade=transition=fade:duration=$XF:offset=$offset[x$i];"
		prev="x$i"
		total=$( echo "$offset + $len" | bc -l )
	fi
done
fo=$( echo "$total - $FADE_OUT" | bc -l )
filter+="[$prev]fade=t=in:st=0:d=$FADE_IN,fade=t=out:st=$fo:d=$FADE_OUT[v]"

mkdir -p "$OUT"
MUSIC="$( mktemp --suffix=.wav )"
trap 'rm -f "$MUSIC"' EXIT
python3 "$HERE/music.py" "$MUSIC" "$( printf '%.2f' "$total" )"

"$FF" -hide_banner -loglevel error -y -i "$RAW" -i "$MUSIC" -filter_complex "$filter" \
	-map "[v]" -map 1:a -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
	-c:a aac -b:a 160k -af "volume=-5dB" -shortest -movflags +faststart \
	"$OUT/rulebox-visualizer-intro.mp4"
echo "Wrote $OUT/rulebox-visualizer-intro.mp4 ($( printf '%.1f' "$total" )s)"
