var db_controller = require('../controllers/database_controller.js');   
var qry_action = db_controller.sd_use;//-------------SQL CONNECTION GOING TO PERFORM THE CRUD ACTIONS ON USERS
var url = require('url');


//----------------------Creating a New eSenteAccount--------------------------
module.exports.createNewEsenteAccount = function (req,res,queryData) {
	var jsonObject=JSON.parse(queryData.data);

	var ip = req.headers['x-forwarded-for'] || 
	req.connection.remoteAddress || 
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;

	var d = new Date(); 
	var mdate = d.getFullYear() +'-'+(d.getMonth()+1)+'-'+d.getDate() ;

	var time = new Date();
	var m_time = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

	console.log('Got a Reques from request from '+ip);


	qry_action.query('insert into client_info set ?', 
		{CI_SURNAME:jsonObject.surname,
			CI_LASTNAME:jsonObject.lastname,
			CI_MOB_TEL:jsonObject.mobTel,
			CI_NI_NUMBER: jsonObject.niNumber,
			CI_COUNTRY: jsonObject.country,
			CI_HOME_ADDRESS : jsonObject.homeAddress,
			CI_USERNAME: jsonObject.username,
			CI_PASSWORD: jsonObject.password,
			CI_REG_DATE: mdate,
			CI_REG_TIME: m_time,
			CI_REG_IP: ip

		}, 
		function(err, result) {
			if (err) 
			{
				return res.end(JSON.stringify({ err: err }));
//res.status(500).json({ err: err });
}
else
{
	return res.end(JSON.stringify({  status: 'eSente Account Registration successful!'   }));
//res.status(200).json({  status: 'eSente Account Registration successful!'   });

}

console.log(result.insertId);
});


}	 
//-------------------------end of Creating an eSente Account----------------------


