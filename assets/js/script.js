const musicLike = document.getElementById("musicLike");
const playlistsDiv = document.getElementById("playlists");
const footer = document.getElementById("footer");
const playlistMusic = document.getElementById("playlistMusic");
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
      displayPlaylistSongs("rap");
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des songs:", error)
    );
});

function displayPlaylists() {
  // Clear previous playlists
  playlistsDiv.innerHTML = "";
  const songs = musics;
  musicLike.style.display = "none";
  playlistsDiv.style.display = "block";
  playlistMusic.style.display = "block";
  console.log(songs);
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
      button.id = genre;
      button.value = genre;
      playlistLabel.className = "playlist-label";

      // Add an event listener to the button
      button.addEventListener("click", () => displayPlaylistSongs(genre));

      // Append elements to the div
      playlistLabel.appendChild(button);
      playlistDiv.appendChild(playlistLabel);

      // Append the playlistDiv to the fragment
      fragment.appendChild(playlistDiv);
    });
  });

  // Append all playlist cards to the playlists container at once
  playlistsDiv.appendChild(fragment);
}

/* DISPLAY musics */
function displayPlaylistSongs(genre) {
  const songs = musics[0][genre];
  if (musicLike.innerHTML == "") {
    if (songs.length == 0) {
      playlistMusic.innerHTML = "Aucune musique dans cette playlist.";
    } else {
      console.log(songs);
      songs.songs.forEach((song) => {
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
             <canvas class="visualizer-${song.id}"></canvas>
           </div>`;
        musicCard.appendChild(freqDiv);

        // Ajout de l'audio
        const audio = document.createElement("audio");
        audio.id = `audio-${song.id}`;
        audio.src = song.pathMp3;
        audio.controls = false;
        audio.style.display = "none"; // Cacher les éléments audio
        musicCard.appendChild(audio);

        playlistMusic.appendChild(musicCard);
        // Ajouter l'événement de clic au bouton de lecture
        musicCard.addEventListener("click", () =>
          afficherBanniere(songs, song)
        );

        // Ajout du bouton favori
        const favoriteButton = document.createElement("button");
        favoriteButton.classList.add("favorite-button");
        if (song.like) {
          favoriteButton.classList.add("liked");
        }
        favoriteButton.innerHTML = `<span class="material-symbols-outlined">${
          song.like ? "favorite" : "favorite_border"
        }</span>`;
        favoriteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleFavorite(song.id);
        });
        musicCard.appendChild(favoriteButton);

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
  } else {
    playlistsDiv.style.display = "block";
    playlistMusic.style.display = "block";
    musicLike.style.display = "none";
  }
}

/* DISPLAY musics */
function displaySongs() {
  const playlists = musics;
  if (musicLike.innerHTML === "") {
    playlistsDiv.style.display = "none";
    playlistMusic.style.display = "none";
    musicLike.style.display = "block";

    let likedSongs = [];

    Object.entries(playlists).forEach(([key, playlist]) => {
      Object.entries(playlist).forEach(([genre]) => {
        playlist[genre].songs.forEach((song) => {
          if (song.like) {
            likedSongs.push(song);
          }
        });
      });
    });
    console.log(likedSongs);

    console.log("Chansons likées avant tri :", likedSongs);

    // Trier les chansons likées par date de like
    likedSongs.sort((a, b) =>
      b.likeDate ? new Date(b.likeDate) - new Date(a.likeDate) : 0
    );

    console.log("Chansons likées après tri :", likedSongs);

    // Effacer le contenu précédent
    musicLike.innerHTML = "";

    if (likedSongs.length === 0) {
      const noSongsMessage = document.createElement("div");
      noSongsMessage.classList.add("no-songs-message");
      noSongsMessage.textContent = "Aucune musique dans vos favoris.";
      musicLike.appendChild(noSongsMessage);
    } else {
      likedSongs.forEach((song) => {
        const musicCard = document.createElement("div");
        musicCard.classList.add("music-card");
        musicCard.classList.add("music-" + song.id);

        const img = document.createElement("img");
        img.src = song.pathImg;
        img.alt = `Pochette de l'album ${song.album}`;
        musicCard.appendChild(img);

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("music-info");
        infoDiv.innerHTML = `
          <h3>${song.title}</h3>
          <p>${song.author}</p>
        `;
        musicCard.appendChild(infoDiv);

        const freqDiv = document.createElement("div");
        freqDiv.classList.add("banner-stats");
        freqDiv.innerHTML = `
                      <div class="vizualisator">
          <canvas class="visualizer-${song.id}"></canvas>
        </div>`;
        musicCard.appendChild(freqDiv);

        const favoriteButton = document.createElement("button");
        favoriteButton.classList.add("favorite-button");
        if (song.like) {
          favoriteButton.classList.add("liked");
        }
        favoriteButton.innerHTML = `<span class="material-symbols-outlined">${
          song.like ? "favorite" : "favorite_border"
        }</span>`;
        favoriteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleFavorite(song.id);
        });
        musicCard.appendChild(favoriteButton);

        const audio = document.createElement("audio");
        audio.id = `audio-${song.id}`;
        audio.src = song.pathMp3;
        audio.controls = false;
        audio.style.display = "none";
        musicCard.appendChild(audio);

        musicLike.appendChild(musicCard);
        musicCard.addEventListener("click", () =>
          afficherBanniere(playlists, song)
        );

        audio.addEventListener("ended", () => {
          const nextMusiqueId = parseInt(song.id) + 1;
          const nextAudio = document.getElementById(`audio-${nextMusiqueId}`);
          if (nextAudio) {
            playState(nextMusiqueId);
          } else {
            playState(0);
          }
        });
      });
    }
  } else {
    playlistsDiv.style.display = "none";
    playlistMusic.style.display = "none";
    musicLike.style.display = "block";
  }
}

