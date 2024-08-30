const express = require('express');
const app = express();
const port = 3000;
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/laboratorio_bd')
require('dotenv').config();

console.log(process.env.DB_HOST);


app.get('/api/v1/', (req,res)=>{
    res.send("hello world");
});

app.listen(port,()=>{
    console.log(`aplicacion esta usando ${port}`);
});


try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
}

