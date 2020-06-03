const cron = require('node-cron');
const Bookings = require('../models/Bookings.js');
const AppConstraints = require('../../config/appConstraints.js');
const mailer = require('../UnivershalFunctions/Univershalfunctions.js');
const smssender = require('../UnivershalFunctions/Univershalfunctions.js');
const pushNotification=require('../LIB/pushNotification.js');
const NotificationData=require('../models/notification.js');
const userSubscriptionPlan = require('../models/UserSubscriptionPlane');
const subscriptionPlan = require('../models/SubscriptionsPlan');
const userAndMemberSubscription = require('../models/userAndMembersSubscriptions');
const User = require('../models/User');
const backup = require('mongodb-backup');
const querystring = require('querystring');
const https = require('https');

exports.notifyToUserThoughEmail = () => {
    try {
        cron.schedule('* * * * *', function () {
            console.log('shuduler ');
            let criteria = {
                status: AppConstraints.APP_CONST_VALUE.PENDING,
                emailNotified: false
                // smsNotified:false
            };


            Bookings.find(criteria).populate({ path: 'userId', select: { email: 1 } }).exec(function (err, result) {
                if (err) {
                    console.log(err, 'error');
                }
                else {
                    result.map(async (myValue) => {
                        await Promise.all([
                            mailer.sendEmail(myValue.userId.email, AppConstraints.NOTIFICATION.EMAIL_NOTIFICATION_SUBJECT.EN, AppConstraints.NOTIFICATION.SUBJECT.EN),
                            Bookings.update({ _id: myValue._id }, { $set: { emailNotified: true, emailNotifiedTime: new Date() } })
                        ]);
                    });
                }
            })
        });
    }
    catch (err) {
        console.log(err);
    }
}


exports.subscriptionChecker = () => {
    try {
        cron.schedule('0 0 * * *', async () => {
            let getSubscribedActualPurchasersUnsubscribed = await userSubscriptionPlan.find({expiryDate:{lte:new Date()},isExpired:false,isDelete:true});

            for(let i=0; i<getSubscribedActualPurchasersUnsubscribed.length; i++){
                let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({_id:getSubscribedActualPurchasersUnsubscribed[i]._id},{$set:{isExpired:true}},{new:true});
                let updateMembers = userAndMemberSubscription.update({userSubscriptionPlanId:updateUserSubscriptions._id},{$set:{isExpired:true,isDelete:true}},{multi:true});
                let getMemberUsers = await userAndMemberSubscription.find({userSubscriptionPlanId:updateUserSubscriptions._id});
                for(let j=0; j<getMemberUsers.length; j++){
                    let update = await User.findOneAndUpdate({_id:getMemberUsers[j].userId},{$set:{isSubscriptiveUser:false,isActualPurchaser:false},$unset:{subscryptinPlans:1}},{new:true});
                }
            }

            let getSubscribedActualPurchasersSubscribed = await userSubscriptionPlan.find({expiryDate:{lte:new Date()},isExpired:false,isDelete:false});

            let expiryDate=new Date(currentDate.setMonth(currentDate.getMonth()+1));
            for(let i=0; i<getSubscribedActualPurchasersSubscribed.length; i++){



                if(payment){//done
                    let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({_id:getSubscribedActualPurchasersSubscribed[i]._id},{$set:{expiryDate:expiryDate}},{new:true});
                    let updateMembers = userAndMemberSubscription.update({userSubscriptionPlanId:updateUserSubscriptions._id},{$set:{expiryDate:expiryDate}},{multi:true});
                }else{//failed
                    let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({_id:getSubscribedActualPurchasersSubscribed[i]._id},{$set:{isExpired:true,isDelete:true}},{new:true});
                    let updateMembers = userAndMemberSubscription.update({userSubscriptionPlanId:updateUserSubscriptions._id},{$set:{isExpired:true,isDelete:true}},{multi:true});
                    let getMemberUsers = await userAndMemberSubscription.find({userSubscriptionPlanId:updateUserSubscriptions._id});
                    for(let j=0; j<getMemberUsers.length; j++){
                        let update = await User.findOneAndUpdate({_id:getMemberUsers[j].userId},{$set:{isSubscriptiveUser:false,isActualPurchaser:false},$unset:{subscryptinPlans:1}},{new:true});
                    }
                }
            }
        });
    }catch (err) {
        console.log(err,"errrrrrrrrrrrrrrrrrrrrrr");
    }
};



