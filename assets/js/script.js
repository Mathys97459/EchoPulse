// Sélection de l'élément contenant les musiques
const musicContainer = document.getElementById('musicContainer');

// Fonction pour afficher les musiques
function afficherMusiques(musiques) {
    console.log(musiques)
    musiques.forEach(musique => {
        // Création de l'élément pour chaque carte de musique
        const musicCard = document.createElement('div');
        musicCard.classList.add('music-card');

        // Ajout de l'image de l'album
        const img = document.createElement('img');
        img.src = musique.pathImg;
        img.alt = `Pochette de l'album ${musique.album}`;
        musicCard.appendChild(img);

        // Ajout des informations de la musique
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('music-info');
        infoDiv.innerHTML = `
            <h3>${musique.title}</h3>
            <p>Artiste : ${musique.author}</p>
            <p>Album : ${musique.album} (${musique.year})</p>
        `;
        const playDiv = document.createElement('div');
        playDiv.classList.add('play');
        playDiv.innerHTML = `
            <button><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
            </svg></button>
        `;
        musicCard.appendChild(infoDiv);
        musicCard.appendChild(playDiv);

        // Ajout du lecteur audio
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = musique.pathMp3;

        musicContainer.appendChild(musicCard);
        musicContainer.appendChild(audio);
    });
}

// Récupérer le fichier JSON et afficher les musiques
fetch('../lib/musics.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        afficherMusiques(data.musics);
    })
    .catch(error => console.error('Erreur lors du chargement des musiques:', error));
