#!/bin/bash
# Cuts the raw Playwright recording into the published intro video:
# title card, the tour sped up 1.15x, outro and end screen, joined with
# crossfades, plus a fade in and a fade out.
#
# Usage: build/video/edit.sh <raw.webm> [outDir]
# The trim points below match one recording. Check yours (for example with a
# contact sheet) and adjust A_END, B_START, B_END and C_END before encoding.
set -euo pipefail

RAW="$1"
OUT="${2:-docs/assets/video}"
FF="${FFMPEG:-ffmpeg}"

A_END=5.0      # end of the title card
B_START=13.6   # dashboard is loaded
B_END=80.5     # live tracker done
C_END=96.3     # end screen done
SPEED=1.15
XF=0.8         # crossfade length
FADE_OUT=1.5

A_LEN=$A_END
B_LEN=$( echo "( $B_END - $B_START ) / $SPEED" | bc -l )
C_LEN=$( echo "$C_END - $B_END - 0.1" | bc -l )
O1=$( echo "$A_LEN - $XF" | bc -l )
O2=$( echo "$O1 + $B_LEN - $XF" | bc -l )
TOTAL=$( echo "$O2 + $C_LEN" | bc -l )
FO=$( echo "$TOTAL - $FADE_OUT" | bc -l )

F="[0:v]fps=25,format=yuv420p,split=3[s1][s2][s3];\
[s1]trim=0:$A_END,setpts=PTS-STARTPTS,fps=25,settb=AVTB[a];\
[s2]trim=$B_START:$B_END,setpts=(PTS-STARTPTS)/$SPEED,fps=25,settb=AVTB[b];\
[s3]trim=$( echo "$B_END + 0.1" | bc -l ):$C_END,setpts=PTS-STARTPTS,fps=25,settb=AVTB[c];\
[a][b]xfade=transition=fade:duration=$XF:offset=$O1[ab];\
[ab][c]xfade=transition=fade:duration=$XF:offset=$O2[abc];\
[abc]fade=t=in:st=0:d=1.0,fade=t=out:st=$FO:d=$FADE_OUT[v]"

mkdir -p "$OUT"
"$FF" -hide_banner -loglevel error -y -i "$RAW" -filter_complex "$F" -map "[v]" \
	-c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart \
	"$OUT/rulebox-visualizer-intro.mp4"
echo "Wrote $OUT/rulebox-visualizer-intro.mp4"
