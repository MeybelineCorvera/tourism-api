const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');

// Eventos entre fechas: /eventos/fechas?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
router.get('/fechas', async (req, res) => {
  const { inicio, fin } = req.query;
  const inicioDate = inicio ? new Date(inicio) : new Date('1900-01-01');
  const finDate = fin ? new Date(fin) : new Date();
  const eventos = await Evento.find({ fecha: { $gte: inicioDate, $lte: finDate } }).populate('ciudadId', 'nombre');
  res.json(eventos);
});

// Obtener todos
router.get('/', async (req, res) => {
  const eventos = await Evento.find().populate('ciudadId', 'nombre');
  res.json(eventos);
});

// Obtener eventos por sitioId
router.get('/sitio/:id', async (req, res) => {
    try {
        const eventos = await Evento.find({ sitioId: req.params.id });
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Obtener eventos por categoría
router.get('/categoria/:idCategoria', async (req, res) => {
  try {
    const { idCategoria } = req.params;

    const eventos = await Evento.find({ categoriaId: idCategoria })
      .populate('sitioId', 'nombre')
      .populate('categoriaId', 'nombre');

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
