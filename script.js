console.log("Welcome to Spotify Clone");

// Initialize variables
let songIndex = 0;
let isShuffleActive = false;
let repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
let audioElement = new Audio("songs/0.mp3");
let masterPlay = document.getElementById("masterPlay");
let gif = document.getElementById("gif");
let masterSongName = document.getElementById("masterSongName");
let songItems = Array.from(document.getElementsByClassName("songItem"));

// New elements
let volumeControl = document.getElementById("volumeControl");
let volumeIcon = document.getElementById("volumeIcon");
let shuffleBtn = document.getElementById("shuffle");
let repeatBtn = document.getElementById("repeat");
let likeBtn = document.getElementById("likeBtn");
let currentTimeDisplay = document.getElementById("currentTime");
let durationDisplay = document.getElementById("duration");

// Initialize volume
audioElement.volume = 0.7;

// Audio error handling
audioElement.addEventListener("error", (e) => {
  console.error("Audio loading error:", e);
  let errorMsg = "Error loading audio file";

  switch (audioElement.error?.code) {
    case 1: errorMsg = "Audio loading aborted"; break;
    case 2: errorMsg = "Network error while loading audio"; break;
    case 3: errorMsg = "Audio decoding failed"; break;
    case 4: errorMsg = "Audio format not supported"; break;
  }

  console.warn(errorMsg);
  // Optionally show user notification
  alert(`Unable to play song: ${errorMsg}`);
});

// let songs = [
//   { songName: "Let Me Love You - Justin Bieber", filePath: "songs/0.mp3" },
//   { songName: "Boond Boond Full Audio Song", filePath: "songs/1.mp3" },
//   { songName: "Aashiq Banaya Aapne Song_Lyrics_ Hate Story IV", filePath: "songs/2.mp3" },
//   { songName: "Pink Lips Full Audio Song _ Hate Story 2", filePath: "songs/3.mp3" },
//   { songName: "O_Rey_Chhori", filePath: "songs/4.mp3" },
// ];

let songs = [
  {
    songName: "Let Me Love You - Justin Bieber",
    filePath: "songs/0.mp3",
    coverPath: "covers/cover1.jpg",
  },
  {
    songName: "Boond Boond Full Audio Song",
    filePath: "songs/1.mp3",
    coverPath: "covers/cover2.jpg",
  },
  {
    songName: "Aashiq Banaya Aapne Song_Lyrics_ Hate Story IV",
    filePath: "songs/2.mp3",
    coverPath: "covers/cover3.jpg",
  },
  {
    songName: "Pink Lips Full Audio Song _ Hate Story 2",
    filePath: "songs/3.mp3",
    coverPath: "covers/cover4.jpg",
  },
  {
    songName: "O_Rey_Chhori_Lyric",
    filePath: "songs/4.mp3",
    coverPath: "covers/cover5.jpg",
  },
];

// Load liked songs from localStorage
let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];

// Format time display (mm:ss)
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  let mins = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Update song duration display
function updateDurationDisplay() {
  if (audioElement.duration) {
    durationDisplay.innerText = formatTime(audioElement.duration);
  }
}

// Listen for metadata to get duration
audioElement.addEventListener("loadedmetadata", updateDurationDisplay);
audioElement.addEventListener("loadstart", () => {
  durationDisplay.innerText = "0:00";
});

