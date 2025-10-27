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
        }
    }

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
});