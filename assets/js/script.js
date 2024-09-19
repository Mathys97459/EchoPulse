const musicLike = document.getElementById("musicLike");
const playlistsDiv = document.getElementById("playlists");
// const canvas = document.getElementById("visualizer");
// const canvasCtx = canvas.getContext("2d");
const footer = document.getElementById("footer");

let steps = 1;
let currentAudio = null; // Variable pour suivre l'audio actuellement joué
let audioCtx = null; // Contexte audio pour le visualiseur
let analyser = null; // Analyseur pour les données audio
let dataArray, bufferLength; // Variables pour les données du visualiseur
let musics;

/* LOADING PAGE */
document.addEventListener("DOMContentLoaded", () => {
  // Récupérer le fichier JSON et afficher les songs
  fetch("../lib/musics.json")
    .then((response) => response.json())
    .then((data) => {
      musics = data.musics;
      displayPlaylists(musics);
      displayPlaylistSong(musics, "rap");
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des songs:", error)
    );

  const header = document.querySelector(".header");
  const body = document.querySelector("body");

  // Appliquer la classe de centrage au chargement
  header.classList.add("header-loading");
  body.classList.add("loading");

  setTimeout(() => {
    // Retirer les classes de chargement après 1 seconde
    header.classList.remove("header-loading");
    header.classList.add("loading-complete");
    body.classList.remove("loading");
  }, 1000); // 1 seconde d'attente
});

window.onload = function () {
  setTimeout(function () {
    document.querySelector(".nav").classList.add("active");
  }, 500); // Délai avant que l'animation commence
};

function displayPlaylists() {
  // Clear previous playlists
  playlistsDiv.innerHTML = "";
  const songs = musics;
  console.log(songs);
  // Hide unrelated section
  musicLike.style.display = "none";
  playlistsDiv.style.display = "block";

  // Create a DocumentFragment to improve performance
  const fragment = document.createDocumentFragment();

  // Iterate over each playlist object using Object.entries
  Object.entries(songs).forEach(([key, playlist]) => {
    Object.entries(playlist).forEach(([genre, data]) => {
      // Create a div for the playlist
      const playlistDiv = document.createElement("div");
      playlistDiv.className = "playlist-card";

      // Create a title for the playlist
      const playlistLabel = document.createElement("h3");
      const button = document.createElement("button");
      button.innerText = data.label; // Use the label from your data
      button.value = genre;
      playlistLabel.className = "playlist-label";

      // Add an event listener to the button
      button.addEventListener("click", () =>
        displayPlaylistSong(songs, button.value)
      );

      // Append elements to the div
      playlistLabel.appendChild(button);
      playlistDiv.appendChild(playlistLabel);

      // Append the playlistDiv to the fragment
      fragment.appendChild(playlistDiv);
    });
  });

  // Append all playlist cards to the playlists container at once
  playlistsDiv.appendChild(fragment);
  displayPlaylistSong(songs, "rap");
}

/* DISPLAY musics */
function displayPlaylistSong(songs, genre) {
  musicLike.innerHTML = "";
  const playlists = musics;
  musicLike.style.display = "block";
  Object.entries(playlists).forEach(([key, playlist]) => {
    Object.entries(playlist).forEach(([playlistGenre, playlist]) => {
      if (playlistGenre == genre) {
        if (playlist.songs.length == 0) {
          musicLike.innerHTML = "Aucune musique dans cette playlist.";
        }
        playlist.songs.forEach((song) => {
          // Création de l'élément pour chaque carte de song
          const musicCard = document.createElement("div");
          musicCard.classList.add("music-card");
          musicCard.classList.add("music-" + song.id);

          // Ajout de l'image de l'album
          const img = document.createElement("img");
          img.src = song.pathImg;
          img.alt = `Pochette de l'album ${song.album}`;
          musicCard.appendChild(img);

          // Ajout des informations de la song
          const infoDiv = document.createElement("div");
          infoDiv.classList.add("music-info");
          infoDiv.innerHTML = `
        <h3>${song.title}</h3>
        <p>${song.author}</p>
        `;
          musicCard.appendChild(infoDiv);

          // Ajout de la frequence
          const freqDiv = document.createElement("div");
          freqDiv.classList.add("banner-stats");
          freqDiv.innerHTML = `
                        <div class="vizualisator">
            <canvas class="canvasVizualisator" id="visualizer-${song.id}"></canvas>
          </div>`;
          musicCard.appendChild(freqDiv);

          // Ajout de l'audio
          const audio = document.createElement("audio");
          audio.id = `audio-${song.id}`;
          audio.src = song.pathMp3;
          audio.controls = false;
          audio.style.display = "none"; // Cacher les éléments audio
          musicCard.appendChild(audio);

          musicLike.appendChild(musicCard);
          // Ajouter l'événement de clic au bouton de lecture
          musicCard.addEventListener("click", () =>
            afficherBanniere(playlist, song)
          );

          // Ajout de l'événement 'ended'
          audio.addEventListener("ended", () => {
            const nextMusiqueId = parseInt(song.id) + 1;
            const nextAudio = document.getElementById(`audio-${nextMusiqueId}`);
            // Vérifier si l'audio suivant existe
            if (nextAudio) {
              playState(nextMusiqueId);
            } else {
              playState(0);
            }
          });
        });
      }
    });
  });
}

/* DISPLAY musics */
function displaySongs() {
  musicLike.innerHTML = "";
  const playlists = musics;
  playlistsDiv.style.display = "none";
  musicLike.style.display = "block";
  Object.entries(playlists).forEach(([key, playlist]) => {
    Object.entries(playlist).forEach(([genre]) => {
      playlist[genre].songs.forEach((song) => {
        // Création de l'élément pour chaque carte de song
        const musicCard = document.createElement("div");
        musicCard.classList.add("music-card");
        musicCard.classList.add("music-" + song.id);

        // Ajout de l'image de l'album
        const img = document.createElement("img");
        img.src = song.pathImg;
        img.alt = `Pochette de l'album ${song.album}`;
        musicCard.appendChild(img);

        // Ajout des informations de la song
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("music-info");
        infoDiv.innerHTML = `
        <h3>${song.title}</h3>
        <p>${song.author}</p>
        `;
        musicCard.appendChild(infoDiv);

        // Ajout de l'audio
        const audio = document.createElement("audio");
        audio.id = `audio-${song.id}`;
        audio.src = song.pathMp3;
        audio.controls = false;
        audio.style.display = "none"; // Cacher les éléments audio
        musicCard.appendChild(audio);

        musicLike.appendChild(musicCard);
        // Ajouter l'événement de clic au bouton de lecture
        musicCard.addEventListener("click", () =>
          afficherBanniere(playlist, song)
        );

        // Ajout de l'événement 'ended'
        audio.addEventListener("ended", () => {
          const nextMusiqueId = parseInt(song.id) + 1;
          const nextAudio = document.getElementById(`audio-${nextMusiqueId}`);
          // Vérifier si l'audio suivant existe
          if (nextAudio) {
            playState(nextMusiqueId);
          } else {
            playState(0);
          }
        });
      });
    });
  });
}

/*CHANGER L'ETAT ET LE SVG DU BOUTON PLAY */
function playState(id) {
  const btn = document.getElementById("play-" + id);
  const audio = document.getElementById(`audio-${id}`);
  const canvas = document.getElementById(`visualizer-${id}`);

  // Mettre tous les autres sons en pause
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    const prevBtn = document.getElementById(`play-${currentAudio.id}`);
    if (prevBtn) {
      prevBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16"> <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" /> </svg>';
    }
  }

  // Initialiser un nouveau AudioContext uniquement si audio.source n'existe pas déjà
  if (!audio.source) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Créer la source seulement si elle n'existe pas
    audio.source = audioCtx.createMediaElementSource(audio);
    audio.source.connect(analyser);
    analyser.connect(audioCtx.destination);

    // Associer ces objets à l'élément audio pour pouvoir les réutiliser
    audio.analyser = analyser;
    audio.dataArray = dataArray;
    audio.bufferLength = bufferLength;
    audio.audioCtx = audioCtx;
  }

  // Si le son est en pause
  if (audio.paused) {
    audio.play();
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-pause-fill" viewBox="0 0 16 16"><path d="M5.5 3.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1zm6 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1z"/></svg>`;
    currentAudio = audio;

    //PROGRESS BAR
    audio.addEventListener("timeupdate", () => updateProgressBar(audio));

    // Appeler la fonction de visualisation avec le canvas et analyser de cette musique
    frequenciesVisualizer(
      canvas,
      audio.analyser,
      audio.dataArray,
      audio.bufferLength
    );
  } else {
    audio.pause();
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16"> <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" /> </svg>';
  }
}

