const md5=require('md5');
const AppConstraints=require('../../config/appConstraints.js');
const Driver=require('../models/User.js');
const User=require('../models/User.js');
const UnivershalFunction=require('../UnivershalFunctions/Univershalfunctions.js');
const Forgot=require('../models/Forgot.js');
const NodeGeocoder = require('node-geocoder');
const Bookings=require('../models/Bookings.js');
const pushNotification=require('../LIB/pushNotification.js');
const NotificationData=require('../models/notification.js');
const validator=require('email-validator');
const Review=require('../models/reviews.js');
const UserRating = require('../models/userRating');
const phoneverification =require('../models/phoneverification.js')
const twilio=require('twilio');
const client = new twilio(process.env.ACCOUNT_SID, process.env.ACCOUNT_AUTH_TOKEN);
const cron = require('node-cron');
const Issue=require('../models/issue');
const version = require('../models/Version');
exports.verifyEmailDriverPage=async(request,response)=>{
  try{
      return response.status(200).render('pages/verificationDriver');
  }catch(err){
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
  }
}
exports.VerifyDriverEmailAddress=async(request,response)=>{
  try{ let langaugeType = request.body.langaugeType;
         request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('id',langaugeType=="EN"?AppConstraints.VERIFICATION_ID.EN:AppConstraints.VERIFICATION_ID.AR).notEmpty();
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

        let decryptToken=await UnivershalFunction.DecryptToken(request.body.accessToken);

        if(!decryptToken)
        return response.status(200).json({statusCode:200,success:0,msg:langaugeType=="EN"?AppConstraints.INVALID_TOKEN_KEY.EN:AppConstraints.INVALID_TOKEN_KEY.AR});

        let findEmailCode=await Driver.findOne({email:decryptToken.email,userType:decryptToken.userType});

        if(findEmailCode && (findEmailCode.emailVerificationcode!==parseInt(request.body.id)))
        return response.status(200).json({statusCode:200,success:0,msg:langaugeType=="EN"?AppConstraints.INVALID_VERIFICATION_ID.EN:AppConstraints.INVALID_VERIFICATION_ID.AR});

        if(findEmailCode && (findEmailCode.emailVerificationcode===parseInt(request.body.id)) && findEmailCode.isEmailVerified)
        return response.status(200).json({statusCode:200,success:0,msg:langaugeType=="EN"?AppConstraints.EMAIL_ALREADY_VERIFIED.EN:AppConstraints.EMAIL_ALREADY_VERIFIED.AR});


        let makeEmailVerified=await Driver.update({email:decryptToken.email,userType:decryptToken.userType},{$set:{isEmailVerified:true}});
        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.EMAIL_VERIFIED.EN:AppConstraints.EMAIL_VERIFIED.AR});

  }catch(err){
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
  }
}


exports.loginDriver=async(request,response)=>{
    try{

        let langaugeType = request.body.langaugeType;
        console.log(request.body,'=======================request data========================');
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('password',langaugeType=="EN"?AppConstraints.PASSWORD.EN:AppConstraints.PASSWORD.AR).notEmpty();
        request.checkBody('email',langaugeType=="EN"?AppConstraints.EMAIL_ADDRESS.EN:AppConstraints.EMAIL_ADDRESS.AR).notEmpty();
        request.checkBody('email',langaugeType=="EN"?AppConstraints.VALID_EMAIL_ADDRESS.EN:AppConstraints.EMAIL_ADDRESS.AR).isEmail();
        request.checkBody('deviceType',langaugeType=="EN"?AppConstraints.DEVICE_TYPE.EN:AppConstraints.DEVICE_TYPE.AR).notEmpty();
        request.checkBody('deviceToken',langaugeType=="EN"?AppConstraints.DEVICE_TOKEN.EN:AppConstraints.DEVICE_TOKEN.AR).notEmpty();
        request.checkBody('lat',langaugeType=="EN"?AppConstraints.DRIVER_LAT.EN:AppConstraints.DRIVER_LAT.AR).notEmpty()
        request.checkBody('long',langaugeType=="EN"?AppConstraints.DRIVER_LONG.EN:AppConstraints.DRIVER_LONG).notEmpty()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});



        let CheckEmailExist=await Driver.findOne({email:request.body.email,userType:AppConstraints.DRIVER});

        if(!CheckEmailExist)
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.EMAIL_NOT_REGISTERED.EN:AppConstraints.EMAIL_NOT_REGISTERED.AR});

        let findDriver=await Driver.findOne({email:request.body.email,password:md5(request.body.password),userType:AppConstraints.DRIVER});

        if(!findDriver)
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.INVALID_EMAIL_PASSWORD.EN:AppConstraints.INVALID_EMAIL_PASSWORD});


        if(findDriver && findDriver.isBlocked)
        return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.SUSPENDED_ACCOUNT.EN:AppConstraints.SUSPENDED_ACCOUNT.AR});


        let criteria={
          email:request.body.email,
          password:md5(request.body.password),
          userType:AppConstraints.DRIVER
        }

        let randomValue=Math.floor(Date.now() / 1000) + (60 * 60);

        let token=await UnivershalFunction.GenerateToken({email:request.body.email,password:request.body.password,userType:AppConstraints.DRIVER})

        let dataToSet={
            $set:{
                  isOnline:true,
                  isAvailable:true,
                  deviceType:request.body.deviceType,
                  deviceToken:request.body.deviceToken,
                  accessToken:token,
                  lat:request.body.lat,
                  long:request.body.long,
                  currentLocation:[parseFloat(request.body.long),parseFloat(request.body.lat)]
                }

        }

















        let updateLoginStatus=await Driver.update(criteria,dataToSet);

        console.log(updateLoginStatus);

        let getDriverAllData=await Driver.findOne(criteria);
       
        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESSFULLY_LOG_IN.EN:AppConstraints.SUCCESSFULLY_LOG_IN,data:getDriverAllData});
    
      }catch(err){

      console.log(err,'==========login error==========================')

      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.renderResetDriver=async(request,response)=>{
  try{
      console.log(request.body);
      return response.status(200).render('pages/resetDriver');
  }catch(err){
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
  }
}



exports.resetPassword=async(request,response)=>{
  try{
    let langaugeType = request.body.langaugeType;
      console.log(request.body,'request data');
      request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

      request.checkBody('verificationcode',langaugeType=="EN"?AppConstraints.VERIFICATION_CODE.EN:AppConstraints.VERIFICATION_CODE.AR).notEmpty();
      request.checkBody('accessTokenkey',langaugeType=="EN"?AppConstraints.TOKEN.EN:AppConstraints.TOKEN.AR).notEmpty();
      request.checkBody('password',langaugeType=="EN"?AppConstraints.PASSWORD.EN:AppConstraints.PASSWORD.AR).notEmpty();
      let errors =await request.validationErrors();
      if (errors)
      return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
      let decryptToken=await UnivershalFunction.DecryptToken(request.body.accessTokenkey);
      if(!decryptToken)
      return response.status(200).json({statusCode:200,success:0, msg:AppConstraints.INVALID_TOKEN_KEY.EN});


      let checkIfLinkActive=await Forgot.findOne({email:decryptToken.email,forgotCode:request.body.verificationcode});

      if(!checkIfLinkActive)
      return response.status(200).json({statusCode:200,success:0, msg:langaugeType=="EN"?AppConstraints.INVALID_TOKEN_KEY_OR_CODE.EN:AppConstraints.INVALID_TOKEN_KEY_OR_CODE.AR});

      if(checkIfLinkActive && !checkIfLinkActive.isActive)
      return response.status(200).json({statusCode:200,success:0, msg:langaugeType=="EN"?AppConstraints.LINK_EXPIRED.EN:AppConstraints.LINK_EXPIRED.AR});

      await Promise.all([
          Driver.update({email:decryptToken.email,userType:decryptToken.userType},{$set:{password:md5(request.body.password)}}),
          Forgot.update({email:decryptToken.email,userType:decryptToken.userType,forgotCode:request.body.verificationcode},{$set:{isActive:false}})
      ]);


     
      response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.PASSWORD_SUCCESSFULLY_UPDATED.EN:AppConstraints.PASSWORD_SUCCESSFULLY_UPDATED.AR
    });    
  }catch(err){
     console.log(err,'erro here');
     return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
  }
}

