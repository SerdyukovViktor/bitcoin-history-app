const express = require('express')
const axios = require('axios')
const dbConfig = require('../config/db');
const mongoose = dbConfig.mongoose;
const Price = require('../Back/models/Price');

const app = express()
const port = 3001

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))

db.once('open', function() {
  console.log('Connected to MongoDB')
})

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

app.get('/api/prices', async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  
  // console.log(`Запрос данных из БД: ${startDate} - ${endDate}`);
  const prices = await Price.find( {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  // console.log("prices", prices);
  res.json(prices);
})
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})