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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/condominios', require('./routes/condominios')); 
app.use('/api/reunioes', require('./routes/reunioes'));
app.use('/api/comunicados', require('./routes/avisos'));
app.use('/api/pagamentos', require('./routes/pagamentos'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/documentos', require('./routes/documentos'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));