exports.updateDriverProfile=async(request,response)=>{
    try{
        let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();


        let dataToSet={};


        if(request.body.name){
            dataToSet['name']=request.body.name
        }

        if(request.body.original){
            dataToSet['Profilepic.original']=request.body.original
        }

        if(request.body.thumbnail){
            dataToSet['Profilepic.thumbnail']=request.body.thumbnail;
        }


        if(request.body.gender){
            dataToSet['gender']=request.body.gender;
        }

        

        if(request.body.countryName){
            dataToSet['countryName']=request.body.countryName;
        }


        let criteria={
            _id:validateToken._id
        }

        await Driver.update(criteria,{$set:dataToSet});

        let findDriverData=await Driver.find(criteria);


        return response.status(200).json({success:1,msg:AppConstraints.langaugeType=="EN"?PROFILE_SUCCESSFULLY.EN:AppConstraints.PROFILE_SUCCESSFULLY.AR,data:findDriverData});


    }catch(err){
        console.log(err,'erro here');
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.changeDriverPassword=async(request,response)=>{
    try{
        let langaugeType = request.body.langaugeType;
        console.log(request.body,'request data');

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('newPassword',langaugeType=="EN"?AppConstraints.NEW_PASSWORD.EN:AppConstraints.NEW_PASSWORD.AR).notEmpty();
        request.checkBody('currentPassword',langaugeType=="EN"?AppConstraints.CURRENT_PASSWORD.EN:AppConstraints.CURRENT_PASSWORD.AR).notEmpty();
        request.checkBody('confirmPassword',langaugeType=="EN"?AppConstraints.CONFIRM_PASSWORD.EN:AppConstraints.CONFIRM_PASSWORD.AR).notEmpty();   
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});

        



        if(validateToken.password!==md5(request.body.currentPassword))
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.INVALID_CURRENT_PASSWORD.EN:AppConstraints.INVALID_CURRENT_PASSWORD.AR})

        if(request.body.newPassword!==request.body.confirmPassword)
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD.EN:AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD});

        if(request.body.newPassword===request.body.currentPassword)
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.NEW_NOT_EQUAL_TO_CONFIRM.EN:AppConstraints.NEW_NOT_EQUAL_TO_CONFIRM.AR});
        
        
        let randomValue=Math.floor(Date.now() / 1000) + (60 * 60);

        
        let payload={
            email:validateToken.email,
            password:request.body.newPassword,
            exp:randomValue,
            userType:AppConstraints.DRIVER
        }

        let token=await UnivershalFunction.GenerateToken(payload);


        let criteria={
            _id:validateToken._id,
            userType:AppConstraints.DRIVER
        }
        let dataToSet={
            $set:{password:md5(request.body.newPassword),accessToken:token}
        }
        await Driver.update(criteria,dataToSet);
        let DriverData=await Driver.findOne(criteria);
        return response.status(200).json({
                                            success:1,
                                            statusCode:200,
                                            msg:langaugeType=="EN"?AppConstraints.CHANGED_PASSWORD.EN:AppConstraints.CHANGED_PASSWORD.AR,
                                            data:DriverData
                                        });

    }catch(err){
        console.log(err,'erro here');
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.logoutDriver=async(request,response)=>{
    try{ let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();


        let criteria={
            _id:validateToken._id,
            userType:AppConstraints.DRIVER
        }

        let dataToSet={
            $set:{
                    isOnline:false,
                    isAvailable:false,
                    accessToken:""
                }
        }

        await Driver.update(criteria,dataToSet);


        return response.status(200).json({
                                            success:1,
                                            statusCode:200,
                                            msg:langaugeType=="EN"?AppConstraints.LOGOUT.EN:AppConstraints.LOGOUT.AR
                                        });


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.makeAvailabilityOnOff=async(request,response)=>{
    try{

        let langaugeType = request.query.langaugeType;
        console.log(request.query,'request data to availability');


        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('isAvailable',langaugeType=="EN"?AppConstraints.NEW_PASSWORD.EN:AppConstraints.NEW_PASSWORD.AR).notEmpty(); 
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});


        let criteria={
            _id:validateToken._id
        }

        let dataToSet={
            $set:{isAvailable:request.query.isAvailable}
        }


        await Driver.update(criteria,dataToSet);

        let getAvailability=await Driver.findOne(criteria);

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:{isAvailable:getAvailability.isAvailable}});

    }catch(err){

        console.log(err,'error in sending data');

        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}

exports.makePickUpOrder=async(request,response)=>{
    try{ let langaugeType = request.query.langaugeType;
        console.log(request.query,'===========request data picked up request=====================');
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});


        let findDeviceToken=await Bookings.findOne({_id:request.query.bookingId})
                                          .populate({path:"userId",select:{deviceToken:1,_id:1,langaugeType:1}})
                                          .populate({path:"driverId",select:{deviceToken:1,_id:1}})
////////////////////////driver notified///////////////////////////////////////////

        let criteriaDriver={
            recieverId:findDeviceToken.userId._id,
            isRead:false
        }

        let findTotalUnreadCountDriver=await NotificationData.count(criteriaDriver);

        let d=new Date();
        let dataToPushDriver={
            msg:langaugeType=="EN"?AppConstraints.DRIVER_PICKED_UP_ORDER.EN:AppConstraints.DRIVER_PICKED_UP_ORDER.AR,
            messageType:AppConstraints.APP_CONST_VALUE.PICKUP_ORDER,
            driverId:validateToken._id,
            bookingId:findDeviceToken._id,
            count:findTotalUnreadCountDriver
        }


        let newNotificationDriver=new NotificationData();
        newNotificationDriver.recieverId=findDeviceToken.userId._id,
        newNotificationDriver.bookingId=findDeviceToken._id
        newNotificationDriver.msg=AppConstraints.ORDER_PICKED_UP.EN+" "+validateToken.name
        newNotificationDriver.createDate=new Date().getTime()


