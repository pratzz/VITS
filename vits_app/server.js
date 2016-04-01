var express = require('express');
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
var mqtt = require('mqtt'),url = require('url')







var app = express();
var db = mongojs('vits_app',['vehicle_info']);

app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());

app.get('/clearRaspby/:raspby',function (req,res){

	var raspby = req.params.raspby;
	
})

app.get('/validate/:rfid',function (req, res) {
	var data = req.params.rfid;
	var id = data.substring(0,12);
	var raspby = data.substring(12,25);
	var Collec_scanned =  db.collection('scanned_info');
	var Collec_raspby  =  db.collection('raspberry_info');
	var Collec_stolen  =  db.collection('stolen_info');


	db.vehicle_info.findOne({RFID_Tag: id}, function (err, docs){

		Collec_scanned.insert({Raspby_id: raspby, Vehicleno: docs.Vehicle.Vehicleno, Time: new Date().getTime()});

		if( docs.Stolen == "Yes" )
		{
			console.log("Stolen Car");
			
			

			Collec_raspby.findOne({Raspby_id: raspby}, function (err, docs1){

				if(err)
					console.log(err)

				else
				{
					console.log(docs.Vehicle.Vehicleno)


							Collec_stolen.remove(
								{
									Vehicleno: docs.Vehicle.Vehicleno
								},
								function (err, docs){
									if(err)
										console.log("error")
								}
							);
							
					var obj = docs1.Next;

					for( var key in obj){
						if(obj.hasOwnProperty(key)){

							var rasObj = obj[key]
							var rasData = [];
							i=0
							for (var key1 in rasObj) {
								rasData[i] = rasObj[key1]
								i++;
							};
							var mqtt_url = url.parse("m10.cloudmqtt.com")
							var client = mqtt.createClient(19324,"m10.cloudmqtt.com",
								{
									username: "surajjorwekar",
									password: "destiny"
								});
							client.on('connect',function(){
								client.publish("/"+rasData[0],"AP31DM2120,5,Regal Raptor,32,Black,1456218668402",function(){
									client.end();
								})
							})

							Collec_stolen.update(
								{
									Vehicleno: docs.Vehicle.Vehicleno,Raspby_id: rasData[0]
								},
								{ 
									$set : {
										Raspby_id: rasData[0], Distance: rasData[1], Vehicleno: docs.Vehicle.Vehicleno, Vehicle: docs.Vehicle, Time: new Date().getTime()
									}
								},
								{
									upsert:true,
									safe:false
								},
								function (err, docs2){

									if(err)
										console.log(err)
								
								}

							);
						}
					}

					/*Collec_stolen.update(
						{
							Vehicleno: docs.Vehicle.Vehicleno
						},
						{ 
							$set : {
								Raspby_id: raspby, RP1: docs1.Next.RP1, RP2: docs1.Next.RP2, RP3: docs1.Next.RP3, Vehicleno: docs.Vehicle.Vehicleno, Vehicle: docs.Vehicle, Time: new Date().getTime()
							}
						},
						{
							upsert:true,
							safe:false
						},
						function (err, docs2){

							if(err)
								console.log(err)
							
						}

					);*/
				}	
				
			});

			
		}	
		
		/*
		else
		{
			
			if(docs.Vehicle.Class == "LMV")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"LMV" : 1}});

			else if(docs.Vehicle.Class == "MCWOG")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"MCWOG" : 1}});

			else if(docs.Vehicle.Class == "MCWG")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"MCWG" : 1}});

			else if(docs.Vehicle.Class == "3W_TR")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"3W_TR" : 1}});

			else if(docs.Vehicle.Class == "LMV_TR")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"LMV_TR" : 1}});

			else if(docs.Vehicle.Class == "TRANS")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"TRANS" : 1}});

			else if(docs.Vehicle.Class == "PVTBUS")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"PVTBUS" : 1}});

			else if(docs.Vehicle.Class == "LMVPVT")
				Collec_raspby.update({Raspby_id: raspby},{$inc: {"LMVPVT" : 1}});
			

		}*/

		res.json(docs)
	})
});


app.get('/estimate/:raspby',function (req, res){
	var id = req.params.raspby;
	
})

app.get('/strength/:raspby',function (req, res){
	var id = req.params.raspby;
	
})

app.get('/findStolen/:raspby', function (req,res){
	var id = req.params.raspby;
	console.log(id)
	var Collec_stolen  =  db.collection('stolen_info');


	Collec_stolen.find({Raspby_id: id}, function (err, docs){
		res.json(docs)
	})
})


app.listen(3000);
console.log("Server Started")