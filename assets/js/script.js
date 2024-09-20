const musicLike = document.getElementById("musicLike");
const footer = document.getElementById("footer");
const playlistMusic = document.getElementById("playlistMusic");
const titlePlaylist = document.getElementById("titlePlaylist");

let currentAudio = null; // Variable pour suivre l'audio actuellement joué
let audioCtx = null; // Contexte audio pour le visualiseur
let analyser = null; // Analyseur pour les données audio
let dataArray, bufferLength; // Variables pour les données du visualiseur
let musics;

/* LOADING PAGE */
document.addEventListener("DOMContentLoaded", () => {
  // Récupérer le fichier JSON et afficher les songs
  fetch("https://mathys97459.github.io/EchoPulse/lib/musics.json")
    .then((response) => response.json())
    .then((data) => {
      musics = data.musics;
      displayPlaylistSongs("rap");
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des songs:", error)
    );
});


function afficherBanniere(songs, song) {
    const banner = document.querySelector(".music-banner-off") || document.querySelector(".music-banner-on");
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

  function playState(id) {
    const btn = document.getElementById("play-" + id);
    const audio = document.getElementById(`audio-${id}`);
    const canvas = document.querySelectorAll(`.visualizer-${id}`);
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


  // Fonction pour mettre à jour la barre de progression en fonction du temps de la chanson
function updateProgressBar(audio) {
    const progressContainer = document.querySelector(".progress-container");
    const progressBar = document.querySelector(".progress-bar");
    const progressDot = document.querySelector(".progress-dot");
  
    let isDragging = false;
  
    // Mise à jour de la barre et du dot pendant la lecture de l'audio
    audio.addEventListener("timeupdate", function () {
      if (!isDragging) {
        // Ne pas mettre à jour pendant le drag
        const duration = audio.duration || 0;
        const currentTime = audio.currentTime || 0;
        const progressPercent = (currentTime / duration) * 100;
  
        // Mettre à jour la largeur de la progress-bar
        progressBar.style.width = `${progressPercent}%`;
  
        // Mettre à jour la position du dot
        const containerWidth = progressContainer.offsetWidth;
        const dotPosition = (currentTime / duration) * containerWidth;
        progressDot.style.left = `${dotPosition}px`;
      }
    });
  
    // Gérer le clic direct sur la barre pour changer la position du son
    progressContainer.addEventListener("click", function (event) {
      const containerWidth = progressContainer.offsetWidth;
      const clickX = event.offsetX;
      const newTime = (clickX / containerWidth) * audio.duration;
      audio.currentTime = newTime; // Mettre à jour la position de lecture
    });
  
    // Gérer le drag du dot
    progressDot.addEventListener("mousedown", function () {
      isDragging = true;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  
    function onMouseMove(event) {
      const containerRect = progressContainer.getBoundingClientRect();
      let x = event.clientX - containerRect.left; // Position relative au conteneur
  
      // Limiter le déplacement du dot dans les bornes de la barre
      x = Math.max(0, Math.min(x, progressContainer.offsetWidth));
  
      // Mettre à jour visuellement pendant le drag
      progressBar.style.width = `${(x / progressContainer.offsetWidth) * 100}%`;
      progressDot.style.left = `${x}px`;
    }
  
    function onMouseUp(event) {
      const containerRect = progressContainer.getBoundingClientRect();
      let x = event.clientX - containerRect.left; // Position relative au conteneur
  
      // Limiter le déplacement du dot dans les bornes de la barre
      x = Math.max(0, Math.min(x, progressContainer.offsetWidth));
  
      const newTime = (x / progressContainer.offsetWidth) * audio.duration;
  
      // Éviter les cas où la durée serait NaN (lorsque l'audio n'est pas encore prêt)
      if (!isNaN(newTime)) {
        audio.currentTime = newTime; // Mettre à jour la position de lecture de l'audio
      }
  
      // Fin du drag
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }
  
  // Exemple d'utilisation
  const audio = document.getElementById("audio");
  updateProgressBar(audio);
  
  // Rendre la barre de progression interactive
  document.getElementById("progress").addEventListener("input", function () {
    const progress = document.getElementById("progress");
    const audio = document.querySelector("audio"); // Récupère l'audio actuellement joué
    const duration = audio.duration;
  
    if (!isNaN(duration)) {
      // Met à jour le temps courant de la chanson lorsque l'utilisateur bouge la barre
      const newTime = (progress.value / 100) * duration;
      audio.currentTime = newTime;
    }
  });
  
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
  
  function setActiveButton(buttonId) {
    const buttons = document.querySelectorAll(".sidebar-links button");
    buttons.forEach((button) => {
      button.classList.remove("active");
    });
  
    const activeButton = document.getElementById(buttonId);
    activeButton.classList.add("active");
  }
  


/* DISPLAY musics */
function displayPlaylistSongs(genre) {
    // Vérifier si la div pour le genre existe déjà
    let genreDiv = document.getElementById(genre);
    titlePlaylist.innerHTML = `PLAYLIST ${genre.toUpperCase()}`;
    // Masquer toutes les autres divs de genre
    const allGenreDivs = document.querySelectorAll('div[id]');
    
    allGenreDivs.forEach(div => {
        if (div !== genreDiv && div.id !== playlistMusic.id) {
            div.style.display = "none"; // Masquer les autres divs
        }
    });

    // Afficher la div du genre sélectionné

    // Continuez avec votre logique existante pour afficher les chansons
    const songs = musics[0][genre];
    playlistMusic.style.display = "block";
    musicLike.style.display = "none";

    if (songs.length === 0) {
        playlistMusic.innerHTML = "Aucune musique dans cette playlist.";
    } else{
        if (!genreDiv) {
            // Si elle n'existe pas, créez-la
            genreDiv = document.createElement("div");
            genreDiv.id = genre; // Attribuer l'id du genre
            document.body.appendChild(genreDiv); // Ajouter la div au corps du document
            genreDiv.style.display = "block";
            songs.songs.forEach(song => {
                // Logique pour afficher les chansons
                const musicCard = document.createElement("div");
                musicCard.classList.add("music-card");
                musicCard.classList.add("music-" + song.id);
    
                // Image de l'album
                const img = document.createElement("img");
                img.src = song.pathImg;
                img.alt = `Pochette de l'album ${song.album}`;
                musicCard.appendChild(img);
    
                // Détails de la chanson
                const infoDiv = document.createElement("div");
                infoDiv.classList.add("music-info");
                infoDiv.innerHTML = `
                    <h3>${song.title}</h3>
                    <p>${song.author}</p>
                `;
                musicCard.appendChild(infoDiv);
    
                // Visualiseur de fréquence
                const freqDiv = document.createElement("div");
                freqDiv.classList.add("banner-stats");
                freqDiv.innerHTML = `
                    <div class="vizualisator">
                        <canvas class="visualizer-${song.id}"></canvas>
                    </div>`;
                    musicCard.appendChild(freqDiv);
    
                // Élément audio
                const audio = document.createElement("audio");
                audio.id = `audio-${song.id}`;
                audio.src = song.pathMp3;
                audio.controls = false;
                audio.style.display = "none"; // Cacher les éléments audio
                musicCard.appendChild(audio);
    
    
                // Écouteur d'événements pour la carte de musique
                musicCard.addEventListener("click", () => afficherBanniere(songs, song));
    
                // Bouton Favori
                const favoriteButton = document.createElement("button");
                favoriteButton.classList.add("favorite-button");
                if (song.like) {
                    favoriteButton.classList.add("liked");
                }
                favoriteButton.innerHTML = `<span class="material-symbols-outlined">${song.like ? "favorite" : "favorite_border"}</span>`;
                favoriteButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    toggleFavorite(song.id);
                });
                musicCard.appendChild(favoriteButton);
                genreDiv.appendChild(musicCard);
                // Gérer la fin de l'audio
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
        }else{
            genreDiv.style.display = 'block'
        }
    }
}



/* DISPLAY musics */
function displaySongs() {
  const playlists = musics;
  
  const allGenreDivs = document.querySelectorAll('div[id]');
    allGenreDivs.forEach(div => {
        if (div.id !== 'musicLike') {
            div.style.display = "none"; // Masquer les autres divs
        }
    });
    musicLike.style.display = "block"
    //METTre display block a musicLike

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

    // Trier les chansons likées par date de like
    likedSongs.sort((a, b) =>
      b.likeDate ? new Date(b.likeDate) - new Date(a.likeDate) : 0
    );

    // Effacer le contenu précédent
    musicLike.innerHTML = "";

    if (likedSongs.length === 0) {
      const noSongsMessage = document.createElement("div");
      noSongsMessage.classList.add("no-songs-message");
      noSongsMessage.textContent = "Aucune musique dans vos favoris.";
      musicLike.appendChild(noSongsMessage);
    } else {
        const title = document.createElement("h2");
        title.classList.add("title");
        title.textContent = "TITRES FAVORIS";
        musicLike.appendChild(title);

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






}