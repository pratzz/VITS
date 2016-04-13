var express = require('express');
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
var mqtt = require('mqtt'),url = require('url')




var app = express()
var db = mongojs('vits_app',['vehicle_info'])

app.use(express.static(__dirname+"/public"))
app.use(bodyParser.json())

app.get('/clearRaspby/:raspby',function (req,res){

	var raspby = req.params.raspby
	
})

app.get('/validate/:rfid',function (req, res) {
	var data = req.params.rfid
	var id = data.substring(0,12)
	var raspby = data.substring(12,25)
	var Collec_scanned =  db.collection('scanned_info')
	var Collec_raspby  =  db.collection('raspberry_info')
	var Collec_stolen  =  db.collection('stolen_info')
	var Time = new Date().getTime();

	db.vehicle_info.findOne({RFID_Tag: id}, function (err, docs){

		Collec_scanned.insert({Raspby_id: raspby, Vehicleno: docs.Vehicle.Vehicleno, Time: Time})


		Collec_raspby.findOne({Raspby_id: raspby}, function (err, docs1)
		{



			if(err)
				console.log(err)

			else
			{

				var obj = docs1.Next
				j=0
				var rasObj = [[]]
				for(var key in obj)
				{
					rasObj[j] = obj[key]
					j++;
				}


				
				Collec_scanned.findOne({
					$and : [
					{
						"Vehicleno":docs.Vehicle.Vehicleno
					},

					{
						$or:[
						{
							"Raspby_id":rasObj[0].Id
						},
						{
							"Raspby_id":rasObj[1].Id
						},
						{
							"Raspby_id":rasObj[2].Id
						},
						{
							"Raspby_id":rasObj[3].Id
						}]
					}
			    	]},
			    	function(error1,checkadj){
			    	if(!error1)
					{
						var found_rasObj = [[]]        // <<-------- Adjacent Raspberry 
						if(checkadj != null)
						{	
							var Diff =   (Time - checkadj.Time)/1000
							Collec_raspby.findOne({Raspby_id: checkadj.Raspby_id}, function (err, foundRaspby)
							{
								if(!err)
								{
									console.log("\n\nprinting info")
									console.log(foundRaspby.Raspby_id)
									console.log(raspby)
									console.log(Diff)
									var found_obj = foundRaspby.Next

									j=0
									found_index = 0
									
									for(var key in found_obj)
									{
										found_rasObj[j] = found_obj[key]
										if(found_rasObj[j].Id == raspby)
											found_index = j
										j++;
									}
									if(found_rasObj[found_index].Threshold > Diff)
									{
										if(found_index == 0 && found_rasObj[found_index].Time > Diff)
										{
											Collec_raspby.update(
												{Raspby_id: foundRaspby.Raspby_id},
												{$set:
													{"Next.RP1.Time" : Diff}
												},
												{upsert:true,safe:false}
											)
										}
										else if(found_index == 1 && found_rasObj[found_index].Time > Diff)
										{
											Collec_raspby.update(
												{Raspby_id: foundRaspby.Raspby_id},
												{$set:
													{"Next.RP2.Time" : Diff}
												},
												{upsert:true,safe:false}
											)
										}
										else if(found_index == 2 && found_rasObj[found_index].Time > Diff)
										{
											Collec_raspby.update(
												{Raspby_id: foundRaspby.Raspby_id},
												{$set:
													{"Next.RP3.Time" : Diff}
												},
												{upsert:true,safe:false}
											)
										}
										else if(found_index == 3 && found_rasObj[found_index].Time > Diff)
										{
											Collec_raspby.update(
												{Raspby_id: foundRaspby.Raspby_id},
												{$set:
													{"Next.RP4.Time" : Diff}
												},
												{upsert:true,safe:false}
											)
										}
									}
									//console.log(found_rasObj[found_index])
								}




							})
						}
						if( docs.Stolen == "Yes" )
						{
							console.log("Stolen"+raspby)
							//Remove vehicle from Stolen Collection 
							Collec_stolen.remove(
								{
									Vehicleno: docs.Vehicle.Vehicleno
								},
								function (err, docs){
									if(err)
										console.log("error")
								}
							);
							
							var SENDRP0 = raspby
							var SENDRP1 = rasObj[0].Id
							var SENDRP2 = rasObj[1].Id
							var SENDRP3 = rasObj[2].Id
							var SENDRP4 = rasObj[3].Id
							//MQTT Protocol Connection and publish
							var mqtt_url = url.parse("m10.cloudmqtt.com")
							var client = mqtt.createClient(19324,"m10.cloudmqtt.com",
								{
									username: "surajjorwekar",
									password: "destiny"
								})
							client.on('connect',function()
							{
								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+SENDRP0,Str)//,function(err,docs)

								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+SENDRP1,Str)//,function(err,docs)

								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+SENDRP2,Str)//,function(err,docs)

								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+SENDRP3,Str)//,function(err,docs)

								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+SENDRP4,Str)//,function(err,docs)


								/*
								{
									if(err)
										console.log(err)

									client.end()
								})*/


							})

							/*
							var SENDRP = rasObj[1].Id
						    console.log(SENDRP)
							//MQTT Protocol Connection and publish
							var mqtt_url = url.parse("m10.cloudmqtt.com")
							var client = mqtt.createClient(19324,"m10.cloudmqtt.com",
								{
									username: "surajjorwekar",
									password: "destiny"
								})
							client.on('connect',function()
							{
								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+SENDRP,Str,function(err,docs)
								{
									if(err)
										console.log(err)

									client.end()
								})


							})

							
							var Raspby_id = rasObj[1].Id
						    console.log(Raspby_id)
							//MQTT Protocol Connection and publish
							var mqtt_url = url.parse("m10.cloudmqtt.com")
							var client = mqtt.createClient(19324,"m10.cloudmqtt.com",
								{
									username: "surajjorwekar",
									password: "destiny"
								})
							client.on('connect',function()
							{
								
							})

							var Raspby_id = rasObj[2].Id
						    console.log(Raspby_id)
							//MQTT Protocol Connection and publish
							var mqtt_url = url.parse("m10.cloudmqtt.com")
							var client = mqtt.createClient(19324,"m10.cloudmqtt.com",
								{
									username: "surajjorwekar",
									password: "destiny"
								})
							client.on('connect',function()
							{
								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+Raspby_id,Str,function(err,docs){
									if(err)
										console.log(err)
									client.end()
								})
							})

							var Raspby_id = rasObj[3].Id
						    console.log(Raspby_id)
							//MQTT Protocol Connection and publish
							var mqtt_url = url.parse("m10.cloudmqtt.com")
							var client = mqtt.createClient(19324,"m10.cloudmqtt.com",
								{
									username: "surajjorwekar",
									password: "destiny"
								})
							client.on('connect',function()
							{
								var Str = docs.Vehicle.Vehicleno+","+docs.Vehicle.Manufacturer+","+docs.Vehicle.Class+","+docs.Vehicle.Color+","+Time
								client.publish("/"+Raspby_id,Str,function(err,docs){
									if(err)
										console.log(err)
									client.end()
								})
							})*/
							
							

							for (i=0; i<4; i++)
							{
								var Raspby_id = rasObj[i].Id
								//console.log(Raspby_id)

								



								//Update the stolen collection for adjacent nodes
								Collec_stolen.update(
									{
										Vehicleno: docs.Vehicle.Vehicleno,Raspby_id: rasObj[i].Id
									},
									{ 
										$set : {
											Raspby_id: rasObj[i].Id, Distance: rasObj[i].Dist, Vehicleno: docs.Vehicle.Vehicleno, Vehicle: docs.Vehicle, Time: Time
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


					}


			    })



				

				if(docs.Vehicle.Class == "LMV")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"LMV" : 1}})

				else if(docs.Vehicle.Class == "MCWOG")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"MCWOG" : 1}})

				else if(docs.Vehicle.Class == "MCWG")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"MCWG" : 1}})

				else if(docs.Vehicle.Class == "3W_TR")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"3W_TR" : 1}})

				else if(docs.Vehicle.Class == "LMV_TR")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"LMV_TR" : 1}})

				else if(docs.Vehicle.Class == "TRANS")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"TRANS" : 1}})

				else if(docs.Vehicle.Class == "PVTBUS")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"PVTBUS" : 1}})

				else if(docs.Vehicle.Class == "LMVPVT")
					Collec_raspby.update({Raspby_id: raspby},{$inc: {"LMVPVT" : 1}})

			}	
			
		})


		res.json(docs)
	})
});


app.get('/estimate/:raspby',function (req, res){
	var id = req.params.raspby
	
})

app.get('/strength/:raspby',function (req, res){
	var id = req.params.raspby
	
})

app.get('/findStolen/:raspby', function (req,res){
	var id = req.params.raspby
	console.log(id)
	var Collec_stolen  =  db.collection('stolen_info')


	Collec_stolen.find({Raspby_id: id}, function (err, docs){
		res.json(docs)
	})
})


app.listen(3000)
console.log("Server Started")