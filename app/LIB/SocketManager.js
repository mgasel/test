let io;
const async=require('async');
const Chatroom=require('../models/Chatroom.js');
const User=require('../models/User.js');
const Service=require('../Services/ChatServices.js');
const AppConstraints=require('../../config/appConstraints.js');
let redis;
exports.connectSocket = (server,redisClient)=>{



try{
    redis=redisClient;

   io = require('socket.io')(server);
   io.on('connection', (socket) => {

   let criteria={
                accessToken:socket.handshake.query.accessToken
            }


            

            User.findOne(criteria,{},{lean:true}, function (err, response) {
            if (err || !response) {
                socket.emit('socketError',AppConstraints.ERROR_WHILE_CONNECTING_SOCKET);
                }
                else
                {
                let userId=""+response._id;
                redisClient.set(userId,socket.id,function(err,reply) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(reply);
                        socket.emit('socketConnected', AppConstraints.SOCKET_CONNECTED);
                    }
                   });


                }
            });


          



            socket.on('updateDriverLocation',async function(data){

                 console.log(data,'driver location data');

                 if(!data || !data.driverId || !data.Lat || !data.Long){
                   await socket.emit('driverDataEmpty',AppConstraints.DRIVER_DATA_EMPTY);
                 }

                
                let findDriverId=await User.find({_id:data.driverId});

                if(!findDriverId){
                   await socket.emit('driverDataEmpty',AppConstraints.INVALID_DRIVER_ID2); 
                } 
                
                 
                let driverCurrentLocation=[parseFloat(data.Long),parseFloat(data.Lat)];

                await User.update({_id:data.driverId},{$set:{currentLocation:driverCurrentLocation,Long:data.Long,Lat:data.Lat}});

                await socket.emit('driverDataSuccess',AppConstraints.UPDATED_DRIVER_LOCATION);

            });




            socket.on('disconnect', function () {
                console.log('disconnected');
                console.log(socket.id,'socket id');
            });







        socket.on('sendMessage',  async(data, callback)=> {

                let chatData = {};

                if (data.audioUrl) {
                    chatData.audioUrl = data.audioUrl;
                    chatData.messageType = "AUDIO"
                }
                if (data.imageUrl) {
                    chatData['imageUrl.original'] = data.imageUrl.original;
                    chatData['imageUrl.thumbnail'] = data.imageUrl.thumbnail;
                    chatData.messageType = "IMAGE"
                }
                if (data.videoUrl) {
                    chatData['videoUrl.original'] = data.videoUrl.original;
                    chatData['videoUrl.thumbnail'] = data.videoUrl.thumbnail;
                    chatData.messageType = "VIDEO"
                }
                if (data.message) {
                    chatData.message = data.message;
                    chatData.messageType = "TEXT"
                }
                
                chatData.senderId = data.senderId,
                chatData.receiverId = data.receiverId,
                chatData.sentAt = data.sentAt,
                chatData.isDelivered = false,
                chatData.isRead = false,
                chatData.conversationId = [data.senderId, data.receiverId].sort().join('.'),
                chatData.chatCreateTime = new Date()
    

                let dataToSend={};    

              
                dataToSend.statusCode=200,
                dataToSend.message=data.message,
                dataToSend.imageUrl=data.imageUrl,
                dataToSend.videoUrl=data.videoUrl,
                dataToSend.audioUrl=data.audioUrl,
                dataToSend.sentAt=data.sentAt,
                dataToSend.senderId=data.senderId,
                dataToSend.receiverId=data.receiverId,
                dataToSend.messageType=chatData.messageType,
                    
          

              
                
               



                Service.create(chatData,function (err,res) {
                    if(err){
                       
                            socket.emit('ErrorCreatingChat',AppConstraints.ERROR_IN_CREATING_CHAT);
                     
                    }else{
                            
                        socket.emit('ChatSuccesfullyCreated',AppConstraints.CHAT_CREATED_SUCCESSFULLY);


                          dataToSend.chatId=res._id;

                          User.findOne({_id:data.receiverId},function(err,result){
                              if(err){
                                  console.log(err);
                              }
                              else{
                                User.findOne({_id:data.senderId},function(err,userData){
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        let message="";
                                        if(chatData.messageType=="TEXT"){
                                            message=chatData.message
                                        }
                                        else if(chatData.messageType=="AUDIO"){
                                            message="Send you a voice sms";
                                        }
                                        else if(chatData.messageType=="VIDEO"){
                                            message="Send you a video";
                                        }
                                        else if(chatData.messageType=="IMAGE"){
                                            message="Send you an image"
                                        }

                                        let dataToPush={
                                            msg:message,
                                            chatData:chatData,
                                            messageType:"CHAT",
                                            userId:userData._id,
                                            name:userData.name,
                                            Profilepicurl:userData.Profilepicurl

                                        }

                                        let filterAccordingTo=[data.senderId, data.receiverId].sort().join('.')

                                        Service.getChatData(
                                                            {conversationId:filterAccordingTo,isDelivered:false,isRead:false,deleteByList:{$nin:[data.receiverId]}},
                                                            {},
                                                            {lean:true},
                                                            function(err,perticularChatDataCount){

                                            if(err){
                                                   
                                                    console.log(err,'error data');
                                            }
                                            else{

                                                dataToSend.perticularChatCount=perticularChatDataCount.length;
                                                

                                                
                                              

                                                  Service.getChatData(
                                                            {receiverId:data.receiverId,isDelivered:false,isRead:false,deleteByList:{$nin:[data.receiverId]}},
                                                            {},
                                                            {lean:true},
                                                            function(err,totalNewChatDataCount){

                                                    if(err){
                                                        
                                                            console.log(err,'error data');
                                                    }
                                                    else{

                                                       

                                                            if(result.isOnline){
                                                                dataToSend.totalNewChatDataCount=totalNewChatDataCount.length;
                                                                
                                                                dataToPush.totalNewChatDataCount=totalNewChatDataCount.length;

                                                     
                                                                redisClient.get(userId,function(err,reply) {
                                                                    if(err){
                                                                        console.log(err);
                                                                    }
                                                                    else if(reply){


                                                                        chatData.deliveredAt = new Date();
                                                                        chatData.isRead = true;
                                                                        io.to(reply).emit("messageFromServer", dataToSend);
                                                                    
                                                                        pushNotification(result.deviceToken,dataToPush,function(err,result){
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                            else{
                                                                            console.log('notification send successfully')
                                                                            }
                                                                        })
                                                                    
                                                                    
                                                                    }
                                                                    else{
                                                                         chatData.isDelivered = false;
                                                                    }
                                                                   });


                                                              
                                            
                                            
                                                                

                                                                



                                            
                                                               


                                                            }

                                                            else{

                                                                dataToSend.totalNewChatDataCount=totalNewChatDataCount.length;
                                                                dataToPush.totalNewChatDataCount=totalNewChatDataCount.length;

                                                     



                                                                if (server.app.socketConnections[data.receiverId]) {
                                                        
                                                                    chatData.deliveredAt = new Date();
                                                                    chatData.isRead = true;


                                                                  


                                                                    io.to(server.app.socketConnections[data.receiverId].socketId).emit("messageFromServer", dataToSend);

                                                        
                                                                }
                                            
                                            
                                            
                                                                else chatData.isDelivered = false;

                                                                

                                                            }
                                                           
                                                        }

                                           
                                               })


                                            }

                                           
                                        })


                                           
                                    }
                                })
                              }
                          })
                          


                    }
                });

        });




            
        });


    }
    catch(err){
        console.log(err);
        console.log(err.code)
    }
}



exports.emitAssignedBooking=(data)=>{
    redis.get(""+data.driverId,function(err,reply){
        console.log(reply,'data');
        io.to(reply).emit("emitAssignedBooking", data);
    })
}





