const express = require('express');
const router = express.Router();
const Sitio = require('../models/Sitio');
const Categoria = require('../models/Categoria');
const Ciudad = require('../models/Ciudad');
const mongoose = require('mongoose');

// Filtrar por categoria AND ciudad
// /sitios/filtrar?categoriaId=...&ciudadId=...
router.get('/filtrar', async (req, res) => {
  const { categoriaId, ciudadId } = req.query;
  const filtros = {};
  if (categoriaId) filtros.categoriaId = categoriaId;
  if (ciudadId) filtros.ciudadId = ciudadId;
  const sitios = await Sitio.find(filtros).populate('categoriaId', 'nombre').populate('ciudadId', 'nombre');
  res.json(sitios);
});

// Sitios por múltiples categorias (ids comma separated)
router.get('/categorias', async (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean).map(id => mongoose.Types.ObjectId(id));
  const sitios = await Sitio.find({ categoriaId: { $in: ids } }).populate('categoriaId', 'nombre').populate('ciudadId', 'nombre');
  res.json(sitios);
});

// Proyectar campos (nombre, pais, categoria)
router.get('/proyectar', async (req, res) => {
  const sitios = await Sitio.find({}, { nombre: 1, servicios: 1, ciudadId: 1, categoriaId: 1 })
    .populate('ciudadId', 'nombre paisId')
    .populate('categoriaId', 'nombre');
  res.json(sitios);
});

// Ordenar por visitantes
router.get('/orden/visitantes', async (req, res) => {
  const sitios = await Sitio.find().sort({ visitantes: -1 }).limit(100).populate('categoriaId', 'nombre').populate('ciudadId', 'nombre');
  res.json(sitios);
});

// Conteo sitios por ciudad (group + count)
router.get('/conteo/ciudades', async (req, res) => {
  const datos = await Sitio.aggregate([
    { $group: { _id: '$ciudadId', total: { $sum: 1 } } }
  ]);
  res.json(datos);
});

// Top sitio por pais (sort + limit) -> uses lookup to join ciudad -> paisId
router.get('/top/:paisId', async (req, res) => {
  const paisId = mongoose.Types.ObjectId(req.params.paisId);
  const data = await Sitio.aggregate([
    { $lookup: { from: 'ciudades', localField: 'ciudadId', foreignField: '_id', as: 'ciudad' } },
    { $unwind: '$ciudad' },
    { $match: { 'ciudad.paisId': paisId } },
    { $sort: { visitantes: -1 } },
    { $limit: 1 }
  ]);
  res.json(data[0] || null);
});
// Obtener todos los sitios turísticos
router.get('/', async (req, res) => {
  try {
    const sitios = await Sitio.find()
      .populate('categoriaId', 'nombre')
      .populate('ciudadId', 'nombre');

    res.json(sitios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ciudad/:idCiudad', async (req, res) => {
  try {
    const { idCiudad } = req.params;

    const sitios = await Sitio.find({ ciudadId: idCiudad })
      .populate('categoriaId', 'nombre')
      .populate('ciudadId', 'nombre');

    res.json(sitios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener sitios por categoría
router.get('/categoria/:idCategoria', async (req, res) => {
  try {
    const { idCategoria } = req.params;

    const sitios = await Sitio.find({ categoriaId: idCategoria })
      .populate('categoriaId', 'nombre')
      .populate('ciudadId', 'nombre');

    res.json(sitios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar sitios por texto (nombre o descripción)
router.get('/buscar', async (req, res) => {
    try {
        const texto = req.query.texto;

        if (!texto) {
            return res.status(400).json({ error: "Debes enviar ?texto=" });
        }

        const sitios = await Sitio.find({
            $or: [
                { nombre: { $regex: texto, $options: 'i' } },
                { descripcion: { $regex: texto, $options: 'i' } }
            ]
        }).populate('categoriaId ciudadId');

        res.json(sitios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
