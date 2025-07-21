const mongoose = require('mongoose');

const cartaSchema = new mongoose.Schema({
  nome: { type: String, default: '' },
  raridade: { type: String, default: 'Bronze' },
  imagem: { type: String, default: '' }, // Base64
  funcionalidade: { type: String, default: '' },
});

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

  },
});

module.exports = mongoose.model('User', userSchema);
