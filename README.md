# CondoGest 360

O **CondoGest 360** é uma plataforma web completa para a gestão de condomínios, concebida para facilitar a comunicação e a administração entre condóminos e a administração. O sistema oferece funcionalidades para gestão de pagamentos, abertura de tickets de suporte, agendamento de reuniões e publicação de comunicados.

## 📋 Funcionalidades

O projeto está dividido em dois módulos principais: o Cliente (Frontend) e o Servidor (Backend).

### Funcionalidades Gerais
* **Autenticação e Autorização:** Sistema de login e registo seguro para utilizadores e administradores.
* **Dashboards:**
    * **Painel do Condómino:** Visão geral das suas informações, pagamentos pendentes e tickets.
    * **Painel de Administração:** Gestão centralizada de todo o condomínio.

### Gestão de Condomínio
* **Pagamentos:** Visualização e controlo de pagamentos de quotas (comprovativos, estados de pagamento).
* **Tickets (Ocorrências):** Sistema para reportar avarias ou problemas, com acompanhamento do estado (aberto, em resolução, fechado).
* **Reuniões:** Agendamento e consulta de assembleias ou reuniões de condomínio.
* **Comunicados/Avisos:** Publicação de informações importantes para todos os moradores.
* **Gestão de Documentos:** Upload e gestão de ficheiros relacionados com o condomínio.

## 🚀 Tecnologias Utilizadas

### Frontend (Client)
* **React:** Biblioteca JavaScript para construção da interface de utilizador.
* **Vite:** Ferramenta de build rápida e leve.
* **Tailwind CSS:** Framework de CSS utilitário para estilização rápida e responsiva.
* **React Router DOM:** Gestão de rotas e navegação da SPA.
* **Axios:** Cliente HTTP para comunicação com a API.
* **Lucide React:** Conjunto de ícones.
* **Recharts:** Biblioteca para criação de gráficos.

### Backend (Server)
* **Node.js & Express:** Ambiente de execução e framework para a API RESTful.
* **MongoDB & Mongoose:** Base de dados NoSQL e ODM para modelação de dados.
* **JWT (JSON Web Tokens):** Para autenticação segura e gestão de sessões.
* **Bcrypt.js:** Para hashing seguro de palavras-passe.
* **Multer:** Middleware para gestão de upload de ficheiros.
* **Cors:** Middleware para permitir requisições de diferentes origens.

## ⚙️ Pré-requisitos

Antes de começar, garante que tens instalado na tua máquina:
* [Node.js](https://nodejs.org/) (versão 14 ou superior recomendada)
* [MongoDB](https://www.mongodb.com/) (localmente ou uma string de conexão Atlas)
* [Git](https://git-scm.com/)

## 🔧 Instalação e Execução

### 1. Clonar o repositório

```bash
git clone [https://github.com/RafaellMaiaa/condogest-360.git](https://github.com/RafaellMaiaa/condogest-360.git)
cd condogest-360
2. Configurar o Backend (Server)
Navega até à pasta do servidor, instala as dependências e configura as variáveis de ambiente.

Bash

cd server
npm install
Cria um ficheiro .env na raiz da pasta server com as seguintes variáveis:

Fragmento do código

PORT=5000
MONGO_URI=mongodb://localhost:27017/condogest360
JWT_SECRET=a_tua_chave_secreta_super_segura
Para iniciar o servidor:

Bash

# Modo de desenvolvimento
npm run dev

# Ou modo de produção
npm start
3. Configurar o Frontend (Client)
Abre um novo terminal, navega até à pasta do cliente e instala as dependências.

Bash

cd client
npm install
Para iniciar a aplicação frontend:

Bash

npm run dev