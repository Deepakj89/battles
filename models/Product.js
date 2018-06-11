var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  Name: String,
  Year: String,
  battle_number: Number,
  attacker_king: String,
  defender_king:String,
  attacker_1 :String,
Location:String,
region:String
});

/*
var ProductSchema = new mongoose.Schema({
  name: String,
  age: Number
});
*/
module.exports = mongoose.model('Product', ProductSchema,'battle');