// 0. Centralized UI Sync
function updateAllUI() {
  if (!songs[songIndex]) return;
  const currentSong = songs[songIndex];
  console.log(`[UI Sync] Updating UI for: ${currentSong.songName} (Index: ${songIndex})`);

  // 1. Master Song Name
  if (masterSongName) masterSongName.innerText = currentSong.songName;

  // 2. Visualizer Sync
  const vizCover = document.getElementById("visualizerCover");
  const vizSong = document.getElementById("visualizerSongName");
  const vizArtist = document.getElementById("visualizerArtistName");

  if (vizCover) {
    vizCover.src = currentSong.coverPath;
    vizCover.onerror = () => {
      console.error(`[UI Sync] Failed to load visualizer cover: ${currentSong.coverPath}`);
      vizCover.src = "covers/cover1.jpg"; // Fallback
    };
  }

  let title = currentSong.songName;
  let artist = "NCS Release";
  if (title.includes(" - ")) {
    [title, artist] = title.split(" - ").map(s => s.trim());
  } else if (title.includes("_")) {
    title = title.split("_")[0].trim();
  }

  if (vizSong) vizSong.innerText = title;
  if (vizArtist) vizArtist.innerText = artist;

  // 3. Mini Player Sync
  const miniPlayer = document.getElementById("miniPlayer");
  const miniCover = document.getElementById("miniPlayerCover");
  const miniTitle = document.getElementById("miniPlayerTitle");
  const miniArtist = document.getElementById("miniPlayerArtist");

  if (miniPlayer) {
    if (miniCover) miniCover.src = currentSong.coverPath;
    if (miniTitle) miniTitle.innerText = currentSong.songName;
    if (miniArtist) miniArtist.innerText = "NCS Release";
  }

  // 4. Highlight List
  highlightPlayingSong(songIndex);

  // 5. Update Lyrics
  if (typeof displayLyrics === 'function') displayLyrics();
}

// Helper function to safely play a song
function playSong(index) {
  songIndex = index;
  console.log("PlaySong called for index:", index);

  audioElement.src = songs[songIndex].filePath;
  audioElement.currentTime = 0;

  // Sync all UI components
  updateAllUI();

  // Ensure audio element is ready
  audioElement.load();

  const startPlay = () => {
    let playPromise = audioElement.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("✓ Song playing: " + songs[songIndex].songName);
          if (gif) gif.style.opacity = 1;

          // Initialize visualizer if not already done
          if (!analyser) initVisualizer();
          if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
          }
        })
        .catch(error => {
          console.error("Play failed:", error);
          // Auto-retry once
          setTimeout(() => {
            audioElement.play().catch(e => console.error("Retry failed:", e));
          }, 500);
        });
    }
  };

  // Play immediately if browser allows, otherwise wait for load
  audioElement.oncanplay = () => {
    startPlay();
    audioElement.oncanplay = null; // Prevent multiple triggers
  };
}
songItems.forEach((element, i) => {
  element.getElementsByTagName("img")[0].src = songs[i].coverPath;
  element.getElementsByClassName("songName")[0].innerText = songs[i].songName;
});

// Initial visualizer setup
const initialVizCover = document.getElementById("visualizerCover");
const initialVizSong = document.getElementById("visualizerSongName");
if (initialVizCover) initialVizCover.src = songs[songIndex].coverPath;
if (initialVizSong) initialVizSong.innerText = songs[songIndex].songName;


// Set song names in list
songItems.forEach((element, i) => {
  element.getElementsByClassName("songName")[0].innerText = songs[i].songName;
});

// Make all play icons default
function makeAllPlays() {
  Array.from(document.getElementsByClassName("songItemPlay")).forEach((el) => {
    el.classList.remove("fa-circle-pause");
    el.classList.add("fa-circle-play");
  });

  // remove highlight
  document.querySelectorAll(".songItem").forEach((item) => {
    item.classList.remove("activeSong");
  });
}

// Highlight the currently playing song
function highlightPlayingSong(index) {
  const songItems = document.getElementsByClassName("songItem");
  Array.from(songItems).forEach((item, i) => {
    item.classList.toggle("activeSong", i === index);
  });
}

// Master play/pause
masterPlay.addEventListener("click", () => {
  if (audioElement.paused || audioElement.currentTime <= 0) {
    audioElement.play();
  } else {
    audioElement.pause();
  }
});

// Update progress bar and time display as song plays
audioElement.addEventListener("timeupdate", () => {
  let progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
  myProgressBar.value = progress;
  currentTimeDisplay.innerText = formatTime(audioElement.currentTime);
});

