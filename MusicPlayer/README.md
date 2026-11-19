# Music Player

A music player built with HTML, CSS and plain JavaScript.

## Features
- Play, pause, next, previous
- Song title, artist, current time and duration
- Seekable progress bar and volume slider with mute
- Playlist (click a song to play it) and autoplay
- Background lights and a glowing disc that move with the sound
- Keyboard: Space = play/pause, Left/Right arrows = skip 5 seconds

## How to use
1. Put your mp3 files in the `songs` folder.
2. Open `script.js` and edit the `songs` array at the top (title, artist, file path, optional cover image).
3. Open `index.html` in your browser.

## About the moving lights
- To make them react to the real music, run the page through a local server (the VS Code "Live Server" extension, or `python -m http.server` in this folder) and open the localhost link.
- If you just double-click `index.html`, the browser blocks reading the sound, so the lights move with a simulated beat instead. The music still plays normally.