////////////////////////driver notified///////////////////////////////////////////
////////////////////////driver notified///////////////////////////////////////////
        console.log("hello world!"+findDeviceToken.userId);

        let criteria={
            recieverId:findDeviceToken.userId._id,
            isRead:false
        }

        let findTotalUnreadCount=await NotificationData.count(criteria);
        let dataToPush={
            msg:findDeviceToken.userId.langaugeType=="EN"?AppConstraints.ORDER_PICKED_UP.EN+" "+validateToken.name:AppConstraints.ORDER_PICKED_UP.AR+" "+validateToken.name,
            messageType:AppConstraints.APP_CONST_VALUE.PICKUP_ORDER,
            userId:validateToken._id,
            bookingId:findDeviceToken._id,
            count:findTotalUnreadCount
        }


        let newNotification=new NotificationData();
        newNotification.recieverId=findDeviceToken.userId._id,
        newNotification.bookingId=findDeviceToken._id
        newNotification.msg=AppConstraints.ORDER_PICKED_UP.EN+" "+validateToken.name
        newNotification.msgAr=AppConstraints.ORDER_PICKED_UP.AR+" "+validateToken.name
        newNotification.createDate=new Date().getTime()
        await Promise.all([
             Bookings.update({_id:request.query.bookingId},{$set:{pickUpTime:d,isPickedUp:true,status:AppConstraints.APP_CONST_VALUE.HANDLE}}),
             pushNotification.sendPushToUser(findDeviceToken.userId.deviceToken,dataToPush),
             newNotification.save()
        ]);




       ////////////////////////driver notified///////////////////////////////////////////

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.ORDER_HAS_PICKED_UP.EN:AppConstraints.ORDER_HAS_PICKED_UP.AR})

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}









exports.makeDeliveredOreder=async(request,response)=>{
    try{
        let langaugeType = request.query.langaugeType;

        console.log(request.body,'dhsdhshdghs mark as complete')

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});

        let findDeviceToken=await Bookings.findOne({_id:request.query.bookingId}).populate({path:"userId",select:{}})
       
        let criteria={
            recieverId:findDeviceToken.userId._id,
            isRead:false
        }

        let findTotalUnreadCount=await NotificationData.count(criteria);

       

        let dataToPush={
            msg:findDeviceToken.userId.langaugeType=="EN"?AppConstraints.YOUR_ORDERER_HAS_DELEVERED.EN:AppConstraints.YOUR_ORDERER_HAS_DELEVERED.AR,
            messageType:AppConstraints.APP_CONST_VALUE.DELIVERED,
            userId:validateToken._id,
            bookingId:findDeviceToken._id,
            count:findTotalUnreadCount
        }


        let newNotification=new NotificationData();
        newNotification.recieverId=findDeviceToken.userId._id
        newNotification.bookingId=findDeviceToken._id
        newNotification.msg=AppConstraints.YOUR_ORDERER_HAS_DELEVERED.EN
        newNotification.msgAr=AppConstraints.YOUR_ORDERER_HAS_DELEVERED.AR
        newNotification.messageType=AppConstraints.APP_CONST_VALUE.DELIVERED
        newNotification.createDate=new Date().getTime()
        // let newNotificationToUser=new NotificationData();
        // newNotificationToUser.recieverId=


      

        let data={
            phoneNumber:findDeviceToken.userId.callingCode+findDeviceToken.userId.phoneNumber,
            message:findDeviceToken.userId.langaugeType=="EN"?AppConstraints.FIRST_HALF.EN+findDeviceToken.orderId+AppConstraints.SECOND_HALF.EN:AppConstraints.FIRST_HALF.AR+findDeviceToken.orderId+AppConstraints.SECOND_HALF.AR
        }

       
     

        let data1= await Promise.all([
            Bookings.update({_id:request.query.bookingId},{$set:{isCompleted:true,status:AppConstraints.APP_CONST_VALUE.COMPLETED,isDelevered:true}}),
            Driver.update(criteria,{$inc:{load:-1}}),
            pushNotification.sendPushToUser(findDeviceToken.userId.deviceToken,dataToPush),
            // pushNotification.sendPush(findDeviceToken.userId.deviceToken,dataToPush),
            newNotification.save(),
            UnivershalFunction.unifonicMessage(data)
        ]);



        console.log('=============unifonic     data1=====================',data1[4])

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.DILEVER_ORDER_SUCCESS.EN:AppConstraints.DILEVER_ORDER_SUCCESS.AR})
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}





exports.raiseAnIssueByDriver=async(request,response)=>{
    try{ let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        if(!request.query.issue)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ISSUE.EN});
        request.checkQuery('issue',AppConstraints.ISSUE_TITLE.EN).notEmpty();
        request.checkQuery('issueType',AppConstraints.ISSUE_TYPE.EN).notEmpty();
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
        let content=request.query.issueType+'<br /> '+validateToken.name +"with email address "+validateToken.email+" has raise an issue "+request.query.issue+'<br />'+request.query.imageUrl;
        await UnivershalFunction.sendEmailToAdmin(content,AppConstraints.ISSUE_BY_DRIVER.EN);


        console.log(request.query,'raise and issue')

        console.log('recently');

        let issueData=new Issue();
        issueData.userId=validateToken._id;
        issueData.issue=request.query.issue;
        issueData.issueType=request.query.issueType;
        issueData.userType=AppConstraints.DRIVER;
        
        await issueData.save();
        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.ISSUE_CREATED_SUCCESS.EN:AppConstraints.ISSUE_CREATED_SUCCESS.AR});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}

exports.ratingToUser=async(request,response)=>{
    console.log(request.body,"rrrrrrrrrrrrrrrrrrrrrrrrrrrr")
    try{ let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkBody('rating',AppConstraints.ISSUE_TITLE.EN).notEmpty();
        request.checkBody('bookingId',AppConstraints.RATING_BY_USER.EN).notEmpty();
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        console.log(request.body,"11111111111111")
        let errors =await request.validationErrors();
        console.log(errors,"errorsssss")
        if (errors)
            return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
        console.log(request.body,"2222222222222222")
        let getBooking = await Bookings.findOne({_id:request.body.bookingId});
        console.log(getBooking,"getBookinggetBookinggetBooking",);
        let rating = new UserRating();
        rating.bookingId = request.body.bookingId;
        rating.driverId = getBooking.driverId;
        rating.userId = getBooking.userId;
        rating.rating = request.body.rating;
        let rate = await rating.save();

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:rate});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
};

