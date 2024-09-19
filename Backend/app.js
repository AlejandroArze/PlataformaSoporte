// Carga las variables de entorno desde el archivo .env (si existe)
require('dotenv').config();
const { sequelize } = require('./models'); // O el archivo donde configuras la conexión


const express = require('express');

// Importa el módulo morgan, un middleware para registrar solicitudes HTTP para depuración
const morgan = require("morgan");

// Importa el enrutador que contiene las rutas de la API
const router = require('./router/router');

// Crea una instancia de la aplicación Express
const app = express();

// Utiliza el middleware de morgan para registrar cada solicitud HTTP en la consola, en formato 'dev'
app.use(morgan("dev"));

// Middleware para analizar el cuerpo de las solicitudes HTTP con formato JSON y asignarlo a req.body
app.use(express.json());

// Obtiene el puerto del servidor desde la variable de entorno SERVER_PORT definida en el archivo .env
const port = process.env.SERVER_PORT;

// Importa la configuración de la base de datos: `pool` para conexiones comunes y `sequelize` para ORM
//const { pool, sequelize } = require('./config/dataBaseConfig');

// Ruta raíz para verificar que el servidor esté funcionando
app.get("/", (req, res) => {
    // Envía una respuesta simple al acceder a la ruta raíz
    res.send("This is Express");
});

// Utiliza el enrutador para todas las rutas que comienzan con '/api/v1' para la organización de las rutas de la API
app.use("/api/v1", router);

// Inicia el servidor en el puerto especificado y muestra un mensaje en la consola indicando que está en funcionamiento
app.listen(port, () => {
    console.log(`Aplicación está corriendo en el puerto ${port}`);
});


// Intento de autenticación con la base de datos utilizando Sequelize ORM
try {
    // Intenta autenticar la conexión con la base de datos
    sequelize.authenticate();
    console.log('Conexión establecida correctamente con la base de datos.');
} catch (error) {
    // Si falla la conexión, imprime un error en la consola
    console.error('No se puede conectar a la base de datos:', error);
}

// Exporta la aplicación Express para que otros archivos puedan usarla (como tests o scripts adicionales)
module.exports = app;
