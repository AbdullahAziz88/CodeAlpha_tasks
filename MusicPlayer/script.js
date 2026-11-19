const songs = [
  { title: "Guzarish", artist: "Satinder Sartaaj", src: "songs/guzarish.mp3" },
  { title: "Sweater Weather", artist: "The Neighbourhood", src: "songs/sweater-weather.mp3" },
  { title: "Birds of a Feather", artist: "Billie Eilish", src: "songs/birds-of-a-feather.mp3" },
  { title: "Sailor Song", artist: "Gigi Perez", src: "songs/sailor-song.mp3" },
  { title: "Babydoll", artist: "Dominic Fike", src: "songs/babydoll.mp3" },
  { title: "Back to Friends", artist: "sombr", src: "songs/back-to-friends.mp3" },
  { title: "Stay", artist: "The Kid LAROI, Justin Bieber", src: "songs/stay.mp3" },
  { title: "Pessimist", artist: "Lithe", src: "songs/pessimist.mp3" },
];

// ELEMENTS 
const $ = (id) => document.getElementById(id);
const app = $("app"), cover = $("cover"), audio = $("audio");
const titleEl = $("title"), artistEl = $("artist"), statusEl = $("status");
const seek = $("seek"), currentEl = $("current"), durationEl = $("duration");
const playBtn = $("play"), prevBtn = $("prev"), nextBtn = $("next");
const volume = $("volume"), muteBtn = $("mute"), autoplayBox = $("autoplay");
const playlistEl = $("playlist");

let current = 0;

// HELPERS
function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return m + ":" + s;
}
function paint(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--fill", pct + "%");
}

// LOAD A SONG
function loadSong(index, play = false) {
  current = (index + songs.length) % songs.length;
  const song = songs[current];

  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  cover.style.setProperty("--art", song.cover ? `url("${song.cover}")` : "");
  seek.value = 0; paint(seek);
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  statusEl.textContent = "";
  highlightActive();

  if (play) playSong();
}

function playSong() {
  audio.play().catch(() => {
    statusEl.textContent = "Can't play this song. Check that the file exists in the songs folder.";
  });
}

function togglePlay() {
  if (audio.paused) playSong(); else audio.pause();
}

const nextSong = (play = !audio.paused) => loadSong(current + 1, play);
const prevSong = (play = !audio.paused) => loadSong(current - 1, play);

