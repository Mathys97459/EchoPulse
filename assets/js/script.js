const musicContainer = document.getElementById("musicContainer");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");

let currentAudio = null; // Variable pour suivre l'audio actuellement joué
let audioCtx = null; // Contexte audio pour le visualiseur
let analyser = null; // Analyseur pour les données audio
let dataArray, bufferLength; // Variables pour les données du visualiseur

// Fonction pour afficher les musiques
function afficherMusiques(musiques) {
  musiques.forEach((musique) => {
    // Création de l'élément pour chaque carte de musique
    const musicCard = document.createElement("div");
    musicCard.classList.add("music-card");
    musicCard.classList.add("music-" + musique.id);

    // Ajout de l'image de l'album
    const img = document.createElement("img");
    img.src = musique.pathImg;
    img.alt = `Pochette de l'album ${musique.album}`;
    musicCard.appendChild(img);

    // Ajout des informations de la musique
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("music-info");
    infoDiv.innerHTML = `
            <h3>${musique.title}</h3>
            <p>${musique.author}</p>
        `;
    musicCard.appendChild(infoDiv);

    // Ajout de l'audio
    const audio = document.createElement("audio");
    audio.id = `audio-${musique.id}`;
    audio.src = musique.pathMp3;
    audio.controls = false;
    audio.style.display = "none"; // Cacher les éléments audio
    musicCard.appendChild(audio);

    // Ajouter la carte musicale au conteneur
    musicContainer.appendChild(musicCard);

    // Ajouter l'événement de clic au bouton de lecture
    musicCard.addEventListener("click", () =>
      playState(musiques, musique, musique.id)
    );
  });
}

