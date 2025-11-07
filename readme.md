# 🪐 Rick and Morty & Spotify Dashboard 🎶

[Node.js, Express, APIs REST]
## 🚀 Visão Geral do Projeto
Link para testar: https://randomizador-he2d.onrender.com/

Este projeto, intitulado **Dashboard de APIs com Rick and Morty e Spotify**, é um trabalho de revisão e aplicação prática dos conceitos fundamentais de APIs.

O objetivo principal é demonstrar a integração e o consumo de dados de duas APIs públicas e populares:

1.  **Rick and Morty API:** Utilizada para obter dados e imagens de personagens aleatórios.
2.  **Spotify Web API:** Utilizada para obter dados de músicas aleatórias, exigindo autenticação via credenciais (Client ID e Client Secret).

### ✨ Funcionalidade Principal

Ao clicar no botão **"Randomizar Tudo"**, o sistema realiza duas requisições simultâneas:
* Busca um personagem aleatório de Rick and Morty.
* Busca uma música aleatória do Spotify.
* Exibe ambos os resultados em uma *dashboard* interativa.

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js, Express.js
* **APIs:** Spotify Web API (com autenticação), Rick and Morty API (acesso público)
* **Gerenciamento de Dependências:** NPM

---

## 🔑 Configuração e Instalação

Para rodar o projeto localmente e acessar a API do Spotify, você precisa obter suas credenciais de desenvolvedor:

### 1. Obtenção das Credenciais do Spotify

As credenciais **`CLIENT_ID`** e **`CLIENT_SECRET`** são essenciais para a autenticação. A API de Rick and Morty não requer autenticação.

| Passo | Ação |
| :--- | :--- |
| **1. Acesso** | Vá para o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/). Faça login com sua conta normal do Spotify. |
| **2. Criação** | Clique em **"Create an App"** e preencha o nome e a descrição do seu projeto. |
| **3. Credenciais** | Na página de visão geral do app, você verá o `Client ID`. Clique em **"Show client secret"** para revelar o `Client Secret`. |

### 2. Configuração do Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/NanaGio/API.git
    cd API
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Insira as Credenciais:**
    Crie um arquivo chamado `.env` na raiz do seu projeto (recomendado para segurança) e adicione suas credenciais:
    ```
    SPOTIFY_CLIENT_ID="SEU_CLIENT_ID_AQUI"
    SPOTIFY_CLIENT_SECRET="SEU_CLIENT_SECRET_AQUI"
    ```
    *(Alternativamente, se você estiver usando a abordagem do texto, insira as credenciais diretamente no arquivo `server.js` nas variáveis `CLIENT_ID` e `CLIENT_SECRET`, **substituindo o uso de `process.env`**, mas isso não é recomendado em produção).*

### 3. Como Iniciar o Servidor

Após configurar as credenciais, ligue o servidor:

```bash
node server.js

