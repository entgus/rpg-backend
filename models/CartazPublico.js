const mongoose = require('mongoose');

const cartazPublicoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, required: true },
  titulo: { type: String, required: true },
  recompensa: { type: String, required: true },
  descricao: { type: String, required: true },
});

module.exports = mongoose.model('CartazPublico', cartazPublicoSchema);
