var mongoose = require('mongoose');
var express = require('express');
var app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/battles')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
var products = require('./routes/products');
app.use('/products', products);
app.listen(8018);

