# Sound Effects & Chiptune Music Engine

All audio for `Super Adventure World` is procedurally synthesized using the HTML5 **Web Audio API** in `js/audio.js`.

## SFX Catalog:
- `Jump`: Square-wave rapid upward exponential pitch sweep (140Hz -> 520Hz).
- `Coin`: Dual-frequency chime ping (B5 987Hz -> E6 1318Hz).
- `Stomp`: Low-pass filtered noise burst + downward frequency drop (260Hz -> 50Hz).
- `Bump / Block`: Resonant triangle punch (160Hz -> 60Hz).
- `Break`: Multi-stage bandpass white noise shatter.
- `Kick`: Fast square wave slide (380Hz -> 90Hz).
- `Power-up / 1-Up`: Rapid ascending 7-note 8-bit arpeggio (C5 to C7).
- `Hurt / Death`: Classic falling descending tragic arpeggio.
- `Flagpole / Fanfare`: Slide whistle descent + triumphant multi-part fanfare.

## Background Music (BGM):
- Multi-channel step sequencer (Square Lead, Triangle Bass, Noise Percussion):
  - **Level 1**: *Grassland Journey* (Bouncy ragtime in C Major, 140 BPM)
  - **Level 2**: *Enchanted Canopy* (Syncopated adventure melody in A Minor, 130 BPM)
  - **Level 3**: *Underground Depths* (Dark funky bass walk, 118 BPM)
  - **Title Screen**: Upbeat title arpeggios