function afficherBanniere(songs, song) {
  console.log(songs);
  const banner = document.getElementById("musicBanner");
  const img = document.getElementById("banner-img");
  const title = document.getElementById("banner-title");
  const author = document.getElementById("banner-author");
  const bannerBtn = document.querySelector(".banner-btn");

  banner.classList.remove("music-banner-off");
  banner.classList.add("music-banner-on");

  img.src = song.pathImg;
  img.width = "100";
  title.innerText = song.title;
  author.innerText = song.author;

  // Étape 2 : Vérifier si un bouton existe déjà
  const bannerPlay = document.querySelector(".banner-play");
  const bannerNext = document.querySelector(".banner-next");
  const bannerPrevious = document.querySelector(".banner-previous");

  if (bannerPlay) {
    // Si le bouton existe déjà, le supprimer
    bannerPlay.parentNode.removeChild(bannerPlay);
  }
  if (bannerNext) {
    // Si le bouton existe déjà, le supprimer
    bannerNext.parentNode.removeChild(bannerNext);
  }
  if (bannerPrevious) {
    // Si le bouton existe déjà, le supprimer
    bannerPrevious.parentNode.removeChild(bannerPrevious);
  }

  // Étape 3 : Créer un nouveau bouton
  const btnPlay = document.createElement("button");
  const btnNext = document.createElement("button");
  const btnPrevious = document.createElement("button");
  btnPlay.classList.add("banner-play");
  btnPlay.id = "play-" + song.id; // Définir l'ID
  btnPlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-pause-fill" viewBox="0 0 16 16"><path d="M5.5 3.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1zm6 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1z"/></svg>`;

  btnNext.classList.add("banner-next");
  btnNext.id = "next-" + song.id; // Définir l'ID
  btnNext.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" viewBox="0 0 43.25 45.39"> <path fill="#fa64b2" d="M3.89,45.39h-.89c-1.41-.29-2.3-1.16-2.68-2.52-.19-.66-.31-1.36-.31-2.04C0,28.75,0,16.66,0,4.58c0-.87.12-1.73.46-2.55C1.03.67,2.3-.08,3.74.07c1.1.11,2.02.61,2.9,1.22,8.26,5.68,16.52,11.36,24.77,17.04.44.3.87.63,1.24,1,1.4,1.43,1.91,3.1,1.18,5.02-.46,1.21-1.37,2.04-2.41,2.76-8.09,5.56-16.18,11.13-24.26,16.7-1.01.7-2.04,1.35-3.28,1.58Z"/> <path fill="#fa64b2" d="M39.53,45.39c-.41-.16-.85-.26-1.21-.5-.79-.52-1.1-1.3-1.1-2.24,0-5.8,0-11.61,0-17.41,0-7.46.03-14.92-.02-22.37-.01-1.81,1.3-2.96,2.86-2.86.13,0,.27,0,.4,0,1.79,0,2.78.97,2.78,2.76,0,13.28,0,26.55,0,39.83,0,1.54-.57,2.29-2.12,2.79h-1.6Z"/> </svg> `;

  btnPrevious.classList.add("banner-previous");
  btnPrevious.id = "prev-" + song.id; // Définir l'ID
  btnPrevious.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg " width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 43.25 45.39"><path fill="#fa64b2" d="M39.35,45.39h.89c1.41-.29,2.3-1.16,2.68-2.52.19-.66.31-1.36.31-2.04.02-12.08.01-24.16.01-36.24,0-.87-.12-1.73-.46-2.55-.57-1.36-1.84-2.11-3.28-1.96-1.1.11-2.02.61-2.9,1.22-8.26,5.68-16.52,11.36-24.77,17.04-.44.3-.87.63-1.24,1-1.4,1.43-1.91,3.1-1.18,5.02.46,1.21,1.37,2.04,2.41,2.76,8.09,5.56,16.18,11.13,24.26,16.7,1.01.7,2.04,1.35,3.28,1.58Z"/><path fill="#fa64b2" d="M3.72,45.39c.41-.16.85-.26,1.21-.5.79-.52,1.1-1.3,1.1-2.24,0-5.8,0-11.61,0-17.41,0-7.46-.03-14.92.02-22.37C6.05,1.05,4.74-.09,3.18,0c-.13,0-.27,0-.4,0C.99,0,0,.98,0,2.76,0,16.04,0,29.32,0,42.59c0,1.54.57,2.29,2.12,2.79h1.6Z"/></svg>`;

  // Ajouter le nouveau bouton à la div
  bannerBtn.appendChild(btnPrevious);
  bannerBtn.appendChild(btnPlay);
  bannerBtn.appendChild(btnNext);

  // Ajouter l'événement de clic au bouton de lecture
  btnPlay.addEventListener("click", () => {
    console.log(songs);
    playState(song.id);
  });
  btnNext.addEventListener("click", () => {
    console.log(songs[song.id]);
    if (songs.songs[song.id]) {
      afficherBanniere(songs, songs.songs[song.id + 1]);
    } else {
      afficherBanniere(songs, songs.songs[0]);
    }
  });

  // Ajouter l'événement de clic au bouton de previous
  btnPrevious.addEventListener("click", () => {
    if (songs.songs[song.id - 1]) {
      afficherBanniere(songs, songs.songs[song.id - 1]);
    } else {
      afficherBanniere(songs, songs.songs[songs.length - 1]);
    }
  });

  playState(song.id);
}

function updateProgressBar(audio) {
  const progressBar = document.querySelector(".progress-bar");

  if (audio.duration) {
    const percentage = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percentage + "%";
  }
}

// Fonction pour visualiser les données
function frequenciesVisualizer(canvas, analyser, dataArray, bufferLength) {
  const canvasCtx = canvas.getContext("2d");
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(dataArray);
  const barWidth = (canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  const midY = canvas.height / 2;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 3;
    if (!barHeight) barHeight = 3;

    const color = "#FA64B2";
    canvasCtx.fillStyle = color;

    // Dessiner vers le haut et le bas du milieu
    canvasCtx.fillRect(x, midY - barHeight / 2, barWidth, barHeight / 2);
    canvasCtx.fillRect(x, midY, barWidth, barHeight / 2);

    x += barWidth + 1;
  }

  if (currentAudio && !currentAudio.paused) {
    requestAnimationFrame(() =>
      frequenciesVisualizer(canvas, analyser, dataArray, bufferLength)
    );
  }
}
