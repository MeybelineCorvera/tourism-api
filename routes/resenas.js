const express = require('express');
const router = express.Router();
const Resena = require('../models/Resena');

router.get('/', async (req, res) => {
  const resenas = await Resena.find().populate('sitioId', 'nombre');
  res.json(resenas);
});

// Obtener reseñas por sitio
router.get('/sitio/:id', async (req, res) => {
    try {
        const resenas = await Resena.find({ sitioId: req.params.id })
            .populate('sitioId', 'nombre');
        res.json(resenas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
