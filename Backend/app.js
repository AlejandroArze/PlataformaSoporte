require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.SERVER_PORT ;

const { pool, sequelize } = require('./config/dataBaseConfig');


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

