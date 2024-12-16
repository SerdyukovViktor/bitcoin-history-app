// service.js
const axios = require('axios');
const Price = require('../Back/models/Price');
const dbConfig = require('../config/db');
const mongoose = dbConfig.mongoose;
const dbName = dbConfig.dbName;

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))

db.once('open', function() {
  console.log('Connected to MongoDB')
})


/**
 * Сохраняет текущую цену Bitcoin для каждой валюты в базе данных.
 * 
 * Эта функция получает текущую цену Bitcoin из API CoinDesk,
 * создает новый документ Price для каждой валюты и сохраняет его в базе данных.
 * 
 * @async
 * @function savePrice
 */
const savePrice = async () => {
  try {
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
    const data = response.data
    const timestamp = new Date()

    for(const currency in data.bpi) {
    const price = data.bpi[currency].rate_float
    const newPrice = new Price({ timestamp, price, currency })
    await newPrice.save()
    // console.log("Price saved");
    }
  } catch (error) {
    console.error(error)
  }
}
savePrice();
setInterval(savePrice, 60000)