exports.driverScheduledBooking=async(request,response)=>{
    try{
        let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('page',langaugeType=="EN"?AppConstraints.PAGE_NUMBER.EN:AppConstraints.PAGE_NUMBER.AR).notEmpty();
        request.checkBody('perPage',langaugeType=="EN"?AppConstraints.PER_PAGE.EN:AppConstraints.PER_PAGE.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});
        let scheduledCriteria={
            $and:[{driverId:validateToken._id},
            {$or:[
                {status:AppConstraints.APP_CONST_VALUE.CONFIRMED},
                {status:AppConstraints.APP_CONST_VALUE.MOVE}
            ]}
           ]
        };
        let bookingsData=await Promise.all([
                                 Bookings.find(scheduledCriteria)
                                .sort({"_id":-1})
                                .skip((parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage))
                                .limit(parseInt(request.body.perPage))
                                .populate({path:"userId",select:{"name":1,"phoneNumber":1,"callingCode":1}})
                                .populate({path:"laundryId",select:{"laundryName":1,"laundryLat":1,"laundryLong":1,"laundryAddress":1}}),               
                                Bookings.count(scheduledCriteria)
                                ]);
        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:bookingsData[0],totalCount:bookingsData[1]});
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}







exports.driverConfirmedBooking=async(request,response)=>{
    try{
        let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('page',langaugeType=="EN"?AppConstraints.PAGE_NUMBER.EN:AppConstraints.PAGE_NUMBER.AR).notEmpty();
        request.checkBody('perPage',langaugeType=="EN"?AppConstraints.PER_PAGE.EN:AppConstraints.PAGE_NUMBER.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});
        let confirmedCriteria={
            $and:[{driverId:validateToken._id},
            {$or:[
                {status:AppConstraints.APP_CONST_VALUE.ACCEPTED},
                {status:AppConstraints.APP_CONST_VALUE.PICKEDUP},
                {status:AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY},
                {status:AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING}
            ]}
        ]
            
        };
        let bookings = await Promise.all([
                    Bookings.find(confirmedCriteria)
                    .sort({"_id":-1})
                    .skip((parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage))
                    .limit(parseInt(request.body.perPage))
                    .populate({path:"laundryId",select:{"laundryName":1,"laundryLat":1,"laundryLong":1,"laundryAddress":1}})           
                    .populate({path:"userId",select:{"name":1,"phoneNumber":1,"callingCode":1}}),
                    Bookings.count(confirmedCriteria)
        ]);                        

      

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:bookings[0],totalCount:bookings[1]});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}




exports.sendForgotPasswordLinkDriver=async(request,response)=>{
    try{ let langaugeType = request.body.langaugeType;
            console.log(request.query,'request data')

           

            if(!request.query.forgotField)
            return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.FORGOT_FIELD.EN:AppConstraints.FORGOT_FIELD.AR});

            if(validator.validate(request.query.forgotField)){

            let ifEmailExist=await Driver.findOne({email:request.query.forgotField,userType:AppConstraints.DRIVER});
            if(!ifEmailExist)
            return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.NOT_A_VALID_FORGOT_EMAIL.EN:AppConstraints.NOT_A_VALID_FORGOT_EMAIL.AR});


           
            request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();




            let token=await UnivershalFunction.GenerateToken({email:request.query.forgotField,userType:AppConstraints.DRIVER});
            let rand = Math.floor((Math.random() * 1000) + 540000);


            let link=`${process.env.BASE_URL}renderForgotPageDriver?id=${rand}&accessToken=${token}`;


            let content="<br/>"+AppConstraints.CLICK_BELOW_FORGOT.EN+"<br /><br /><br />"+link+"</a>"
    
            let forgot = new Forgot();
            forgot.email=request.query.forgotField;
            forgot.forgotCode=rand;
            forgot.userType=AppConstraints.DRIVER;

            let makeForgot=await Promise.all([
                forgot.save(),
                UnivershalFunction.sendEmail(request.query.forgotField,content,AppConstraints.FORGOT_SUBJECT.EN)
            ]);


            console.log(makeForgot[0]);
            

            return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.RESET_PASSWORD_LINK.EN:AppConstraints.RESET_PASSWORD_LINK.AR});
           
        
        }
        else if(!isNaN(parseFloat(request.body.forgotField)) && isFinite(request.body.forgotField)){

        }
        else{
            return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.INVALID_FORGOT_FIELD.EN:AppConstraints.INVALID_FORGOT_FIELD.AR});
        }
    }catch(err){
        console.log(err,'error data');
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.renderForgotPageDriver=async(request,response)=>{
    try{
        let langaugeType = request.body.langaugeType;
        console.log(request.body,'request data');

        return response.status(200).render('pages/forgotDriver');


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message}); 
    }
}



exports.updateDriverPasswordFromEmail=async(request,response)=>{
 
        try{ let langaugeType = request.body.langaugeType;
            request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

            request.checkBody('verificationcode',AppConstraints.VERIFICATION_CODE.EN).notEmpty();
            request.checkBody('accessTokenkey',AppConstraints.TOKEN.EN).notEmpty();
            request.checkBody('password',langaugeType=="EN"?AppConstraints.PASSWORD.EN:AppConstraints.PASSWORD.AR).notEmpty();
            let errors =await request.validationErrors();
            if (errors)
            return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
            let decryptToken=await UnivershalFunction.DecryptToken(request.body.accessTokenkey);
            if(!decryptToken)
            return response.status(200).json({statusCode:200,success:0, msg:langaugeType=="EN"?AppConstraints.INVALID_TOKEN_KEY.EN:AppConstraints.INVALID_TOKEN_KEY.AR});
            let checkIfLinkActive=await Forgot.findOne({email:decryptToken.email,forgotCode:request.body.verificationcode,userType:decryptToken.userType});
            if(!checkIfLinkActive)
            return response.status(200).json({statusCode:200,success:0, msg:langaugeType=="EN"?AppConstraints.INVALID_TOKEN_KEY_OR_CODE.EN:AppConstraints.INVALID_TOKEN_KEY_OR_CODE.AR});
            if(checkIfLinkActive && !checkIfLinkActive.isActive)
            return response.status(200).json({statusCode:200,success:0, msg:langaugeType=="EN"?AppConstraints.LINK_EXPIRED.EN:AppConstraints.LINK_EXPIRED.AR});
            let makeUpdation=await Promise.all([
                Driver.update({email:decryptToken.email,userType:decryptToken.userType},{$set:{password:md5(request.body.password)}}),
                Forgot.update({email:decryptToken.email,forgotCode:request.body.verificationcode,userType:decryptToken.userType},{$set:{isActive:false}})
            ]);

            console.log(makeUpdation[0]);

            response.status(200).json({success:1,statusCode:200,msg:AppConstraints.langaugeType=="EN"?PASSWORD_SUCCESSFULLY_UPDATED.EN:PASSWORD_SUCCESSFULLY_UPDATED.AR});
            
            
        }catch(err){
           return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
        }
}