exports.notifyUserThroughMessage = async () => {
    try {
        cron.schedule('* * * * *', function () {

            console.log('send message');

            let criteria = {
                status: AppConstraints.APP_CONST_VALUE.PENDING,
                emailNotified: true,
                smsNotified: false
            };


            Bookings.find(criteria).populate({ path: 'userId', select: { email: 1 } }).exec(function (err, result) {
                if (err) {



                    console.log(err, 'error');
                }
                else if (result.length > 0) {

                    result.map(async (myValue) => {
                        console.log(myValue._id);
                        let randomValue = new Date(new Date(myValue.emailNotifiedTime).getTime() + 1800000).getTime();
                        let d = new Date().getTime();

                        if (randomValue < d) {
                            await Promise.all([
                                smssender.sendMessage(myValue.userId.callingCode + myValue.userId.phoneNumber, AppConstraints.NOTIFICATION.EMAIL_NOTIFICATION_SUBJECT.EN),
                                Bookings.update({ _id: myValue._id }, { $set: { smsNotified: true, smsNotifiedTime: new Date() } })
                            ]);
                        }


                    });
                }
            })




        })
    } catch (err) {
        console.log(err, 'error in notifying user while message');
    }
}




exports.changeStatusSheduler = async () => {
    try {
        cron.schedule('* * * * *', function () {

            console.log('collect to reassigned');

            let criteria = {
                status: AppConstraints.APP_CONST_VALUE.COLLECT,
                 notificationDate: { $lt: new Date().getTime() }
            };


            Bookings.find(criteria,{},{}).populate([{path:"driverId",select:{deviceToken:1,_id:1}}]).exec(function (err, result) {
                if (err) {
                    console.log(err, 'error');
                } else {
                    if(result.length>0) {
                        for(let i = 0 ; i< result.length ; i++){
                            if(result[i]&&result[i]._id){
                                Bookings.update({_id:result[i]._id}, { $set: { status: AppConstraints.APP_CONST_VALUE.REASSIGNED } }, { lean: true, new: true }, function (err, result1) {
                                    if (err) {
                                        console.log(err, 'error');
                                    } else {
                                     
        
                                        console.log(result1,'reassignfjkdshfjk===========================ed')
        
                                            let criteriadriver={
                                                recieverId:result[i].driverId._id,
                                                isRead:false
                                            }
        
        
                                            NotificationData.count(criteriadriver).exec( async function(err,nd){
                                                if(err){
                                                    console.log(err);
                                                }
                                                else{
                                                    let dataToPush={
                                                        msg:AppConstraints.BOOKING_REASSIGNED.EN,
                                                        messageType:AppConstraints.APP_CONST_VALUE.REASSIGNED,
                                                        userId:result[i].userId,
                                                        bookingId:result[i]._id,
                                                        count:nd+1
                                                    }
        
                                                    let newNotification=new NotificationData();
                                                    newNotification.recieverId=result[i].driverId._id,
                                                    newNotification.bookingId=result[i]._id;
                                                    newNotification.msg=AppConstraints.BOOKING_REASSIGNED.EN;
                                                    newNotification.msgAr=AppConstraints.BOOKING_REASSIGNED.AR;
                                                    newNotification.messageType=AppConstraints.APP_CONST_VALUE.REASSIGNED;
                                                    newNotification.createDate=new Date().getTime();
                                                    await pushNotification.sendPush(result[i].driverId.deviceToken,dataToPush)
                                                    await newNotification.save()
                                                }
        
                                               
                                            });
                                        
                                         }
            
            
            
                                    })
                            }


                        console.log(result[i]._id,'reassigned')


                      
                        }
                    }
                   
                }
            });


        })





    } catch (err) {
        console.log(err, 'error in notifying user while message');
    }
}




///////////when driver rescheduled booking/////////////////



// pickupTimeNotAvailable                  

// deliveryTimeNotAvailable   















