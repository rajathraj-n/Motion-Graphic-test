#!/bin/sh
# master.sh video.mp4 mix.wav out.mp4 — two-pass loudnorm to -14 LUFS / -1.5 dBTP, then mux.
# Stand-in for the library's mux.sh, which needs ffmpeg 7+ (this machine has ffmpeg 6).
set -e
V="$1"; A="$2"; O="$3"
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
TMP="${O%.mp4}.norm.wav"
ffmpeg -y -hide_banner -loglevel error -i "$A" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000,apad,atrim=0:$VD" -c:a pcm_s24le "$TMP"
ffmpeg -y -hide_banner -loglevel error -i "$V" -i "$TMP" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart "$O.part.mp4"
mv "$O.part.mp4" "$O"; rm -f "$TMP"
ffmpeg -hide_banner -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|Peak:" | tr -s ' '
echo "$O"
