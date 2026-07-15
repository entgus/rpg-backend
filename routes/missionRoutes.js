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
// Criar novo cartaz público (autenticado)
router.post('/cartazes-publicos', authMiddleware, async (req, res) => {
  try {
    console.log("1 - Entrou na rota");

    const { tipo, titulo, recompensa, descricao } = req.body;
    console.log("2 - Body:", req.body);

    const userId = req.userId;
    console.log("3 - userId:", userId);

    if (!tipo || !titulo || !recompensa || !descricao) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    console.log("4 - Procurando usuário...");
    const user = await User.findById(userId);

    console.log("5 - Usuário encontrado:", user);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    console.log("6 - Ficha:", user.ficha);
    console.log("7 - Pontos:", user.ficha.cartazesPontosDisponiveis);

    if (user.ficha.cartazesPontosDisponiveis < 1) {
      return res.status(400).json({
        error: 'Pontos insuficientes para criar cartaz.'
      });
    }

    user.ficha.cartazesPontosDisponiveis -= 1;

    console.log("8 - Salvando usuário...");
    await user.save();

    console.log("9 - Usuário salvo");

    const novoCartaz = new CartazPublico({
      userId,
      tipo,
      titulo,
      recompensa,
      descricao,
    });

    console.log("10 - Salvando cartaz...");
    await novoCartaz.save();

    console.log("11 - Cartaz salvo");

    res.status(201).json(novoCartaz);

  } catch (error) {
    console.error("===== ERRO AO CRIAR CARTAZ =====");
    console.error(error);

    res.status(500).json({
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }
});

module.exports = router;