exports.changeStatusShedulerUser = async () => {
    try {
        cron.schedule('* * * * *', function () {

            console.log('collect to reassigned');


            

            let criteria = {
                isRescheduledBookingByUser:true,
                isRescheduledBookingByUserDate:+new Date(),
                status:AppConstraints.APP_CONST_VALUE.RESCHEDULE,
               // newDateToHandelDriverReschedule: { $lt: new Date().getTime() }
            };

            Bookings.find(criteria,{},{}).populate([{path:"userId",select:{deviceToken:1,_id:1}}]).exec(function (err, result) {
                if (err) {
                    console.log(err, 'error');
                } else {
                    if(result.length>0) {
                        console.log("hello");
                        for(let i = 0 ; i< result.length ; i++){


                        if(result[i].isRescheduledBookingByUser){
                            Bookings.findOne({_id:result[i]._id}).exec(function (err, data) {
                            Bookings.update({_id:result[i]._id}, { $set: {isRescheduledBookingByUser:false,status:data.status} }, { lean: true, new: true }, function (err, result1) {
                                if (err) {
                                    console.log(err, 'error');
                                } else {
                                 
                                        let criteriadriver={
                                            recieverId:result[i].driverId._id,
                                            isRead:false
                                        }
                                        NotificationData.count(criteriadriver).exec( async function(err,nd){
                                            if(err){
                                                console.log(err);
                                            }
                                            else{
                                                let dataToPush={
                                                    msg:"Please Check your order status",
                                                    messageType:data.status,
                                                    userId:result[i].userId,
                                                    bookingId:result[i]._id,
                                                    count:nd+1
                                                }
    
                                                let newNotification=new NotificationData();
                                                newNotification.recieverId=result[i].driverId._id,
                                                newNotification.bookingId=result[i]._id;
                                                newNotification.msg="Please Check your order status";
                                                newNotification.messageType=data.status;
                                                await pushNotification.sendPush(result[i].driverId.deviceToken,dataToPush)
                                                await newNotification.save()
                                            }
    
                                           
                                        });
                                    
                                     }
        
        
        
                                })
                            })
                        }else if(result[i].deliveryTimeNotAvailable){
                            Bookings.update({_id:result[i]._id}, { $set: { deliveryTimeNotAvailable:false,isRescheduledBookingByDriver: false,status:AppConstraints.APP_CONST_VALUE.REASSIGNED} }, { lean: true, new: true }, function (err, result1) {
                                if (err) {
                                    console.log(err, 'error');
                                } else {
                                 
                                        let criteriadriver={
                                            recieverId:result[i].driverId._id,
                                            isRead:false
                                        }
                                        NotificationData.count(criteriadriver).exec( async function(err,nd){
                                            if(err){
                                                console.log(err);
                                            }
                                            else{
                                                let dataToPush={
                                                    msg:"Please Check your order status",
                                                    messageType:data.status,
                                                    userId:result[i].userId,
                                                    bookingId:result[i]._id,
                                                    count:nd+1
                                                }
    
                                                let newNotification=new NotificationData();
                                                newNotification.recieverId=result[i].driverId._id,
                                                newNotification.bookingId=result[i]._id;
                                                newNotification.msg="Please Check your order status";
                                                newNotification.messageType=data.status;
                                                await pushNotification.sendPush(result[i].driverId.deviceToken,dataToPush)
                                                await newNotification.save()
                                            }
    
                                           
                                        });
                                    
                                     }
        
        
        
                                })
                        }

                        









                        }
                    }
                   
                }
            });


        })





    } catch (err) {
        console.log(err, 'error in notifying user while message');
    }
}


