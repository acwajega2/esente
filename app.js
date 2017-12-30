  var http = require('http');
  var url = require('url');
  var mysql = require('mysql');

  //---------------Controllers-----------------------------------------
  var db_controller = require('./controllers/database_controller.js');     
  var action_controller = require('./controllers/actions_controller.js'); 
  var security_controller = require('./controllers/security_controller.js'); 
  var accounts_controller = require('./controllers/accounts_controller.js');
  //---------------End of Controllers------------------------------------------


  var sd_use = db_controller.sd_use;   

  //---------------------------------CONNECTING TO MYSQL DB--------------------------------------------------  
  db_controller.CONNECT_TO_DATABASE();
  //--------------------------------------------------------------------------------------------------------




  var server = http.createServer(function(req,res){
  //----------------Registering new Server Request---------------------
  action_controller.registerServerRequest(req,res);
  //----------------End of registering new Server Request--------------





  //----------------Specifying the type of response -------
  res.writeHead(200, {'Content-Type': 'application/json'});
  //------------------------------Parsing the recieved URL----------
  var querryData = url.parse(req.url, true).query;
  //----------------End of Specifying the type of response -------

  var access_api_key = querryData.access_api_key;

  sd_use.query('select * from esente_access_api_key where eaak_key = ? and eaak_status = ? ',[access_api_key,'Y'],function(err,result){
    if (err) 
    {
      return     

      res.end(JSON.stringify({err:err}));     
    }
    else
    {
      if (result.length === 0)
      {
        res.end(JSON.stringify({ err: 'Sorry, your eSente api access key is not valid!!' }));  



      }
  //----------------------The api access_token is valid-------------
  else
  {

    //res.end(JSON.stringify({ pass: 'Correct API' }));  

  //-------------------API ACTIONS----------------------------------
  if (querryData.action ==='auth'){

    security_controller.logingIntoeSente(req,res,querryData);

  }
  //-----------------Logging out of eSente----------------------------
  else if (querryData.action ==='logOut') 
  {
    security_controller.logingOutOfeSente(req,res,querryData);

  }
  //------------------Creating a new eSente Account-------------------
  else if (querryData.action ==='createNewEsenteAcc') 
  {
    accounts_controller.createNewEsenteAccount(req,res,querryData);

  }
  //------------------Creating a new eSente Account-------------------
  else if (querryData.action ==='suspendEsenteAcc') 
  {
    accounts_controller.suspendEsenteAccount(req,res,querryData);

  }
  //------------------Transfering Money from one accoun to another-------------------
  else if (querryData.action ==='sendMoney') 
  {
    accounts_controller.sendMoney(req,res,querryData);

  }
  else
  {

  }
  //-------------END OF API ACTIONS-----------------------------------------


}
}
});










}).listen(8080, "0.0.0.0");
  console.log('Server running at http://0.0.0.0:8080');