// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const conectarDB = require('./config/mongo');

// Rutas individuales CRUD
const paisesRoutes = require('./routes/paises');
const ciudadesRoutes = require('./routes/ciudades');
const categoriasRoutes = require('./routes/categorias');
const sitiosRoutes = require('./routes/sitios');
const eventosRoutes = require('./routes/eventos');
const resenasRoutes = require('./routes/resenas');

// Rutas de consultas del ING
const queriesRoutes = require('./routes/queries');

const app = express();
app.use(express.json());

// Conectar DB
conectarDB();

// Rutas CRUD
app.use('/api/paises', paisesRoutes);
app.use('/api/ciudades', ciudadesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/sitios', sitiosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/resenas', resenasRoutes);
 
// Rutas de consultas (ORGANIZADO)
app.use('/api/queries', queriesRoutes);

// Ruta base de prueba
app.get('/', (req, res) => res.send('API Turismo funcionando'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en puerto', PORT));