//PLAYLIST 
function renderPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="track" data-index="${i}">
        <span class="num">${i + 1}</span>
        <span><span class="name"></span><span class="by"></span></span>
        <span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>`;
    li.querySelector(".name").textContent = song.title;
    li.querySelector(".by").textContent = song.artist;
    playlistEl.appendChild(li);
  });
}

function highlightActive() {
  document.querySelectorAll(".track").forEach((el, i) => {
    el.classList.toggle("active", i === current);
  });
}

playlistEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".track");
  if (btn) loadSong(Number(btn.dataset.index), true);
});

// BUTTONS
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", () => nextSong());
prevBtn.addEventListener("click", () => prevSong());

// AUDIO EVENTS
audio.addEventListener("play", () => { app.classList.add("playing"); playBtn.setAttribute("aria-label", "Pause"); });
audio.addEventListener("pause", () => { app.classList.remove("playing"); playBtn.setAttribute("aria-label", "Play"); });
audio.addEventListener("loadedmetadata", () => { durationEl.textContent = formatTime(audio.duration); });
audio.addEventListener("timeupdate", () => {
  if (!isFinite(audio.duration)) return;
  seek.value = (audio.currentTime / audio.duration) * 100;
  paint(seek);
  currentEl.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("ended", () => {
  if (autoplayBox.checked) nextSong(true); 
});
audio.addEventListener("error", () => {
  statusEl.textContent = "Couldn't load this song. Add your mp3 files to the songs folder.";
});

//SEEK AND VOLUME 
seek.addEventListener("input", () => {
  if (isFinite(audio.duration)) audio.currentTime = (seek.value / 100) * audio.duration;
  paint(seek);
});

function setVolume(v) {
  audio.volume = v;
  volume.value = v; paint(volume);
  muteBtn.parentElement.classList.toggle("muted", audio.muted || v === 0);
  try { localStorage.setItem("player-volume", v); } catch (e) {}
}
volume.addEventListener("input", () => { audio.muted = false; setVolume(Number(volume.value)); });
muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  muteBtn.parentElement.classList.toggle("muted", audio.muted);
});

// KEYBOARD (Space = play/pause and arrows = skip 5s) 
document.addEventListener("keydown", (e) => {
  if (e.target !== document.body) return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  if (e.code === "ArrowRight") audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
  if (e.code === "ArrowLeft") audio.currentTime = Math.max(audio.currentTime - 5, 0);
});

//BACKGROUND LIGHTS 
const canvas = $("lights"), g = canvas.getContext("2d");
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.2 : 1;
const level = { bass: 0, mid: 0, high: 0 };
let audioCtx = null, analyser = null, freq = null;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resizeCanvas);
resizeCanvas();
function setupAnalyser() {
  if (audioCtx || location.protocol === "file:") return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
  } catch (e) { analyser = null; }
}
audio.addEventListener("play", () => {
  setupAnalyser();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
});

const band = (from, to) => {
  let sum = 0;
  for (let i = from; i < to; i++) sum += freq[i];
  return sum / (to - from) / 255;
};

function readLevels(t) {
  let b = 0, m = 0, h = 0;
  if (!audio.paused) {
    if (analyser) {
      analyser.getByteFrequencyData(freq);
      b = band(0, 6); m = Math.min(band(6, 40) * 1.4, 1); h = Math.min(band(40, 100) * 2.2, 1);
    } else {
      const beat = Math.pow(Math.max(0, Math.sin(t * 0.0075)), 3);
      b = 0.35 + beat * 0.55;
      m = 0.3 + 0.3 * Math.pow(Math.sin(t * 0.004), 2);
      h = 0.25 + 0.3 * Math.pow(Math.sin(t * 0.009 + 1), 2);
    }
  }
  level.bass += (b - level.bass) * 0.3;
  level.mid  += (m - level.mid)  * 0.3;
  level.high += (h - level.high) * 0.3;
}
const lights = [
  { color: "245,185,66",  x: 0.20, y: 0.25, band: "bass", sx: 0.00031, sy: 0.00023, p: 0 },
  { color: "255,100,90",  x: 0.82, y: 0.30, band: "mid",  sx: 0.00027, sy: 0.00035, p: 2 },
  { color: "60,190,200",  x: 0.30, y: 0.82, band: "high", sx: 0.00041, sy: 0.00029, p: 4 },
  { color: "110,120,255", x: 0.78, y: 0.78, band: "bass", sx: 0.00022, sy: 0.00038, p: 1 },
  { color: "245,185,66",  x: 0.52, y: 0.50, band: "mid",  sx: 0.00035, sy: 0.00026, p: 3 },
];

function drawLights(t) {
  readLevels(t);
  const w = innerWidth, h = innerHeight, big = Math.max(w, h);
  g.clearRect(0, 0, w, h);
  g.globalCompositeOperation = "lighter";
  for (const l of lights) {
    const lv = level[l.band] * calm;
    const x = (l.x + Math.sin(t * l.sx + l.p) * 0.12) * w;
    const y = (l.y + Math.cos(t * l.sy + l.p) * 0.12) * h;
    const r = big * (0.18 + lv * 0.22);
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${l.color},${0.10 + lv * 0.38})`);
    grad.addColorStop(1, `rgba(${l.color},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
  document.documentElement.style.setProperty("--bass", (level.bass * calm).toFixed(3));
  requestAnimationFrame(drawLights);
}
requestAnimationFrame(drawLights);

//START THE PLAYER 
let savedVolume = 0.8;
try { const v = parseFloat(localStorage.getItem("player-volume")); if (!isNaN(v)) savedVolume = v; } catch (e) {}
renderPlaylist();
setVolume(savedVolume);
loadSong(0);
