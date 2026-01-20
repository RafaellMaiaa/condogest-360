require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// AS TUAS ROTAS
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/condominios', require('./routes/condominios')); // <--- ESTA É CRÍTICA
app.use('/api/reunioes', require('./routes/reunioes'));
app.use('/api/comunicados', require('./routes/avisos'));
app.use('/api/pagamentos', require('./routes/pagamentos'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));