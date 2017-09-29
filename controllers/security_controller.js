          var db_controller = require('../controllers/database_controller.js');   
          var qry_action = db_controller.sd_use;//-------------SQL CONNECTION GOING TO PERFORM THE CRUD ACTIONS ON USERS
          var url = require('url');
          //----------------------------Loging into the eSente----------------------------
          module.exports.logingIntoeSente = function (req,res,querryData) {
            console.log('tried to login');

          //----Query mysql for the username and password to see if they are correct
             qry_action.query('select * from client_info where ci_username = ? and ci_password =?',[querryData.uname,querryData.pword], 
              function (err, results){
                console.log('reached hia');

               if (err){
             
                return    res.end(JSON.stringify({ err: err }));  
                // res.status(500).json({ err: err });
             
             }
             else
             {

               if (results.length ===  0){
                console.log('Access Denied..........Invalid Username or Password');


                return   res.end(JSON.stringify({ err: 'Access Denied..........Invalid Username or Password' }));
                  
                  res.end(JSON.stringify());
              
             
             }


             //--------------------------user found----------------------------------- 
             else
             {
               console.log('account found');
              //-------------------Checking if the Account is Deativated----------------
               qry_action.query('select * from client_info where ci_ac_status = ?',['Y'],function(err,results){

                  if (err){
             
                return res.end(JSON.stringify({ err: err }));
                //res.status(500).json({ err: err });
             
             }
             else
             {
              if (results.length ===  0){
                //--------------Can Not Login
                return res.end(JSON.stringify({ err: 'Sorry, your Account has been Suspended or Deactivated!!' }));
                //res.status(500).json({ err: 'Sorry, your Account has been Suspended or Deactivated!!' });
              }
              else
              {

                //--------------Can Login-----------

                  var d = new Date(); 
                  var Adate = d.getFullYear() +'-'+(d.getMonth()+1)+'-'+d.getDate() ;
             
                  var Atime = new Date();
                  var m_time = Atime.getHours() + ":" + Atime.getMinutes() + ":" + Atime.getSeconds();


                  //-------Generating an access token ------------------------------------------------
             var hat = require('hat');
             var token_id = hat();
             //--------------------------End of token Generation --------------------------------
             var user = results[0];
             var obj = JSON.parse(JSON.stringify(user));
             res.end(JSON.stringify({resp:"pass",
              account_username:obj.CI_USERNAME,
              account_id:obj.CI_ID,
              account_esente_bal:obj.CI_ESENTE_AMOUNT,
              account_name :obj.CI_SURNAME + " "+ obj.CI_LASTNAME,
              access_token:token_id}));
             
             console.log(JSON.stringify(user));

               //------------------------INSERTING GENERATED CLIENT ACCESS TOKENS-----------------------
                //--------checking if the generated access token has already been generated or not-----

                qry_action.query('insert into client_access_tokens set ?',{CAT_TOKEN:token_id,CAT_GEN_DATE:Adate,CAT_GEN_TIME:m_time},function(err,result){

                  if (err) throw err;
                  console.log(result.insertId);



                });

               //------------------------END OF INSERTING CLIENT ACCESS TOKENS--------------------------

          

             console.log('Access Granted!!...');
             
             var d = new Date(); 
                  var Adate = d.getFullYear() +'-'+(d.getMonth()+1)+'-'+d.getDate() ;
             
                  var Atime = new Date();
                  var m_time = Atime.getHours() + ":" + Atime.getMinutes() + ":" + Atime.getSeconds();
             
             var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
             //-----------------------------RECORDING A USER LOG INTO THE SYSTEM -------------------------------------------------------
              qry_action.query('insert into client_logins set ?', {  CL_CI_ID: obj.CI_ID,CL_USERNAME: obj.CI_USERNAME,
                                          CL_ACCESS_TOKEN: token_id,
                                          CL_DATE: Adate,CL_TIME: Atime,CL_IP: ip,CL_API_ACCESS_KEY: querryData.access_api_key}, function(err, result) {
               if (err) throw err;
              
               console.log(result.insertId);
             });
             //------------------------------------------END OF CODE -------------------------------------------------------------------
             
             

                //----------------End of Can Login------



              }


             }

               });



              //-----------------------End of Check-----------------------------------------







             


             }




             }

              });

             //-------------------End of username and password check


          }

          //-----------------------------End of Logging into eSente-----------------------


          //---------------------Loging out of the eSente Account---------------------------
          module.exports.logingOutOfeSente = function (req,res,querryData) {

             
             //-----------------------------RECORDING A USER LOG OUT OF THE SYSTEM -------------------------------------------------------
              qry_action.query('update client_access_tokens set cat_status = ? where cat_token = ?', ['N',querryData.accessToken ], function(err, result) {
               if (err) 
                    {
                      return res.end(JSON.stringify({ err: err }));
                      //res.status(500).json({ err: err });
                    }
                    else
                    {
                      return res.end(JSON.stringify({  status: 'Successfully Logged out of eSente!'   }));
                      //res.status(200).json({  status: 'Successfully Logged out of eSente!'   });

                    }
                  
             });
             //------------------------------------------END OF CODE -------------------------------------------------------------------
             
             

          }
          //-----------------End of Loging out of the eSente Account---------------------