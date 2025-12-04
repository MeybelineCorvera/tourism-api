const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    fecha: { type: Date, required: true },
    
    ciudadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ciudad', required: true },
    paisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pais', required: true },
    sitioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sitio', required: true },
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },

    descripcion: String
}, { timestamps: true, collection: 'eventos' });

module.exports = mongoose.model('Evento', eventoSchema);
