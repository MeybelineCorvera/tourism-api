const mongoose = require('mongoose');

const ciudadSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    paisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pais', required: true }
}, { timestamps: true,
    collection: 'ciudades'
 });

module.exports = mongoose.model('Ciudad', ciudadSchema);