// Volume control
volumeControl.addEventListener("input", (e) => {
  let volumePercent = e.target.value / 100;
  audioElement.volume = volumePercent;

  // Update icon based on volume
  if (volumePercent === 0) {
    volumeIcon.classList.remove("fa-volume-low", "fa-volume-high");
    volumeIcon.classList.add("fa-volume-xmark");
  } else if (volumePercent < 0.5) {
    volumeIcon.classList.remove("fa-volume-high", "fa-volume-xmark");
    volumeIcon.classList.add("fa-volume-low");
  } else {
    volumeIcon.classList.remove("fa-volume-low", "fa-volume-xmark");
    volumeIcon.classList.add("fa-volume-high");
  }
});

// Shuffle functionality
shuffleBtn.addEventListener("click", () => {
  isShuffleActive = !isShuffleActive;
  shuffleBtn.classList.toggle("active");
});

// Repeat functionality
const repeatContainer = document.querySelector(".repeat-container");
const repeatBadge = document.getElementById("repeatBadge");
const repeatTooltip = document.querySelector(".repeat-tooltip");

// Update repeat display
const updateRepeatDisplay = () => {
  if (repeatMode === 0) {
    // OFF state
    repeatContainer.classList.remove("repeat-all", "repeat-one");
    repeatBadge.textContent = "OFF";
    repeatBadge.style.opacity = "0.6";
    repeatTooltip.textContent = "Repeat: OFF\nClick to repeat all songs";
    repeatContainer.setAttribute("aria-pressed", "false");
    repeatContainer.title = "Repeat OFF - Click to repeat all (R)";
  } else if (repeatMode === 1) {
    // ALL state
    repeatContainer.classList.add("repeat-all");
    repeatContainer.classList.remove("repeat-one");
    repeatBadge.textContent = "ALL";
    repeatBadge.style.opacity = "1";
    repeatTooltip.textContent = "Repeat: ALL songs\nClick to repeat one";
    repeatContainer.setAttribute("aria-pressed", "mixed");
    repeatContainer.title = "Repeat ALL - Click to repeat one (R)";
  } else if (repeatMode === 2) {
    // ONE state
    repeatContainer.classList.add("repeat-one");
    repeatContainer.classList.remove("repeat-all");
    repeatBadge.textContent = "ONE";
    repeatBadge.style.opacity = "1";
    repeatTooltip.textContent = "Repeat: ONE song\nClick to turn off repeat";
    repeatContainer.setAttribute("aria-pressed", "true");
    repeatContainer.title = "Repeat ONE - Click to turn off (R)";
  }
};

// Click handler for repeat container
repeatContainer.addEventListener("click", () => {
  repeatMode = (repeatMode + 1) % 3;
  updateRepeatDisplay();
  console.log("Repeat mode changed to:", ["OFF", "ALL", "ONE"][repeatMode]);
});

// Keyboard support for repeat container
repeatContainer.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    repeatContainer.click();
  }
});

// Initialize repeat display on load
updateRepeatDisplay();

// Like functionality
likeBtn.addEventListener("click", () => {
  const songId = songs[songIndex].songName;
  if (likedSongs.includes(songId)) {
    likedSongs = likedSongs.filter(s => s !== songId);
    likeBtn.classList.remove("liked");
  } else {
    likedSongs.push(songId);
    likeBtn.classList.add("liked");
  }
  localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.target === volumeControl || e.target === myProgressBar) return; // Don't interfere with slider input

  switch (e.code) {
    case "Space":
      e.preventDefault();
      masterPlay.click();
      break;
    case "ArrowRight":
      document.getElementById("next").click();
      break;
    case "ArrowLeft":
      document.getElementById("previous").click();
      break;
    case "KeyS":
      shuffleBtn.click();
      break;
    case "KeyR":
      repeatContainer.click();
      break;
    case "KeyL":
      likeBtn.click();
      break;
  }
});

// Handle audioElement play/pause → update UI
audioElement.onplay = () => {
  masterPlay.classList.remove("fa-circle-play");
  masterPlay.classList.add("fa-circle-pause");
  gif.style.opacity = 1;

  makeAllPlays();
  const currentBtn = document.getElementById(songIndex.toString());
  currentBtn.classList.remove("fa-circle-play");
  currentBtn.classList.add("fa-circle-pause");

  highlightPlayingSong(songIndex);
};