exports.getAllReviewsByDriver=async(request,response)=>{
    try{

        let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('perPage',AppConstraints.PER_PAGE.EN).notEmpty();
        request.checkQuery('page',AppConstraints.PAGE.EN).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});

        let criteria={
            isDeleted:false
        };

        let findReviews=await Promise.all([
            Review.find(criteria)
            .sort({"_id":-1})
            .skip((parseInt(request.query.perPage)*parseInt(request.query.page)) - parseInt(request.query.perPage))
            .limit(parseInt(request.query.perPage))
            .populate({path:'userId',select:{name:1}}),
            Review.count(criteria)
        ]);

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:findReviews[0],totalResult:findReviews[1]});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.acceptBooking=async(request,response)=>{
    try{
        let langaugeType = request.query.langaugeType;
        console.log(request.query,'query data');

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});


       


        let criteria={
            recieverId:validateToken._id,
            isRead:false
        }

        let findTotalUnreadCount=await NotificationData.count(criteria);

        let d=new Date();

        let dataToPush={
            msg:validateToken.langaugeType=="EN"?AppConstraints.ORDER_PICKED_UP.EN:AppConstraints.ORDER_PICKED_UP.AR,
            messageType:AppConstraints.APP_CONST_VALUE.ACCEPTED,
            bookingId:request.query.bookingId,
            count:findTotalUnreadCount
        }


        let newNotification=new NotificationData();
        newNotification.recieverId=validateToken._id
        newNotification.bookingId=request.query.bookingId
        newNotification.msg=AppConstraints.ACCEPT_ORDER_BY_DRIVER.EN
        newNotification.msgAr=AppConstraints.ACCEPT_ORDER_BY_DRIVER.AR
        newNotification.messageType=AppConstraints.APP_CONST_VALUE.ACCEPTED
        newNotification.createDate=new Date().getTime()

        await Promise.all([
            Bookings.update({_id:request.query.bookingId},{$set:{status:AppConstraints.APP_CONST_VALUE.ACCEPTED}}),
            pushNotification.sendPush(validateToken.deviceToken,dataToPush),
            newNotification.save()
        ]);

        return response.status(200).json({statusCode:200,success:1,msg:langaugeType=="EN"?AppConstraints.BOOKING_ACCEPTED.EN:AppConstraints.BOOKING_ACCEPTED.AR});

    }catch(err){
        console.log(err,'error data');
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.getNotificationListingByDriver=async(request,response)=>{
    try{


        let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();


      


        request.checkQuery('page',langaugeType=="EN"?AppConstraints.PAGE.EN:AppConstraints.PAGE.AR).notEmpty();
        request.checkQuery('perPage',langaugeType=="EN"?AppConstraints.PER_PAGE.EN:AppConstraints.PER_PAGE.EN).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});

        let criteria={
            isDeleted:false,
            recieverId:validateToken._id
        }

        let getNotification=await Promise.all([ 
                                                  NotificationData.find(criteria)
                                                  .sort({_id:-1})
                                                  .skip(parseInt(request.query.perPage)*parseInt(request.query.page)-parseInt(request.query.perPage))
                                                  .limit(parseInt(request.query.perPage)),
                                                  NotificationData.count(criteria)
                                              ]);


        await NotificationData.updateMany(criteria,{$set:{isRead:true}});
        
        return response.status(200).json({success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,statusCode:200,data:getNotification[0],totalResult:getNotification[1]})




    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.acceptedBookingsListByDriver=async(request,response)=>{
    try{

        let langaugeType = request.query.langaugeType;
        let findUserData=[];

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let confirmedCriteria={
            $and:[{driverId:validateToken._id},
            {$or:[
                {status:AppConstraints.APP_CONST_VALUE.ACCEPTED},
                {status:AppConstraints.APP_CONST_VALUE.PICKEDUP},
                {status:AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY},
                {status:AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING},
            ]}
        ]
            
        };
        let findUserData1=await Bookings.find(confirmedCriteria)
                                        .sort({_id:-1})
                                        .populate({path:'userId',select:{name:1}})
                                        .populate({path:'laundryId',select:{laundryName:1,laundryAddress:1}})
        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:findUserData1})




    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.quickReviewWash=async(request,response)=>{
    try{
        let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});

        // let findTotalDriver=await User.count({isBlocked:false,userType:AppConstraints.DRIVER});


        // console.log(findTotalDriver,'================findTotalDriver==================findTotalDriver========findTotalDriver')



        let findTotalReview=await Review.find({driverId:validateToken._id,isDeleted:false},{driverRating:1});

        let findTotalNumberOfUserRated=await Review.count({driverId:validateToken._id,isDeleted:false});


        console.log(findTotalReview.length,'======================///////////////==================')

       
        let totalNumberOfReviews=0.0;
        for(let i=0;i<findTotalReview.length;i++){
            totalNumberOfReviews+=parseFloat(findTotalReview[i].driverRating)
        }

        console.log(totalNumberOfReviews);
        console.log(findTotalNumberOfUserRated);
        let totalRattingToDriver = 0
        if(parseFloat(totalNumberOfReviews/findTotalNumberOfUserRated)>0)
        totalRattingToDriver=(totalNumberOfReviews/findTotalNumberOfUserRated)

        console.log(totalRattingToDriver,'=============totalRattingToDriver=============')


        let findStatus=await Promise.all([
         
            
            Bookings.count({
                $and : [
                    {driverId:validateToken._id },
                    { $or : [ { status:AppConstraints.APP_CONST_VALUE.MOVE }, { status:AppConstraints.APP_CONST_VALUE.ACCEPTED },{ status:AppConstraints.APP_CONST_VALUE.HANDLE },{status:AppConstraints.APP_CONST_VALUE.REASSIGNED} ,{status:AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY},{status:AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING}] }
                ]
            }),
            Bookings.count({driverId:validateToken._id,status:AppConstraints.APP_CONST_VALUE.CANCELLED}),
            Bookings.count({driverId:validateToken._id,$or:[{status:AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING},{status:AppConstraints.APP_CONST_VALUE.PICKEDUP},{status:AppConstraints.APP_CONST_VALUE.HANDLE}]}),
        ]);

        console.log(findStatus+"|||||||||||||||||||||||");
        console.log("incentive"+validateToken.incentive)



        return response.status(200).json({
                                        success:1,
                                        statusCode:200,
                                        msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,
                                        data:{
                                                activeOrders:findStatus[0],
                                                notResponded:findStatus[1],
                                                volumes:findStatus[2],
                                                incentive:validateToken.incentive,
                                                totalRattingToDriver:totalRattingToDriver>5?5:totalRattingToDriver
                                              }
                                        });

    }catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.orderDetailsForDriver=async(request,response)=>{
    try{
        let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});


        
        let findOrderDetail=await Bookings.findOne({_id:request.query.bookingId})
                                          .populate({path:'userId',select:{}})
                                          .populate({path:"laundryId",select:{"laundryName":1,"laundryLat":1,"laundryLong":1}})           




        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR.EN,data:findOrderDetail});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.changeDriverPhoneNumber=async(request,response)=>{
    try{ let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('phoneNumber',AppConstraints.PHONE_NUMBER.EN).notEmpty();
        request.checkQuery('callingCode',AppConstraints.CALLING_CODE.EN).notEmpty();
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});


        let criteria={
            _id:validateToken._id
        }

        let dataToUpdate={};
        dataToUpdate['phoneNumber']=request.query.phoneNumber;
        dataToUpdate['callingCode']=request.body.callingCode;

        await Driver.update(criteria,{$set:dataToUpdate});


        let findDriverDate=await Driver.findOne(criteria);

        console.log(findDriverDate,'driver data');

        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,data:findDriverDate})


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}





