const mongoose = require('mongoose');

const CartazSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  titulo: { type: String, required: true },
  perigo: { type: String, required: true },
  recompensa: { type: String, required: true },
  descricao: { type: String, required: true }
});

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pontosCartaz: { type: Number, default: 0 },
  cartazes: [CartazSchema]
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