audioElement.onpause = () => {
  masterPlay.classList.add("fa-circle-play");
  masterPlay.classList.remove("fa-circle-pause");
  gif.style.opacity = 0;

  const currentBtn = document.getElementById(songIndex.toString());
  currentBtn.classList.add("fa-circle-play");
  currentBtn.classList.remove("fa-circle-pause");
};

// Play individual song
Array.from(document.getElementsByClassName("songItemPlay")).forEach((element) => {
  element.addEventListener("click", (e) => {
    const clickedIndex = parseInt(e.target.id);

    if (songIndex === clickedIndex && !audioElement.paused) {
      audioElement.pause();
    } else {
      playSong(clickedIndex);
    }
  });
});

// Next button - auto-play enabled
document.getElementById("next").addEventListener("click", () => {
  if (isShuffleActive) {
    let randomIndex = Math.floor(Math.random() * songs.length);
    while (randomIndex === songIndex && songs.length > 1) {
      randomIndex = Math.floor(Math.random() * songs.length);
    }
    songIndex = randomIndex;
  } else {
    if (songIndex >= songs.length - 1) {
      songIndex = 0; // Auto-loop to first song
    } else {
      songIndex += 1;
    }
  }

  playSong(songIndex);
});

// Previous button - auto-play enabled
document.getElementById("previous").addEventListener("click", () => {
  if (songIndex <= 0) {
    songIndex = songs.length - 1; // Go to last song when on first
  } else {
    songIndex -= 1;
  }

  playSong(songIndex);
});

// Handle song end - implement repeat and shuffle with auto-loop
audioElement.addEventListener("ended", () => {
  if (repeatMode === 2) {
    // Repeat one song
    playSong(songIndex);
  } else if (isShuffleActive) {
    // Shuffle mode - auto-play next random song
    let randomIndex = Math.floor(Math.random() * songs.length);
    while (randomIndex === songIndex && songs.length > 1) {
      randomIndex = Math.floor(Math.random() * songs.length);
    }
    playSong(randomIndex);
  } else {
    // Normal mode - auto-loop to first song or next song
    if (songIndex >= songs.length - 1) {
      // Last song - auto-loop to first song
      playSong(0);
    } else {
      // Not last song - play next song
      playSong(songIndex + 1);
    }
  }
});

// Search functionality
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const allSongItems = document.querySelectorAll(".songItem");

  allSongItems.forEach((item) => {
    const songName = item.querySelector(".songName").innerText.toLowerCase();
    if (songName.includes(searchTerm)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
});

// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");
const isDarkMode = localStorage.getItem("darkMode") === "true";

// Set initial dark mode state
if (isDarkMode) {
  document.body.classList.add("dark-mode");
  darkModeToggle.classList.add("fa-sun");
  darkModeToggle.classList.remove("fa-moon");
}

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);

  if (isDark) {
    darkModeToggle.classList.add("fa-sun");
    darkModeToggle.classList.remove("fa-moon");
  } else {
    darkModeToggle.classList.add("fa-moon");
    darkModeToggle.classList.remove("fa-sun");
  }
});

// Keyboard shortcut for dark mode
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyD" && e.target === document.body) {
    darkModeToggle.click();
  }
});

// Handle keyboard shortcuts for icon buttons
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.hasAttribute("role")) {
    if (e.target.getAttribute("role") === "button") {
      e.target.click();
    }
  }
});

// Help Modal for main player
const helpModal = document.getElementById("helpModal");
const modalClose = document.querySelector(".modal-close");

// Open modal with ? key
document.addEventListener("keydown", (e) => {
  if ((e.key === "?" || (e.shiftKey && e.key === "/")) && helpModal) {
    e.preventDefault();
    helpModal.classList.add("show");
  }

  // Close modal with Escape key
  if (e.key === "Escape" && helpModal) {
    helpModal.classList.remove("show");
  }
});