exports.sendOtpByDriver=async(request,response)=>{
    try{ let langaugeType = request.query.langaugeType;
        console.log(request.body,'body data data');
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('phoneNumber',AppConstraints.PHONE_NUMBER.EN).notEmpty();
        request.checkQuery('callingCode',AppConstraints.CALLING_CODE.EN).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});
        let criteriaPhoneNumber={
            phoneNumber:request.query.phoneNumber,
            userType:AppConstraints.DRIVER
        }
        let ifPhoneAlready=await Driver.findOne(criteriaPhoneNumber);
        if(ifPhoneAlready)
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.PHONE_ALREADY.EN:AppConstraints.PHONE_ALREADY.AR});

        let randomValue=new Date(new Date().getTime()+60000).getTime();
        var otpval=Math.floor(1000 + Math.random() * 9000);
        let otpDataVal=langaugeType=="EN"?AppConstraints.OTP_CODE.EN:AppConstraints.OTP_CODE.AR+otpval;


        console.log('hello')

        let data={
            phoneNumber:request.query.callingCode+request.query.phoneNumber,
            message:otpDataVal
        }

        let sendOtp=await UnivershalFunction.unifonicMessage(data);


        console.log(sendOtp,'====================== sendOtp ====================')
        

        // var message = await client.messages.create({
        //     body:otpDataVal,
        //     to:request.query.callingCode+request.query.phoneNumber, 
        //     from:process.env.PHONE_NUMBER
        // });

        // if(message.error)
        // return response.status(400).json({statusCode:400,success:0,msg:message.error,err:message.error});

        let pv=new phoneverification();
        pv.callingCode=request.query.callingCode;
        pv.phoneNumber=request.query.phoneNumber;
        pv.otp=otpval;
        pv.expiryDate=randomValue;
        let saveOtp=await pv.save();
        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.OTP_SEND_SUCCESSFULLY.EN:AppConstraints.OTP_SEND_SUCCESSFULLY.AR,data:saveOtp});
    

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.verifyOtpByDriver=async(request,response)=>{
    try{

        let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        console.log(request.query,'request data')

        request.checkQuery('otpId',langaugeType=="EN"?AppConstraints.OTP_ID_REQUIRED.EN:AppConstraints.OTP_ID_REQUIRED.AR).notEmpty().isMongoId();
        request.checkQuery('otp',langaugeType=="EN"?AppConstraints.OTP_REQUIRED.EN:AppConstraints.OTP_REQUIRED.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

        let criteria={
            _id:request.query.otpId,
            isActive:true,
            otp:request.query.otp
        }


        let findifExist=await phoneverification.findOne(criteria);

        if(!findifExist)
        return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.INVALID_OTP_CODE.EN:AppConstraints.INVALID_OTP_CODE.AR});

        console.log('gsg ddd')

        let d=new Date();
        if(findifExist.expiryDate<d.getTime())
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.EXPIRED.EN});
        await phoneverification.update(criteria,{$set:{isActive:false}});
        await User.update({_id:validateToken._id},{$set:{phoneNumber:findifExist.phoneNumber,callingCode:findifExist.callingCode}})
        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.OTP_VERIFIED_SUCCESSFULLY.EN:AppConstraints.OTP_VERIFIED_SUCCESSFULLY.AR})


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}




exports.resendOtpByDriver=async(request,response)=>{
    try{ let langaugeType = request.query.langaugeType;
        request.checkQuery('otpId',AppConstraints.PHONE_NUMBER.EN).notEmpty().isMongoId();
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

        let findPhone=await phoneverification.findOne({_id:request.query.otpId});
        if(!findPhone)
        return response.status(200).json({success:0,statusCode:400,msg:AppConstraints.INVALID_OTP_ID.EN});

        
        var otpval=Math.floor(1000 + Math.random() * 9000);
        
        let otpDataVal=langaugeType=="EN"?AppConstraints.OTP_CODE.EN:AppConstraints.OTP_CODE.AR+otpval;


        let data={
            phoneNumber:findPhone.callingCode+findPhone.phoneNumber,
            message:otpDataVal
        }

        let sendOtp=await UnivershalFunction.unifonicMessage(data);

        console.log(sendOtp,'===============sendOtp===================')
        
        let randomValue=new Date(new Date().getTime()+60000).getTime();

        console.log(randomValue,'new expiry date');
    
        await phoneverification.update({_id:request.query.otpId},{$set:{otp:otpval,expiryDate:randomValue,isActive:true}});

        let getOtp=await phoneverification.findOne({_id:request.query.otpId});

        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.OTP_SEND_SUCCESSFULLY.EN:AppConstraints.OTP_SEND_SUCCESSFULLY,data:getOtp});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.handlecollect = async (request,response)=>{
    try{ let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('handleOrCollect',AppConstraints.HANDLE_OR_COLLECT.EN).notEmpty();
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});

        if(request.query.handleOrCollect=='handle'||request.query.handleOrCollect=='Handle'||request.query.handleOrCollect=='HANDLE'){
            let handleList = await Bookings.find({status:AppConstraints.APP_CONST_VALUE.HANDLE}).populate({path:"userId",select:{"name":1,"phoneNumber":1,"callingCode":1}})
                                                                                                .populate({path:"laundryId",select:{"laundryName":1,"laundryLat":1,"laundryLong":1,"laundryAddress":1}});
            let totalHandle =await Bookings.count({status:AppConstraints.APP_CONST_VALUE.HANDLE});
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.HANDLE_LIST.EN,data:handleList,totalCount:totalHandle})
        }


        if(request.query.handleOrCollect==='collect'||request.query.handleOrCollect==='Collect'||request.query.handleOrCollect==='COLLECT'){
            
      
            let criteria={
                $or:[{status:AppConstraints.APP_CONST_VALUE.COLLECT},{status:AppConstraints.APP_CONST_VALUE.REASSIGNED}]
            }

            let collectList = await Bookings.find(criteria).populate({path:"userId",select:{"name":1,"phoneNumber":1,"callingCode":1}}).populate({path:"laundryId",select:{"laundryName":1,"laundryLat":1,"laundryLong":1,"laundryAddress":1}});;
            let totalCollect =await Bookings.count(criteria);
            return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.COLLECT_LIST.EN:AppConstraints.COLLECT_LIST.AR,data:collectList,totalCount:totalCollect})
       
        }

      
    }
    catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}

