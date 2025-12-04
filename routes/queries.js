// tourism-api/routes/queries.js
const express = require('express');
const router = express.Router();

const Pais = require('../models/Pais');
const Ciudad = require('../models/Ciudad');
const Categoria = require('../models/Categoria');
const Sitio = require('../models/Sitio');
const Evento = require('../models/Evento');

/* ============================================================
1) Buscar países o ciudades por población (gt / lt)
   GET /api/population?type=pais|ciudad&op=gt|lt&value=100000
============================================================ */
router.get('/population', async (req, res) => {
  try {
    const { type = 'pais', op = 'gt', value } = req.query;
    if (!value) return res.status(400).json({ error: 'value es requerido' });

    const num = Number(value);
    const operador = op === 'lt' ? { $lt: num } : { $gt: num };
    const Model = type === 'ciudad' ? Ciudad : Pais;

    const data = await Model.find({ poblacion: operador });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
2) Buscar sitios turísticos filtrando por categoría + ciudad
   GET /api/sitios/filter?categoriaId=&ciudadId=
============================================================ */
router.get('/sitios/filter', async (req, res) => {
  try {
    const { categoriaId, ciudadId } = req.query;

    const filtros = {};
    if (categoriaId) filtros.categoriaId = categoriaId;
    if (ciudadId) filtros.ciudadId = ciudadId;

    const sitios = await Sitio.find(filtros)
      .populate('categoriaId', 'nombre')
      .populate('ciudadId', 'nombre');

    res.json(sitios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
3) Eventos por rango de fechas
   GET /api/eventos/dates?from=YYYY-MM-DD&to=YYYY-MM-DD
============================================================ */
router.get('/eventos/dates', async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = {};

    if (from || to) q.fecha = {};
    if (from) q.fecha.$gte = new Date(from);
    if (to) q.fecha.$lte = new Date(to);

    const eventos = await Evento.find(q).populate('ciudadId', 'nombre');
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
4) Sitios por múltiples categorías (IN)
   GET /api/sitios/by-categories?categoriaIds=cat1,cat2
============================================================ */
router.get('/sitios/by-categories', async (req, res) => {
  try {
    const { categoriaIds } = req.query;
    if (!categoriaIds) return res.status(400).json({ error: 'categoriaIds requerido' });

    const ids = categoriaIds.split(',');

    const sitios = await Sitio.find({
      categoriaId: { $in: ids }
    }).populate('categoriaId', 'nombre');

    res.json(sitios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
5) Excluir países que tengan sitios de una categoría
   GET /api/paises/exclude-category?categoriaId=
============================================================ */
router.get('/paises/exclude-category', async (req, res) => {
  try {
    const { categoriaId } = req.query;
    if (!categoriaId) return res.status(400).json({ error: 'categoriaId requerido' });

    const ciudadesConCat = await Sitio.distinct('ciudadId', {
      categoriaId: categoriaId
    });

    const ciudadesDocs = await Ciudad.find({
      _id: { $in: ciudadesConCat }
    });

    const paisIds = ciudadesDocs.map(c => c.paisId);

    const paises = await Pais.find({
      _id: { $nin: paisIds }
    });

    res.json(paises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
6) Project solo nombre, país y categoría 
   GET /api/sitios/project?ciudadName=
============================================================ */

router.get('/sitios/project', async (req, res) => {
  try {
    const { ciudadName } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: "ciudades",
          localField: "ciudadId",
          foreignField: "_id",
          as: "ciudad"
        }
      },
      { $unwind: "$ciudad" },

      {
        $lookup: {
          from: "pais",
          localField: "ciudad.paisId",
          foreignField: "_id",
          as: "pais"
        }
      },
      { $unwind: "$pais" }
    ];

    // Filtro por ciudad opcional
    if (ciudadName) {
      pipeline.push({
        $match: { "ciudad.nombre": ciudadName }
      });
    }

    // PROJECT
    pipeline.push({
      $project: {
        _id: 0,
        nombre: 1,
        categoria: 1,
        pais: "$pais.nombre"
      }
    });

    const results = await Sitio.aggregate(pipeline);
    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* ============================================================
7) Ordenar sitios por número de visitantes
   GET /api/sitios/sort?order=asc|desc
============================================================ */
router.get('/sitios/sort', async (req, res) => {
  try {
    const { order = 'desc' } = req.query;
    const val = order === 'asc' ? 1 : -1;

    const sitios = await Sitio.find().sort({ visitantes: val });
    res.json(sitios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
8) Conteo de sitios por país
   GET /api/sitios/count-by-country
============================================================ */
router.get('/sitios/count-by-country', async (req, res) => {
  try {
    const data = await Sitio.aggregate([
      {
        $lookup: {
          from: 'ciudades',
          localField: 'ciudadId',
          foreignField: '_id',
          as: 'ciudad'
        }
      },
      { $unwind: '$ciudad' },
      {
        $group: {
          _id: '$ciudad.paisId',
          totalSitios: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
9) Detalles completos de eventos
   GET /api/eventos/details
============================================================ */
router.get("/eventos/project", async (req, res) => {
  try {
    const results = await Evento.aggregate([
      // Unir con ciudad
      {
        $lookup: {
          from: "ciudads",
          localField: "ciudadId",
          foreignField: "_id",
          as: "ciudad"
        }
      },
      { $unwind: "$ciudad" },

      // Unir con país
      {
        $lookup: {
          from: "pais",
          localField: "paisId",
          foreignField: "_id",
          as: "pais"
        }
      },
      { $unwind: "$pais" },

      // Unir con sitio turístico
      {
        $lookup: {
          from: "sitios",
          localField: "sitioId",
          foreignField: "_id",
          as: "sitio"
        }
      },
      { $unwind: "$sitio" },

      // Proyección final
      {
        $project: {
          _id: 0,
          nombre: 1,
          fecha: 1,
          descripcion: 1,
          lugar: 1,
          ciudad: {
            nombre: "$ciudad.nombre",
            poblacion: "$ciudad.poblacion"
          },
          pais: {
            nombre: "$pais.nombre",
            continente: "$pais.continente"
          },
          sitioTuristico: {
            nombre: "$sitio.nombre",
            categoria: "$sitio.categoria",
            visitantes: "$sitio.visitantes"
          }
        }
      }
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================
10) Sitio más visitado por país
   GET /api/sitios/top?paisName=
============================================================ */
router.get('/sitios/top', async (req, res) => {
  try {
    const { paisName } = req.query;
    if (!paisName) return res.status(400).json({ error: 'paisName requerido' });

    const pais = await Pais.findOne({ nombre: paisName });
    if (!pais) return res.status(404).json({ error: 'país no encontrado' });

    const result = await Sitio.aggregate([
      {
        $lookup: {
          from: 'ciudades',
          localField: 'ciudadId',
          foreignField: '_id',
          as: 'ciudad'
        }
      },
      { $unwind: '$ciudad' },
      { $match: { 'ciudad.paisId': pais._id } },  // ← FIX
      { $sort: { visitantes: -1 } },
      { $limit: 1 }
    ]);

    res.json(result[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
