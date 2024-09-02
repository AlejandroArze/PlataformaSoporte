require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3001; // Asegúrate de que SERVER_PORT está definido o usa un valor por defecto
const { Sequelize } = require('sequelize');

// Inicialización de Sequelize
const sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Importar el pool de conexiones
const pool = require('./config/dataBaseConfig');

app.get('/api/v1/', (req, res) => {
    pool.query('SELECT NOW()', (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const currentTime = result.rows[0].now;
        console.log(`La fecha y hora actual es ${currentTime}`);
        res.send(`La fecha y hora actual es: ${currentTime}`);
    });
});

app.listen(port, () => {
    console.log(`La aplicación está usando el puerto ${port}`);
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
