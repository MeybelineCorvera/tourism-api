const express = require('express');
const router = express.Router();
const Ciudad = require('../models/Ciudad');
const Pais = require('../models/Pais');

router.get('/', async (req, res) => {
  const ciudades = await Ciudad.find().populate('paisId', 'nombre');
  res.json(ciudades);
});

// Ciudades por población menor a X
router.get('/poblacion/menor/:num', async (req, res) => {
  const num = Number(req.params.num);
  const ciudades = await Ciudad.find({ poblacion: { $lt: num } }).populate('paisId', 'nombre');
  res.json(ciudades);
});
// 🔍 Ciudades por id de país
router.get('/pais/:paisId', async (req, res) => {
  try {
    const ciudades = await Ciudad.find({ paisId: req.params.paisId })
      .populate('paisId', 'nombre poblacion');

    res.json(ciudades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