// Close button
if (modalClose) {
  modalClose.addEventListener("click", () => {
    helpModal.classList.remove("show");
  });
}

// ===== NEW FEATURES =====

// 1. PLAY HISTORY TRACKING
let playHistory = JSON.parse(localStorage.getItem("playHistory")) || [];
let playStats = JSON.parse(localStorage.getItem("playStats")) || {
  totalPlays: 0,
  totalTimeSpent: 0,
  lastPlayDate: new Date().toDateString(),
  songPlayCount: {}
};

function addToHistory(songName) {
  playHistory.unshift({
    songName: songName,
    timestamp: new Date(),
    time: new Date().toLocaleTimeString()
  });

  if (playHistory.length > 50) {
    playHistory.pop();
  }

  localStorage.setItem("playHistory", JSON.stringify(playHistory));
  updateHistoryDisplay();
}

// 2. SONG QUEUE MANAGEMENT
let songQueue = [];
function updateQueue() {
  songQueue = songs.slice(songIndex + 1);
  updateQueueDisplay();
}

function updateQueueDisplay() {
  const queueList = document.getElementById("queueList");
  if (!queueList) return;

  queueList.innerHTML = "";
  if (songQueue.length === 0) {
    queueList.innerHTML = '<p style="opacity: 0.6;">Queue is empty</p>';
    return;
  }

  songQueue.forEach((song, index) => {
    const queueItem = document.createElement("div");
    queueItem.className = "queue-item";
    queueItem.innerHTML = `
      <div class="queue-item-title">${index + 1}. ${song.songName}</div>
      <div class="queue-item-artist">Queue position</div>
    `;
    queueItem.addEventListener("click", () => {
      playSong(songIndex + index + 1);
    });
    queueList.appendChild(queueItem);
  });
}