exports.changeStatusShedulerDriver = async () => {
    try {
        cron.schedule('* * * * *', function () {

            console.log('collect to reassigned');


            

            let criteria = {
                isRescheduledBookingByDriver:true,
                status:AppConstraints.APP_CONST_VALUE.RESCHEDULE,
                newDateToHandelDriverReschedule: { $lt: new Date().getTime() }
            };

            Bookings.find(criteria,{},{}).populate([{path:"userId",select:{deviceToken:1,_id:1}}]).exec(function (err, result) {
                if (err) {
                    console.log(err, 'error');
                } else {
                    if(result.length>0) {
                        for(let i = 0 ; i< result.length ; i++){


                        if(result[i].pickupTimeNotAvailable){

                            Bookings.update({_id:result[i]._id}, { $set: { pickupTimeNotAvailable:false,isRescheduledBookingByDriver: false,status:AppConstraints.APP_CONST_VALUE.CONFIRMED} }, { lean: true, new: true }, function (err, result1) {
                                if (err) {
                                    console.log(err, 'error');
                                } else {
                                 
                                        let criteriadriver={
                                            recieverId:result[i].driverId._id,
                                            isRead:false
                                        }
                                        NotificationData.count(criteriadriver).exec( async function(err,nd){
                                            if(err){
                                                console.log(err);
                                            }
                                            else{
                                                let dataToPush={
                                                    msg:AppConstraints.BOOKING_REASSIGNED.EN,
                                                    messageType:AppConstraints.APP_CONST_VALUE.REASSIGNED,
                                                    userId:result[i].userId,
                                                    bookingId:result[i]._id,
                                                    count:nd+1
                                                }
    
                                                let newNotification=new NotificationData();
                                                newNotification.recieverId=result[i].driverId._id,
                                                newNotification.bookingId=result[i]._id;
                                                newNotification.msg=AppConstraints.BOOKING_REASSIGNED.EN;
                                                newNotification.messageType=AppConstraints.APP_CONST_VALUE.REASSIGNED;
                                                await pushNotification.sendPush(result[i].driverId.deviceToken,dataToPush)
                                                await newNotification.save()
                                            }
    
                                           
                                        });
                                    
                                     }
        
        
        
                                })
                        }else if(result[i].deliveryTimeNotAvailable){
                            Bookings.update({_id:result[i]._id}, { $set: { deliveryTimeNotAvailable:false,isRescheduledBookingByDriver: false,status:AppConstraints.APP_CONST_VALUE.REASSIGNED} }, { lean: true, new: true }, function (err, result1) {
                                if (err) {
                                    console.log(err, 'error');
                                } else {
                                 
                                        let criteriadriver={
                                            recieverId:result[i].driverId._id,
                                            isRead:false
                                        }
                                        NotificationData.count(criteriadriver).exec( async function(err,nd){
                                            if(err){
                                                console.log(err);
                                            }
                                            else{
                                                let dataToPush={
                                                    msg:AppConstraints.BOOKING_REASSIGNED.EN,
                                                    messageType:AppConstraints.APP_CONST_VALUE.REASSIGNED,
                                                    userId:result[i].userId,
                                                    bookingId:result[i]._id,
                                                    count:nd+1
                                                }
    
                                                let newNotification=new NotificationData();
                                                newNotification.recieverId=result[i].driverId._id,
                                                newNotification.bookingId=result[i]._id;
                                                newNotification.msg=AppConstraints.BOOKING_REASSIGNED.EN;
                                                newNotification.messageType=AppConstraints.APP_CONST_VALUE.REASSIGNED;
                                                await pushNotification.sendPush(result[i].driverId.deviceToken,dataToPush)
                                                await newNotification.save()
                                            }
    
                                           
                                        });
                                    
                                     }
        
        
        
                                })
                        }

                        









                        }
                    }
                   
                }
            });


        })





    } catch (err) {
        console.log(err, 'error in notifying user while message');
    }
}


////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// backup cron //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
exports.backupScheduler=()=>{
    try{


        console.log('inside crone')

        // cron.schedule('* * * * *', function () {
        //     console.log('========================scheduler=========================')
        //     let fileName=new Date()+'.tar'
        //     backup({
        //         uri: process.env.URL, 
        //         root: __dirname,
        //         // tar:fileName,
        //         parser:'json',
        //         // stream:'.tar',
        //         callback: function(err,result){
        //         if(err){
        //             console.log(err,'dsfsdfddfdsfdsfdfd');
        //         }else{
        //             console.log(result,'dfdfddd')
        //         }
        //     }
        //     });
        // })


    }catch(err){
        console.log(err, 'error in notifying user while message');
    }
}


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

