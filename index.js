require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const missionRoutes = require('./routes/missionRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado com sucesso!'))
    .catch((err) => console.error('❌ Erro ao conectar MongoDB:', err));

app.use('/api/users', userRoutes);
app.use('/api', missionRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));