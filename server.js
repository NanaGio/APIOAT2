require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express'); // Framework para criar o servidor web
const axios = require('axios'); //r requisições HTTP
const app = express(); // Inicializa a aplicação Express
const path = require('path'); // Módulo para lidar com caminhos de arquivos
const port = process.env.port || 3000; // Define a porta do servidor

// Cache do token do Spotify | nana
let spotifyToken = {
    value: null,
    expiresAt: null
}

//middleware custom | nana
function logger (req, res, next){
    const time = new Date().toLocaleString("pt-br", {timeZone: "America/Bahia"}); //definição da timezone | nana
    console.log(`NEW ${req.method}, AT TIME: ${time}`);
    next();
}

//middleware sendo utilizado | nana
app.use(logger)

app.use(express.static(path.join(__dirname, '')));

//chamando rick & morty | nana
app.get('/personagem-aleatorio', async (req, res) => {
    try {
        const RICK_AND_MORTY_API_URL = 'https://rickandmortyapi.com/api/character';
        const infoResponse = await axios.get(RICK_AND_MORTY_API_URL);
        const totalCharacters = infoResponse.data.info.count;

        const randomId = Math.floor(Math.random() * totalCharacters) + 1;
        const characterResponse = await axios.get(`${RICK_AND_MORTY_API_URL}/${randomId}`);

        res.json(characterResponse.data);
    } catch (error) { //caso de erro na busca do personagem | nana
        console.error("Falha ao buscar personagem:", error.message);
        res.status(500).json({error: "Não foi possivel buscar um personagem."});

    }
});

// chamando token do spotify | nana
async function getSpotifyToken() {
    if (spotifyToken.value && spotifyToken.expiresAt > Date.now()) {
        console.log("Usando token do Spotify (do cache).");
        return spotifyToken.value;
    }
    console.log("Buscando novo token do Spotify...");
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            data,
            {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const token = response.data.access_token;
        const expiresInMs = response.data.expires_in * 1000;
        spotifyToken.value = token;
        spotifyToken.expiresAt = Date.now() + expiresInMs - 60000;
        return token;

    } catch (error) {// caso de erro na busca do token | nana
        console.error("Erro ao obter token do Spotify:", error.response ? error.response.data : error.message);
        throw new Error("Falha na autenticação com Spotify.");
    }
}
// buscando albuns e artistas | nana
app.get('/buscar-artista', async (req, res) => {
    try {
        const token = await getSpotifyToken();
        const artistName = req.query.nome || 'Daft Punk';

        const artistResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: {'Authorization': `Bearer ${token}`},  
            params: {
                q: artistName,
                type: 'artist',
                limit: 1
            }          
        });

        if (artistResponse.data.artists.items.length === 0) {
            return res.status(404).json({error: "Artista não encontrado."});
        }
        const artistData = artistResponse.data.artists.items[0];
        const artistId = artistData.id;

        const albumsResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                include_groups: 'album,single', 
                limit: 50 
            }
        });

        const allAlbums = albumsResponse.data.items;
         if (allAlbums.length === 0) {// caso não se encontre albuns para determinado artista | nana
         return res.status(404).json({ error: "Álbuns não encontrados para este artista." });
         }

        const randomAlbum = allAlbums[Math.floor(Math.random() * allAlbums.length)];
        
        const responseData = {
            artistName: artistData.name,      
            artistId: artistData.id,          
            genres: artistData.genres,        
            albumName: randomAlbum.name,      
            albumId: randomAlbum.id,          
            albumImage: randomAlbum.images[0]?.url 
        };

        res.json(responseData);

    } catch (error) {// caso de erro ao buscar o artista | nana
        console.error("Erro na rota /buscar-artista:", error.message);
        if (error.response) {
            console.error("Erro Spotify:", error.response.data);
    }
        res.status(500).json({ error: "Erro ao buscar dados do Spotify." });
    }
});
//anunciando no console que o server foi iniciado | nana
app.listen(port, () => {
    console.log(`SERVIDOR INICIADO, RODANDO EM ${port}`)
})
