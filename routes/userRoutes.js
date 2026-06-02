const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

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
    role: user.role,
  },

  ficha: user.ficha || {},
});
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Atualizar ficha (não requer token pois é pelo email, pode melhorar depois)
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

// Pontos para cartas
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

// Gastar ponto para carta - exige autenticação
async function gastarPontoCartaHandler(req, res) {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);

    if (!user.ficha || (user.ficha.pontosCartas || user.ficha.cartasPontosDisponiveis || 0) <= 0) {
      return res.status(400).json({ message: "Sem pontos de carta disponíveis." });
    }

    if (user.ficha.pontosCartas !== undefined) {
      user.ficha.pontosCartas -= 1;
    } else if (user.ficha.cartasPontosDisponiveis !== undefined) {
      user.ficha.cartasPontosDisponiveis -= 1;
    }

    await user.save();

    res.json({ message: "Carta adquirida com sucesso!", pontosCartas: user.ficha.pontosCartas || user.ficha.cartasPontosDisponiveis });
  } catch (error) {
    res.status(500).json({ message: "Erro ao gastar ponto de carta." });
  }
}

router.post("/ficha/gastar-ponto-carta", authenticateToken, gastarPontoCartaHandler);
router.put("/ficha/gastar-ponto-carta", authenticateToken, gastarPontoCartaHandler);

// ------------ PATHS ------------

// Pontos disponíveis para paths (via email, sem token)
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

// Obter paths
router.get('/ficha/paths', async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      paths: user.ficha.paths || [],
      connections: user.ficha.connections || [] // 🔥 ESSENCIAL
    });

  } catch (error) {
    console.error(error);
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

// Atualizar paths
router.put("/ficha/update-paths", authenticateToken, async (req, res) => {
  try {

    console.log("BODY:", req.body);

    const { email, paths, connections } = req.body;

    const currentUser = await User.findById(req.user.id);

if (
  currentUser.role !== "master" &&
  currentUser.email !== email
) {
  return res.status(403).json({
    error: "Sem permissão",
  });
}

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // 🔥 SALVA TUDO DE FORMA SEGURA
    user.ficha.paths = Array.isArray(paths) ? paths : [];
    user.ficha.connections = Array.isArray(connections) ? connections : [];

    await user.save();

    return res.json({
      ok: true,
      paths: user.ficha.paths,
      connections: user.ficha.connections,
    });

  } catch (err) {
    console.error("Erro update-paths:", err);
    return res.status(500).json({ error: "Erro ao salvar paths" });
  }
});
// ------------ CONEXÕES ENTRE PATHS ------------

// Salvar conexões entre paths - com autenticação
router.put('/ficha/salvar-conexoes', authenticateToken, async (req, res) => {
  try {
    const { pathConnections } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    user.ficha.pathConnections = pathConnections || [];
    await user.save();

    res.json({ message: 'Conexões salvas com sucesso!', pathConnections: user.ficha.pathConnections });
  } catch (error) {
    console.error('Erro ao salvar conexões:', error);
    res.status(500).json({ error: 'Erro ao salvar conexões entre paths.' });
  }
});

// Obter conexões entre paths - com autenticação
router.get('/ficha/conexoes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    res.json({ pathConnections: user.ficha.pathConnections || [] });
  } catch (error) {
    console.error('Erro ao buscar conexões:', error);
    res.status(500).json({ error: 'Erro ao buscar conexões entre paths.' });
  }
});

router.get("/players", authenticateToken, async (req, res) => {
  try {

    // pega usuário logado
    const currentUser = await User.findById(req.user.id);

    // verifica se é mestre
    if (currentUser.role !== "master") {
      return res.status(403).json({
        error: "Sem permissão",
      });
    }

    // busca todos os players
    const users = await User.find(
      {},
      "username email role"
    );

    res.json(users);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar players",
    });
  }
});

module.exports = router;
