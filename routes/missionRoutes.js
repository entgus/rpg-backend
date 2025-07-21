const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CartazPublico = require('../models/CartazPublico');
const authMiddleware = require('../middlewares/authMiddleware');

// Listar todos os cartazes públicos
router.get('/cartazes-publicos', async (req, res) => {
  try {
    const cartazes = await CartazPublico.find().populate('userId', 'username');
    res.json(cartazes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cartazes públicos.' });
  }
});

// Criar novo cartaz público (autenticado)
router.post('/cartazes-publicos', authMiddleware, async (req, res) => {
  try {
    const { tipo, titulo, recompensa, descricao } = req.body;
    const userId = req.userId;

    if (!tipo || !titulo || !recompensa || !descricao) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (user.ficha.cartazesPontosDisponiveis < 1) {
      return res.status(400).json({ error: 'Pontos insuficientes para criar cartaz.' });
    }

    user.ficha.cartazesPontosDisponiveis -= 1;
    await user.save();

    const novoCartaz = new CartazPublico({
      userId,
      tipo,
      titulo,
      recompensa,
      descricao,
    });
    await novoCartaz.save();

    res.status(201).json(novoCartaz);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cartaz público.' });
  }
});

module.exports = router;