function playState(musiques, musique, id) {
  console.log("Play state id musique : " + id);

  const audio = document.getElementById(`audio-${id}`);

  // Si un autre audio est en cours de lecture, mettre en pause
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Vérifier si l'audio en question est en pause ou non
  if (audio.paused) {
    // Si c'est un nouvel audio, ou si la musique a été mise en pause, démarrer ou reprendre
    audio.play();
    currentAudio = audio; // Mettre à jour l'audio en cours

    // Initialiser le contexte audio et le visualiseur pour cette musique
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Vérifier si une source MediaElementSource a déjà été créée pour cet audio
    if (!audio.source) {
      audio.source = audioCtx.createMediaElementSource(audio);
    }

    // Créer un analyseur seulement si nécessaire
    if (!analyser) {
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    // Connecter la source à l'analyseur et à la sortie audio
    audio.source.connect(analyser);
    analyser.connect(audioCtx.destination);
    afficherBanniere(musiques, musique);
    // Visualiser les données
    visualize();
  } else {
    // Si l'audio est en cours de lecture, le mettre en pause
    audio.pause();
    currentAudio = null; // Réinitialiser l'audio en cours
  }
}

// Fonction pour afficher la bannière avec les informations de la musique
function afficherBanniere(musiques, musique) {
  console.log("Afficher banniere id musique : " + musique.id);

  const banner = document.getElementById("musicBanner");
  const img = document.getElementById("banner-img");
  const title = document.getElementById("banner-title");
  const author = document.getElementById("banner-author");
  const bannerBtn = document.querySelector(".banner-btn");

  banner.classList.remove("music-banner-off");
  banner.classList.add("music-banner-on");

  img.src = musique.pathImg;
  img.width = "100";
  title.innerText = musique.title;
  author.innerText = musique.author;

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
  btnPlay.id = "play-" + musique.id; // Définir l'ID
  btnPlay.innerHTML = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    fill="#FA64B2"
    class="bi bi-play-fill"
    viewBox="0 0 16 16"
  >
    <path
      d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
    />
  </svg>
`;
  btnNext.classList.add("banner-next");
  btnNext.id = "play-" + musique.id; // Définir l'ID
  btnNext.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg " 
    width="30"
    height="30"
    fill="#FA64B2"
    viewBox="0 0 43.25 45.39">
<path fill="#fa64b2" d="M3.89,45.39h-.89c-1.41-.29-2.3-1.16-2.68-2.52-.19-.66-.31-1.36-.31-2.04C0,28.75,0,16.66,0,4.58c0-.87.12-1.73.46-2.55C1.03.67,2.3-.08,3.74.07c1.1.11,2.02.61,2.9,1.22,8.26,5.68,16.52,11.36,24.77,17.04.44.3.87.63,1.24,1,1.4,1.43,1.91,3.1,1.18,5.02-.46,1.21-1.37,2.04-2.41,2.76-8.09,5.56-16.18,11.13-24.26,16.7-1.01.7-2.04,1.35-3.28,1.58Z"/>
<path fill="#fa64b2" d="M39.53,45.39c-.41-.16-.85-.26-1.21-.5-.79-.52-1.1-1.3-1.1-2.24,0-5.8,0-11.61,0-17.41,0-7.46.03-14.92-.02-22.37-.01-1.81,1.3-2.96,2.86-2.86.13,0,.27,0,.4,0,1.79,0,2.78.97,2.78,2.76,0,13.28,0,26.55,0,39.83,0,1.54-.57,2.29-2.12,2.79h-1.6Z"/>
</svg>
`;
  btnPrevious.classList.add("banner-previous");
  btnPrevious.id = "play-" + musique.id; // Définir l'ID
  btnPrevious.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg " 
    width="30"
    height="30"
    fill="#FA64B2"
    class="bi bi-play-fill"
    viewBox="0 0 43.25 45.39">
<path fill="#fa64b2" d="M39.35,45.39h.89c1.41-.29,2.3-1.16,2.68-2.52.19-.66.31-1.36.31-2.04.02-12.08.01-24.16.01-36.24,0-.87-.12-1.73-.46-2.55-.57-1.36-1.84-2.11-3.28-1.96-1.1.11-2.02.61-2.9,1.22-8.26,5.68-16.52,11.36-24.77,17.04-.44.3-.87.63-1.24,1-1.4,1.43-1.91,3.1-1.18,5.02.46,1.21,1.37,2.04,2.41,2.76,8.09,5.56,16.18,11.13,24.26,16.7,1.01.7,2.04,1.35,3.28,1.58Z"/>
<path fill="#fa64b2" d="M3.72,45.39c.41-.16.85-.26,1.21-.5.79-.52,1.1-1.3,1.1-2.24,0-5.8,0-11.61,0-17.41,0-7.46-.03-14.92.02-22.37C6.05,1.05,4.74-.09,3.18,0c-.13,0-.27,0-.4,0C.99,0,0,.98,0,2.76,0,16.04,0,29.32,0,42.59c0,1.54.57,2.29,2.12,2.79h1.6Z"/>
</svg>
`;

  // Ajouter le nouveau bouton à la div
  bannerBtn.appendChild(btnPrevious);
  bannerBtn.appendChild(btnPlay);
  bannerBtn.appendChild(btnNext);

  // Ajouter l'événement de clic au bouton de lecture
  btnPlay.addEventListener("click", () =>
    playState(musiques, musique, musique.id)
  );
  // Ajouter l'événement de clic au bouton de next
  btnNext.addEventListener("click", () =>
    playState(musiques, musiques[musique.id + 1], musique.id + 1)
  );
  // Ajouter l'événement de clic au bouton de previous
  btnPrevious.addEventListener("click", () =>
    playState(musiques, musiques[musique.id - 1], musique.id - 1)
  );
}

function cacherBanniere() {
  const banner = document.getElementById("musicBanner");
  banner.classList.remove("music-banner-on");
  banner.classList.add("music-banner-off");
}

// Fonction pour visualiser les données
function visualize() {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  // Obtenir les données de fréquence
  analyser.getByteFrequencyData(dataArray);
  const barWidth = (canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  const midY = canvas.height / 2; // Milieu du canvas

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 3;

    if (!barHeight) {
      barHeight = 3;
    }

    const color = "#FA64B2";

    // Dessiner les barres vers le haut à partir du milieu
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(x, midY - barHeight / 2, barWidth, barHeight / 2);

    // Dessiner les barres vers le bas à partir du milieu
    canvasCtx.fillRect(x, midY, barWidth, barHeight / 2);

    x += barWidth + 1;
  }

  // Boucler la visualisation
  if (currentAudio && !currentAudio.paused) {
    requestAnimationFrame(visualize);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Obtenir l'élément où l'année sera affichée
  const yearElement = document.getElementById("currentYear");

  // Obtenir l'année en cours
  const currentYear = new Date().getFullYear();

  // Mettre à jour le contenu de l'élément avec l'année actuelle
  yearElement.textContent = currentYear;
});

// Récupérer le fichier JSON et afficher les musiques
fetch("../lib/musics.json")
  .then((response) => response.json())
  .then((data) => {
    afficherMusiques(data.musics);
  })
  .catch((error) =>
    console.error("Erreur lors du chargement des musiques:", error)
  );
