// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- IMPORTANTE
require('dotenv').config();
const connectDB = require('./config/db'); // (Assumindo que tens isto)

const app = express();

// Conectar à base de dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// --- LINHA CRÍTICA PARA AS FOTOS FUNCIONAREM ---
// Isto torna a pasta 'uploads' pública na internet
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/dashboard'));
app.use('/api', require('./routes/admin'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/comunicados', require('./routes/comunicados')); // Vamos criar este

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));