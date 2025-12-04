const { Schema, model, Types } = require('mongoose');

const ResenaSchema = new Schema({
  puntuacion: { type: Number, min: 1, max: 5 },
  comentario: String,
  fechaVisita: Date,
  sitioId: { type: Types.ObjectId, ref: 'Sitio', required: true }
}, { timestamps: true,
  collection: 'resenas'
 });

module.exports = model('Resena', ResenaSchema);
