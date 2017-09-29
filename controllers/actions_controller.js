    var db_controller = require('../controllers/database_controller.js');   
    var qry_action = db_controller.sd_use;//-------------SQL CONNECTION GOING TO PERFORM THE CRUD ACTIONS ON USERS
    var url = require('url');


    //-------------------Registering a new Server access from the url------------------
    module.exports.registerServerRequest = function (req,res) {

     var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
       
            var d = new Date(); 
            var mdate = d.getFullYear() +'-'+(d.getMonth()+1)+'-'+d.getDate() ;
       
            var time = new Date();
            var m_time = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

            console.log('request from '+ip);
     

     qry_action.query('insert into server_requests set ?', {SR_DATE: mdate,SR_TIME: m_time,SR_IP:ip,SR_REQ:req.url}, function(err, result) {
         if (err) throw err;
        
         console.log(result.insertId);
       });


    }
    //----------------------End of url--------------------------------------------