function toggleFavorite(songId) {
  let songFound = false;
  Object.entries(musics[0]).forEach(([genre, data]) => {
    data.songs.forEach((song) => {
      if (song.id === songId) {
        // Inverser la valeur de 'like'
        song.like = !song.like;
        if (song.like) {
          song.likeDate = new Date(); // Ajouter la date de like
        } else {
          delete song.likeDate; // Supprimer la date de like si le morceau n'est plus liké
        }

        console.log(
          `La chanson ${song.title} est maintenant ${
            song.like ? "likée" : "non likée"
          }`
        );

        // Mettre à jour visuellement le bouton
        const favoriteButton = document.querySelector(
          `.music-${songId} .favorite-button`
        );
        if (favoriteButton) {
          const icon = favoriteButton.querySelector(
            "span.material-symbols-outlined"
          );
          icon.textContent = song.like ? "favorite" : "favorite_border";
          favoriteButton.classList.toggle("liked", song.like);
        }

        songFound = true;
      }
    });
  });

  if (!songFound) {
    console.error("Chanson non trouvée dans les données.");
  }
}

/*CHANGER L'ETAT ET LE SVG DU BOUTON PLAY */
function playState(id) {
  const btn = document.getElementById("play-" + id);
  const audio = document.getElementById(`audio-${id}`);
  const canvas = document.querySelectorAll(`.visualizer-${id}`);
  console.log(canvas);
  // Mettre tous les autres sons en pause
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Si le son est en pause
  if (audio.paused) {
    audio.play(); // on le play et on change son svg
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-pause-fill" viewBox="0 0 16 16"><path d="M5.5 3.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1zm6 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1z"/></svg>`;
    currentAudio = audio; // Mettre à jour l'audio en cours

    //PROGRESS BAR
    audio.addEventListener("timeupdate", () => updateProgressBar(audio));

    // Initialiser le contexte audio et le visualiseur pour cette song
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Créer la source seulement si elle n'existe pas
    if (!audio.source) {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Associer ces objets à l'élément audio pour pouvoir les réutiliser
      audio.source = audioCtx.createMediaElementSource(audio);
      audio.source.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Associer l'analyseur et les données de visualisation
      audio.analyser = analyser;
      audio.dataArray = dataArray;
      audio.bufferLength = bufferLength;
    }

    // Commencer la visualisation
    canvas.forEach((canva) => {
      frequenciesVisualizer(
        canva,
        audio.analyser,
        audio.dataArray,
        audio.bufferLength
      );
    });
  } else {
    audio.pause(); // sinon on le met en pause et on change le svg
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16"> <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" /> </svg>';
  }
}

function setActiveButton(buttonId) {
  const buttons = document.querySelectorAll(".sidebar-links button");
  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  const activeButton = document.getElementById(buttonId);
  activeButton.classList.add("active");
}

