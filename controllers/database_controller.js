var mysql = require('mysql');
var configDB = require('../config/db.js');
var eSente_db = mysql.createConnection(configDB.connection_parameters);// connect to mysql database



module.exports.CONNECT_TO_DATABASE = function(req,res){
  eSente_db.connect(function(err){
    if (err){
       console.log('Unable to connect to the the eSente main Database!!!');
    }
    else
    {
      console.log('Connected to the eSente main Database!!!');
      
    }
  })
}

module.exports.sd_use = eSente_db;