exports.inAppNotificationToUser = () => {
    try {
        cron.schedule('* * * * *', function () {
            console.log('shuduler ');
            let criteria = {
                status: AppConstraints.APP_CONST_VALUE.CONFIRMED,
                pickUpDate: {$lte:new Date().getTime() + 1800000},
                isUserNotified:false
            };


            Bookings.find(criteria).populate({ path: 'driverId', select: {_id:1} }).populate({ path: 'userId', select: { deviceToken:1,langaugeType:1,_id:1} }).exec(function (err, result) {
                if (err) {
                    console.log(err, 'error');
                }
                else {
                    // console.log(result[0].isUserNotified);
                    console.log(result.length);
                    if(result.length>0){
                        result.map(async (myValue) => {
                            // console.log('+++++++++++++++', JSON.stringify(myValue));
                
                                let criteriaUser={
                                    recieverId:myValue.userId._id,
                                    isRead:false
                                };
                                let findTotalUnreadCountUser=await NotificationData.count(criteriaUser);
                                console.log(myValue);
                                let dataToPushUser = {
                                    msg:myValue.userId.langaugeType=="EN"?AppConstraints.REMIND_USER.EN:AppConstraints.REMIND_USER.AR,
                                    messageType:AppConstraints.APP_CONST_VALUE.REMINDER,
                                    driverId:myValue.driverId._id,
                                    bookingId:myValue._id,
                                    count:findTotalUnreadCountUser+1
                                }
                                let newNotificationUser=new NotificationData();
                                newNotificationUser.recieverId=myValue.userId._id,
                                newNotificationUser.bookingId=myValue._id,
                                newNotificationUser.msg=AppConstraints.REMIND_USER.EN;
                                newNotificationUser.msgAr=AppConstraints.REMIND_USER.AR;
                                newNotificationUser.messageType=AppConstraints.APP_CONST_VALUE.REMINDER;
                                newNotificationUser.createDate=new Date().getTime() 
                                console.log("+++++++++++++++++++++++==")
                                await Promise.all([
                                    pushNotification.sendPushToUser(myValue.userId.deviceToken,dataToPushUser),   
                                    newNotificationUser.save(),
                                    Bookings.update({ _id: myValue._id }, { $set: { isUserNotified: true } })
                                ]);
                            
                            
                        });
                    }
                   
                }
            })
        });
    }
    catch (err) {
        console.log(err,"fidfiid");
    }
}