exports.readytomove = async (request,response)=>{console.log(request.body);
    try{ let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 

        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});

            await Bookings.update({_id:request.body.bookingId},{$set:{status:AppConstraints.APP_CONST_VALUE.MOVE}})

            let b = await Bookings.findOne({_id:request.body.bookingId});
            let criteriaUser={
                recieverId:b.userId,
                isRead:false
            };
            let user = await User.findOne({_id:b.userId});

            let findTotalUnreadCountUser=await NotificationData.count(criteriaUser);
            let dataToPushUser = {
                msg:user.langaugeType=="EN"?AppConstraints.READY_TO_MOVE.EN:AppConstraints.READY_TO_MOVE.AR,
                messageType:AppConstraints.APP_CONST_VALUE.MOVE,
                driverId:b.driverId,
                bookingId:b._id,
                count:findTotalUnreadCountUser+1
            }

            let newNotificationUser=new NotificationData();
            newNotificationUser.recieverId=b.userId,
            newNotificationUser.bookingId=b._id,
            newNotificationUser.msg=AppConstraints.READY_TO_MOVE.EN;
            newNotificationUser.msgAr=AppConstraints.READY_TO_MOVE.AR;
            newNotificationUser.messageType=AppConstraints.APP_CONST_VALUE.MOVE;
            newNotificationUser.createDate=new Date().getTime()
            await Promise.all([
                pushNotification.sendPushToUser(user.deviceToken,dataToPushUser),
                newNotificationUser.save(),
            ])
        
        return response.status(200).json({statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,success:1})

    }
    catch(err){

    console.log(err,'error data')    

    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.collect = async (request,response) => {
    try{ let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
        
        //let update = new Date().getTime()+86400000
        let update = new Date().getTime()+ 64800000
        await Bookings.update({_id:request.body.bookingId},{$set:{status:AppConstraints.APP_CONST_VALUE.COLLECT,notificationDate:update}});
            let b = await Bookings.findOne({_id:request.body.bookingId}).populate({path:'userId',select:{}});
            let criteriaUser={
                recieverId:b.userId._id,
                isRead:false
            };
            let findTotalUnreadCountUser=await NotificationData.count(criteriaUser);
            let user = await User.findOne({_id:b.userId._id});
            let dataToPushUser = {
                msg:user.langaugeType=="EN"?AppConstraints.UNDER_PROCESS.EN:AppConstraints.UNDER_PROCESS.AR,
                messageType:AppConstraints.APP_CONST_VALUE.UNDERPROCESS,
                driverId:b.driverId,
                bookingId:b._id,
                count:findTotalUnreadCountUser+1
            }

            let newNotificationUser=new NotificationData();
            newNotificationUser.recieverId=b.userId,
            newNotificationUser.bookingId=b._id,
            newNotificationUser.msg=AppConstraints.UNDER_PROCESS.EN;
            newNotificationUser.msgAr=AppConstraints.UNDER_PROCESS.AR;
            newNotificationUser.messageType=AppConstraints.APP_CONST_VALUE.UNDERPROCESS;
            newNotificationUser.createDate=new Date().getTime()
            await Promise.all([
                pushNotification.sendPushToUser(user.deviceToken,dataToPushUser),
                newNotificationUser.save(),
            ]);
            return response.status(200).json({statusCode:200,msg:AppConstraints.SUCCESS.EN,success:1});



    }
    catch(err){
        console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.pickedupfromlaundry = async (request,response) => {
    try{ let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
        
        await Bookings.update({_id:request.query.bookingId},{$set:{status:AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY}});
            let b = await Bookings.findOne({_id:request.query.bookingId});
            let criteriaUser={
                recieverId:b.userId,
                isRead:false
            };
            let findTotalUnreadCountUser=await NotificationData.count(criteriaUser);
            let user = await User.findOne({_id:b.userId});

            let dataToPushUser = {
                msg:user.langaugeType=="EN"?AppConstraints.PICKUP_LAUNDRY.EN:AppConstraints.PICKUP_LAUNDRY.AR,
                messageType:AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY,
                driverId:b.driverId,
                bookingId:b._id,
                count:findTotalUnreadCountUser+1
            }

            let newNotificationUser=new NotificationData();
            newNotificationUser.recieverId=b.userId,
            newNotificationUser.bookingId=b._id,
            newNotificationUser.msg=AppConstraints.PICKUP_LAUNDRY.EN;
            newNotificationUser.msgAr=AppConstraints.PICKUP_LAUNDRY.AR;
            newNotificationUser.messageType=AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY;
            newNotificationUser.createDate=new Date().getTime()


//////////////////////////////////on the way notification/////////////////////////////////////////////////////////

            // let dataToPushUser = {
            //     msg:AppConstraints.ON_THE_WAY,
            //     messageType:AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY,
            //     driverId:b.driverId,
            //     bookingId:b._id,
            //     count:findTotalUnreadCountUser+1
            // }

            // let newNotificationUser=new NotificationData();
            // newNotificationUser.recieverId=b.userId,
            // newNotificationUser.bookingId=b._id,
            // newNotificationUser.msg=AppConstraints.PICKUP_LAUNDRY;
            // newNotificationUser.messageType=AppConstraints.APP_CONST_VALUE.PICKEDUPFROMLAUNDRY;

//////////////////////////////////on the way notification/////////////////////////////////////////////////////////





            await Promise.all([
                pushNotification.sendPushToUser(user.deviceToken,dataToPushUser),
                newNotificationUser.save(),
            ])
        


        return response.status(200).json({statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR,success:1});
    }
    catch(err){
        console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}



exports.userNotAvailable=async(request,response)=>{
     try{
        let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateDriverAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        request.checkBody('notAvailableType',AppConstraints.NOT_AVAILABLE_TYPE).notEmpty();
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
        
        let FindOrderStatus=await Bookings.findOne({_id:request.body.bookingId}).populate({path:'userId',select:{}})
        
        if(!FindOrderStatus)
        return response.status(400).json({statusCode:400,msg:'Invalid booking id ',success:1})


        if(request.body.notAvailableType=='PICKEDUP'){
            
            let newPickupTime=new Date().getTime()+86400000;
           // let newPickupTime=new Date().getTime()+60000
            let criteria={
                recieverId:FindOrderStatus.userId._id,
                isRead:false
            }

            let findTotalUnreadCount=await NotificationData.count(criteria);
          
            let dataToPush={
                msg:FindOrderStatus.userId.langaugeType=="EN"?AppConstraints.PICKUP_HAS_RESCHEDULED.EN:AppConstraints.PICKUP_HAS_RESCHEDULED.AR,
                messageType:AppConstraints.APP_CONST_VALUE.RESCHEDULED,
                userId:validateToken._id,
                bookingId:FindOrderStatus._id,
                count:findTotalUnreadCount+1
            }
    
    
            let newNotification=new NotificationData();
            newNotification.recieverId=FindOrderStatus.userId._id,
            newNotification.bookingId=FindOrderStatus._id;
            newNotification.msg=AppConstraints.PICKUP_HAS_RESCHEDULED.EN,
            newNotification.msgAr=AppConstraints.PICKUP_HAS_RESCHEDULED.AR,
            newNotification.messageType=AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER;
            newNotification.createDate=new Date().getTime()


            console.log("hello");




            await Promise.all([
                Bookings.update(
                    {_id:request.body.bookingId},
                    {$set:{
                            newDateToHandelDriverReschedule:newPickupTime,deliveryDate:newPickupTime+86400000,
                            pickUpDate:newPickupTime,isRescheduledBookingByDriver:true,pickupTimeNotAvailable:true
                          }
                    }),
                newNotification.save(),
                pushNotification.sendPushToUser(FindOrderStatus.userId.deviceToken,dataToPush),   
            ])


////       after 24 hours status changed to confirm///////////

            return response.status(200).json({success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.EN,statusCode:200})

        }

        else if(request.body.notAvailableType=='DELEVERED'){


 ////       after 24 hours status changed to reassigned/////////// 



            let newPickupTime=new Date().getTime()+86400000;
          //  let newPickupTime=new Date().getTime()+60000;
            let criteria={
                recieverId:FindOrderStatus.userId._id,
                isRead:false
            }
            let findTotalUnreadCount=await NotificationData.count(criteria);

            let dataToPush={
                msg:FindOrderStatus.userId.langaugeType=="EN"?AppConstraints.DELIVERY_RESCHEDULED.EN:AppConstraints.DELIVERY_RESCHEDULED.AR,
                messageType:AppConstraints.APP_CONST_VALUE.RESCHEDULED,
                userId:validateToken._id,
                bookingId:FindOrderStatus._id,
                count:findTotalUnreadCount+1
            }


            let newNotification=new NotificationData();
            newNotification.recieverId=FindOrderStatus.userId._id,
            newNotification.bookingId=FindOrderStatus._id;
            newNotification.msg=AppConstraints.NOT_AVAILABLE_USER.EN;
            newNotification.messageType=AppConstraints.APP_CONST_VALUE.RESCHEDULED;
            newNotification.createDate=new Date().getTime()

           



            await Promise.all([
                Bookings.update({_id:request.body.bookingId},{$set:{deliveryTimeNotAvailable:true,newDateToHandelDriverReschedule:newPickupTime,deliveryDate:newPickupTime,isRescheduledBookingByDriver:true}}),
                newNotification.save(),
                pushNotification.sendPushToUser(FindOrderStatus.userId.deviceToken,dataToPush)
            ])

            
            return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.EN})
        }

       



     }catch(err){
         console.log('dhfdhf',err)
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
     }
}


exports.goingToUser=async(request,response)=>{
    try{

        let langaugeType = request.query.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkQuery('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('bookingId',langaugeType=="EN"?AppConstraints.BOOKING_ID.EN:AppConstraints.BOOKING_ID.AR).notEmpty().isMongoId(); 
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});

        let findDetail=await Bookings.findOne({_id:request.query.bookingId}).populate({path:'userId',select:{deviceToken:1,langaugeType:1}})
        let criteria={
            recieverId:findDetail.userId._id,
            isRead:false
        }
        let findTotalUnreadCount=await NotificationData.count(criteria);

       
        let dataToPush={
            msg:  findDetail.userId.langaugeType=="EN"?AppConstraints.DRIVER_MOOVING_TO_YOU.EN:AppConstraints.DRIVER_MOOVING_TO_YOU.AR,
            messageType:AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING,
            userId:validateToken._id,
            bookingId:findDetail._id,
            count:findTotalUnreadCount+1
        }


        let newNotification=new NotificationData();
        newNotification.recieverId=findDetail.userId._id,
        newNotification.bookingId=findDetail._id
        newNotification.msg=AppConstraints.DRIVER_MOOVING_TO_YOU.EN;
        newNotification.msgAr=AppConstraints.DRIVER_MOOVING_TO_YOU.AR;
        newNotification.messageType=AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING;
        newNotification.createDate=new Date().getTime();

        await Promise.all([
            Bookings.update({_id:request.query.bookingId},{status:AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING}),
            newNotification.save(),
            pushNotification.sendPushToUser(findDetail.userId.deviceToken,dataToPush)
        ]);




        return response.status(200).json({success:1,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.EN,statusCode:200});

    }catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}

exports.versionCheck = async (request,response)=>{
    try{ let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('version',langaugeType=="EN"?AppConstraints.VERSION.EN:AppConstraints.VERSION.AR).notEmpty();
        request.checkBody('app_type',langaugeType=="EN"?AppConstraints.APP_TYPE:AppConstraints.VERSION.AR).notEmpty();
        request.checkBody('platform',langaugeType=="EN"?AppConstraints.PLATFORM:AppConstraints.PLATFORM.AR).notEmpty();
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});   
        let latestVersion =  await version.find({app_type:request.body.app_type,platform:request.body.platform}).sort({version:-1}).limit(1);
       console.log(latestVersion[0].version);
        if(latestVersion[0].version>request.body.version){
            let criteria={
                recieverId:validateToken._id,
                isRead:false
            }
            let findTotalUnreadCount=await NotificationData.count(criteria);

            let dataToPush={
                msg:validateToken.langaugeType=="EN"?AppConstraints.UPDATE_APPLICATION.EN:AppConstraints.UPDATE_APPLICATION.AR,
                messageType:AppConstraints.APP_CONST_VALUE.UPDATE,
                count:findTotalUnreadCount
            }
    
            let newNotification=new NotificationData();
            newNotification.recieverId=validateToken._id
            newNotification.msg=AppConstraints.UPDATE_APPLICATION.EN
            newNotification.msgAr=AppConstraints.UPDATE_APPLICATION.AR
            newNotification.messageType=AppConstraints.APP_CONST_VALUE.UPDATE
            newNotification.createDate=new Date().getTime()
    
            await Promise.all([
                pushNotification.sendPush(validateToken.deviceToken,dataToPush),
                newNotification.save()
            ]);

            return response.status(200).json({success:0,statusCode:200});    

           
        }else{
            return response.status(200).json({success:1,statusCode:200});    

        }
    }
    catch(err){
    console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});
    }
}


exports.changeLanguageDriver = async (request,response) =>{
    try{console.log("change language to",request.body.langaugeType)
        let langaugeType = request.body.langaugeType;
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
        request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();    
        let errors =await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});
        await User.update({_id:validateToken._id},{$set:{langaugeType:request.body.langaugeType}});
        return response.status(200).json({success:1,statusCode:200,msg:langaugeType=="EN"?AppConstraints.SUCCESS.EN:AppConstraints.SUCCESS.AR});

    }catch(err){
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});      
    }
}