// 3. PLAY HISTORY DISPLAY
function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  historyList.innerHTML = "";
  if (playHistory.length === 0) {
    historyList.innerHTML = '<p style="opacity: 0.6;">No history yet</p>';
    return;
  }

  playHistory.forEach((item, index) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
      <div class="history-item-title">${item.songName}</div>
      <div class="history-item-time">${item.time}</div>
    `;
    historyItem.addEventListener("click", () => {
      const songToPlay = songs.find(s => s.songName === item.songName);
      if (songToPlay) {
        playSong(songs.indexOf(songToPlay));
      }
    });
    historyList.appendChild(historyItem);
  });
}

// 4. LYRICS DISPLAY
const mockLyrics = {
  "Let me Love You": "Let me love you\nI'll make a way\nThroughout the darkness\nI will guide you\nHold on, I got you...",
  "Boond Boond": "Boond boond, pyaar teri\nBoond boond, jaan teri\nMay naz na kar...",
  "Aashiq Banaya": "Aashiq banaya aapne\nMujhe aashiq banaya\nDil kaa rakhwala\nAp hi mere...",
  "Pink Lips": "Pink lips, I love you\nPink lips are dangerous\nLike a perfect kiss...",
  "O Rey Chhori": "O rey chhori, o rey chhori\nTu dhoom machaa gai\nDil ko lut liya..."
};

function displayLyrics() {
  const lyricsList = document.getElementById("lyricsList");
  const lyricsSongName = document.getElementById("lyricsSongName");

  if (!lyricsList) return;

  const currentSong = songs[songIndex].songName;
  lyricsSongName.innerText = currentSong;

  const lyrics = mockLyrics[currentSong] || "No lyrics available for this song";

  if (lyrics === "No lyrics available for this song") {
    lyricsList.innerHTML = '<p class="no-lyrics">No lyrics available for this song</p>';
  } else {
    const lyricLines = lyrics.split("\n");
    lyricsList.innerHTML = lyricLines
      .map(line => `<div class="lyrics-line">${line}</div>`)
      .join("");
  }
}

// 5. STATISTICS DASHBOARD
function updateStats() {
  playStats.totalPlays++;

  const currentSong = songs[songIndex].songName;
  playStats.songPlayCount[currentSong] = (playStats.songPlayCount[currentSong] || 0) + 1;

  localStorage.setItem("playStats", JSON.stringify(playStats));
  updateStatsDisplay();
}

function updateStatsDisplay() {
  const totalPlaysEl = document.getElementById("totalPlays");
  const totalLikedEl = document.getElementById("totalLiked");
  const totalTimeEl = document.getElementById("totalTime");
  const topSongsEl = document.getElementById("topSongs");

  if (totalPlaysEl) totalPlaysEl.innerText = playStats.totalPlays;
  if (totalLikedEl) totalLikedEl.innerText = likedSongs.length;

  if (totalTimeEl) {
    const hours = Math.floor(playStats.totalTimeSpent / 3600);
    const minutes = Math.floor((playStats.totalTimeSpent % 3600) / 60);
    totalTimeEl.innerText = `${hours}h ${minutes}m`;
  }

  if (topSongsEl) {
    const topSongs = Object.entries(playStats.songPlayCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topSongsEl.innerHTML = topSongs
      .map((song, idx) => `
        <div class="top-song-item">
          <span class="top-song-rank">#${idx + 1}</span>
          <span>${song[0]}</span>
          <span>${song[1]} plays</span>
        </div>
      `)
      .join("");
  }
}

// 6. AUDIO VISUALIZER
let audioContext, analyser, dataArray, canvas, canvasCtx;

function initVisualizer() {
  const canvasEl = document.getElementById("audioVisualizer");
  if (!canvasEl) return;

  canvas = canvasEl;
  canvasCtx = canvas.getContext("2d");

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!analyser) {
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaElementAudioSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  drawVisualizer();
}

function drawVisualizer() {
  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.fillStyle = "rgba(29, 185, 84, 0.8)";

  const barWidth = canvas.width / bufferLength * 2.5;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;

    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
    x += barWidth;
  }

  requestAnimationFrame(drawVisualizer);
}

// 7. MINI PLAYER
const miniPlayer = document.getElementById("miniPlayer");
const miniPlayBtn = document.getElementById("miniPlayBtn");
const miniCloseBtn = document.getElementById("miniCloseBtn");

if (miniPlayBtn) {
  miniPlayBtn.addEventListener("click", () => {
    if (audioElement.paused) {
      audioElement.play();
      miniPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      audioElement.pause();
      miniPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  });
}

if (miniCloseBtn) {
  miniCloseBtn.addEventListener("click", () => {
    miniPlayer.style.display = "none";
  });
}

// Redundant functions removed in favor of updateAllUI()

// 8. SHARE FUNCTIONALITY
const shareBtn = document.getElementById("shareBtn");
const shareModal = document.getElementById("shareModal");
const shareBtns = document.querySelectorAll(".share-btn");
const copySongLinkBtn = document.getElementById("copySongLink");

if (shareBtn && shareModal) {
  shareBtn.addEventListener("click", () => {
    shareModal.style.display = "flex";
    document.getElementById("shareLink").value = `${window.location.href}?song=${songIndex}`;
  });
}

if (shareBtns) {
  shareBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const shareType = btn.dataset.share;
      const songName = songs[songIndex].songName;
      const shareUrl = `${window.location.href}?song=${songIndex}`;

      switch (shareType) {
        case "twitter":
          window.open(`https://twitter.com/intent/tweet?text=Check out ${songName}! &url=${shareUrl}`, "_blank");
          break;
        case "facebook":
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank");
          break;
        case "whatsapp":
          window.open(`https://wa.me/?text=Check out ${songName}! ${shareUrl}`, "_blank");
          break;
        case "copy":
          navigator.clipboard.writeText(shareUrl);
          alert("Link copied to clipboard!");
          break;
      }
    });
  });
}

if (copySongLinkBtn) {
  copySongLinkBtn.addEventListener("click", () => {
    const shareLink = document.getElementById("shareLink");
    navigator.clipboard.writeText(shareLink.value);
    alert("Link copied!");
  });
}

