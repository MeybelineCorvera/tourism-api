const express = require('express');
const router = express.Router();
const Pais = require('../models/Pais');
const { Types } = require('mongoose');

// Obtener todos los países
router.get('/', async (req, res) => {
  const paises = await Pais.find();
  res.json(paises);
});

// Países por población mayor a X
router.get('/poblacion/mayor/:num', async (req, res) => {
  const num = Number(req.params.num);
  const paises = await Pais.find({ poblacion: { $gt: num } });
  res.json(paises);
});

module.exports = router;