//-----------------------------------Suspending An Account--------------------------
module.exports.suspendEsenteAccount = function (req,res,queryData) {

//-----------------------------RECORDING A USER LOG OUT OF THE SYSTEM -------------------------------------------------------
qry_action.query('update client_info set ci_ac_status = ? where ci_id = ?', ['S',queryData.account_id ], function(err, result) {
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

//-------------------------------End of Suspending the eSente Account-----------------


//-----------------------------------Sending Money to another Account--------------------------
module.exports.sendMoney = function (req,res,queryData) {

	var hat = require('hat');
	var trans_key = hat();
	var sender_Account_id = queryData.senderAccount;
	var esente_commission_Account = 1;
	var reciever_Account_id = queryData.receiverAccount;
	var sender_Access_token = queryData.access_token;
	var trans_amount = queryData.trans_amount;
	var sender_api_key = queryData.access_api_key;
//--------------------------------Checking a veryfing the api_access_key------------

var esente_commission_Account_balance = 0;
var sender_account_balance = 0;
var reciever_account_balance = 0;
//--------------------------Checking for the access_token-------------------




var d = new Date(); 
var mdate = d.getFullYear() +'-'+(d.getMonth()+1)+'-'+d.getDate() ;

var Atime = new Date();
var m_time = Atime.getHours() + ":" + Atime.getMinutes() + ":" + Atime.getSeconds();








//------------------------Inserting into the generated Client_transaction_keys--------



qry_action.query('select * from client_access_tokens where cat_token = ? and cat_status = ?',[sender_Access_token,'Y'],function(err,result){
	if (err) 
	{
		return res.end(JSON.stringify({ err: err }));
	//res.status(500).json({ err: err });
}

else
{

	if (result.length === 0)
	{
		return res.end(JSON.stringify({ err: 'Sorry, your eSente access token is not valid!!' }));
		//res.status(500).json({ err: 'Sorry, your eSente access token is not valid!!' });

	}
 //----------------------The api access_token is valid-------------
 else
 {


   //-----------------------Inserting the generated transaction Keys--------------------	
   qry_action.query('insert into client_transaction_keys  set ? ',{CTK_DATE:mdate,
   	CTK_TIME:m_time,
   	CTK_SEND_CI:sender_Account_id,
   	CTK_REC_CI:reciever_Account_id,
   	CTK_KEY:trans_key,
   	CTK_SEND_ACCESS_TOKEN:sender_Access_token,
   	CTK_SEND_API_KEY:queryData.access_api_key},function(err,result){
   		if (err){

   			throw err;
   		}
   		else
   		{

   		}

   	});
   //-----------------------------End of inserting the generated transaction keys--------


   //---------------- getting the amount to be transacted ------------------------
   var transaction_amount = queryData.trans_amount;
   var aTransAmount = Number(transaction_amount);
   
   var can_proceed_transaction = false;
   var sender_api_access_key = queryData.access_api_key;
   //---------------- End of getting the amount to be transacted--------------------

//------------------------Checking the Sender Access Token------
async function checkSenderAccessToken (){
	return new Promise((resolve,reject) =>{

		qry_action.query('select * from client_logins where cl_ci_id =? and cl_access_token = ?',[sender_Account_id,access_token],function(err,result){

			if (err){

				return res.end(JSON.stringify({ err: err }));
			}
			else
			{
				if (result.length === 0){

					resolve(false);
				}
				else
				{
					
					resolve(true);
					
				}

			}

		});


	})


}
//--------------------End Checking the Sender Access Token -----------




//-------------------------Getting the Account Balance of the person sending the money---------
async function getSnderAccountBalance(){


	return new Promise((resolve,reject) =>{


		qry_action.query('select CI_ESENTE_AMOUNT from client_info where ci_id =? ',[sender_Account_id],function(err,result){

			if (err){

				return res.end(JSON.stringify({ err: err }));
			}
			else
			{
				if (result.length === 0){

					reject(JSON.stringify({ err: 'Sender Acount id not found' }));
					//return res.end(JSON.stringify({ err: 'Sender Acount id not found' }));
				}
				else
				{
					
					resolve(result[0].CI_ESENTE_AMOUNT);
					
				}

			}

		});

	})




}

 //----------------------Ending of getting thr Account Balance of the person sending the money-------



//------------------------ Getting the account balance of the eSente Commision Account---------
async function geteSenteCommissionAccountBal(){
	return new Promise((resolve,reject) =>{
		qry_action.query('select CI_ESENTE_AMOUNT from client_info where ci_id = ? ',[1],function(err,result){

			if (err){

				return res.end(JSON.stringify({ err: err }));
			}
			else
			{
				if (result.length === 0){
					reject(JSON.stringify({ err: 'eSenete Acount id not found' }));
					//return res.end(JSON.stringify({ err: 'eSenete Acount id not found' }));
				}
				else
				{
					resolve(result[0].CI_ESENTE_AMOUNT);
					//esente_commission_Account_balance = result[0].CI_ESENTE_AMOUNT;
				}

			}

		});




	})


}

//-----------------------End of Getting the account balance of the eSente Commision Account-----



//------------------------ Getting the account balance of the person reciever---------
async function getRecieverAccountBalance(){

	return new Promise((resolve,reject) =>{
		qry_action.query('select CI_ESENTE_AMOUNT from client_info where ci_id = ? ',[reciever_Account_id],function(err,result){

			if (err){

				return res.end(JSON.stringify({ err: err }));
			}
			else
			{
				if (result.length === 0){
					reject(JSON.stringify({ err: 'Reciever Acount id not found' }));
					//return res.end(JSON.stringify({ err: 'Reciever Acount id not found' }));
				}
				else
				{
					resolve(result[0].CI_ESENTE_AMOUNT);
					//reciever_account_balance = result[0].CI_ESENTE_AMOUNT;
				}

			}

		});

	})


}


//------------------------ End of Getting the account balance of the person reciever---------

//---------------Removing the transaction commision Fee from the  sender Account ----
async function removeTransactionCommision(senderAccBal){

	return new Promise((resolve,reject) =>{
 	//

 	qry_action.query('update client_info set CI_ESENTE_AMOUNT = ? where ci_id = ? ',[senderAccBal - (aTransAmount * 0.025),sender_Account_id ],function(err,result){

 		if (err){

 			reject({err:'sss'});


 		}
 		else
 		{
 			resolve(result);


 		}

 	});
 })

}

//---------------End of Removing the transaction commision Fee from the  sender Account ----


//-----------Adding the transaction fee to the eSente Commision Account --------------
async function addCommsiontoEsenteAcc (essenteCommsionAccBal){
	return new Promise((resolve,reject) =>{
		
		qry_action.query('update client_info set CI_ESENTE_AMOUNT = ? where ci_id = ? ',[essenteCommsionAccBal + (aTransAmount * 0.025),esente_commission_Account ],function(err,result){

			if (err){
   			//return res.end(JSON.stringify({ err: err }));
   			reject('dddd');

   		}
   		else
   		{

   			resolve(result);

   		}

   	});

	})


}



//-----------End of Adding the transaction fee to the eSente Commision Account --------------

//------------------------------------Inserting the transaction fee charge into the client ledger transaction table ------
async function insertTransactionFeeChargetoClientLedger(senderAccBal,esenteCommisionAccBal){

	return new Promise((resolve,reject) =>{

		qry_action.query('insert into client_ledger_transactions  set ? ',
			{CLT_DATE: mdate,CLT_TIME:m_time,
				CLT_TRANS_TYPE:'W',CLT_CR_CI : sender_Account_id,
				CLT_CR_OPENING_BALANCE:senderAccBal,
				CLT_CR_CLOSING_BALANCE: (senderAccBal - (aTransAmount * 0.025)),
				CLT_DR_CI: esente_commission_Account,
				CLT_DR_OPENING_BALANCE: esenteCommisionAccBal,
				CLT_DR_CLOSING_BALANCE: (esenteCommisionAccBal +  (aTransAmount * 0.025)),
				CLT_AMOUNT:(aTransAmount * 0.025),
				CLT_REMARKS:'Transaction Commision Charge',
				CLT_SENDER_ACCESS_TOKEN: sender_Access_token,
				CLT_SENDER_API_ACCESS_KEY : sender_api_access_key
			},



			function(err,result){

				if (err){

					reject(JSON.stringify({ err: err }));

				}
				else
				{

					resolve(result);

				}

			});

	})

}

//------------------------------------End of Inserting the transaction fee charge into the client ledger transaction table ------

	//---------------Removing the transaction AMount from the  sender Account --------------------
	async function remTransAmountFromSenderAcc(senderAccBal){
		return new Promise((resolve,reject) =>{
			

			qry_action.query('update client_info set CI_ESENTE_AMOUNT = ? where ci_id = ? ',[senderAccBal - (aTransAmount +(aTransAmount) * 0.025) ,sender_Account_id ],function(err,result){

				if (err){
					reject(JSON.stringify({ err: err }));
   			//return res.end(JSON.stringify({ err: err }));

   		}
   		else
   		{

   			resolve(result);

   		}

   	});


		})

	}

	//---------------End of Removing the transaction AMount from the  sender Account --------------------

	//---------------Addind the transaction AMount to the  reciever Account ----
	async function addTransAmountToRecieverAcc(recAccBal){

		new Promise((resolve,reject) =>{
			
			qry_action.query('update client_info set CI_ESENTE_AMOUNT = ? where ci_id = ? ',[recAccBal + aTransAmount,reciever_Account_id ],function(err,result){

				if (err){
					reject(JSON.stringify({ err: err }))
   			//return res.end();

   		}
   		else
   		{

   			resolve(result);

   		}

   	});



		})
	}



	//---------------End of Adding the transaction AMount to the  reciever Account ----
	//------------------------------------Inserting the transaction Amounut into the client ledger transaction table ------
	async function addTransAmountintoLedger(senderAccBalP,recAccBalP){

		new Promise((resolve,reject) =>{

			qry_action.query('insert into client_ledger_transactions  set ? ',
				{CLT_DATE: mdate,CLT_TIME:m_time,
					CLT_TRANS_TYPE:'W',CLT_CR_CI : sender_Account_id,
					CLT_CR_OPENING_BALANCE:senderAccBalP -(aTransAmount * 0.025),
					CLT_CR_CLOSING_BALANCE: senderAccBalP - (aTransAmount+aTransAmount * 0.025),
					CLT_DR_CI: reciever_Account_id,
					CLT_DR_OPENING_BALANCE: recAccBalP,
					CLT_DR_CLOSING_BALANCE: recAccBalP+  aTransAmount ,
					CLT_AMOUNT:aTransAmount ,
					CLT_REMARKS:'Money Send from one Account to another',
					CLT_SENDER_ACCESS_TOKEN: sender_Access_token,
					CLT_SENDER_API_ACCESS_KEY : sender_api_access_key
				},



				function(err,result){

					if (err){

						reject(JSON.stringify({ err: err }))
   				//return res.end(JSON.stringify({ err: err }));

   			}
   			else
   			{

   				resolve(result);

   			}

   		});


		})
	}
	//------------------------------------END of Inserting the transaction Amounut into the client ledger transaction table ------


   //===============Some asyncronous magic====================
   async function TransferMoney(){
   	let canProceed = false;

   	let AsenderAccBalance = await getSnderAccountBalance();
   	let AesenteCommissionAccBal = await geteSenteCommissionAccountBal();
   	let ArecieverAccBalance = await getRecieverAccountBalance();

   	let AcheckSenderAccessToken  = await checkSenderAccessToken() ;

   	if (AcheckSenderAccessToken){
   		if ( (((aTransAmount) + (aTransAmount * 0.025))  < (AsenderAccBalance)) || (((aTransAmount) + (aTransAmount * 0.025))  == (AsenderAccBalance))  ) 
   		{
    	canProceed = true; //---------------the sender has enough money to make the transaction

    }
    else
    {

    	canProceed = false;  //-------------------the sender doesnot have enough money to complete thr transaction
    }

}
else
{
	res.end(JSON.stringify({ err: 'Prohibited transaction!!!' }));


}










if (canProceed){



	let AremCommisionAmountFromSenderAcc = await removeTransactionCommision(AsenderAccBalance);
	let addCommsiontoeenteAccD = await addCommsiontoEsenteAcc(AesenteCommissionAccBal);
	let AinsertTransactionFeeChargetoClientLedger = await insertTransactionFeeChargetoClientLedger(AsenderAccBalance,AesenteCommissionAccBal)
	let AremTransAmountFromSenderAcc = await remTransAmountFromSenderAcc(AsenderAccBalance);
	let AaddTransAmountToRecieverAcc = await addTransAmountToRecieverAcc(ArecieverAccBalance);
	let AaddTransAmountintoLedger = await addTransAmountintoLedger(AsenderAccBalance,ArecieverAccBalance);

	res.end(JSON.stringify({ pass: 'Transaction successful!!!!'}));

}
else
{
	res.end(JSON.stringify({ err: 'AAASorry your eSente Account Balance not enough to complete this transaction!' }));

}



}
   //=================End of asyncronous magic================


   //-------------------- Checking if the amount to be transacted is accepted---------------


   //------------------------- End of Checking if the amount to be transacted is accepted --------


   TransferMoney();











}
}

});




//-------------------------End of Checking for the access_token-----------











//---------------------END OF CHECKING FOR THE API_ACCESS_KEY------------------------------------






}	

//---------------------------------------End of Sending Money to another Account------------



