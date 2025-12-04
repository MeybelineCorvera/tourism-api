require('dotenv').config();
const conectarDB = require('../config/mongo');
const Pais = require('../models/Pais');
const Ciudad = require('../models/Ciudad');
const Categoria = require('../models/Categoria');
const Sitio = require('../models/Sitio');
const Evento = require('../models/Evento');
const Resena = require('../models/Resena');

const run = async () => {
  await conectarDB();

  // Limpiar colecciones
  await Promise.all([
    Pais.deleteMany({}),
    Ciudad.deleteMany({}),
    Categoria.deleteMany({}),
    Sitio.deleteMany({}),
    Evento.deleteMany({}),
    Resena.deleteMany({})
  ]);

  // Crear datos
  const sv = await Pais.create({ nombre: 'El Salvador', poblacion: 6500000 });
  const gt = await Pais.create({ nombre: 'Guatemala', poblacion: 17000000 });

  const ss = await Ciudad.create({ nombre: 'San Salvador', poblacion: 1200000, paisId: sv._id });
  const asa = await Ciudad.create({ nombre: 'Santa Ana', poblacion: 250000, paisId: sv._id });

  const catMuseo = await Categoria.create({ nombre: 'Museo' });
  const catPlaya = await Categoria.create({ nombre: 'Playa' });
  const catMontana = await Categoria.create({ nombre: 'Montaña' });

  const sitio1 = await Sitio.create({
    nombre: 'Museo Nacional',
    descripcion: 'Historia del país',
    categoriaId: catMuseo._id,
    ciudadId: ss._id,
    visitantes: 50000,
    servicios: ['Guías','Parqueo'],
    horario: '9:00-17:00',
    tarifa: 3
  });

  const sitio2 = await Sitio.create({
    nombre: 'Volcán de Santa Ana',
    descripcion: 'Cráter y vistas',
    categoriaId: catMontana._id,
    ciudadId: asa._id,
    visitantes: 80000,
    servicios: ['Guías'],
    horario: '6:00-18:00',
    tarifa: 0
  });

  await Resena.create({ puntuacion: 5, comentario: 'Excelente', fechaVisita: new Date('2025-01-10'), sitioId: sitio1._id });
  await Resena.create({ puntuacion: 4, comentario: 'Muy bueno', fechaVisita: new Date('2025-02-10'), sitioId: sitio2._id });

  await Evento.create({ nombre: 'Festival Cultural', descripcion: 'Fiestas Agosto', fecha: new Date('2025-08-05'), lugar: 'Centro', ciudadId: ss._id });

  console.log('Seed completado');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
