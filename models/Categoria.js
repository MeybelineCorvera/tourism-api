const { Schema, model } = require('mongoose');

const CategoriaSchema = new Schema({
  nombre: { type: String, required: true }
}, { timestamps: true,
  collection: 'categorias'
 });

module.exports = model('Categoria', CategoriaSchema);
