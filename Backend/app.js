// Carga las variables de entorno desde el archivo .env (si existe)
require('dotenv').config();
const { sequelize } = require('./models'); // O el archivo donde configuras la conexión
const cors = require('cors');
const express = require('express');
const morgan = require("morgan"); // Middleware para registrar solicitudes HTTP
const router = require('./router/router'); // Importa el enrutador con las rutas de la API

// Crea una instancia de la aplicación Express
const app = express();

// Middleware
app.use(morgan("dev")); // Log de cada solicitud HTTP
app.use(express.json()); // Analizar el cuerpo de las solicitudes JSON
app.use(cors()); // Configuración CORS, puedes personalizarlo según los orígenes permitidos

// Obtén el puerto de la variable de entorno o usa 3001 por defecto
const port = process.env.APP_PORT || 3001;

// Ruta raíz para verificar que el servidor esté funcionando
app.get("/", (req, res) => {
    res.send("This is Express");
});

// Usa el enrutador para todas las rutas que comienzan con '/api/v1'
app.use("/api/v1", router);

// Intenta conectar a la base de datos usando Sequelize ORM
sequelize.authenticate()
    .then(() => {
        console.log('Conexión establecida correctamente con la base de datos.');
    })
    .catch((error) => {
        console.error('No se puede conectar a la base de datos:', error);
    });

// Inicia el servidor en el puerto especificado
app.listen(port, '0.0.0.0', () => {
    console.log(`Aplicación está corriendo en el puerto ${port}`);
});



// Exporta la aplicación para que otros archivos puedan usarla
module.exports = app;
