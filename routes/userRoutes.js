const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registrar usuário
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Email já cadastrado.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Senha incorreta.' });

    const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      ficha: user.ficha || {},
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Atualizar ficha (salvar ficha no usuário correto)
router.put('/updateFicha', async (req, res) => {
  const { email, ficha } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    user.ficha = { ...user.ficha.toObject(), ...ficha };

    await user.save();

    res.json({ message: 'Ficha atualizada!', ficha: user.ficha });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar ficha.' });
  }
});

// Pegar pontos disponíveis para criar cartas
router.get('/ficha/cartas-pontos', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({ pontosDisponiveis: user.ficha.cartasPontosDisponiveis || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Gastar ponto para carta
router.put('/ficha/gastar-ponto-carta', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (user.ficha.cartasPontosDisponiveis <= 0) {
      return res.status(400).json({ error: 'Você não possui pontos disponíveis para criar cartas.' });
    }

    user.ficha.cartasPontosDisponiveis -= 1;
    await user.save();

    return res.json({ pontosRestantes: user.ficha.cartasPontosDisponiveis });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ------------------ ROTAS NOVAS PARA PATHS ------------------

// Pegar pontos disponíveis do path
router.get('/ficha/path-points', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({ pathPoints: user.ficha.pathPoints || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Pegar os paths atuais
router.get('/ficha/paths', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({ paths: user.ficha.paths || [] });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Gastar ponto de path
router.put('/ficha/gastar-ponto-path', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if ((user.ficha.pathPoints || 0) <= 0) {
      return res.status(400).json({ error: 'Você não possui pontos de path disponíveis.' });
    }

    user.ficha.pathPoints -= 1;
    await user.save();

    return res.json({ pontosRestantes: user.ficha.pathPoints });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Atualizar paths do usuário (ex: desbloquear ou modificar)
router.put('/ficha/update-paths', async (req, res) => {
  try {
    const { email, paths } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    user.ficha.paths = paths;  // Substitui os paths atuais
    await user.save();

    return res.json({ message: 'Paths atualizados!', paths: user.ficha.paths });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

module.exports = router;
