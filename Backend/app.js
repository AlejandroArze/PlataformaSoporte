// Carga las variables de entorno desde el archivo .env (si existe)
require('dotenv').config();
const { sequelize } = require('./models'); // O el archivo donde configuras la conexión
const cors = require('cors');
const express = require('express');
const morgan = require("morgan"); // Middleware para registrar solicitudes HTTP
const router = require('./router/router'); // Importa el enrutador con las rutas de la API
const axios = require('axios');

const qs = require('qs'); // Para serializar los datos
// Crea una instancia de la aplicación Express
const app = express();
const request = require('request');

// Middleware
app.use(morgan("dev")); // Log de cada solicitud HTTP
app.use(express.json()); // Analizar el cuerpo de las solicitudes JSON
app.use(cors()); // Configuración CORS, puedes personalizarlo según los orígenes permitidos
app.use(express.urlencoded({ extended: true })); // Si necesitas leer datos del body en POST

// Obtén el puerto de la variable de entorno o usa 3001 por defecto
const port = process.env.APP_PORT || 3001;

// Ruta raíz para verificar que el servidor esté funcionando
app.get("/", (req, res) => {
    res.send("This is Express");
});

// Usa el enrutador para todas las rutas que comienzan con '/api/v1'
app.use("/api/v1", router);

app.get('/api/bienes', async (req, res) => {
    try {
      const codigo = req.query.codigo; // Obtener el código de los parámetros de la consulta
  console.log("Codigo",codigo);
      // Realizar la solicitud POST al servidor externo
    const response = await axios.post('https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php', {
        cod_bienes: codigo  // Enviar el código de bienes en el cuerpo de la solicitud
      });
      console.log("data",response);
      // Devolver la respuesta a tu frontend
      res.json(response.data);
    } catch (error) {
      console.error('Error al obtener los bienes:', error);
      res.status(500).json({ error: 'Error al consultar los bienes' });
    }
  });

  app.post('/api/proxy', async (req, res) => {
    try {
      const data = qs.stringify(req.body); // Convierte a x-www-form-urlencoded
  
      const response = await axios.post(
        'https://appgamc.cochabamba.bo/transparencia/servicio/ws-consulta-bienes.php',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.post('/api/empleados', async (req, res) => {
    try {
      const data = qs.stringify(req.body); // Convierte a x-www-form-urlencoded
  
      const response = await axios.post(
        'https://appgamc.cochabamba.bo/transparencia/servicio/buscar-empleados.php',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  

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
