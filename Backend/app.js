require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.SERVER_PORT ;

const { pool, sequelize } = require('./config/dataBaseConfig');

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

(async () => {
    try {
        console.log(sequelize); 
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


app.listen(port, () => {
    console.log(`La aplicación está usando el puerto ${port}`);
});













