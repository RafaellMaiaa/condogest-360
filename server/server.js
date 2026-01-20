require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// 1. Conectar BD
connectDB();

// 2. Middlewares
app.use(cors()); // Permite que o frontend fale com o backend
app.use(express.json()); // Permite ler JSON no body

// 3. Servir Imagens Estáticas (Crucial para as fotos aparecerem!)
// Quando o frontend pede http://localhost:5001/uploads/foto.jpg, este comando entrega o ficheiro.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Rotas
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/comunicados', require('./routes/avisos'));

// 5. Rota de Teste
app.get('/', (req, res) => {
    res.send('API CondoGest 360 a funcionar! 🚀');
});

// 6. Arrancar Servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));