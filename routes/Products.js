var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Product = require('../models/Product.js');
var async =require('async');
var _=require('underscore');

/* GET ALL PRODUCTS */
router.get('/list', function(req, res, next) {
  Product.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  }).select('location region');
});

/* GET count PRODUCT */
router.get('/count', function(req, res, next) {
  Product.count({}, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.get('/stat', function(req, res, next) {

async.auto({
  task1: function(callback) {
      //Do some operations
      var output={};
      Product.aggregate([
        {"$group" : {_id:"$attacker_outcome", count:{$sum:1}}},{ "$sort": { "count": -1 } }
    ],function (err, post) {
      if (err) return next(err);
      _.map(post,function(val){
          if(val._id=="win")
          {
            output['win']=val.count;
          }
          if(val._id=="loss")
          {
            output['loss']=val.count;
          }       
      });
      callback(null,output);
    });
  },
  task2: function(callback) {
    //Do some operations
    var output={};
    Product.aggregate([{"$group":{_id:"$attacker_king", count:{$sum:1}}},{ "$sort": { "count": -1 } },{ "$limit": 1 }],function (err, post) {
      if (err) return next(err);
     output['attacker_king']=post[0]._id;
     Product.aggregate([{"$group":{_id:"$defender_king", count:{$sum:1}}},{ "$sort": { "count": -1 } },{ "$limit": 1 }],function (err, post) {
      if (err) return next(err);
     // console.log(post);
     // agg.push(post);
     output['defender_king']=post[0]._id;
     Product.aggregate([{"$group":{_id:"$region", count:{$sum:1}}},{ "$sort": { "count": -1 } },{ "$limit": 1 }],function (err, post) {
      if (err) return next(err);
     // console.log(post);
     output['region']=post[0]._id;
     Product.aggregate([{"$group":{_id:"$name", count:{$sum:1}}},{ "$sort": { "count": -1 } },{ "$limit": 1 }],function (err, post) {
      if (err) return next(err);
      output['name']=post[0]._id;
      callback(null,output);
      });
      });
      });
    });
    
   
    
},
task3: function(callback) {
  var output={};
  Product.aggregate([{"$group":{_id:null,min:{ "$min": "$defender_size" }}}],function (err, post) {
   output['min']=post[0].min;
    Product.findOne({'defender_size': { "$nin": [ null, "" ] }}).sort('-defender_size').exec(function (err, post) {
      post=JSON.parse(JSON.stringify(post));
      output['max']=post.defender_size;
      Product.aggregate([{"$group":{_id:null,avg:{ "$avg": "$defender_size" }}}],function (err, post) {
        output['avg']=post[0].avg;
        callback(null,output);
      });
      });
  });
   
     
},
task4: function(callback) {
  //Do some operations
  Product.find().distinct('battle_type', function(error, result) {
    result = result.filter(function(e){return e}); 

    callback(null,result);

    });
},
finalTask: ['task1', 'task2', 'task3','task4', function(results,callback) {
var final={};
final['most_active']=results.task2;
final['attacker_outcome']=results.task1;
final['battle_type']=results.task4;
final['defender_size']=results.task3;
callback(null,final);

}]
}, function(err, results) {
  res.json(results.finalTask)
  });


});


/* search PRODUCT */
router.get('/search', function(req, res, next) {
 if(req.query.king && req.query.location && req.query.type)
 {
  var query={ $or:[ {'attacker_king':req.query.king}, {'defender_king':req.query.king} ],$and:[{'location':req.query.location},{'battle_type':req.query.type}]};
 }
 else if(req.query.king && req.query.location)
 {
  var query={ $or:[ {'attacker_king':req.query.king}, {'defender_king':req.query.king} ],$and:[{'location':req.query.location}]};

 }
 else if(req.query.king && req.query.type)
 {
  var query={ $or:[ {'attacker_king':req.query.king}, {'defender_king':req.query.king} ],$and:[{'battle_type':req.query.type}]};

 }
 else if(req.query.location && req.query.type)
 {
  var query={$and:[{'location':req.query.location},{'battle_type':req.query.type}]};

 }
 else{
var query={};
 }
 

  Product.find(query, function (err, post) {
    res.json(post);
  });
});



module.exports = router;