// 9. PLAYLIST MANAGEMENT
let playlists = JSON.parse(localStorage.getItem("playlists")) || [];

const newPlaylistBtn = document.getElementById("newPlaylistBtn");
const playlistModal = document.getElementById("playlistModal");
const playlistForm = document.getElementById("playlistForm");
const addToPlaylistBtn = document.getElementById("addToPlaylistBtn");

if (newPlaylistBtn && playlistModal) {
  newPlaylistBtn.addEventListener("click", () => {
    playlistModal.style.display = "flex";
  });
}

if (playlistForm) {
  playlistForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const playlistName = document.getElementById("playlistName").value;
    const playlistDesc = document.getElementById("playlistDesc").value;

    playlists.push({
      id: Date.now(),
      name: playlistName,
      description: playlistDesc,
      songs: []
    });

    localStorage.setItem("playlists", JSON.stringify(playlists));
    updatePlaylistsDisplay();
    playlistForm.reset();
    playlistModal.style.display = "none";
  });
}

function updatePlaylistsDisplay() {
  const playlistsList = document.getElementById("playlistsList");
  if (!playlistsList) return;

  playlistsList.innerHTML = "";
  playlists.forEach(playlist => {
    const playlistItem = document.createElement("div");
    playlistItem.className = "playlist-item";
    playlistItem.innerHTML = `
      <div class="playlist-item-title">${playlist.name}</div>
      <div class="queue-item-artist">${playlist.songs.length} songs</div>
    `;
    playlistItem.addEventListener("click", () => {
      alert(`Opened playlist: ${playlist.name}`);
    });
    playlistsList.appendChild(playlistItem);
  });
}

if (addToPlaylistBtn) {
  addToPlaylistBtn.addEventListener("click", () => {
    if (playlists.length === 0) {
      alert("Create a playlist first!");
      return;
    }

    const playlistName = prompt("Select a playlist (enter name):");
    const playlist = playlists.find(p => p.name === playlistName);

    if (playlist) {
      playlist.songs.push(songs[songIndex].songName);
      localStorage.setItem("playlists", JSON.stringify(playlists));
      alert("Song added to playlist!");
    }
  });
}

// 10. VIEW TOGGLE (List, Grid, Artist)
const viewBtns = document.querySelectorAll(".view-btn");
viewBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    viewBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.dataset.view;
    const songItemContainer = document.querySelector(".songItemContainer");

    if (view === "grid") {
      songItemContainer.style.display = "grid";
      songItemContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
    } else if (view === "list") {
      songItemContainer.style.display = "block";
    } else if (view === "artist") {
      alert("Artist view coming soon!");
    }
  });
});

// 11. EQUALIZER
const equalizerBtn = document.getElementById("equalizerBtn");
const equalizerPanel = document.getElementById("equalizerPanel");
const eqCloseBtn = document.getElementById("eqClose");
const eqPresets = document.querySelectorAll(".eq-preset");
const eqControls = document.querySelectorAll(".eq-control");

if (equalizerBtn && equalizerPanel) {
  equalizerBtn.addEventListener("click", () => {
    equalizerPanel.style.display = equalizerPanel.style.display === "none" ? "block" : "none";
  });
}

if (eqCloseBtn) {
  eqCloseBtn.addEventListener("click", () => {
    equalizerPanel.style.display = "none";
  });
}

eqPresets.forEach(preset => {
  preset.addEventListener("click", () => {
    eqPresets.forEach(p => p.classList.remove("active"));
    preset.classList.add("active");

    // Apply preset adjustments
    const presetName = preset.dataset.preset;
    let values = {
      60: 0,
      250: 0,
      1000: 0,
      4000: 0,
      12000: 0
    };

    if (presetName === "bass") {
      values = { 60: 10, 250: 5, 1000: 0, 4000: -5, 12000: -10 };
    } else if (presetName === "treble") {
      values = { 60: -5, 250: -3, 1000: 0, 4000: 5, 12000: 10 };
    } else if (presetName === "vocal") {
      values = { 60: -5, 250: 2, 1000: 8, 4000: 3, 12000: 0 };
    }

    eqControls.forEach(control => {
      const freq = control.dataset.freq;
      control.value = values[freq];
    });
  });
});

