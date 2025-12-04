const { Schema, model } = require('mongoose');

const PaisSchema = new Schema({
  nombre: { type: String, required: true },
  poblacion: { type: Number, default: 0 }
}, { timestamps: true,
  collection: 'paises' 
 });

module.exports = model('Pais', PaisSchema);
