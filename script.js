document.addEventListener('DOMContentLoaded', () => {

    const mainButton = document.getElementById('randomize-all-btn');

    // --- SELETORES DO RICK AND MORTY ---
    const characterCard = document.getElementById('character-card');
    const characterImage = document.getElementById('character-image');
    const characterName = document.getElementById('character-name');
    const characterId = document.getElementById('character-id');
    const characterStatus = document.getElementById('character-status');
    const rickMortyMessage = document.getElementById('rick-morty-message');

    // --- SELETORES DO SPOTIFY ---
    const albumImage = document.getElementById('album-image');
    const artistName = document.getElementById('artist-name');
    const albumName = document.getElementById('album-name');
    const artistId = document.getElementById('artist-id');
    const artistGenre = document.getElementById('artist-genre');

    // --- EVENT LISTENER PRINCIPAL ---
    mainButton.addEventListener('click', fetchAllApis);

    async function fetchAllApis() {
        mainButton.disabled = true;
        mainButton.textContent = 'Randomizando... ⏳';

        loadingStates.setLoading(characterCard, true);
        loadingStates.setLoading(albumImage.parentElement, true);

        rickMortyMessage.classList.add('hidden');
        characterCard.classList.add('hidden');
        
        try {
            await Promise.all([
                fetchRandomCharacter(), 
                fetchRandomArtist()
            ]);

        } catch (error) {

            console.error('Uma das APIs falhou:', error);

        } finally {

            mainButton.disabled = false;
            mainButton.textContent = '✨ Randomizar Tudo ✨';

            loadingStates.setLoading(characterCard, false);
            loadingStates.setLoading(albumImage.parentElement, false);
        }
    }
    // fetch R&M
    async function fetchRandomCharacter() {
        try {

            const response = await fetch('/personagem-aleatorio');
            if (!response.ok) {
                throw new Error(`Erro na rede! Status: ${response.status}`);
            }
            const data = await response.json();

            characterName.textContent = data.name;
            characterId.textContent = data.id;
            characterImage.src = data.image;
            characterImage.alt = `Imagem de ${data.name}`;
            characterStatus.textContent = data.status;

            characterStatus.classList.remove('text-green-500', 'text-red-500', 'text-gray-500');
            if (data.status === 'Alive') {
                characterStatus.classList.add('text-green-500');
            } else if (data.status === 'Dead') {
                characterStatus.classList.add('text-red-500');
            } else {
                characterStatus.classList.add('text-gray-500');
            }

            characterCard.classList.remove('hidden');

        } catch (error) {
            console.error('Falha ao buscar personagem:', error);
            rickMortyMessage.textContent = 'Erro ao buscar Rick & Morty.';
            rickMortyMessage.classList.remove('hidden'); 
        }
    }

    // fetch Spotify
    async function fetchRandomArtist() {

        const randomArtistsList = [
            'Daft Punk', 'Lorde', 'Marina Sena', 'FKA Twigs',
            'PinkPantheress', 'SOPHIE', 'Britney Spears', 'Aaliyah', 'Gal Costa', 'Linkin Park'
        ];
        
        const randomArtistQuery = randomArtistsList[Math.floor(Math.random() * randomArtistsList.length)];

        try {
            const response = await fetch(`/buscar-artista?nome=${encodeURIComponent(randomArtistQuery)}`);
            if (!response.ok) {
                throw new Error(`Erro na rede! Status: ${response.status}`);
            }

            const data = await response.json();

            artistName.textContent = data.artistName;   
            albumName.textContent = data.albumName;    
            artistId.textContent = data.artistId;       
            artistGenre.textContent = data.genres.slice(0, 2).join(', ') || 'N/A'; 
            
            albumImage.src = data.albumImage || 'https://placehold.co/400x400/1DB954/ffffff?text=Álbum';
            albumImage.alt = `Capa do álbum ${data.albumName}`;
            


        } catch (error) {
            console.error('Falha ao buscar artista:', error);
            artistName.textContent = 'Erro ao buscar';
            albumName.textContent = 'Tente novamente';
        }
    }
    // animação de carregando
    const loadingStates = {
        setLoading: (element, isLoading) => {
            if (isLoading) {
                element.classList.add('animated-pulse', 'opacity-50');
            } else {
                element.classList.remove('animated-pulse', 'opacity-50');
            }
        }
    };

    const API = {
        async adicionarFavorito(tipo, data) {
            try {
                const response = await fetch('/favoritos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tipo,
                        id: data.id,
                        nome: tipo === 'character' ? data.name : data.artistName,
                        imagem: tipo === 'character' ? data.image : data.albumImage
                    })
                });
            } catch (error) {
                console.error('Erro:', error);
                throw error;
            }
        },

        async atualizarFavorito(id, dados){
            try {
                const response = await fetch(`/favoritos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                if (!response.ok) throw new Error('Erro ao atualizar favorito');
                return response.json();
            } catch (error) {
                console.error('Erro:', error);
                throw error;
            }
        },

        async removerFavorito(id) {
            try {
                const response = await fetch(`/favoritos/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Erro ao remover favorito');
                return true;
            } catch (error) {
                console.error('Erro:', error);
                throw error;
            }
        },

        async listarFavoritos(){
            try {
                const response = await fetch('/favoritos');
                if (!response.ok) throw new Error('Erro ao listar favoritos');
                return response.json();
            } catch (error) {
                console.error('Erro:', error);
                throw error;

            }
        }
    };

    // Exemplo de uso:

    function adicionarBotoesFavoritos() {
    // Botão para favoritar personagem
    const btnFavoritarChar = document.createElement('button');
    btnFavoritarChar.className = 'bg-purple-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-purple-600 transition-colors';
    btnFavoritarChar.textContent = '❤️ Favoritar Personagem';
    btnFavoritarChar.onclick = async () => {
        try {
            await API.adicionarFavorito('character', {
                id: characterId.textContent,
                name: characterName.textContent,
                image: characterImage.src
            });
            console.log('Personagem favoritado!');
        } catch (error) {
            console.error('Erro ao favoritar:', error);
        }
    };

    // Botão para favoritar álbum
    const btnFavoritarAlbum = document.createElement('button');
    btnFavoritarAlbum.className = 'bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600 transition-colors';
    btnFavoritarAlbum.textContent = '❤️ Favoritar Álbum';
    btnFavoritarAlbum.onclick = async () => {
        try {
            await API.adicionarFavorito('album', {
                id: artistId.textContent,
                artistName: artistName.textContent,
                albumName: albumName.textContent,
                image: albumImage.src
            });
            console.log('Álbum favoritado!');
        } catch (error) {
            console.error('Erro ao favoritar:', error);
        }
    };

        // Adiciona os botões aos cards
        characterCard.querySelector('.p-6').appendChild(btnFavoritarChar);
        
        const spotifyCard = document.querySelector('#spotify-container .bg-white');
        if (spotifyCard) {
            spotifyCard.querySelector('.p-6').appendChild(btnFavoritarAlbum);
        }
    }
   
    adicionarBotoesFavoritos();

});
