console.log("Welcome to Spotify Clone");

// Initialize variables
let songIndex = 0;
let audioElement = new Audio("songs/0.mp3");
let masterPlay = document.getElementById("masterPlay");
let gif = document.getElementById("gif");
let masterSongName = document.getElementById("masterSongName");
let songItems = Array.from(document.getElementsByClassName("songItem"));

// let songs = [
//   { songName: "Let Me Love You - Justin Bieber", filePath: "songs/0.mp3" },
//   { songName: "Boond Boond Full Audio Song", filePath: "songs/1.mp3" },
//   { songName: "Aashiq Banaya Aapne Song_Lyrics_ Hate Story IV", filePath: "songs/2.mp3" },
//   { songName: "Pink Lips Full Audio Song _ Hate Story 2", filePath: "songs/3.mp3" },
//   { songName: "O_Rey_Chhori_Lyric@A._R._Rahman", filePath: "songs/4.mp3" },
// ];

let songs = [
  {
    songName: "Let Me Love You - Justin Bieber",
    filePath: "songs/1.mp3",
    coverPath: "covers/cover1.jpg",
  },
  {
    songName: "Boond Boond Full Audio Song",
    filePath: "songs/2.mp3",
    coverPath: "covers/cover2.jpg",
  },
  {
    songName: "Aashiq Banaya Aapne Song_Lyrics_ Hate Story IV",
    filePath: "songs/3.mp3",
    coverPath: "covers/cover3.jpg",
  },
  {
    songName: "Pink Lips Full Audio Song _ Hate Story 2",
    filePath: "songs/4.mp3",
    coverPath: "covers/cover4.jpg",
  },
  {
    songName: "O_Rey_Chhori_Lyric@A._R._Rahman",
    filePath: "songs/5.mp3",
    coverPath: "covers/cover5.jpg",
  },
];
songItems.forEach((element, i) => {
  element.getElementsByTagName("img")[0].src = songs[i].coverPath;
  element.getElementsByClassName("songName")[0].innerText = songs[i].songName;
});


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

// === PROGRESS BAR UPDATE ===
// Update progress bar as song plays
audioElement.addEventListener("timeupdate", () => {
  let progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
  myProgressBar.value = progress;
});

// Change song current time on progress bar change
myProgressBar.addEventListener("change", () => {
  audioElement.currentTime = (myProgressBar.value * audioElement.duration) / 100;
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
      songIndex = clickedIndex;
      audioElement.src = songs[songIndex].filePath;
      masterSongName.innerText = songs[songIndex].songName;
      audioElement.currentTime = 0;
      audioElement.play();
    }
  });
});

// Next button
document.getElementById("next").addEventListener("click", () => {
  if (songIndex >= songs.length - 1) {
    songIndex = 0;
  } else {
    songIndex += 1;
  }

  audioElement.src = songs[songIndex].filePath;
  masterSongName.innerText = songs[songIndex].songName;
  audioElement.currentTime = 0;
  audioElement.play();
});

// Previous button
document.getElementById("previous").addEventListener("click", () => {
  if (songIndex <= 0) {
    songIndex = 0;
  } else {
    songIndex -= 1;
  }

  audioElement.src = songs[songIndex].filePath;
  masterSongName.innerText = songs[songIndex].songName;
  audioElement.currentTime = 0;
  audioElement.play();
});
