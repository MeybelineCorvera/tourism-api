const mongoose = require('mongoose');

const sitioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
    ciudadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudad', required: true },
    descripcion: String
}, { timestamps: true,
    collection: 'sitios'
 });

module.exports = mongoose.model('Sitio', sitioSchema);
