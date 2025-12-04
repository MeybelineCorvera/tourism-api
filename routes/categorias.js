const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');

router.get('/', async (req, res) => {
  const categorias = await Categoria.find();
  res.json(categorias);
});

module.exports = router;
