require('dotenv').config();
const express = require('express'); //usando express
const axios = require('axios'); //axios para conectar API's externas (R&M e SPOTIFY)
const app = express(); //usando express
const path = require('path'); //declarando path
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;// declarando a chave do spotify
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;// declarando a chave do spotify
const port = process.env.port || 3000;// declarando porta

// Array para reunir favoritados do usuario
let favoritos = [];

// utilizando token do spotify
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
app.use(express.json()); //middleware pro json

//chamando rick & morty | nana
app.get('/personagem-aleatorio', async (req, res) => {
    try {
        const RICK_AND_MORTY_API_URL = 'https://rickandmortyapi.com/api/character';
        const infoResponse = await axios.get(RICK_AND_MORTY_API_URL);
        const totalCharacters = infoResponse.data.info.count;

        const randomId = Math.floor(Math.random() * totalCharacters) + 1;
        const characterResponse = await axios.get(`${RICK_AND_MORTY_API_URL}/${randomId}`);

        res.json(characterResponse.data);
    } catch (error) {
        console.error("Falha ao buscar personagem:", error.message);
        res.status(500).json({error: "Não foi possivel buscar um personagem."});

    }
});


// chamando spotify | nana
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

    } catch (error) {
        console.error("Erro ao obter token do Spotify:", error.response ? error.response.data : error.message);
        throw new Error("Falha na autenticação com Spotify.");
    }
}

// definindo favoritos
app.get('/favoritos', (req, res) => {
    res.json(favoritos);
});

// GET - buscando artistas da API do Spotify
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
         if (allAlbums.length === 0) {
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

    } catch (error) {
        console.error("Erro na rota /buscar-artista:", error.message);
        if (error.response) {
            console.error("Erro Spotify:", error.response.data);
    }
        res.status(500).json({ error: "Erro ao buscar dados do Spotify." });
    }
});

// POST - adiciona o favorito
app.post('/favoritos', async (req, res) => {
    try {
        const {tipo, id, nome, imagem} = req.body; // Corrigi "images" para "imagem"

        console.log('📥 Dados recebidos:', req.body);
        console.log('📊 Favoritos antes:', favoritos);

        if (!tipo || !id || !nome){
            return res.status(400).json({error: "Dados incompletos"});
        }

        const novoFavorito = {
            id,
            tipo,
            nome,
            imagem,
            dataCriacao: new Date()
        };

        favoritos.push(novoFavorito);
        
        console.log('✅ Favoritos depois:', favoritos);
        console.log('🎯 Total de favoritos:', favoritos.length);

        res.status(201).json(novoFavorito);
    } catch (error) {
        console.error('❌ Erro ao adicionar favorito:', error);
        res.status(500).json({ error: "Erro ao adicionar favorito"});
    }
});

// GET - use /ver-favoritos para ver seus favoritados
app.get('/ver-favoritos', (req, res) => {
    res.json({
        quantidade: favoritos.length,
        favoritos: favoritos
    });
});

// Adicione também uma rota para ver os favoritos no console
app.get('/debug-favoritos', (req, res) => {
    console.log('🔍 Array de favoritos:', favoritos);
    console.log('📈 Quantidade:', favoritos.length);
    res.json(favoritos);
});

//PUT - Estrutura dos favoritdas no /ver-favoritos
app.put('/favoritos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo } = req.body;

        const index = favoritos.findIndex(f => f.id === id);
        if (index === -1){
            return res.status(404).json({ error: "Favorito não encontrado "})
        }

        favoritos[index] = {
            ...favoritos[index],
            nome: nome || favoritos[index].nome,
            tipo: tipo || favoritos[index].tipo,
            dataAtualizacao: new Date()
        };

        res.json(favoritos[index]);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar favorito" });
    }
});

//DELETE - Deletar um favorito
app.delete('/favoritos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const index = favoritos.findIndex(f => f.id === id);

        if (index === -1){
            return res.status(404).json({ error: "Favorito não encontrado"});
        }

        favoritos.splice(index, 1);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar favorito "});
    }
})

//Declaração da porta 3000, rodando
app.listen(port, () => {
    console.log(`SERVIDOR INICIADO, RODANDO EM ${port}`)
})
