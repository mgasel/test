'use strict';


const FCM = require('fcm-node');
let sendPush = function (deviceToken, data){
    const serverKey='AIzaSyCqXl2CnsIZSKmxOlfAhXzRuW8qsZLWLa0';
    const fcm = new FCM(serverKey);
        return new Promise((resolve , reject)=>{

            console.log(data);

            let message = {
                to: deviceToken,
                notification: {
               //     title:'3ndk',
                    body: data.msg,
                    sound: "default",
                    badge:data.count
                },

                data:data,
                priority: 'high'
            };
            fcm.send(message, function(err, result){
                if (err) {
                    resolve(null);
                } else {
                    resolve(null,result);
                }
            });

         })

};







let sendPushToUser = function (deviceToken, data){
    const serverKeyUser='AIzaSyB0QeVUQ2LLJtkbzDSampIt3xAg_9oj33I';
    const fcm = new FCM(serverKeyUser);
        return new Promise((resolve , reject)=>{

            console.log(data,'dshgdshddddddddddd');

            let message = {
                to: deviceToken,
                notification: {
                //    title:'3ndk',
                    body: data.msg,
                    sound: "default",
                    badge:data.count
                },

                data:data,
                priority: 'high'
            };
            fcm.send(message, function(err, result){
                if (err) {

                    console.log(err,'err');

                    resolve(null);
                } else {
                    console.log(result,'resul==========================t')
                    resolve(null,result);
                }
            });

         })

};












let sendChatPush = function (deviceToken,data){
        
       
    return new Promise((resolve , reject)=>{
        let message = {
            to: deviceToken,

            notification: {
                title:data.name,
                body: data.msg,
                sound: "default",
                badge:data.totalNewChatDataCount
            },

            data:data,
            priority: 'high'
        };
        
        fcm.send(message, function(err, result){
            if (err) {
                resolve(null);
            } else {
                resolve(null,result);
            }
        });

     })

};






let sendPushToAllUser = function (deviceTokens, data){
    const serverKeyUser='AIzaSyB0QeVUQ2LLJtkbzDSampIt3xAg_9oj33I';
    const fcm = new FCM(serverKeyUser);
    return new Promise((resolve , reject)=>{
        let message = {
            
            registration_ids: deviceTokens,

            notification: {
                title:'laundryapp !',
                body: data.msg,
                sound: "default",
                badge:0
            },

            data:data,
            priority: 'high'
        };
        fcm.send(message, function(err, result){
            if (err) {
                console.log(err,'eror in promo push');
                resolve(null);
            } else {
                resolve(null,result);
            }
        });

     })

};

module.exports = {
    sendPush: sendPush,
    sendPushToAllUser:sendPushToAllUser,
    sendChatPush:sendChatPush,
    sendPushToUser:sendPushToUser
};