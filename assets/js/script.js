const musicContainer = document.getElementById("musicContainer");
        let currentAudio = null; // Variable pour suivre l'audio actuellement joué

        // Fonction pour afficher les musiques
        function afficherMusiques(musiques) {
            console.log(musiques);
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
                audio.style.display = 'none'; // Hide audio elements
                musicCard.appendChild(audio);

                // Ajouter la carte musicale au conteneur
                musicContainer.appendChild(musicCard);

                // Ajouter l'événement de clic au bouton de lecture
                const playButton = document.getElementById(`play-${musique.id}`);
                playButton.addEventListener('click', () => playState(musique.id));
            });
        }

        // Fonction pour gérer l'état de lecture
        function playState(id) {
            const audio = document.getElementById(`audio-${id}`);
            const playButton = document.getElementById(`play-${id}`);

            // Si un autre audio est en cours de lecture, mettre en pause
            if (currentAudio && currentAudio !== audio) {
                audio.currentTime = 0
                currentAudio.pause();
                document.getElementById(`play-${currentAudio.id.split('-')[1]}`).innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>
                `;
            }

            // Lecture ou pause de l'audio actuel
            if (audio.paused) {
                audio.currentTime = 0
                audio.play();
                playButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-pause-fill" viewBox="0 0 16 16">
                        <path d="M5.5 3.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1zm6 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h1z"/>
                    </svg>
                `;
                currentAudio = audio; // Met à jour l'audio en cours
            } else {
                audio.currentTime = 0
                audio.pause();
                playButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FA64B2" class="bi bi-play-fill" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                    </svg>
                `;
                currentAudio = null; // Réinitialise l'audio en cours
            }
        }

        // Récupérer le fichier JSON et afficher les musiques
        fetch('../lib/musics.json')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                afficherMusiques(data.musics);
            })
            .catch(error => console.error('Erreur lors du chargement des musiques:', error));
 