const musicContainer = document.getElementById("musicContainer");
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

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

        // Ajout du bouton de lecture
        const playDiv = document.createElement("div");
        playDiv.classList.add("play");
        playDiv.innerHTML = `
            <button id="play-${musique.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            </button>
        `;
        musicCard.appendChild(playDiv);

        // Ajout de l'audio
        const audio = document.createElement("audio");
        audio.id = `audio-${musique.id}`;
        audio.src = musique.pathMp3;
        audio.controls = false;
        audio.style.display = 'none'; // Cacher les éléments audio
        musicCard.appendChild(audio);

        // Ajouter la carte musicale au conteneur
        musicContainer.appendChild(musicCard);

        // Ajouter l'événement de clic au bouton de lecture
        const playButton = document.getElementById(`play-${musique.id}`);
        playButton.addEventListener('click', () => playState(musique, musique.id));
    });
}

function playState(musique, id) {
    const audio = document.getElementById(`audio-${id}`);
    const playButton = document.getElementById(`play-${id}`);

    // Si un autre audio est en cours de lecture, mettre en pause
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0
        document.getElementById(`play-${currentAudio.id.split('-')[1]}`).innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
        `;
    }

    // Vérifier si l'audio en question est en pause ou non
    if (audio.paused) {
        // Si c'est un nouvel audio, ou si la musique a été mise en pause, démarrer ou reprendre
        audio.play();
        playButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-pause-fill" viewBox="0 0 16 16">
                <path d="M5.5 3.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1zm6 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1z"/>
            </svg>
        `;
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
        afficherBanniere(musique)
        // Visualiser les données
        visualize();
    } else {
        // Si l'audio est en cours de lecture, le mettre en pause
        audio.pause();
        playButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg>
        `;
        currentAudio = null; // Réinitialiser l'audio en cours
    }
}

// Fonction pour afficher la bannière avec les informations de la musique
function afficherBanniere(musique) {
    console.log("afficher banniere " + musique.author);
    const banner = document.getElementById("musicBanner");
    const img = document.getElementById("banner-img");
    const title = document.getElementById("banner-title");
    const author = document.getElementById("banner-author");
  
    banner.classList.add("music-banner-on");
    banner.classList.remove("music-banner-off");
  
    img.src = musique.pathImg;
    img.width = "100"
    title.innerText = musique.title;
    author.innerText = musique.author;
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
        barHeight = dataArray[i]/3;

        if(!barHeight) {
            barHeight = 3;
        }

        const color = 'rgb(' + (barHeight + 100) + ',50,50)';

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

// Récupérer le fichier JSON et afficher les musiques
fetch('../lib/musics.json')
    .then(response => response.json())
    .then(data => {
        afficherMusiques(data.musics);
    })
    .catch(error => console.error('Erreur lors du chargement des musiques:', error));