function afficherBanniere(songs, song) {
  console.log(songs);
  console.log(song);
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
  btnNext.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#FA64B2" viewBox="0 0 43.25 45.39"> <path fill="#fa64b2" d="M3.89,45.39h-.89c-1.41-.29-2.3-1.16-2.68-2.52-.19-.66-.31-1.36-.31-2.04C0,28.75,0,16.66,0,4.58c0-.87.12-1.73.46-2.55C1.03.67,2.3-.08,3.74.07c1.1.11,2.02.61,2.9,1.22,8.26,5.68,16.52,11.36,24.77,17.04.44.3.87.63,1.24,1,1.4,1.43,1.91,3.1,1.18,5.02-.46,1.21-1.37,2.04-2.41,2.76-8.09,5.56-16.18,11.13-24.26,16.7-1.01.7-2.04,1.35-3.28,1.58Z"/> <path fill="#fa64b2" d="M39.53,45.39c-.41-.16-.85-.26-1.21-.5-.79-.52-1.1-1.3-1.1-2.24,0-5.8,0-11.61,0-17.41,0-7.46.03-14.92-.02-22.37-.01-1.81,1.3-2.96,2.86-2.86.13,0,.27,0,.4,0,1.79,0,2.78.97,2.78,2.76,0,13.28,0,26.55,0,39.83,0,1.54-.57,2.29-2.12,2.79h-1.6Z"/> </svg> `;

  btnPrevious.classList.add("banner-previous");
  btnPrevious.id = "prev-" + song.id; // Définir l'ID
  btnPrevious.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg " width="15" height="15" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 43.25 45.39"><path fill="#fa64b2" d="M39.35,45.39h.89c1.41-.29,2.3-1.16,2.68-2.52.19-.66.31-1.36.31-2.04.02-12.08.01-24.16.01-36.24,0-.87-.12-1.73-.46-2.55-.57-1.36-1.84-2.11-3.28-1.96-1.1.11-2.02.61-2.9,1.22-8.26,5.68-16.52,11.36-24.77,17.04-.44.3-.87.63-1.24,1-1.4,1.43-1.91,3.1-1.18,5.02.46,1.21,1.37,2.04,2.41,2.76,8.09,5.56,16.18,11.13,24.26,16.7,1.01.7,2.04,1.35,3.28,1.58Z"/><path fill="#fa64b2" d="M3.72,45.39c.41-.16.85-.26,1.21-.5.79-.52,1.1-1.3,1.1-2.24,0-5.8,0-11.61,0-17.41,0-7.46-.03-14.92.02-22.37C6.05,1.05,4.74-.09,3.18,0c-.13,0-.27,0-.4,0C.99,0,0,.98,0,2.76,0,16.04,0,29.32,0,42.59c0,1.54.57,2.29,2.12,2.79h1.6Z"/></svg>`;

  // Ajouter le nouveau bouton à la div
  bannerBtn.appendChild(btnPrevious);
  bannerBtn.appendChild(btnPlay);
  bannerBtn.appendChild(btnNext);
  // Ajouter l'événement de clic au bouton de lecture
  btnPlay.addEventListener("click", () => {
    playState(song.id);
  });
  btnNext.addEventListener("click", () => {
    console.log(song);
    if (songs.songs[song.id + 1]) {
      afficherBanniere(songs, songs.songs[song.id + 1]);
    } else {
      afficherBanniere(songs, songs.songs[0]);
    }
  });
  btnPrevious.addEventListener("click", () => {
    if (songs.songs[song.id - 1]) {
      afficherBanniere(songs, songs.songs[song.id - 1]);
    } else {
      afficherBanniere(songs, songs.songs[songs.songs.length - 1]);
    }
  });

  playState(song.id);
}

function updateProgressBar(audio) {
  const progressBar = document.querySelector(".progress-bar");
  const progressDot = document.querySelector(".progress-dot");

  if (audio.duration) {
    const percentage = (audio.currentTime / audio.duration) * 100;

    // Mise à jour de la largeur de la barre de progression
    progressBar.style.width = percentage + "%";

    // Mise à jour de la position du point sur la barre
    progressDot.style.left = percentage + "%";
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

  const midY = canvas.height / 2; // Milieu du canvas

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 4;

    const color = "#FA64B2";

    // Dessiner les barres vers le haut à partir du milieu
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(x, midY - barHeight / 2, barWidth, barHeight / 2);

    // Dessiner les barres vers le bas à partir du milieu
    canvasCtx.fillRect(x, midY, barWidth, barHeight / 2);

    x += barWidth + 1;
  }

  if (currentAudio && !currentAudio.paused) {
    requestAnimationFrame(() =>
      frequenciesVisualizer(canvas, analyser, dataArray, bufferLength)
    );
  }
}
