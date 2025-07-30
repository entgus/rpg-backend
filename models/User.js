const mongoose = require('mongoose');

// Schema para cartas (habilidades ou itens)
const cartaSchema = new mongoose.Schema({
  nome: { type: String, default: '' },
  raridade: { type: String, default: 'Bronze' },
  imagem: { type: String, default: '' }, // Base64
  funcionalidade: { type: String, default: '' },
});

// Schema para paths (caminhos desbloqueáveis)
const pathSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nome: { type: String, default: '' },
  desbloqueado: { type: Boolean, default: false },
  descricao: { type: String, default: '' },
  nivel: { type: Number, default: 1 },
  coluna: { type: Number, default: 1 },
  filhos: [{ type: Number }],
});

// 📌 Schema das conexões entre os paths (linhas)
const connectionSchema = new mongoose.Schema({
  from: { type: Number, required: true },
  to: { type: Number, required: true },
  start: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  end: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
});

// Schema principal do usuário
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  passwordHash: String,

  ficha: {
    // ----------- Página 1 -----------
    nome: { type: String, default: '' },
    idade: { type: String, default: '' },
    classe: { type: String, default: '' },
    energiaZ: { type: String, default: '' },
    profissao: { type: String, default: '' },
    alinhamento: { type: String, default: '' },
    atributos: {
      força: { type: Number, default: 0 },
      agilidade: { type: Number, default: 0 },
      inteligência: { type: Number, default: 0 },
      vigor: { type: Number, default: 0 },
      carisma: { type: Number, default: 0 },
      sabedoria: { type: Number, default: 0 },
    },
    vida: { type: Number, default: 0 },
    ca: { type: Number, default: 0 },
    iniciativa: { type: Number, default: 0 },
    personalidade: { type: String, default: '' },
    imagem: { type: String, default: '' },
    titulos: { type: String, default: '' },
    pontos: { type: Number, default: 20 },

    // ----------- Página 2 -----------
    cartas: [cartaSchema],
    historico: { type: String, default: '' },
    aliados: { type: String, default: '' },
    notas: { type: String, default: '' },

    cartazesPontosDisponiveis: { type: Number, default: 0 },
    cartasPontosDisponiveis: { type: Number, default: 0 },

    // ----------- Sistema de paths -----------
    pathPoints: { type: Number, default: 0 },
    paths: [pathSchema],
    pathConnections: [connectionSchema],
  },
});

module.exports = mongoose.model('User', userSchema);
