const { Pool } = require('pg');// Importar la librería pg
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  pool.end();
});