exports.autoRenewFunction = async () => {
    try {
    //    crone hai ye
    cron.schedule('* * * * *', async function () {

        let getSubscribedActualPurchasersUnsubscribed = await userSubscriptionPlan.find({expiryDate:{$lte:new Date()},isExpired:false,isDelete:true});
console.log('++++++++++++++1', getSubscribedActualPurchasersUnsubscribed.length)
        for(let i=0; i<getSubscribedActualPurchasersUnsubscribed.length; i++){
            let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({_id:getSubscribedActualPurchasersUnsubscribed[i]._id},{$set:{isExpired:true}},{new:true});
            let updateMembers = userAndMemberSubscription.update({userSubscriptionPlanId:updateUserSubscriptions._id},{$set:{isExpired:true,isDelete:true}},{multi:true});
            let getMemberUsers = await userAndMemberSubscription.find({userSubscriptionPlanId:updateUserSubscriptions._id});
            for(let j=0; j<getMemberUsers.length; j++){
                let update = await User.findOneAndUpdate({_id:getMemberUsers[j].userId},{$set:{isSubscriptiveUser:false,isActualPurchaser:false},$unset:{subscryptinPlans:1}},{new:true});
            }
        }

        let getSubscribedActualPurchasersSubscribed = await userSubscriptionPlan.find({expiryDate:{$lte:new Date()},isExpired:false,isDelete:false});
        // console.log('++++++++++++++2', getSubscribedActualPurchasersSubscribed.length, new Date())

        let currentDate = new Date()
        let expiryDate=new Date(currentDate.setMonth(currentDate.getMonth()+1));
        // console.log('++++++++++++++',expiryDate, currentDate )

        for(let i=0; i<getSubscribedActualPurchasersSubscribed.length; i++){
            let getsubscriptionPlanData = await subscriptionPlan.find({_id: getSubscribedActualPurchasersSubscribed[i].subscriptionPlanId})
            let planAmount = parseInt(getsubscriptionPlanData[0].planAmount.slice(2))
            // console.log('++++++++++++++', planAmount)
            let payment = false
            if(getSubscribedActualPurchasersSubscribed[i].registrationId){
                let paymentCheck = await hyperpayPlanPurchaseToken1(getSubscribedActualPurchasersSubscribed[i].registrationId, planAmount)
                // console.log(paymentCheck)
                if(paymentCheck) payment = true
            }
        // console.log('++++++++++++++4', payment)

            if(payment){//done
                let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({_id:getSubscribedActualPurchasersSubscribed[i]._id},{$set:{expiryDate:expiryDate}},{new:true});
                let updateMembers = userAndMemberSubscription.update({userSubscriptionPlanId:updateUserSubscriptions._id},{$set:{expiryDate:expiryDate}},{multi:true});
            }else{//failed
                let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({_id:getSubscribedActualPurchasersSubscribed[i]._id},{$set:{isExpired:true,isDelete:true}},{new:true});
                let updateMembers = userAndMemberSubscription.update({userSubscriptionPlanId:updateUserSubscriptions._id},{$set:{isExpired:true,isDelete:true}},{multi:true});
                let getMemberUsers = await userAndMemberSubscription.find({userSubscriptionPlanId:updateUserSubscriptions._id});
                for(let j=0; j<getMemberUsers.length; j++){
                    let update = await User.findOneAndUpdate({_id:getMemberUsers[j].userId},{$set:{isSubscriptiveUser:false,isActualPurchaser:false},$unset:{subscryptinPlans:1}},{new:true});
                }
            }
        }
    })
    }catch (err) {
        console.log(err)
        // return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
};


const hyperpayPlanPurchaseToken1 = async (registrationId, planAmount) => {
    try{
        return new Promise((resolve, reject)=>{
            var path = '/v1/registrations/'+registrationId+'/payments';
            var d = {
                // 'authentication.userId': '8ac7a4c7679c71ed0167b705a421278d',
                // 'authentication.password': '7MbQFsQdCj',
            //     'authentication.userId': '8ac9a4ca68c1e6640168d9f9c8b65f69',
            //   'authentication.password': 'Kk8egrf9Fh',
                // 'authentication.entityId': '8ac7a4c86b308f7b016b46012a211942',
                'authentication.entityId': '8acda4c96ade4a49016afe7f214811e3',
                amount: planAmount,
                currency: 'SAR',
                // paymentType: request.body.paymentType,
                paymentType: "DB",
                recurringType : "REPEATED",
                // notificationUrl: request.body.notificationUrl,
                // merchantTransactionId: request.body.merchantTransactionId,
                // 'customer.email': request.body.email,
                // 'customer.givenName': request.body.givenName,
                // 'customer.surname': request.body.surname,
                // 'billing.street1': "Olayih",
                // 'billing.city': "Riyadh",
                // 'billing.state': "Central",
                // 'billing.country': "SA"
            };
            // if (request.body.isSubscriptionPlan) {
            //     d.createRegistration = "true";
            //     d.recurringType = "INITIAL";
            //     d['authentication.entityId'] = '8ac7a4c86b308f7b016b46012a211942'
            // }
            // console.log(d);
            // let findToken = await hypertoken.find({ userId: validateToken._id });
            // if (findToken.length > 0) {
            //     for (let i = 0; i < findToken.length; i++) {
            //         if (findToken[i].token != '' || findToken[i].token != null) {
            //             d[`registrations[${[ i ]}].id`] = findToken[i].token;
            //         }
            //     }
            // }
            // console.log(d);
            var data = querystring.stringify(d);
            // console.log(data);
            var options = {
                port: 443,
                //host:'test.oppwa.com',
                host: 'oppwa.com',
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'Content-Length': data.length,
                    Authorization:
                    'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA=='
                }
            };
            var postRequest = https.request(options, function(res) {
                console.log('resresres', res);
                
                        res.setEncoding('utf8');
                        res.on('data', function(chunk) {
                            console.log('asdadadadasdasda', JSON.parse(chunk));
                            jsonRes = JSON.parse(chunk);
                            let x = JSON.parse(chunk);
                            // console.log(x);
                            resolve(chunk)
                            // return response
                            //     .status(200)
                            //     .json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: x });
                        });
                    });
            console.log('postRequestpostRequestpostRequest');
    
            postRequest.write(data);
            postRequest.end();
        })
        
    }catch (err) {
        console.log(err)
        // return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

let postRequestFunction = (options)=>{
    console.log('optionsoptionsoptionsoptionsoptions',options);

    return new Promise((resolve, reject)=>{ 
        resolve()
        console.log('5433535',options);
        https.request(options, function(res) {
    console.log('resresres',res);
    
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                console.log('asdadadadasdasda', JSON.parse(chunk));
                jsonRes = JSON.parse(chunk);
                let x = JSON.parse(chunk);
                console.log(x);
                resolve(true)
                // return response
                //     .status(200)
                //     .json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: x });
            });
        });
    })
}