// 12. SIDEBAR TABS
const sidebarTabs = document.querySelectorAll(".sidebar-tab");
const sidebarContents = document.querySelectorAll(".sidebar-content");

sidebarTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    sidebarTabs.forEach(t => t.classList.remove("active"));
    sidebarContents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    document.querySelector(`[data-content="${tabName}"]`)?.classList.add("active");
  });
});

// 13. SIDEBAR TOGGLE (Mobile)
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (sidebarToggle && sidebar && sidebarOverlay) {
  const toggleIcon = sidebarToggle.querySelector("i");

  function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    sidebarToggle.classList.remove("active");
    if (toggleIcon) {
      toggleIcon.classList.remove("fa-xmark");
      toggleIcon.classList.add("fa-bars");
    }
  }

  // Toggle sidebar on button click
  sidebarToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    sidebarToggle.classList.toggle("active");

    if (toggleIcon) {
      if (isOpen) {
        toggleIcon.classList.remove("fa-bars");
        toggleIcon.classList.add("fa-xmark");
      } else {
        toggleIcon.classList.remove("fa-xmark");
        toggleIcon.classList.add("fa-bars");
      }
    }
  });

  // Global click listener to close sidebar when clicking outside
  window.addEventListener("click", (e) => {
    if (sidebar.classList.contains("active")) {
      // If click is outside sidebar AND outside the toggle button, close it
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // Close sidebar on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeSidebar();
    }
  });
  console.log("Sidebar toggle initialized successfully");
} else {
  console.warn("Sidebar elements not found:", { sidebarToggle, sidebar, sidebarOverlay });
}

// 14. CLEAR HISTORY
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear all play history?")) {
      playHistory = [];
      localStorage.setItem("playHistory", JSON.stringify(playHistory));
      updateHistoryDisplay();
    }
  });
}

// 15. RECENTLY ADDED & RECOMMENDATIONS
function populateRecentlyAdded() {
  const carousel = document.getElementById("recentlyAddedCarousel");
  if (!carousel) return;

  carousel.innerHTML = songs
    .map(song => `
      <div class="carousel-card" onclick="playSong(${songs.indexOf(song)})">
        <img src="${song.coverPath || 'covers/cover1.jpg'}" alt="${song.songName}" />
        <h4>${song.songName}</h4>
        <p>NCS</p>
      </div>
    `)
    .join("");
}

function populateRecommendations() {
  const carousel = document.getElementById("recommendationsCarousel");
  if (!carousel) return;

  // Create shuffle of songs for recommendations
  const shuffled = [...songs].sort(() => Math.random() - 0.5);
  carousel.innerHTML = shuffled
    .map(song => `
      <div class="carousel-card" onclick="playSong(${songs.indexOf(song)})">
        <img src="${song.coverPath || 'covers/cover1.jpg'}" alt="${song.songName}" />
        <h4>${song.songName}</h4>
        <p>NCS</p>
      </div>
    `)
    .join("");
}

// ===== INITIALIZE NEW FEATURES =====
window.addEventListener("load", () => {
  updateQueueDisplay();
  updateHistoryDisplay();
  updateStatsDisplay();
  updatePlaylistsDisplay();
  populateRecentlyAdded();
  populateRecommendations();
  displayLyrics();
  updateMiniPlayer();
  initVisualizer();

  // Update when song changes
  audioElement.addEventListener("timeupdate", () => {
    playStats.totalTimeSpent += 0.1;
  });

  audioElement.addEventListener("play", () => {
    updateStats();
    updateQueue();
    updateAllUI();
    if (analyser) {
      audioContext.resume();
    }
  });
});

// Close modals when clicking outside
[shareModal, playlistModal].forEach(modal => {
  if (modal) {
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  }
});

// Close modal when clicking outside
if (helpModal) {
  window.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove("show");
    }
  });
}
