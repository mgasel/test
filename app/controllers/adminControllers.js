
const md5=require('md5');
const async=require('async');
const Admin=require('../models/Admin.js');
const AppConstraints=require('../../config/appConstraints.js');
const UnivershalFunction=require('../UnivershalFunctions/Univershalfunctions.js');
const jwt=require('jsonwebtoken');
const User=require('../models/User.js');
const Service=require('../models/Services.js');
const Forgot=require('../models/Forgot.js');
const Driver=require('../models/User.js');
const Laundry=require('../models/Laundry.js');
const NodeGeocoder = require('node-geocoder');
const randomstring=require('randomstring');
const serviceItem=require('../models/serviceItems.js');
const serviceCategory = require('../models/serviceItemCategory.js');
const SubscriptionPlane=require('../models/SubscriptionsPlan.js');
const SubscriptionPlaneItem=require('../models/SubcriptionPlaneItems.js');
const master=require('../models/masterData');
const Bookings=require('../models/Bookings.js');
const NotificationData=require('../models/notification.js');
const PromoCode=require('../models/promoCode.js');
const coupon = require('../models/coupon.js');
const pushNotification=require('../LIB/pushNotification.js');
const Review=require('../models/reviews.js');
const Vehicle=require('../models/Vehicle.js');
const SocketManager=require('../LIB/SocketManager.js');
const Charge=require('../models/charge.js');
const Issue=require('../models/issue');
const slots=require('../models/slots');
const ObjectId = require('mongodb').ObjectID;
const version = require('../models/Version');
const district = require('../models/district');
const crypto = require('crypto');
const laundryserviceitem = require('../models/laundryserviceitem');
const geodist=require('geodist');
const mongoose=require('mongoose');

exports.loginAdmin=async(request,response)=>{
  try{
      request.checkBody('email',AppConstraints.EMAIL_ADDRESS).notEmpty();
      request.checkBody('email',AppConstraints.VALID_EMAIL_ADDRESS).isEmail();
      request.checkBody('password',AppConstraints.PASSWORD).notEmpty();
      let errors = await request.validationErrors();
      if (errors)
      return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

      let isAdmin=await Admin.findOne({email:request.body.email,password:md5(request.body.password)});
      if(!isAdmin)
      return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.INVALID_EMAIL_PASSWORD.EN});
      let payloadData={
          email:request.body.email,
          password:request.body.password,
          exp: Math.floor(Date.now() / 1000) + (60 * 60*60)
      }
      let createToken=await jwt.sign(payloadData,process.env.JWT_SECRET);
      await Admin.update({email:request.body.email,password:md5(request.body.password)},{$set:{accessToken:createToken}});
      let criteriaUser={
          isBlocked:false,
          userType:AppConstraints.USER
      }
      let criteriaDriver={
            isBlocked:false,
            userType:AppConstraints.DRIVER
      }
      let criteriaService={
            isDeleted:false
      }
      let criteriaLaundry={
            isDeleted:false
      }
      let completedCriteria={
          status:AppConstraints.APP_CONST_VALUE.COMPLETED
      }

var start = new Date();
start.setHours(0,0,0,0);

var end = new Date();
end.setHours(23,59,59,999);
let newCriteria={
	created_on:{
        $gte: start,
        $lt: end
      }
/* isDeleted:false*/
}

     let totalRevenue=await Bookings.find({status:AppConstraints.APP_CONST_VALUE.COMPLETED},{totalAmount:1,_id:0});
       


     console.log(totalRevenue,'=================')

      let totalAmmountToSend=0.0;
      for(let i=0;i<totalRevenue.length;i++){
          console.log(totalRevenue[i].totalAmount,'=======================amiount')
        totalAmmountToSend+=parseFloat(totalRevenue[i].totalAmount);
        console.log(totalAmmountToSend,'=================================')
      }


      let findData=await Promise.all([
          Admin.findOne({email:request.body.email,password:md5(request.body.password)}).select({password:0}),
          User.count(criteriaUser),
          Driver.count(criteriaDriver),
          Service.count(criteriaService),
          Laundry.count(criteriaLaundry),
          Bookings.count(),
          Bookings.count(completedCriteria),
	Bookings.count(newCriteria),
	User.count(newCriteria)
      ])





      return response.status(200).json({
                                        statusCode:200,
                                        success:1,
                                        msg:'success',
                                        data:{
                                                adminData:findData[0],
                                                totalUser:findData[1],
                                                totalDriver:findData[2],
                                                totalService:findData[3],
                                                totalLaundry:findData[4],
                                                totalOrderRequest:findData[5],
                                                totalOrderComplete:findData[6],
                                                totalRevenue:totalAmmountToSend,
						todaysOrders:findData[7],
						todaysUsers:findData[8]
                                            }
                                        });
      
  }catch(err){
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
  }
}




exports.createService=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('serviceName',AppConstraints.SERVICE_NAME).notEmpty();
        request.checkBody('serviceNameAr',AppConstraints.SERVICE_NAME).notEmpty();
        request.checkBody('hexString',AppConstraints.HEX_STRING).notEmpty();
        request.checkBody('servicePicOriginal',AppConstraints.SERVICE_PIC_ORIGINAL).notEmpty();
        request.checkBody('servicePicThumbnail',AppConstraints.SERVICE_PIC_THUMBNAIL).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let isService=await Service.findOne({serviceName:request.body.serviceName});
        if(isService)
        return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_SERVICE});
        
        let serviceCategoryList = await serviceCategory.find({})
        let arrayToSave = []
        serviceCategoryList.map(obj=>{arrayToSave.push(obj._id)})

        let service=new Service();
        service.serviceName=request.body.serviceName;
        service.serviceNameAr=request.body.serviceNameAr;
        service.servicePic.servicePicOriginal=request.body.servicePicOriginal;
        service.servicePic.servicePicThumbnail=request.body.servicePicThumbnail;
        service.hexString=request.body.hexString;
        service.serviceCategory=arrayToSave
        let createService=await service.save();

        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SERVICE_SUCCESSFULLY_CREATED,data:createService});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah



exports.createDriver=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('callingCode',AppConstraints.CALLING_CODE).notEmpty();
        // request.checkBody('email',AppConstraints.EMAIL_ADDRESS).notEmpty();
        // request.checkBody('email',AppConstraints.VALID_EMAIL_ADDRESS).isEmail();
        request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
        request.checkBody('name',AppConstraints.NAME).notEmpty();
        //request.checkBody('laundryId',AppConstraints.LAUNDRY_ID).notEmpty();
        request.checkBody('districtId',AppConstraints.DISTRICT_ID).notEmpty();
        //request.checkBody('cityName',AppConstraints.CITY_NAME).notEmpty();
        request.checkBody('licencePicOriginal',AppConstraints.LICENCE_PIC_ORIGINAL).notEmpty();
        request.checkBody('licencePicThumbnail',AppConstraints.LICENCE_PIC_THUMBNAIL).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


   
        if(!(!isNaN(parseFloat(request.body.phoneNumber)) && isFinite(request.body.phoneNumber)))
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.PHONE_NUMERIC});

        let criteriaEmail={
            email:request.body.email,
            userType:AppConstraints.DRIVER
        }


        let criteriaPhone={
            phoneNumber:request.body.phoneNumber,
            userType:AppConstraints.DRIVER
        }

        let ifEmailAlready=await Driver.findOne(criteriaEmail);
        if(ifEmailAlready)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.EMAIL_ALREADY});

        let ifPhoneAlready=await Driver.findOne(criteriaPhone);
        if(ifPhoneAlready)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.PHONE_ALREADY});


        let randomValue=  Math.floor(Date.now() / 1000) + (60 * 60);
        let rand = Math.floor((Math.random() * 1000) + 540000);
        let randomPassword=await randomstring.generate(8);



        console.log(randomPassword,'password of driver');

        let token=await UnivershalFunction.GenerateToken({email:request.body.email,userType:AppConstraints.DRIVER});

        let link=`${process.env.BASE_URL}verifyEmailDriverPage?id=${rand}&accessToken=${token}`;

        let content="<br />"+AppConstraints.CLICK_BELOW.EN+"<br /><a href="+link+">"+AppConstraints.CLICK_HERE.EN+"</a>";

        let driver=new Driver();
        driver.name=request.body.name;
        driver.phoneNumber=request.body.phoneNumber;
        driver.email=(request.body.email?request.body.email:null);
        driver.password=await md5(randomPassword);
        driver.licencePic.licencePicOriginal=request.body.licencePicOriginal;
        driver.licencePic.licencePicThumbnail=request.body.licencePicThumbnail;
        driver.emailVerificationcode=rand;
        driver.callingCode=request.body.callingCode;
        driver.userType=AppConstraints.DRIVER
        driver.cityName=request.body.cityName
       // driver.laundryId=request.body.laundryId;
      //  driver.districtId = request.body.districtId;
        console.log(driver,'driver data');

        let forgot = new Forgot();
        forgot.email=request.body.email;
        forgot.forgotCode=rand;
        forgot.userType=AppConstraints.DRIVER

        let link1=`${process.env.BASE_URL}renderResetDriver?id=${rand}&accessToken=${token}`;

        let content1="<br /><p>"+AppConstraints.YOUR_CREDENTIALS1.EN+
            "<br /><br /><br />"+
            "</p><br /><dl><dt>Email address</dt><dd>- " +request.body.email+
            "</dd><dt>Password</dt><dd>- " +randomPassword+"</dd></dl>"+
            "<br />"+AppConstraints.CHANGE_ALSO.EN+"<br /><br /><br />"+
            "<a href="+link1+">"+AppConstraints.CLICK_HERE_TO_RESET.EN+"</a>";

        let otpDataVal=AppConstraints.YOUR_CREDENTIALS1.EN+' '+
            'Email address'+request.body.email+' '+
            'Password'+randomPassword+' '+
            AppConstraints.CHANGE_ALSO.EN+' '+
            link1+' '+AppConstraints.CLICK_HERE_TO_RESET.EN;


        let data={
            phoneNumber:request.body.callingCode+request.body.phoneNumber,
            message:otpDataVal
        }

        let sendOtp=await UnivershalFunction.unifonicMessage(data);

        let createDriver=await Promise.all([
                forgot.save(),
                driver.save(),
                UnivershalFunction.sendEmail(request.body.email,content,AppConstraints.REGISTRATIONS_MESSAGE.EN),
                UnivershalFunction.sendEmail(request.body.email,content1,AppConstraints.LOGIN_CREDENTIALS.EN)
        ]);


              let districtIds;
        if(request.body.districtId){
            districtIds=(request.body.districtId);
           for(let i=0;i<districtIds.length;i++){
               await Driver.update({_id:createDriver[1]},{$addToSet:{districtId:districtIds[i]}});
           }
        }

        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.DRIVER_SUCCESSFULLY_CREATED,data:createDriver[1]});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah


exports.createLaundry=async(request,response)=>{
    try{


        // console.log(request.body,'================request data===================');

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('laundryName',AppConstraints.LAUNDRY_NAME).notEmpty();
        request.checkBody('laundryAddress',AppConstraints.LAUNDRY_ADDRESS).notEmpty();
        request.checkBody('laundryLat',AppConstraints.LAUNDRY_LAT).notEmpty();
        request.checkBody('laundryLong',AppConstraints.LAUNDRY_LONG).notEmpty();
        request.checkBody('districtId',AppConstraints.DISTRICT_ID).notEmpty();
        //request.checkBody('cityName',AppConstraints.CITY_NAME).notEmpty();
        request.checkBody('serviceId',AppConstraints.SERVICES_ID_REQUIRED).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let criteria={
            laundryName:request.body.laundryName,
            laundryAddress:request.body.laundryAddress,
            laundryLat:request.body.laundryLat,
            laundryLong:request.body.laundryLong
        }

        let checkIfLaundryAlreadyCreated=await Laundry.findOne(criteria);

        if(checkIfLaundryAlreadyCreated)
        return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.LAUNDRY_ALREADY_CREATED});
       

        let checkDistrictDistance = await district.findOne({_id:request.body.districtId});
        let distanceFromLaundry = geodist({lat:checkDistrictDistance.districtLat,lon:checkDistrictDistance.districtLong},{lat:request.body.laundryLat,lon: request.body.laundryLong})

        if(distanceFromLaundry>500){
        return response.status(400).json({success:0,statusCode:400,msg:'Please enter laundry withing the district'});
        }

        console.log('_____________',request.body)

        // console.log('distanceFromLaundry'+distanceFromLaundry+'distanceFromLaundry')
        let serviceCategoryList = await Service.find({_id: {$in: JSON.parse(request.body.serviceId)}})

        let arrayToSave = []
        serviceCategoryList.map(obj=>{arrayToSave  = [...new Set([...arrayToSave, ...obj.serviceCategory])] })
        console.log('_____________', arrayToSave)

        let latitude = parseFloat(request.body.laundryLat);
        let longitude= parseFloat(request.body.laundryLong);
        let laundry=new Laundry();
        laundry.laundryName=request.body.laundryName;
        laundry.laundryAddress=request.body.laundryAddress;
        laundry.laundryLat=latitude;
        laundry.laundryLong=longitude;
        laundry.districtId=request.body.districtId;
        laundry.serviceCategory=arrayToSave
      //  laundry.cityName=request.body.cityName;
        laundry.currentLocation=[longitude, latitude];
        let createLaundry=await laundry.save();
            let serviceIds;
        if(request.body.serviceId){
            serviceIds= JSON.parse(request.body.serviceId);
           for(let i=0;i<serviceIds.length;i++){
               await Laundry.update({_id:createLaundry._id},{$addToSet:{services:serviceIds[i]}});
           }
        }



        let items = await serviceItem.find({serviceId:{$in:serviceIds}, isDeleted: false});
        console.log('itemsitemsitemsitemsitemsitems', items)
        for (let service of serviceCategoryList){
        // console.log(items[j].serviceId, items[j]._id,createLaundry._id,items[j].amountPerItem,"tttttttttttttttttttttttttttttttttttttttttttt");
            if(service.serviceCategory && service.serviceCategory.length){
                for(let sc of service.serviceCategory){
                    
                    if(items.length){
                        for(let item of items){
                            // console.log('++++++++++++', item.serviceId.toString() === service._id.toString(),item.serviceId , service._id, item._id)
                            if((item.serviceId.toString() === service._id.toString()) && (item.categoryId.toString() === sc.toString())){
                                        // if(item.serviceId.toString() === service._id.toString()){
                                let laundryItem = new laundryserviceitem();
                                laundryItem.serviceId=service._id;
                                laundryItem.categoryId=sc;
                                laundryItem.serviceItemId=item._id;
                                laundryItem.laundryId=createLaundry._id;
                                laundryItem.amountPerItem=item.amountPerItem;
                                laundryItem.serviceItemId=item._id 
                                await laundryItem.save(); 
                            }
                        }
                    }
                }
            }            
        }

      


        let findLaundryDetails=await Laundry.findOne({_id:createLaundry._id});
       

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.LAUNDRY_CREATED_SUCCESSFULLY,data:findLaundryDetails});

    }catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah



exports.blockUnblockUser=async(request,response)=>{
    try{


        console.log(request.body,'block unblock request data');



        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('userId',AppConstraints.USER_ID).notEmpty();
        request.checkBody('isBlocked',AppConstraints.BLOCKED_STATUS).notEmpty().isBoolean();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        await User.update({_id:request.body.userId},{$set:{isBlocked:request.body.isBlocked}});

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESSFULLY_CHANGED_STATUS_OF_USER});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer


exports.getUserListing=async(request,response)=>{
    try{


        console.log(request.body,'request data for listing');

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
/*        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        / *if(validateToken.superAdmin || validateToken.customerAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }*/

        request.checkBody('page',AppConstraints.PAGE_NUMBER).notEmpty();
        request.checkBody('perPage',AppConstraints.PER_PAGE).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


    
        let criteria={};

        if(request.body.fromDate && request.body.toDate && request.body.serachField){
            criteria={
            createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
            name:new RegExp(request.body.serachField,'i'),
            userType:AppConstraints.USER
           }
        }


        else if(request.body.fromDate && request.body.toDate){
            criteria={
              
                createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
                userType:AppConstraints.USER
               }  
        }


        else if(request.body.fromDate && request.body.serachField){
            criteria={
              
                createDate:{$gte :new Date(request.body.fromDate)},
                name:new RegExp(request.body.serachField,'i'),
                userType:AppConstraints.USER
                
               }  
        }

        else if(request.body.toDate && request.body.serachField){
            criteria={
               
                createDate:{$lte :new Date(request.body.toDate)},
                name:new RegExp(request.body.serachField,'i'),
                userType:AppConstraints.USER
               }  
        }
           

        else if(request.body.toDate){
            criteria={
              
                createDate:{$lte :new Date(request.body.toDate)},
                userType:AppConstraints.USER
               }  
        }

        else if(request.body.fromDate){
            criteria={
              
                createDate:{$gte :new Date(request.body.fromDate)},
                userType:AppConstraints.USER
               }  
        }

        else if(request.body.serachField){
            criteria={
             
                name:new RegExp(request.body.serachField,'i'),
                userType:AppConstraints.USER
               }  
        }

        else if(request.body.status==="BLOCKED"){
            criteria={
                isBlocked:true,
                userType:AppConstraints.USER
            }
        }

        else if(request.body.status==="UNBLOCKED"){
            criteria={
                userType:AppConstraints.USER,
                isBlocked:false
            }  
        }

        else{
            criteria={
                userType:AppConstraints.USER
            }  
        }


        let getData=await Promise.all([
            User.count(criteria),
            // User.find(criteria)
            // .sort({"_id":-1})
            // .select({password:0,accessToken:0})
            // .skip((parseInt(request.body.perPage) * parseInt(request.body.page)) - parseInt(request.body.perPage))
            // .limit(parseInt(request.body.perPage))
            User.aggregate([
                {$match:criteria},
                {$sort:{"_id":-1}},
                {$skip:(parseInt(request.body.perPage) * parseInt(request.body.page)) - parseInt(request.body.perPage)},
                {$limit:parseInt(request.body.perPage)},
                {
                    $lookup:{
                        from:'userratings',
                        localField:'_id',
                        foreignField:'userId',
                        as:'userRating'
                    }
                },
                {
                    $unwind:{path:'$userRating',preserveNullAndEmptyArrays:true}
                },
                {
                    $group:{
                        _id: "$_id",
                        avgRating: {$avg:"$userRating.rating"},
                        couponId : {$min:"$couponId"},
                        name :  {$min:"$name"},
                        email: {$min:"$email"},
                        districtId :  {$min:"$districtId"},
                        weekendFlag :  {$min:"$weekendFlag"},
                        langaugeType : {$min:"$langaugeType"},
                        packChoosen :  {$min:"$packChoosen"},
                        couponApplied : {$min:"$couponApplied"},
                        cityName :  {$min:"$cityName"},
                        nationality : {$min:"$nationality"},
                        isRated : {$min:"$isRated"},
                        incentive : {$min:"$incentive"},
                        completePhoneNumber : {$min:"$completePhoneNumber"},
                        location : {$min:"$location"},
                        landmark : {$min:"$landmark"},
                        house_flat : {$min:"$house_flat"},
                        dateOfBirth : {$min:"$dateOfBirth"},
                        countryName : {$min:"$countryName"},
                        gender : {$min:"$gender"},
                        load : {$min:"$load"},
                        isAvailable : {$min:"$isAvailable"},
                        isSubscriptiveUser :  {$min:"$isSubscriptiveUser"},
                        hasSubscribed : {$min:"$hasSubscribed"},
                        userType : {$min:"$userType"},
                        isTCAccepted : {$min:"$isTCAccepted"},
                        long : {$min:"$long"},
                        lat : {$min:"$lat"},
                        licencePic : {$min:"$licencePic"},
                        isOnline : {$min:"$isOnline"},
                        Profilepic :  {$min:"$Profilepic"},
                        deviceType :  {$min:"$deviceType"},
                        isEmailVerified : {$min:"$isEmailVerified"},
                        isVerified :  {$min:"$isVerified"},
                        isBlocked :  {$min:"$isBlocked"},
                        isActive :  {$min:"$isActive"},
                        emailVerificationcode :  {$min:"$emailVerificationcode"},
                        createDate :  {$min:"$createDate"},
                        callingCode :  {$min:"$callingCode"},
                        phoneNumber : {$min:"$phoneNumber"},
                        isDeleted : {$min:"$isDeleted"},
                    }
                },
                {$sort:{"_id":-1}}
            ])
        ])





      
        

        return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:getData[1],totalResult:getData[0]});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer


exports.getDriverListing=async(request,response)=>{
    try{

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        if(request.body.driverId){
            let driver = await Review.aggregate([
                {
                    $match: {
                        driverId: mongoose.Types.ObjectId(request.body.driverId)
                    }
                },
                {
                    $project: {
                        avgRating: { $avg: "$driverRating"}
                    }
                }
            ]);
            let data = await Driver.findOne({_id:request.body.driverId},{},{lean:true}).populate({path:'laundryId',select:{laundryName:1}})
                .populate({path:'districtId',select:{districtName:1}})
                .select({password:0,accessToken:0});
            if(driver.length){
                data.avgRating = driver[0].avgRating;
            }else{
                data.avgRating = 0;
            }

            return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:data});

        }else{
            
            let errors = await request.validationErrors();
            if (errors)
            return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
    
    
            let criteria={}
    
            if(request.body.fromDate && request.body.toDate && request.body.serachField){
                criteria={
                    isDeleted:false,
                createDate:{$gte:new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
                name:new RegExp(request.body.serachField,'i'),
                userType:AppConstraints.DRIVER
               }
            }
    
    
            else if(request.body.fromDate && request.body.toDate){
                criteria={
                    isDeleted:false,
                    createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
                    userType:AppConstraints.DRIVER
                   }  
            }
    
    
            else if(request.body.fromDate && request.body.serachField){
                criteria={
                    isDeleted:false,
                    createDate:{$gte :new Date(request.body.fromDate)},
                    name:new RegExp(request.body.serachField,'i'),
                    userType:AppConstraints.DRIVER
                   }  
            }
    
            else if(request.body.toDate && request.body.serachField){
                criteria={
                    isDeleted:false,
                    createDate:{$lte :new Date(request.body.toDate)},
                    name:new RegExp(request.body.serachField,'i'),
                    userType:AppConstraints.DRIVER
                   }  
            }
               
    
            else if(request.body.toDate){
                criteria={
                    isDeleted:false,
                    createDate:{$lte :new Date(request.body.toDate)},
                    userType:AppConstraints.DRIVER
                   }  
            }
    
            else if(request.body.fromDate){
                criteria={
                    isDeleted:false,
                    createDate:{$gte :new Date(request.body.fromDate)},
                    userType:AppConstraints.DRIVER
                   }  
            }
    
            else if(request.body.serachField){
                criteria={
                    isDeleted:false,
                    name:new RegExp(request.body.serachField,'i'),
                    userType:AppConstraints.DRIVER
                   }  
            }
    
    
            else if(request.body.status==="BLOCKED"){
                criteria={
                    isDeleted:false,
                    isBlocked:true,
                    userType:AppConstraints.DRIVER
                }
            }
    
            else if(request.body.status==="UNBLOCKED"){
                criteria={
                    isDeleted:false,
                    userType:AppConstraints.DRIVER,
                    isBlocked:false
                }  
            }
    
    
            else{
                criteria={
                    isDeleted:false,
                    userType:AppConstraints.DRIVER
                   }  
            }
    let getData;
    if(request.body.page && request.body.perPage){
         getData=await Promise.all([
            Driver.count(criteria),
            Driver.aggregate([
                {$match:criteria},
                {$lookup:{
                        from:'reviews',
                        localField:'_id',
                        foreignField:'driverId',
                        as:'reviews'
                    }},
                {
                    $unwind:{path:"$reviews",preserveNullAndEmptyArrays:true}
                },
                {
                    $group:{
                        _id: "$_id",
                        avgRating: {$avg:"$reviews.driverRating"},
                        "email" : {$min:"$email"},
                        "name" : {$min:"$name"},
                        "districtId" : {$min:"$districtId"},
                        "langaugeType" :{$min:"$langaugeType"},
                        "packChoosen" : {$min:"$packChoosen"},
                        "couponApplied" : {$min:"$couponApplied"},
                        "cityName" : {$min:"$cityName"},
                        "nationality" : {$min:"$nationality"},
                        "isRated" : {$min:"$isRated"},
                        "incentive" :{$min:"$incentive"},
                        "completePhoneNumber" :{$min:"$completePhoneNumber"},
                        "location" :{$min:"$location"},
                        "landmark" : {$min:"$landmark"},
                        "house_flat" :{$min:"$house_flat"},
                        "dateOfBirth" : {$min:"$dateOfBirth"},
                        "countryName" : {$min:"$countryName"},
                        "gender" : {$min:"$gender"},
                        "load" : {$min:"$load"},
                        "isAvailable" :{$min:"$isAvailable"},
                        "isSubscriptiveUser" : {$min:"$isSubscriptiveUser"},
                        "userType" :{$min:"$userType"},
                        "isTCAccepted" :{$min:"$isTCAccepted"},
                        "long" : {$min:"$long"},
                        "lat" : {$min:"$lat"},
                        "licencePic" : {$min:"$licencePic"},
                        "deviceToken" :{$min:"$deviceToken"},
                        "isOnline" :{$min:"$isOnline"},
                        "Profilepic" : {$min:"$Profilepic"},
                        "deviceType" : {$min:"$deviceType"},
                        "isEmailVerified" :{$min:"$isEmailVerified"},
                        "isVerified" :{$min:"$isVerified"},
                        "isBlocked" : {$min:"$isBlocked"},
                        "isActive" :{$min:"$isActive"},
                        "emailVerificationcode" :{$min:"$emailVerificationcode"},
                        "createDate" : {$min:"$createDate"},
                        "callingCode" : {$min:"$callingCode"},
                        "phoneNumber" : {$min:"$phoneNumber"},
                        "currentLocation" : {$min:"$currentLocation"},
                        "isDeleted" : {$min:"$isDeleted"},
                        "reviews" : {$addToSet:"$reviews"}
//	deviceType:{$min:"$deviceType"}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $skip:(parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage)
                },
                {
                    $limit:parseInt(request.body.perPage)
                }
            ])
                // .populate({path:'laundryId',select:{laundryName:1}})
                // .populate({path:'districtId',select:{districtName:1}}),
            // Driver.find(criteria)
            // .sort({"_id":-1})
            // .populate({path:'laundryId',select:{laundryName:1}})
            // .populate({path:'districtId',select:{districtName:1}})
            // .select({password:0,accessToken:0})
            // .skip((parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage))
            // .limit(parseInt(request.body.perPage))
        ])
    }else{
       getData=await Promise.all([
            Driver.count(criteria),
           Driver.aggregate([
                {$match:criteria},
               {$lookup:{
                       from:'reviews',
                       localField:'_id',
                       foreignField:'driverId',
                       as:'reviews'
                   }},
               {
                   $unwind:{path:"$reviews",preserveNullAndEmptyArrays:true}
               },
               {
                   $group:{
                       _id: "$_id",
                       avgRating: {$avg:"$reviews.driverRating"},
                       "email" : {$min:"$email"},
                       "name" : {$min:"$name"},
                       "districtId" : {$min:"$districtId"},
                       "langaugeType" :{$min:"$langaugeType"},
                       "packChoosen" : {$min:"$packChoosen"},
                       "couponApplied" : {$min:"$couponApplied"},
                       "cityName" : {$min:"$cityName"},
                       "nationality" : {$min:"$nationality"},
                       "isRated" : {$min:"$isRated"},
                       "incentive" :{$min:"$incentive"},
                       "completePhoneNumber" :{$min:"$completePhoneNumber"},
                       "location" :{$min:"$location"},
                       "landmark" : {$min:"$landmark"},
                       "house_flat" :{$min:"$house_flat"},
                       "dateOfBirth" : {$min:"$dateOfBirth"},
                       "countryName" : {$min:"$countryName"},
                       "gender" : {$min:"$gender"},
                       "load" : {$min:"$load"},
                       "isAvailable" :{$min:"$isAvailable"},
                       "isSubscriptiveUser" : {$min:"$isSubscriptiveUser"},
                       "userType" :{$min:"$userType"},
                       "isTCAccepted" :{$min:"$isTCAccepted"},
                       "long" : {$min:"$long"},
                       "lat" : {$min:"$lat"},
                       "licencePic" : {$min:"$licencePic"},
                       "deviceToken" :{$min:"$deviceToken"},
                       "isOnline" :{$min:"$isOnline"},
                       "Profilepic" : {$min:"$Profilepic"},
                       "deviceType" : {$min:"$deviceType"},
                       "isEmailVerified" :{$min:"$isEmailVerified"},
                       "isVerified" :{$min:"$isVerified"},
                       "isBlocked" : {$min:"$isBlocked"},
                       "isActive" :{$min:"$isActive"},
                       "emailVerificationcode" :{$min:"$emailVerificationcode"},
                       "createDate" : {$min:"$createDate"},
                       "callingCode" : {$min:"$callingCode"},
                       "phoneNumber" : {$min:"$phoneNumber"},
                       "currentLocation" : {$min:"$currentLocation"},
                       "isDeleted" : {$min:"$isDeleted"},
                       "reviews" : {$addToSet:"$reviews"}
//	deviceType:{$min:"$deviceType"}
                   }
               },
               {
                   $sort:{
                       _id:-1
                   }
               },
               // {
               //     $skip:(parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage)
               // },
               // {
               //     $limit:parseInt(request.body.perPage)
               // }
           ])
               // .populate({path:'districtId',select:{districtName:1}})
       ])
            // Driver.find(criteria)
            // .sort({"_id":-1})
            // .populate({path:'laundryId',select:{laundryName:1}})
            // .populate({path:'districtId',select:{districtName:1}})
            // .select({password:0,accessToken:0})])
    }

    getData[1]= await Driver.populate(getData[1],[{path:'districtId',select:{districtName:1}}]);
         
    
           
    
            return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:getData[1],totalResult:getData[0]});
    
    
        }


       
    }catch(err){
        console.log(err,"err");
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational








exports.getServiceListing=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkBody('page',AppConstraints.PAGE_NUMBER).notEmpty();
        // request.checkBody('perPage',AppConstraints.PER_PAGE).notEmpty();
        // let errors = await request.validationErrors();
        // if (errors)
        // return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        let criteria={}

        if(request.body.fromDate && request.body.toDate && request.body.serachField){
            criteria={
            isDeleted:false,
            createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
            serviceName:new RegExp(request.body.serachField,'i')
           }
        }


        else if(request.body.fromDate && request.body.toDate){
            criteria={
                isDeleted:false,
                createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
               }  
        }


        else if(request.body.fromDate && request.body.serachField){
            criteria={
                isDeleted:false,
                createDate:{$gte :new Date(request.body.fromDate)},
                serviceName:new RegExp(request.body.serachField,'i')
               }  
        }

        else if(request.body.toDate && request.body.serachField){
            criteria={
                isDeleted:false,
                createDate:{$lte :new Date(request.body.toDate)},
                serviceName:new RegExp(request.body.serachField,'i')
               }  
        }
           

        else if(request.body.toDate){
            criteria={
                isDeleted:false,
                createDate:{$lte :new Date(request.body.toDate)}
               }  
        }


        else if(request.body.fromDate){
            criteria={
                isDeleted:true,
                createDate:{$gte :new Date(request.body.fromDate)}
               }  
        }

        else if(request.body.status=='BLOCKED'){
            criteria={
                isDeleted:true,
            }  
        }

        else if(request.body.status=='ACTIVE'){
            criteria={
                isDeleted:false,
            }  
        }

        else if(request.body.serachField){
            criteria={
                isDeleted:false,
                serviceName:new RegExp(request.body.serachField,'i')
               }  
        }

        else{
            criteria={
               
               }  
        }


        let getData=await Promise.all([
            Service.count(criteria),
            Service.find(criteria)
            .sort({"_id":-1})
            // .skip((parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage))
            // .limit(parseInt(request.body.perPage))
        ])

       

        return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:getData[1],totalResult:getData[0]});
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational



exports.blockUnblockDriver=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('driverId',AppConstraints.DRIVER_ID).notEmpty();
        request.checkBody('isBlocked',AppConstraints.BLOCKED_STATUS);
        request.checkBody('isDeleted',AppConstraints.BLOCKED_STATUS);
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        await Driver.update({_id:request.body.driverId},{$set:{isBlocked:request.body.isBlocked}});
        if(request.body.isDeleted != null){
            await Driver.update({_id:request.body.driverId},{$set:{isDeleted:request.body.isDeleted}});
        }

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESSFULLY_CHANGED_STATUS_OF_USER});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah

exports.getAllLaundryList=async(request,response)=>{
    try{


    console.log(request.query,'request data')


    if(!request.headers['authorization'])
    return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
    let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
    if(!validateToken)
    return response.status(401).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

    // request.checkBody('page',AppConstraints.PAGE_NUMBER).notEmpty();
    // request.checkBody('perPage',AppConstraints.PER_PAGE).notEmpty();
    let errors = await request.validationErrors();
    if (errors)
    return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


    let criteria;

    

    if(request.body.fromDate && request.body.toDate && request.body.serachField){
        criteria={
        isDeleted: false,
        createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
        laundryName:new RegExp(request.body.serachField,'i')
       }
    }


    else if(request.body.fromDate && request.body.toDate){
        criteria={
            isDeleted: false,
            createDate:{$gte :new Date(request.body.fromDate),$lte :new Date(request.body.toDate)},
           }  
    }


    else if(request.body.fromDate && request.body.serachField){
        criteria={
            isDeleted: false,
            createDate:{$gte :new Date(request.body.fromDate)},
            laundryName:new RegExp(request.body.serachField,'i')
           }  
    }

    else if(request.body.toDate && request.body.serachField){
        criteria={
            isDeleted: false,
            createDate:{$lte :new Date(request.body.toDate)},
            laundryName:new RegExp(request.body.serachField,'i')
           }  
    }
       

    else if(request.body.toDate){
        criteria={
            isDeleted: false,
            createDate:{$lte :new Date(request.body.toDate)}
           }  
    }

    else if(request.body.fromDate){
        criteria={
            isDeleted: false,
            createDate:{$gte :new Date(request.body.fromDate)}
           }  
    }

    else if(request.body.serachField){
        criteria={
            isDeleted: false,
            laundryName:new RegExp(request.body.serachField,'i')
           }  
    }


    else if(request.body.status=="BLOCKED"){
        criteria={
            isDeleted: true
        }
    }


    else if(request.body.status=="ACTIVE"){
        criteria={
            isDeleted: false
        }
    }

    else{
        criteria={isDeleted: false}  
    }

    let getData

    if(request.body.page&&request.body.perPage){
        getData=await Promise.all([
            Laundry.count(criteria),
            Laundry.aggregate([
                {$match:criteria},
                {$lookup:{
                        from:'reviews',
                        localField:'_id',
                        foreignField:'laundryId',
                        as:'reviews'
                    }},
                {
                    $unwind:{path:"$reviews",preserveNullAndEmptyArrays:true}
                },
                {
                    $group:{
                        _id: "$_id",
                        avgRating: {$avg:"$reviews.laundryServiceRating"},
                        "currentLocation" :{$min:"$currentLocation"},
                        "districtId" : {$min:"$districtId"},
                        "isDeleted" : {$min:"$isDeleted"},
                        "created_at" : {$min:"$created_at"},
                        "isActive" : {$min:"$isActive"},
                        "laundryLong" : {$min:"$laundryLong"},
                        "laundryLat" : {$min:"$laundryLat"},
                        "laundryAddress" : {$min:"$laundryAddress"},
                        "laundryName" :{$min:"$laundryName"},
                        "services" : {$min:"$services"},
                        "reviews" : {$addToSet:"$reviews"}
                    }
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $skip:(parseInt(request.body.perPage)*parseInt(request.body.page))-parseInt(request.body.perPage)
                },
                {
                    $limit:parseInt(request.body.perPage)
                }
            ])
            // Laundry.find(criteria)//.populate({path:'districtId',select:{}})
            // .sort({"_id":-1})
            // .skip((parseInt(request.body.perPage)*parseInt(request.body.page))-parseInt(request.body.perPage))
            // .limit(parseInt(request.body.perPage))
            
        ]);
    }else{
         getData=await Promise.all([
            Laundry.count(criteria),
            // Laundry.find(criteria)//.populate({path:'districtId',select:{}})
            // .sort({"_id":-1}),
             Laundry.aggregate([
                 {$match:criteria},
                 {$lookup:{
                         from:'reviews',
                         localField:'_id',
                         foreignField:'laundryId',
                         as:'reviews'
                     }},
                 {
                     $unwind:{path:"$reviews",preserveNullAndEmptyArrays:true}
                 },
                 {
                     $group:{
                         _id: "$_id",
                         avgRating: {$avg:"$reviews.laundryServiceRating"},
                         "currentLocation" :{$min:"$currentLocation"},
                         "districtId" : {$min:"$districtId"},
                         "isDeleted" : {$min:"$isDeleted"},
                         "created_at" : {$min:"$created_at"},
                         "isActive" : {$min:"$isActive"},
                         "laundryLong" : {$min:"$laundryLong"},
                         "laundryLat" : {$min:"$laundryLat"},
                         "laundryAddress" : {$min:"$laundryAddress"},
                         "laundryName" :{$min:"$laundryName"},
                         "services" : {$min:"$services"},
                         "reviews" : {$addToSet:"$reviews"}
                     }
                 },
                 {
                     $sort:{_id:-1}
                 },
                 // {
                 //     $skip:(parseInt(request.body.perPage)*parseInt(request.body.page))-parseInt(request.body.perPage)
                 // },
                 // {
                 //     $limit:parseInt(request.body.perPage)
                 // }
             ])
        ]);
    }

    getData[1]= await Laundry.populate(getData[1],[{path:'districtId',select:{}}])




    

   

    return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:getData[1],totalResult:getData[0]});
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational

exports.editOrDeleteService=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.status==="DELETE"){
            let deleteService=await Service.update({_id:request.body.serviceId},{$set:{isDeleted:true}});
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SERVICE_DELETED});
        }
        else if(request.body.status==="EDIT"){
            
            let dataToSet={};
            if(request.body.serviceName){
                let isService=await Service.findOne({serviceName:request.body.serviceName});
                if(isService && (""+isService._id===request.body.serviceId)){
                    dataToSet['serviceName']=request.body.serviceName;
                }
                else if(isService && (""+isService._id!==request.body.serviceId)){
                    return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_SERVICE});
                }
                else{
                    dataToSet['serviceName']=request.body.serviceName;
                }
                
            }

            if(request.body.servicePicOriginal){
                dataToSet['servicePic.servicePicOriginal']=request.body.servicePicOriginal;
            }


            if(request.body.servicePicThumbnail){
                dataToSet['servicePic.servicePicThumbnail']=request.body.servicePicThumbnail;
            }

            if(request.body.hexString){
                dataToSet['hexString']=request.body.hexString;
            }


            let dataToUpdate={
                $set:dataToSet
            }
            
            let criteria={
                _id:request.body.serviceId
            }

            let editService=await Service.update(criteria,dataToUpdate);


            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SERVICE_EDIT});
        }

        else {
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.SEND_CORRECT});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah



exports.editDriver=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('driverId',AppConstraints.DRIVER_ID).notEmpty();
        request.checkBody('driverId',AppConstraints.DRIVER_ID_VALID).isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        let checkIfDriverExist=await Driver.findOne({_id:request.body.driverId,userType:AppConstraints.DRIVER});
        if(!checkIfDriverExist)
        return response.status(400).json({success:1,statusCode:400,msg:AppConstraints.INVALID_DRIVER_ID});
        


        let dataToSet={};
        if(request.body.name){
            dataToSet['name']=request.body.name;
        }
        if(request.body.email){

            let findDriver=await Driver.findOne({email:request.body.email,userType:AppConstraints.DRIVER});

            if(!findDriver){
                dataToSet['email']=request.body.email;
            }

            else if(findDriver && (request.body.driverId!== ""+findDriver._id)){
                return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.EMAIL_ALREADY});
            }

            else if(findDriver && (request.body.driverId===""+findDriver._id)){
                dataToSet['email']=request.body.email;
            }
        }


     

        if(request.body.phoneNumber){
            let findDriver=await User.findOne({phoneNumber:request.body.phoneNumber,userType:AppConstraints.DRIVER});

            if(!findDriver){
                dataToSet['phoneNumber']=request.body.phoneNumber;
            }

            else if(findDriver && (request.body.driverId!== ""+findDriver._id)){
                return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.EMAIL_ALREADY});
            }

            else if(findDriver && (request.body.driverId===findDriver._id)){
                dataToSet['phoneNumber']=request.body.phoneNumber;
            }
        }


        if(request.body.licencePicOriginal){
            dataToSet['licencePic.licencePicOriginal']=request.body.licencePicOriginal;
        }

        if(request.body.licencePicThumbnail){
             dataToSet['licencePic.licencePicThumbnail']=request.body.licencePicThumbnail;
        }

        if(request.body.cityName){
            dataToSet['cityName']=request.body.cityName;
       }

     await Driver.update({_id:request.body.driverId},{$unset:{districtId:""}});  
       let districtIds;
       if(request.body.districtId){
           districtIds=(request.body.districtId);
          for(let i=0;i<districtIds.length;i++){
              await Driver.update({_id:request.body.driverId},{$addToSet:{districtId:districtIds[i]}});
          }
       }

        await Driver.update({_id:request.body.driverId},{$set:dataToSet});

        let getDriverData=await Driver.findOne({_id:request.body.driverId});

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS,data:getDriverData});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah



exports.editOrDeleteLaundry=async(request,response)=>{
    try{


        console.log(request.body,'===================================request data=================================')

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('laundryId',AppConstraints.LAUNDRY_ID).notEmpty();
        request.checkBody('laundryId',AppConstraints.LAUNDRY_ID_NOT_VALID).isMongoId();
        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.status==="DELETE"){
            
           let updateLaundrydata= await Laundry.update({_id:request.body.laundryId},{$set:{isDeleted:true}});
           console.log(updateLaundrydata,'updateLaundrydata') 
           return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.LAUNDRY_DELETED});
        }
        else if(request.body.status==="EDIT"){


            let isLaundry=await Laundry.findOne({_id:request.body.laundryId});

            if(!isLaundry)
            return response.status(200).json({success:0,msg:AppConstraints.INVALID_LAUNDRY_ID})

            let dataToSet={};
            if(request.body.laundryName){
                dataToSet['laundryName']=request.body.laundryName;
            }
            if(request.body.laundryLat){
                dataToSet['laundryLat']=request.body.laundryLat;
            }

            if(request.body.laundryLong){
                dataToSet['laundryLong']=request.body.laundryLong
            }

            if(request.body.laundryAddress){
                dataToSet['laundryAddress']=request.body.laundryAddress;
            }


            if(request.body.cityName){
                dataToSet['cityName']=request.body.cityName;
            }

            if(request.body.districtId){
                dataToSet['districtId']=request.body.districtId;
            }

            // if(request.body.laundryAddress){
            //     dataToSet['services']=;
            // }

            if(request.body.laundryLat && request.body.laundryLong){
                dataToSet['currentLocation']=[parseFloat(request.body.laundryLong),parseFloat(request.body.laundryLat)]
            }

            
            await Laundry.update({_id:request.body.laundryId},{$set:dataToSet});



            if(request.body.serviceId){

                let serviceIds=request.body.serviceId; //JSON.parse(request.body.serviceId);
                await Laundry.update({_id:request.body.laundryId},{$unset:{services:""}})
                for(let i=0;i<serviceIds.length;i++){
                    await Laundry.update({_id:request.body.laundryId},{$addToSet:{services:serviceIds[i]}});
                }

                let serviceCategoryList = await Service.find({_id: {$in:serviceIds}})
                let items = await serviceItem.find({serviceId:{$in:serviceIds}, isDeleted: false});

                let arrayToSave = []
                serviceCategoryList.map(obj=>{arrayToSave  = [...new Set([...arrayToSave, ...obj.serviceCategory])] })
                console.log(serviceCategoryList, "serviceIdsserviceIdsserviceIds") 
                for (let service of serviceCategoryList){
                // console.log(items[j].serviceId, items[j]._id,createLaundry._id,items[j].amountPerItem,"tttttttttttttttttttttttttttttttttttttttttttt");
                    if(service.serviceCategory && service.serviceCategory.length){
                        for(let sc of service.serviceCategory){
                            if(items.length){
                                for(let item of items){
                                    // console.log('++++++++++++', item.serviceId.toString() === service._id.toString(),item.serviceId , service._id, item._id)
                                    let checkData = await laundryserviceitem.find({serviceId: service._id,categoryId: sc, serviceItemId: item._id, laundryId: request.body.laundryId})
                                    // console.log(checkData.length, {serviceId: service._id,categoryId: sc, serviceItemId: item._id, laundryId: request.body.laundryId})
                                    if(checkData && checkData.length){
                                        continue
                                    }
                                    if((item.serviceId.toString() === service._id.toString()) && (item.categoryId.toString() === sc.toString())){
                                        let laundryItem = new laundryserviceitem();
                                        laundryItem.serviceId=service._id;
                                        laundryItem.categoryId=sc;
                                        laundryItem.serviceItemId=item._id;
                                        laundryItem.laundryId=request.body.laundryId;
                                        laundryItem.amountPerItem=item.amountPerItem;
                                // laundryItem.amountPerItem=items[j].amountPerItem;
                                        // laundryItem.serviceItemId=item._id 
                                        await laundryItem.save(); 
                                    }
                                }
                            }
                        }
                    }            
                }
             }

            // if(request.body.laundryId.toString() == "5bd06e502a239366b3197d8c"){
            //     let items = await serviceItem.find({serviceId:"5bc45d22de51373d690b8226"});
            //     console.log(items.length,"zzzzzzzzzzzz");
            //     for (let j = 0 ; j<items.length ; j++){
            //         let laundryItem = new laundryserviceitem();
            //         laundryItem.serviceId=items[j].serviceId;
            //         laundryItem.serviceItemId=items[j]._id;
            //         laundryItem.laundryId=request.body.laundryId;
            //         laundryItem.amountPerItem=items[j].amountPerItem;
            //         await laundryItem.save();
            //     }
            // }
     
            let findLaundryData=await Laundry.findOne({_id:request.body.laundryId});

            return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.LAUNDRY_UPDATED_SUCCESSFULLY,data:findLaundryData});


        }

        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        console.log(err)
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah


exports.createServiceItems=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        request.checkBody('categoryId',AppConstraints.CATEGORY_ID).notEmpty();
        request.checkBody('serviceId',AppConstraints.SERVICE_ID_NOT_VALID).isMongoId();
        request.checkBody('categoryId',AppConstraints.CATEGORY_ID_NOT_VALID).isMongoId();
        // request.checkBody('series',AppConstraints.CATEGORY_ID_NOT_VALID).notEmpty();
        // request.checkBody('itemName',AppConstraints.SERVICE_ITEM_NAME).notEmpty();
        // request.checkBody('itemNameAr',AppConstraints.SERVICE_ITEM_NAME).notEmpty();
        request.checkBody('itemPicOriginal',AppConstraints.SERVICE_ITEM_PIC_ORIGINAL).notEmpty();
        request.checkBody('itemPicThumbnail',AppConstraints.SERVICE_ITEM_PIC_THUMBNAIL).notEmpty();
        request.checkBody('amountPerItem',AppConstraints.AMMOUNT_PER_ITEM).notEmpty()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let criteria={
            serviceId:request.body.serviceId,
            itemName:request.body.itemName,
            isDeleted:false
        }

        // let checkIfAlreadyCreated=await serviceItem.findOne(criteria);
        // if(checkIfAlreadyCreated)
        // return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_CREATED_ITEM})
        console.log("payyyyyyyyyyyyyyyyyyy",request.body);
        let serviceitem=new serviceItem();
        serviceitem.serviceId=request.body.serviceId;
        serviceitem.categoryId=request.body.categoryId;
        serviceitem.itemName=request.body.itemName;
        serviceitem.series=request.body.series;
        serviceitem.itemNameAr=request.body.itemNameAr;
        serviceitem.itemPic.itemPicOriginal=request.body.itemPicOriginal;
        serviceitem.itemPic.itemPicThumbnail=request.body.itemPicThumbnail;
        serviceitem.amountPerItem=request.body.amountPerItem;

        let createItem=await serviceitem.save();

//         let laundriesToUpdate = await Laundry.find({services:{$in:[request.body.serviceId]}})
// console.log(laundriesToUpdate)
//         for(let i = 0 ; i < laundriesToUpdate.length ; i++){
//             let laundryItem = new laundryserviceitem();
//             laundryItem.serviceId=request.body.serviceId;
//             laundryItem.categoryId=request.body.categoryId;
//             laundryItem.series=request.body.series;
//             laundryItem.serviceItemId=createItem._id;
//             laundryItem.laundryId=laundriesToUpdate[i]._id;
//             laundryItem.amountPerItem=createItem.amountPerItem;
//            await laundryItem.save(); 
//         }

        //  serviceItem laundryServiceItem
        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_CREATED,data:createItem});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //omer abdhullah

exports.createServiceCategory=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        // request.checkBody('serviceId',AppConstraints.SERVICE_ID_NOT_VALID).isMongoId();
        request.checkBody('categoryName',AppConstraints.SERVICE_ITEM_NAME).notEmpty();
        request.checkBody('categoryNameAr',AppConstraints.SERVICE_ITEM_NAME).notEmpty();
        request.checkBody('series',AppConstraints.SERVICE_CATEGORY_SERIES).notEmpty();
        request.checkBody('categoryPicOriginal',AppConstraints.SERVICE_ITEM_PIC_ORIGINAL).notEmpty();
        request.checkBody('categoryPicThumbnail',AppConstraints.SERVICE_ITEM_PIC_THUMBNAIL).notEmpty();
        // request.checkBody('amountPerItem',AppConstraints.AMMOUNT_PER_ITEM).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let criteria={
            // serviceId:request.body.serviceId,
            categoryName:request.body.itemName,
            isDeleted:false
        };

        let checkIfAlreadyCreated=await serviceCategory.findOne(criteria);
        if(checkIfAlreadyCreated)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_CREATED_CATEGORY});

        let createCategory;
        if(request.body.Id){
            createCategory = await serviceCategory.update({_id:request.body.Id},{$set:{
                    categoryName:request.body.categoryName,
                    categoryNameAr:request.body.categoryNameAr,
                    series:request.body.series,
                    'categoryPic.categoryPicOriginal':request.body.categoryPicOriginal,
                    'categoryPic.categoryPicThumbnail':request.body.categoryPicThumbnail,
                }});
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_UPDATED_SUCCESSFULLY,data:createCategory});
        }else{
            let servicecategory=new serviceCategory();
            // serviceCategory.serviceId=request.body.serviceId;
            servicecategory.categoryName=request.body.categoryName;
            servicecategory.categoryNameAr=request.body.categoryNameAr;
            servicecategory.series = request.body.series;
            servicecategory.categoryPic.categoryPicOriginal=request.body.categoryPicOriginal;
            servicecategory.categoryPic.categoryPicThumbnail=request.body.categoryPicThumbnail;
            // servicecategory.amountPerItem=request.body.amountPerItem;
            console.log(servicecategory,"servicecategoryservicecategoryservicecategory", request.body);
            createCategory = await servicecategory.save();

            if(createCategory && createCategory._id){
                await Service.update({_id: request.body.serviceId}, {$addToSet: {serviceCategory: createCategory._id}}, {multi: true})
                await Laundry.update({}, {$addToSet: {serviceCategory: createCategory._id}}, {multi: true})
            }

            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_CREATED,data:createCategory});
        }

        // let laundriesToUpdate = await Laundry.find({services:{$in:[request.body.serviceId]}});
        // console.log(laundriesToUpdate);
        // for(let i = 0 ; i < laundriesToUpdate.length ; i++){
        //     let laundryItem = new laundryserviceitem();
        //     laundryItem.serviceId=request.body.serviceId;
        //     laundryItem.serviceItemId=createCategory._id;
        //     laundryItem.laundryId=laundriesToUpdate[i]._id;
        //     laundryItem.amountPerItem=createCategory.amountPerItem;
        //     await laundryItem.save();
        // }

    }catch(err){
        console.log(err,"===================err");
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};   //omer abdhullah

exports.editOrDeleteServiceItems=async(request,response)=>{
    try{

        console.log(request.body,'request data');
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkBody('serviceItemId',AppConstraints.SERVICE_ITEM_ID).notEmpty();
        // request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.status==='DELETE'){
            if(request.body.serviceItemId && request.body.serviceId){
                let criteria={
                    _id:request.body.serviceItemId,
                    serviceId:request.body.serviceId
                };
                let criteria2 = {
                    serviceId:request.body.serviceId,
                    serviceItemId:request.body.serviceItemId
                };
    
                await laundryserviceitem.update(criteria2,{$set:{isDeleted:true}},{multi:true});
                await serviceItem.update(criteria,{$set:{isDeleted:true}});
            }else if(request.body.serviceId){
                let criteria={
                    _id:request.body.serviceId
                };
                
                let criteria2 = {
                    serviceId: request.body.serviceId
                }

                await laundryserviceitem.update(criteria2,{$set:{isDeleted:true}},{multi:true});
                await Service.update(criteria,{$set:{isDeleted:true}});
            }
            
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_DELETED_SUCCESSFULLY.EN});
        }
        else if(request.body.status==='EDIT'){

            let dataToSet={};
            if(request.body.itemName){
    
    
                let criteria={
                    itemName:request.body.itemName,
                    serviceId:request.body.serviceId
                };
    
                let findItemAlready=await serviceItem.findOne(criteria);
                if(!findItemAlready){
                    dataToSet['itemName']=request.body.itemName;
                }
    
                // else if(findItemAlready && (""+findItemAlready._id!==request.body.serviceItemId)){
                //     return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_CREATED_ITEM.EN});
                // }
    
                else{
                    dataToSet['itemName']=request.body.itemName;
                }
    
                
                
               
            }
    
    
    
            if(request.body.itemPicOriginal){
                dataToSet['itemPic.itemPicOriginal']=request.body.itemPicOriginal;
            }
    
    
            if(request.body.itemPicOriginal){
                dataToSet['itemPic.itemPicThumbnail']=request.body.itemPicThumbnail;
            }
    
    
            if(request.body.amountPerItem){
                dataToSet['amountPerItem']=request.body.amountPerItem;
            }
            
            if(request.body.itemNameAr){
                dataToSet['itemNameAr']=request.body.itemNameAr;
            }

            if(request.body.categoryId){
                dataToSet['categoryId']=request.body.categoryId;
            }

            if(request.body.series){
                dataToSet['series']=request.body.series;
            }

            let criteria={
                _id:request.body.serviceItemId,
                // serviceId:request.body.serviceId
            };
    
        

            await serviceItem.update(criteria,{$set:dataToSet});

            let findUpdatedData=await serviceItem.findOne(criteria);

            let criteria1={
                serviceItemId:request.body.serviceItemId,
                serviceId:request.body.serviceId
            };

            // "itemInitialCount" : NumberInt(0),
            //     "createDate" : ISODate("2018-09-24T14:03:13.434+0000"),
            //     "isActive" : true,
            //     "isDeleted" : false,
            //     "amountPerItem" : "100",

            let laundrySercieItems = await laundryserviceitem.update(criteria1,{$set:{categoryId:request.body.categoryId,series:request.body.series}},{multi:true});
            console.log(laundrySercieItems,"laundrySercieItems");
            // let laundriesToUpdate = await Laundry.find({services:{$in:[request.body.serviceItemId]}})
            // console.log(laundriesToUpdate)
            // for(let i = 0 ; i < laundriesToUpdate.length ; i++){
            //     let laundryItem = new laundryserviceitem();
            //     laundryItem.serviceId=request.body.serviceId;
            //     laundryItem.serviceItemId=createItem._id;
            //     laundryItem.laundryId=laundriesToUpdate[i]._id;
            //     laundryItem.amountPerItem=createItem.amountPerItem;
            //     await laundryItem.save();
            // }
    
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_UPDATED_SUCCESSFULLY.EN,data:findUpdatedData});

        }

        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //omer abdhullah

exports.editOrDeleteServiceItems1=async(request,response)=>{
    try{

        console.log(request.body,'request data');
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkBody('laundryItemId',AppConstraints.LAUNDRY_ITEM_ID).notEmpty();
        // request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        // request.checkBody('status',AppConstraints.STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
        console.log('criteria criteria', request.body.key)

        if(request.body.key==='DELETE'){
            let criteria={
                categoryId:mongoose.Types.ObjectId(request.body.categoryId),
                serviceId:mongoose.Types.ObjectId(request.body.serviceCategoryId)
            };
            console.log('criteria criteria', criteria)
            await laundryserviceitem.update(criteria,{$set:{isDeleted:true}},{multi:true});
            console.log('criteria criteria')

            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_DELETED_SUCCESSFULLY.EN});
        }
        else if(request.body.key==='EDIT'){

            let dataToSet={};
            if(request.body.itemName){
    
    
                let criteria={
                    itemName:request.body.itemName,
                    serviceId:request.body.serviceId
                };
    
                let findItemAlready=await serviceItem.findOne(criteria);
                if(!findItemAlready){
                    dataToSet['itemName']=request.body.itemName;
                }
    
                // else if(findItemAlready && (""+findItemAlready._id!==request.body.serviceItemId)){
                //     return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_CREATED_ITEM.EN});
                // }
    
                else{
                    dataToSet['itemName']=request.body.itemName;
                }
    
                
                
               
            }
    
    
    
            if(request.body.itemPicOriginal){
                dataToSet['itemPic.itemPicOriginal']=request.body.itemPicOriginal;
            }
    
    
            if(request.body.itemPicOriginal){
                dataToSet['itemPic.itemPicThumbnail']=request.body.itemPicThumbnail;
            }
    
    
            if(request.body.amountPerItem){
                dataToSet['amountPerItem']=request.body.amountPerItem;
            }
            
            if(request.body.itemNameAr){
                dataToSet['itemNameAr']=request.body.itemNameAr;
            }

            if(request.body.categoryId){
                dataToSet['categoryId']=request.body.categoryId;
            }

            if(request.body.series){
                dataToSet['series']=request.body.series;
            }

            let criteria={
                _id:request.body.serviceItemId,
                // serviceId:request.body.serviceId
            };
    
        

            await serviceItem.update(criteria,{$set:dataToSet});

            let findUpdatedData=await serviceItem.findOne(criteria);

            let criteria1={
                serviceItemId:request.body.serviceItemId,
                serviceId:request.body.serviceId
            };

            // "itemInitialCount" : NumberInt(0),
            //     "createDate" : ISODate("2018-09-24T14:03:13.434+0000"),
            //     "isActive" : true,
            //     "isDeleted" : false,
            //     "amountPerItem" : "100",

            let laundrySercieItems = await laundryserviceitem.update(criteria1,{$set:{categoryId:request.body.categoryId,series:request.body.series}},{multi:true});
            console.log(laundrySercieItems,"laundrySercieItems");
            // let laundriesToUpdate = await Laundry.find({services:{$in:[request.body.serviceItemId]}})
            // console.log(laundriesToUpdate)
            // for(let i = 0 ; i < laundriesToUpdate.length ; i++){
            //     let laundryItem = new laundryserviceitem();
            //     laundryItem.serviceId=request.body.serviceId;
            //     laundryItem.serviceItemId=createItem._id;
            //     laundryItem.laundryId=laundriesToUpdate[i]._id;
            //     laundryItem.amountPerItem=createItem.amountPerItem;
            //     await laundryItem.save();
            // }
    
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_UPDATED_SUCCESSFULLY.EN,data:findUpdatedData});

        }

        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //omer abdhullah //sandeep

exports.blockOrDeleteServiceCategory1=async(request,response)=>{
    try{

        console.log(request.body,'request data');
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('serviceCategoryId',AppConstraints.SERVICE_CATEGORY_ID).notEmpty();
        request.checkBody('isActive',AppConstraints.SERVICE_ITEM_ID).notEmpty();
        // request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        // request.checkBody('status',AppConstraints.STATUS).notEmpty();
        request.checkBody('key',AppConstraints.KEY).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.key==='DELETE'){
            let criteria={
                _id:request.body.serviceCategoryId,
                // serviceId:request.body.serviceId
            };
            // let criteria2 = {
            //     serviceId:request.body.serviceId,
            //     serviceItemId:request.body.serviceItemId
            // };
            // let log = await laundryserviceitem.find(criteria2);
            // console.log(log);
            // await laundryserviceitem.update(criteria2,{$set:{isDeleted:true}},{multi:true});
            // await serviceCategory.update(criteria,{$set:{isDeleted:request.body.isActive}});
            if(request.body.isActive === true){
                console.log('++++++++++++1')
                if(request.body.serviceId){
                console.log('++++++++++++2')
                    await Service.findOneAndUpdate({_id: mongoose.Types.ObjectId(request.body.serviceId)},{$pull:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }else if(request.body.laundryId){
                console.log('++++++++++++3')
                    await Laundry.findOneAndUpdate({_id: mongoose.Types.ObjectId(request.body.laundryId)},{$pull:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }
            }else if(request.body.isActive === false){
                if(request.body.serviceId){
                    await Service.update({},{$addToSet:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }else if(request.body.laundryId){
                    await Laundry.update({},{$addToSet:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }

            }
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_DELETED_SUCCESSFULLY.EN});
        }
        else if(request.body.status==='BLOCK'){

            // let dataToSet={};
            // if(request.body.itemName){
            //     let criteria={
            //         itemName:request.body.itemName,
            //         serviceId:request.body.serviceId
            //     }
            //     let findItemAlready=await serviceItem.findOne(criteria);
            //     if(!findItemAlready){
            //         dataToSet['itemName']=request.body.itemName;
            //     }
            //     // else if(findItemAlready && (""+findItemAlready._id!==request.body.serviceItemId)){
            //     //     return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_CREATED_ITEM.EN});
            //     // }
            //     else{
            //         dataToSet['itemName']=request.body.itemName;
            //     }
            // }
            // if(request.body.itemPicOriginal){
            //     dataToSet['itemPic.itemPicOriginal']=request.body.itemPicOriginal;
            // }
            // if(request.body.itemPicOriginal){
            //     dataToSet['itemPic.itemPicThumbnail']=request.body.itemPicThumbnail;
            // }
            // if(request.body.amountPerItem){
            //     dataToSet['amountPerItem']=request.body.amountPerItem;
            // }
            // if(request.body.itemNameAr){
            //     dataToSet['itemNameAr']=request.body.itemNameAr;
            // }
            let criteria={
                _id:request.body.serviceCategoryId,
                // serviceId:request.body.serviceId
            }
            await serviceCategory.update(criteria,{$set:{isActive:request.body.isActive}});

            let findUpdatedData=await serviceCategory.findOne(criteria);

            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_UPDATED_SUCCESSFULLY.EN,data:findUpdatedData});

        }

        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //omer abdhullah

exports.blockOrDeleteServiceCategory=async(request,response)=>{
    try{

        console.log(request.body,'request data');
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('serviceCategoryId',AppConstraints.SERVICE_CATEGORY_ID).notEmpty();
        request.checkBody('isActive',AppConstraints.SERVICE_ITEM_ID).notEmpty();
        // request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        // request.checkBody('status',AppConstraints.STATUS).notEmpty();
        request.checkBody('key',AppConstraints.KEY).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.key==='DELETE'){
            if(request.body.isActive === true){
                console.log('++++++++++++1')
                if(request.body.serviceCategoryId && request.body.categoryId){
                    console.log('++++++++++++3')
                    let criteria={
                        laundryId:mongoose.Types.ObjectId(request.body.laundryId),
                        categoryId:mongoose.Types.ObjectId(request.body.categoryId),
                        serviceId:mongoose.Types.ObjectId(request.body.serviceCategoryId)
                    };
                    console.log('criteria criteria', criteria)
                    await laundryserviceitem.update(criteria,{$set:{isDeleted:true}},{multi:true});
                    console.log('criteria criteria')
        
                    return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_DELETED_SUCCESSFULLY.EN});
                }else if(request.body.serviceId){
                console.log('++++++++++++2')
                    await Service.findOneAndUpdate({_id: mongoose.Types.ObjectId(request.body.serviceId)},{$pull:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }
            }else if(request.body.isActive === false){
                if(request.body.serviceId){
                    await Service.update({},{$addToSet:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }else if(request.body.laundryId){
                    await Laundry.update({},{$addToSet:{serviceCategory:mongoose.Types.ObjectId(request.body.serviceCategoryId)}}, {multi: true});
                }

            }
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_DELETED_SUCCESSFULLY.EN});
        }
        else if(request.body.status==='BLOCK'){

            // let dataToSet={};
            // if(request.body.itemName){
            //     let criteria={
            //         itemName:request.body.itemName,
            //         serviceId:request.body.serviceId
            //     }
            //     let findItemAlready=await serviceItem.findOne(criteria);
            //     if(!findItemAlready){
            //         dataToSet['itemName']=request.body.itemName;
            //     }
            //     // else if(findItemAlready && (""+findItemAlready._id!==request.body.serviceItemId)){
            //     //     return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_CREATED_ITEM.EN});
            //     // }
            //     else{
            //         dataToSet['itemName']=request.body.itemName;
            //     }
            // }
            // if(request.body.itemPicOriginal){
            //     dataToSet['itemPic.itemPicOriginal']=request.body.itemPicOriginal;
            // }
            // if(request.body.itemPicOriginal){
            //     dataToSet['itemPic.itemPicThumbnail']=request.body.itemPicThumbnail;
            // }
            // if(request.body.amountPerItem){
            //     dataToSet['amountPerItem']=request.body.amountPerItem;
            // }
            // if(request.body.itemNameAr){
            //     dataToSet['itemNameAr']=request.body.itemNameAr;
            // }
            let criteria={
                _id:request.body.serviceCategoryId,
                // serviceId:request.body.serviceId
            }
            await serviceCategory.update(criteria,{$set:{isActive:request.body.isActive}});

            let findUpdatedData=await serviceCategory.findOne(criteria);

            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.ITEM_UPDATED_SUCCESSFULLY.EN,data:findUpdatedData});

        }

        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
} // sandeep

exports.createSubscriptionPlan=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('planName',AppConstraints.PLANE_NAME).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        let findIfAlreadySubs=await SubscriptionPlane.findOne({planName:request.body.planName,isDeleted:false});
        if(findIfAlreadySubs)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_SUBSCRIPTION_PLAN})


        console.log('request plane',request.body.planName)

        let subscriptionplane=new SubscriptionPlane();
        subscriptionplane.planName=request.body.planName;
        subscriptionplane.planNameAr=request.body.planNameAR;
        subscriptionplane.planAmount=request.body.planAmount||"";
        subscriptionplane.planAmountAr=request.body.planAmount||"";
        subscriptionplane.perPeriod=request.body.perPeriod||"";
        subscriptionplane.perPeriodAr=request.body.perPeriodAR||"";
        subscriptionplane.noOfUsers=request.body.noOfUsers||"";
        subscriptionplane.noOfWeeklyOrders=request.body.noOfWeeklyOrders||"";
        subscriptionplane.weekendService=request.body.weekendService||false;
        // subscriptionplane.subscriptionItems=request.body.subscriptionItems||[];

        let saveSubscription=await subscriptionplane.save();

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUBSCRIPTION_PLANE_CREATED,data:saveSubscription});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //superAdmin


exports.editOrDeleteSubscriptionPlane=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin ){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('planId',AppConstraints.PLANE_ID).notEmpty();
        request.checkBody('planId',AppConstraints.PLANE_ID_NOT_VALID).isMongoId();
        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        if(request.body.status==="DELETE"){



            let deletePlane=await SubscriptionPlane.update({_id:request.body.planId},{$set:{isDeleted:true}});
            return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.PLANE_DELETED});
        }

        else if(request.body.status==="EDIT"){

            let dataToSet={};

            if(request.body.planName){

                let findIfAlreadPlane=await SubscriptionPlane.findOne({planName:request.body.planName});

                if(findIfAlreadPlane){
                    if(""+findIfAlreadPlane._id===request.body.planId){
                        dataToSet['planName']=request.body.planName;
                    }
                    else{
                        return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.ALREADY_SUBSCRIPTION_PLAN})
                    }
                }
                else{
                    dataToSet['planName']=request.body.planName;
                }

               
            }

            
                dataToSet['planAmount']=request.body.planAmount;
                dataToSet['perPeriod']=request.body.perPeriod;


                await SubscriptionPlane.update({_id:request.body.planId},{$set:dataToSet});
                let getPlaneData=await SubscriptionPlane.findOne({_id:request.body.planId})

                return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.PLANE_UPDATED,data:getPlaneData});

         

        }
        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

        

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //superAdmin



exports.createSubscriptionPlaneItem=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('planId',AppConstraints.PLANE_ID).notEmpty();
        request.checkBody('planId',AppConstraints.PLANE_ID_NOT_VALID).isMongoId();
        request.checkBody('itemQwery',AppConstraints.ITEM_QWERY).notEmpty();
        request.checkBody('itemStatus',AppConstraints.ITEM_STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let ifAlreadyItem=await SubscriptionPlaneItem.findOne({planId:request.body.planId,itemQwery:request.body.itemQwery});

        if(ifAlreadyItem)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_PLAN_ITEM});


        

        let planItem=new SubscriptionPlaneItem();
        planItem.planId=request.body.planId;
        planItem.itemQwery=request.body.itemQwery;
        planItem.itemStatus=request.body.itemStatus;


        console.log(planItem,'plan item data');

        let createPlaneItem=await planItem.save();


        // console


        return response.status(200).json({statusCode:400,success:1,msg:AppConstraints.PLANE_ITEM_CREATED,data:createPlaneItem})



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //superAdmin


exports.editOrDeleteSubscriptionPlaneItem=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('planItemId',AppConstraints.PLANE_ITEM_ID).notEmpty();
        request.checkBody('status',AppConstraints.PLANE_ID_STATUD).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        if(request.body.status==="DELETE"){
          
            await SubscriptionPlaneItem.update({_id:request.body.planItemId},{$set:{isDeleted:true}})
            return response.status(200).json({success:1,msg:AppConstraints.PLANE_ITEM_DELETED,statusCode:200})
        }
        else if(request.body.status==="EDIT"){

            let dataToSet={};

            if(request.body.itemQwery){


                let findQweryItem=await SubscriptionPlaneItem.findOne({itemQwery:request.body.itemQwery});
                if(findQweryItem){
                    if(""+findQweryItem._id===request.body.planItemId){
                        dataToSet['itemQwery']=request.body.itemQwery;
                    }
                    else{
                        return response.status(200).json({success:1,msg:AppConstraints.ITEM_QWERY_ALREADY,statusCode:400});
                    }
                }
                else{
                    dataToSet['itemQwery']=request.body.itemQwery;
                }

               
            }

            if(request.body.itemStatus){
                dataToSet['itemStatus']=request.body.itemStatus;
            }


            await SubscriptionPlaneItem.update({_id:request.body.planItemId},{$set:dataToSet});

           let data=await SubscriptionPlaneItem.findOne({_id:request.body.planItemId});
            return response.status(200).json({statusCode:200,success:1,data:data,msg:AppConstraints.SUCCESSFULLY_UPDATED_ITEM})

        }
        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //superAdmin



exports.assignBookingToDriver=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

       
        request.checkBody('driverId',AppConstraints.DRIVER_ID).notEmpty();
        request.checkBody('driverId',AppConstraints.DRIVER_ID_VALID).isMongoId();
        request.checkBody('bookingId',AppConstraints.BOOKING_ID).notEmpty();
        request.checkBody('bookingId',AppConstraints.BOOKING_ID_VALID).isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
        let findBookingData=await Bookings.findOne({_id:request.body.bookingId}).populate({path:'userId',select:{}});
        let findDeviceToken=await User.findOne({_id:request.body.driverId});
        if(!findDeviceToken.isAvailable)
        return response.status(200).json({success:0,statusCode:400,msg:AppConstraints.DRIVER_NOT_AVAILABLE})
       
        let criteria={
            recieverId:request.body.driverId,
            isRead:false
        }
        let findTotalUnreadCount=await NotificationData.count(criteria);

        let d=new Date();

        let dataToPush={
            msg:AppConstraints.BOOKING_ASSIGNED,
            messageType:AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER,
            userId:findBookingData.userId._id,
            bookingId:request.body.bookingId,
            count:findTotalUnreadCount+1
        }


        let newNotification=new NotificationData();
        newNotification.recieverId=request.body.driverId,
        newNotification.bookingId=request.body.bookingId;
        newNotification.msg=AppConstraints.BOOKING_ASSIGNED;
        newNotification.messageType=AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER;







        let criteriaUser={
            recieverId:request.body.driverId,
            isRead:false
        }

        let findTotalUnreadCountUser=await NotificationData.count(criteriaUser);

      

        let dataToPushUser={
            msg:AppConstraints.BOOKING_ASSIGNED_USER_NOTIFICATION,
            messageType:AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER,
            userId:findBookingData.userId._id,
            bookingId:request.body.bookingId,
            count:findTotalUnreadCountUser+1
        }


        let newNotificationUser=new NotificationData();
        newNotificationUser.recieverId=findBookingData.userId._id,
        newNotificationUser.bookingId=request.body.bookingId;
        newNotificationUser.msg=AppConstraints.BOOKING_ASSIGNED_USER_NOTIFICATION;
        newNotificationUser.messageType=AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER;

        await Promise.all([
            Bookings.update({_id:request.body.bookingId},
                            {$set:{driverId:request.body.driverId,
                                   status:AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER,
                                   assignedStatusCount:findBookingData.assignedStatusCount+1,
                                   assignedTime:new Date().getTime()}
                            }),
            pushNotification.sendPush(findDeviceToken.deviceToken,dataToPush),
            pushNotification.sendPushToUser(findBookingData.userId.deviceToken,dataToPushUser),
            newNotification.save(),
            newNotificationUser.save()
        ]);

        let findBooking=await Bookings.findOne({_id:request.body.bookingId});
        await SocketManager.emitAssignedBooking(findBooking);
        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESSFULLY_ASSIGNED})

    }catch(err){
        console.log(err,'error data++++++++++++')
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational-------------------------------------------


exports.subscriptionPlanListing=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }
       

        let criteria={
            isDeleted:false
        }

        let findSubscriptionPlane=await SubscriptionPlane.aggregate([
                                                            {$match:criteria},      
                                                            { $lookup:
                                                                {
                                                    
                                                                from:'subscriptionplanitems',
                                                                localField: '_id',
                                                                foreignField: 'planId',
                                                                as: 'planDetails'
                                                                }
                                                            },

                                                            {
                                                            $project:{
                                                                "_id" : 1, 
                                                                "isDeleted" :1, 
                                                                "created_at" : 1, 
                                                                "isActive" : 1, 
                                                                "perPeriod" : 1, 
                                                                "planAmount" :1, 
                                                                "planName" : 1, 
                                                                "__v" : 1,
                                                                planDetails:{$filter: {
                                                                input: "$planDetails",
                                                                as: "item",
                                                                cond: { $eq: [ "$$item.isDeleted", false ] }
                                                                }}
                                                            }}
    ]);

        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESS,data:findSubscriptionPlane});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //superAdmin


exports.createPrmoCode=async(request,response)=>{
    try{
        console.log(request.body,'request data for promocode');
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.marketingAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('promoCode',AppConstraints.PROMO_CODE).notEmpty();
        request.checkBody('expiryDate',AppConstraints.EXPIRY_DATE).notEmpty();
        request.checkBody('discount',AppConstraints.DISCOUNT).notEmpty();
        request.checkBody('message',AppConstraints.MESSAGE).notEmpty();
        request.checkBody('startDate',AppConstraints.START_DATE).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});


        let ifAlreadyPromos=await PromoCode.findOne({promoCode:request.body.promoCode});


        if(ifAlreadyPromos)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_PROMO});

        let d1 = new Date();
        let d2 = new Date(request.body.expiryDate)

        if(d2.getTime()>d1.getTime()){
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.EXPIRY_DATE_VALID})
        }

        let startDate=new Date(request.body.startDate)

        // if(startDate.getTime()<d1.getTime()){
        //     return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.START_DATE_LESSER})
        // }

        if(parseInt(request.body.discount)>100){
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.DISCOUNT_NOT_MORE_100})
        }

        let promocode=new PromoCode();


        promocode.promoCode=request.body.promoCode
        promocode.expiryDate=new Date(parseInt(request.body.expiryDate)).getTime();
        promocode.discount=request.body.discount;
        promocode.message=request.body.message;
        promocode.discount=parseFloat(request.body.discount);
        promocode.startDate=new Date(parseInt(request.body.startDate)).getTime();



        let promoCodeSaved=await promocode.save();
        let findUserTokens=await User.find({isBlocked:false,userType:AppConstraints.USER}).select({deviceToken:1});
        let allTokens=await findUserTokens.map((val)=>{
            let token=val.deviceToken;
            return token;
        });
        let dataToPush={};

        dataToPush.msg=request.body.message;
        dataToPush.promocode=request.body.promocode;
        dataToPush.messageType=AppConstraints.APP_CONST_VALUE.PROMO;
        dataToPush.msg=request.body.message;
        dataToPush.promocodeId=promoCodeSaved._id;

      
        
        // await pushNotification.sendPushToAllUser(allTokens,dataToPush)
     

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.PROMO_CODE_SUCCESS});            


    }catch(err){
        console.log(err,'error in data')
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //superAdmin


exports.getAllbookingList=async(request,response)=>{
    try{
        console.log(request.body,'request data');
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
        console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");

            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('perPage',AppConstraints.PER_PAGE).notEmpty();
        request.checkBody('page',AppConstraints.PAGE).notEmpty();
        request.checkBody('status',AppConstraints.STATUS_BOOKING).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});
        let criteria;
        if(request.body.status==='ALL'){
            criteria={}
        }else{
             criteria={
                status:request.body.status
            }
        }
        if(request.body.startDate && request.body.endDate){
            criteria.createDate={$gte:request.body.startDate,$lte:request.body.endDate}
        }
        console.log(criteria,"criteria");
        let getBooking=await Promise.all([
            Bookings.count(criteria),
            Bookings.find(criteria)
            .sort({"_id":-1})
            .skip((parseInt(request.body.perPage)*parseInt(request.body.page))-parseInt(request.body.perPage))
            .limit(parseInt(request.body.perPage))
            .populate({path:'laundryId',select:{},populate:{path:'districtId'}})
            .populate({path:'userId',select:{password:0,accessToken:0,licencePic:0}})
            .populate({path:'driverId',select:{password:0,accessToken:0}})
        ]);


        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS,data:getBooking[1],totalResult:getBooking[0]});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational


exports.getListOfReviews=async(request,response)=>{
    try{
        console.log(request.body,'request data');
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        let criteria={
            isDeleted:false
        };


        if(request.query.searchText){
            criteria={
                isDeleted:false,
                description:new RegExp(request.query.searchText,'i')
            };
            
        }




        let findReview=await Review.find(criteria).populate({path:'userId',select:{password:0,accessToken:0}});

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS,data:findReview});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer


exports.addVehicle=async(request,response)=>{
    try{
        
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('VehicleName',AppConstraints.VEHICLE_NAME).notEmpty();
        request.checkBody('VehicleNumber',AppConstraints.VEHICLE_NUMBER).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});
        let findAlreadyAddedVehicle=await Vehicle.findOne({VehicleNumber:request.body.VehicleNumber});
        if(findAlreadyAddedVehicle)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_VEHICLE});
        let vehicle=new Vehicle();
        vehicle.VehicleName=request.body.VehicleName;
        vehicle.VehicleNumber=request.body.VehicleNumber;
        let saveVehicle=await vehicle.save();

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.VEHICLE_ADDED,data:saveVehicle});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //super


exports.editOrDeleteVehicle=async(request,response)=>{
    try{


        console.log('edit vehicle',request.body);



        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        request.checkBody('vehicleId',AppConstraints.VEHILCE_ID).notEmpty().isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});

        if(request.body.status==='EDIT'){

           let dataToSave={}
         
           if(request.body.VehicleName!=null || request.body.VehicleName!=''){
            dataToSave['VehicleName']=request.body.VehicleName;
           }
           if(request.body.VehicleNumber!=null ||request.body.VehicleNumber!=''){
            dataToSave['VehicleNumber']=request.body.VehicleNumber;
           }

            await Vehicle.update({_id:request.body.vehicleId},{$set:dataToSave});

            let dataToSendToUser=await Vehicle.findOne({_id:request.body.vehicleId})

            return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:dataToSendToUser})

        }
        else if(request.body.status==='DELETE'){
            await Vehicle.update({_id:request.body.vehicleId},{$set:{isDeleted:true}});
            return response.status(200).json({success:1,msg:AppConstraints.SUCCESS})
        }
       else{
            return response.status(200).json({success:1,msg:'Invalid status'})
       }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //super


exports.getVehicleListing=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        let criteria={};

        criteria={
            isDeleted:false
        }

        if(request.query.searchText){
            criteria={
                $and:[
                    {isDeleted:false},
                    {$or:[{VehicleName:new RegExp(request.query.searchText,'i')},{VehicleNumber:new RegExp(request.query.searchText,'i')}]}
                ]
            }
        }

        let findVehicle=await Vehicle.find(criteria);

        return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,statusCode:200,data:findVehicle});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //super

exports.getPerticularUserData=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkQuery('userId',AppConstraints.USER_ID).notEmpty().isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});

        
        let findUserData=await User.findOne({_id:request.body.userId},{accessToken:0,password:0});

        console.log(findUserData)

        if(!findUserData)
        return response.status(400).json({statusCode:400,success:1,msg:AppConstraints.INVALID_USER_ID})

        return response.status(200).json({success:1,statusCode:400,msg:AppConstraints.SUCCESS,data:findUserData});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer


exports.quickReviewWash=async(request,response)=>{
    try{

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.giveIncentivesToDriver=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        request.checkBody('driverId',AppConstraints.DRIVER_ID).notEmpty().isMongoId();
        request.checkBody('incentive',AppConstraints.INCENTIVE_REQUIRED).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});


        let findDriver=await User.findOne({_id:request.body.driverId});

        if(!findDriver)
        return response.status(400).json(AppConstraints.INVALID_DRIVER_ID2);

        await User.update({_id:request.body.driverId},{$set:{incentive:request.body.incentive}});

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.createCharge=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        request.checkBody('quickCharge',AppConstraints.QUICK_CHARGE).notEmpty();
        request.checkBody('deliveryCharge',AppConstraints.DELIVERY_CHARGE).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

        let findIfAlreadCharge=await Charge.find();

        if(findIfAlreadCharge.length>0){
            await Charge.update({_id:findIfAlreadCharge[0]._id},{$set:{quickCharge:request.body.quickCharge,deliveryCharge:request.body.deliveryCharge}});
            let finCharge=await Charge.find();
            return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.CHARGE_UPDATED_SUCCESSFULLY,data:finCharge})
        }

        let charge=new Charge();
        charge.quickCharge=request.body.quickCharge;
        charge.deliveryCharge=request.body.deliveryCharge;
        let saveCharge=await charge.save();
        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.CHARGE_CREATED_SUCCESSFULLY,data:saveCharge})


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}


exports.promocodeListingToAdmin=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.marketingAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        let criteria={};

        if(request.query.status=='ACTIVE'){
            criteria.isDeleted=false
        }
        else if(request.query.status=='BLOCKED'){
            criteria.isDeleted=true
        }
        
        let findPromocode=await PromoCode.find(criteria);

        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESS,data:findPromocode})

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //super

exports.updateSubscriptionPlanAndPlanItem=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('planId',AppConstraints.PLANE_ID).notEmpty().isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        if(request.body.planItem.length<=0){
            return response.status(400).json({success:0,msg:AppConstraints.ATLEAST_ONE_ITEM})
        }

        let findIfAlreadySubs=await SubscriptionPlane.findOne({planName:request.body.planName});
        if(findIfAlreadySubs)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_SUBSCRIPTION_PLAN})


        let dataToSet={};

        if(request.body.planName){
            dataToSet['planName']=request.body.planName;
        }
       
        dataToSet['planAmount']=request.body.planAmount;
    
    
        dataToSet['perPeriod']=request.body.perPeriod;
       

        await SubscriptionPlane.update({_id:request.body.planId},{$set:dataToSet});
       
        if(request.body.planItem && request.body.planItem.length>0){


            for(let i=0;i<request.body.planItem.length;i++){

             

                let dataToSave={}
                if(request.body.planItem[i].itemQwery){
                    dataToSave['itemQwery']=request.body.planItem[i].itemQwery
                }
                if(request.body.planItem[i].itemStatus){
                    dataToSave['itemStatus']=request.body.planItem[i].itemStatus
                }
                

                await SubscriptionPlaneItem.update({_id:request.body.planItem[i].planItemId,planId:request.body.planId},{$set:dataToSave});
    
            }


        }

        let criteria={
            isDeleted:false
        }

        let findSubscriptionPlane=await SubscriptionPlane.aggregate([
                                                            {$match:criteria},      
                                                            { $lookup:
                                                                {
                                                    
                                                                from:'subscriptionplanitems',
                                                                localField: '_id',
                                                                foreignField: 'planId',
                                                                as: 'planDetails'
                                                                }
                                                            },
                                                            {
                                                            $project:{
                                                                "_id" : 1, 
                                                                "isDeleted" :1, 
                                                                "created_at" : 1, 
                                                                "isActive" : 1, 
                                                                "perPeriod" : 1, 
                                                                "planAmount" :1, 
                                                                "planName" : 1, 
                                                                "__v" : 1,
                                                                planDetails:{$filter: {
                                                                input: "$planDetails",
                                                                as: "item",
                                                                cond: { $eq: [ "$$item.isDeleted", false ] }
                                                                }}
                                                            }}
       ]);

       return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESS,data:findSubscriptionPlane});



       
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //super

exports.addSubscriptionPlanAndPlanItem=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('planName',AppConstraints.PLANE_NAME).notEmpty();
        request.checkBody('planItem',AppConstraints.PLANE_ITEM).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        if(request.body.planItem.length<=0){
            return response.status(400).json({success:0,msg:AppConstraints.ATLEAST_ONE_ITEM})
        }

        let findIfAlreadySubs=await SubscriptionPlane.findOne({planName:request.body.planName});
        if(findIfAlreadySubs)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_SUBSCRIPTION_PLAN})


        console.log('request plane',request.body.planName)

        let subscriptionplane=new SubscriptionPlane();
        subscriptionplane.planName=request.body.planName;
        subscriptionplane.planAmount=request.body.planAmount||"";
        subscriptionplane.perPeriod=request.body.perPeriod||"";
        let saveSubscription=await subscriptionplane.save();

        for(let i=0;i<request.body.planItem.length;i++){

            let planItem=new SubscriptionPlaneItem();
            planItem.planId=saveSubscription._id;
            planItem.itemQwery=request.body.planItem[i].itemQwery;
            planItem.itemStatus=request.body.planItem[i].itemStatus;
            await planItem.save();

        }
       
       
        let criteria={
            isDeleted:false
        }

        let findSubscriptionPlane=await SubscriptionPlane.aggregate([
                                                            {$match:criteria},      
                                                            { $lookup:
                                                                {
                                                    
                                                                from:'subscriptionplanitems',
                                                                localField: '_id',
                                                                foreignField: 'planId',
                                                                as: 'planDetails'
                                                                }
                                                            },
                                                            {
                                                            $project:{
                                                                "_id" : 1, 
                                                                "isDeleted" :1, 
                                                                "created_at" : 1, 
                                                                "isActive" : 1, 
                                                                "perPeriod" : 1, 
                                                                "planAmount" :1, 
                                                                "planName" : 1, 
                                                                "__v" : 1,
                                                                planDetails:{$filter: {
                                                                input: "$planDetails",
                                                                as: "item",
                                                                cond: { $eq: [ "$$item.isDeleted", false ] }
                                                                }}
                                                            }}
       ]);

       return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESS,data:findSubscriptionPlane});



       
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //super

exports.planItemDataListing=async(request,response)=>{
    try{
        console.log(request.body,'request data')
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkQuery('planId',AppConstraints.PLANE_NAME).notEmpty().isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let data=await SubscriptionPlaneItem.find({planId:request.query.planId,isDeleted:false});
        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESS,data:data});
       
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //super



exports.reAssignedOrder=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('bookingId',AppConstraints.BOOKING_ID).notEmpty();
        request.checkBody('bookingId',AppConstraints.BOOKING_ID_VALID).isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
        let findBookingData=await Bookings.findOne({_id:request.body.bookingId}).populate({path:'userId',select:{}});
        let findDeviceToken=await User.findOne({_id:findBookingData.driverId});
        if(!findDeviceToken.isAvailable)
        return response.status(200).json({success:0,statusCode:400,msg:AppConstraints.DRIVER_NOT_AVAILABLE})
        let criteria={
            recieverId:findBookingData.driverId,
            isRead:false
        }
        let findTotalUnreadCount=await NotificationData.count(criteria);
        let dataToPush={
            msg:AppConstraints.BOOKING_REASSIGNED,
            messageType:AppConstraints.APP_CONST_VALUE.REASSIGNED,
            userId:findBookingData.userId._id,
            bookingId:request.body.bookingId,
            count:findTotalUnreadCount+1
        }
        let newNotification=new NotificationData();
        newNotification.recieverId=findBookingData.driverId,
        newNotification.bookingId=request.body.bookingId;
        newNotification.msg=AppConstraints.BOOKING_REASSIGNED;
        newNotification.messageType=AppConstraints.APP_CONST_VALUE.REASSIGNED;
        let criteriaUser={
            recieverId:request.body.driverId,
            isRead:false
        }
        await Promise.all([
            Bookings.update({_id:request.body.bookingId},
                {$set:{status:AppConstraints.APP_CONST_VALUE.REASSIGNED,
                        reAssignedCount:findBookingData.reAssignedCount+1,assignedTime:new Date().getTime()}}),
             pushNotification.sendPush(findDeviceToken.deviceToken,dataToPush),
             newNotification.save()
        ]);
        let findBooking=await Bookings.findOne({_id:request.body.bookingId});

        await SocketManager.emitAssignedBooking(findBooking);
        
        return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESSFULLY_REASSIGNED})

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational



exports.assignSlotToDriver=async(request,response)=>{
    try{



        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('driverId',AppConstraints.DRIVER_ID).notEmpty().isMongoId();
        request.checkBody('bookingId',AppConstraints.BOOKING_ID).notEmpty().isMongoId();
        request.checkBody('slotTime',AppConstraints.TIME_SLOT).notEmpty();

        // let findDriverData=await User.findOne({_id:request.body.driverId})

        let criteria={
            recieverId:request.body.driverId,
            isRead:false
        }

        let findTotalUnreadCount=await NotificationData.count(criteria);

        let d=new Date();

        let dataToPush={
            msg:AppConstraints.RESHUDULED+' '+new Date(request.body.slotTime).getTime(),
            reshuduled:new Date(request.body.slotTime).getTime(),
            messageType:AppConstraints.APP_CONST_VALUE.SLOTE,
            userId:findBookingData.userId._id,
            bookingId:request.body.bookingId,
            count:findTotalUnreadCount+1
        }


        let newNotification=new NotificationData();
        newNotification.recieverId=request.body.driverId,
        reshuduled=new Date(request.body.slotTime).getTime(),
        newNotification.bookingId=request.body.bookingId;
        newNotification.msg=AppConstraints.RESHUDULED+' '+new Date(request.body.slotTime).getTime()
        newNotification.messageType=AppConstraints.APP_CONST_VALUE.SLOTE;

        await Promise.all([
            Bookings.update({_id:request.body.bookingId}, {$set:{timeSlot:new Date(parseInt(request.body.timeSlot)).getTime()}}),
            pushNotification.sendPush(findDeviceToken.deviceToken,dataToPush),
            newNotification.save()
        ]);



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational







exports.viewDriverOrderHistory=async(request,response)=>{
    try{


        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkBody('driverId',AppConstraints.DRIVER_ID).notEmpty().isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
        let criteria;
        if(request.body.driverId){
            criteria={
                driverId:request.body.driverId,
                status:AppConstraints.APP_CONST_VALUE.COMPLETED
            };
        }
        if(request.body.userId){
            criteria = {
                userId:request.body.userId
            }
        }
        if(request.body.startDate){
            criteria.createDate={$gte:request.body.startDate,$lte:request.body.endDate}
        }
        let findOrderOfDriver=await Bookings.find(criteria).sort({_id:-1})
        return response.status(200).json({statusCode:200,msg:'success',success:1,data:findOrderOfDriver});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational



exports.sendEmailToAllUser=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin || validateToken.marketingAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('message',AppConstraints.MESSAGE_TO_USER).notEmpty()
        request.checkBody('subject',AppConstraints.SUBJECT).notEmpty()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        let criteria={
            isBlocked:false,
            userType:AppConstraints.USER
        }

        let projection={
            email:1
        }


        let Email=[];
        let findAllUser=await User.find(criteria,projection);

        for(let i=0;i<findAllUser.length;i++){
            Email.push(findAllUser[i].email);
        }


        await UnivershalFunction.sendEmail(Email,request.body.message,request.body.subject);

        return response.status(200).json({success:1,msg:'email successfully sented to all user',statusCode:200})


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer

exports.addAndEditMaster = async (request,response) => {
    try {
        let add;
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});


        if(request.body._id){
            console.log(request.body._id,"else");
            add = await master.findOneAndUpdate({_id:request.body._id},{$set:
                    {
                        name:request.body.name,
                        nameAr:request.body.nameAr,
                        type:request.body.type
                    }
            },{new:true});

        }else{
            console.log(request.body._id,"request.body._idrequest.body._idrequest.body._idrequest.body._id");
            let data = new master();
            data.name = request.body.name;
            data.nameAr = request.body.nameAr;
            data.type = request.body.type;
            add = await data.save();
        }

        return response.status(200).json({statusCode:200,msg:'success',success:1,data:add});
    }catch (err) {
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};

exports.deleteBlockMaster = async (request,response) => {
    try {
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        let dataToSet = {};

        if(request.body.isDeleted != null){
            dataToSet.isDeleted = request.body.isDeleted;
        }
        if(request.body.isBlocked != null){
            dataToSet.isBlocked = request.body.isBlocked;
        }

        let update = await master.update({_id:request.body._id},{$set:dataToSet},{new:true});
        return response.status(200).json({statusCode:200,msg:'success',success:1,data:update});

    }catch (err) {
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};

exports.getMaster = async (request,response) => {
    try {
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        let get = await master.find({type:request.query.type,isDeleted:false,isBlocked:false});

        return response.status(200).json({statusCode:200,msg:'success',success:1,data:get});
    }catch (err) {
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};

exports.sendPushNotificationToAllUser=async(request,response)=>{
    try{





        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin || validateToken.marketingAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('message',AppConstraints.MESSAGE_TO_USER).notEmpty()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});


        let criteria={
            isBlocked:false,
            userType:AppConstraints.USER
        }

        let projection={
            deviceToken:1
        }


        let deviceToken=[];

        let findAllUser=await User.find(criteria,projection);

        for(let i=0;i<findAllUser.length;i++){
            console.log(findAllUser[i].deviceToken)
            deviceToken.push(findAllUser[i].deviceToken);
        }


        let dataToPush={
            messageType:AppConstraints.APP_CONST_VALUE.ADMIN,
            msg:request.body.message
        }


        await pushNotification.sendPushToAllUser(deviceToken,dataToPush); 
        return response.status(200).json({success:1,msg:'notification successfully send to all user',statusCode:200})



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer


exports.findPaymentPaidByCustomer=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('userId',AppConstraints.USER_ID).notEmpty().isMongoId()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let criteria={
            userId:request.body.userId,
            status:AppConstraints.APP_CONST_VALUE.COMPLETED
        }

        let projection={
                        totalAmount:1
                    }

        let findData=await Bookings.find(criteria,projection);
        
        let totalPaidAmmount=0; 

        for(let i=0;i<findData.length;i++){
            totalPaidAmmount+=parseFloat(findData[i].totalAmount)
        }

        return response.status(200).json({success:1,msg:'total ammount pad by customer',data:{totalAmmount:totalPaidAmmount}})


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer

exports.userRegisteredInOneYear=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
    
        let criteria={
            userType:AppConstraints.USER,
            createDate:{$gte:new Date(new Date().setFullYear(new Date().getFullYear()-1))}
        }

        let projection={
            createDate:1
        }



        console.log(err,'error')

        //    let findUser=await User.find(criteria,projection);
        //    for(let i=0;i<12;i++){
        //         for(let j=0;j<findUser.length;j++){
        //             if(new Date(findUser[i].createDate).getMonth()==i){
        //                 totalUserInYear=totalUserInYear+1;
        //             }
        //         }
        //     }



        // let data=await User.aggregate([
        //     {$match:{}}
        // ]);



       




        let data=[];

        return response.status(200).json({success:1,msg:'success',data:data,statusCode:200});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.raisedIssueListing=async(request,response)=>{
    try{


        console.log(request.body,'==========================================================')

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }


      



        let criteria={};
        if(request.body.fromDate && request.body.toDate && request.body.userType){
            criteria={
                userType:request.body.userType,
                issuesCreateDate:{$gte:new Date(parseInt(request.body.fromDate)),$lte:new Date(parseInt(request.body.toDate))}
            }
        }

        if(request.body.fromDate&&request.body.toDate){
            criteria={
                issuesCreateDate:{$gte:new Date(parseInt(request.body.fromDate)),$lte:new Date(parseInt(request.body.toDate))}
            }
        }
        if(request.body.fromDate && request.body.userType){
            criteria={
                userType:request.body.userType,
                issuesCreateDate:{$gte:new Date(parseInt(request.body.fromDate))}
            }
        }

        if(request.body.toDate && request.body.userType){
            criteria={
                userType:request.body.userType,
                issuesCreateDate:{$lte:new Date(parseInt(request.body.toDate))}
            }
        }

        if(request.body.toDate){
            criteria={
                issuesCreateDate:{$lte:new Date(parseInt(request.body.toDate))}
            }
        } 

        if(request.body.fromDate){
            criteria={
                issuesCreateDate:{$gte:new Date(parseInt(request.body.fromDate))}
            }
        } 

        if(request.body.userType){
            criteria={
                userType:request.body.userType
            }
        }
        
       

        let data=await Promise.all([
            Issue.find(criteria)
            .sort({"_id":-1})
            .populate({path:'userId',select:{}})
            .skip((parseInt(request.body.perPage)*parseInt(request.body.page))-parseInt(request.body.perPage))
            .limit(parseInt(request.body.perPage)),
            Issue.count(criteria)
        ]);


        console.log(data[1],'============////////////////////////=============')

        return response.status(200).json({success:1,statusCode:200,msg:'success',data:data[0],totaResult:data[1]});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //customer

exports.revenueGenerated=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}



exports.totalEarningAccordingToLaundry=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        request.checkQuery('laundryId',AppConstraints.LAUNDRY_ID).notEmpty().isMongoId()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
        let findTotalEarning=await Bookings.aggregate([
            {$match:{laundryId:ObjectId(request.query.laundryId),status:AppConstraints.APP_CONST_VALUE.COMPLETED}},
            {$group:{_id:"$laundryId",totalAmmount:{$sum:"$totalAmount"}}}
        ]);

        return response.status(200).json({success:1,msg:'success',statusCode:200,data:findTotalEarning});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.totalEarningAccordingToDriver=async(request,response)=>{
    try{

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        request.checkQuery('driverId',AppConstraints.DRIVER_ID).notEmpty().isMongoId()
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
        let findTotalEarning=await Bookings.aggregate([
            {$match:{driverId:ObjectId(request.query.driverId),status:AppConstraints.APP_CONST_VALUE.COMPLETED}},
            {$group:{_id:"$driverId",totalAmmount:{$sum:"$totalAmount"}}}
        ]);

        return response.status(200).json({success:1,msg:'success',statusCode:200,data:findTotalEarning});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.listOfAllDriverEarnings=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        let findTotalEarning=await Bookings.aggregate([
            {$match:{status:AppConstraints.APP_CONST_VALUE.COMPLETED}},
            {$group:{_id:"$driverId",totalAmmount:{$sum:"$totalAmount"}}},
            {$lookup:{
                $lookup:
                {
                from: "users",
                localField : "driverId",
                foreignField : "_id",
                as: "userData"
                }
            }}
        ]);

        return response.status(200).json({success:1,msg:'success',statusCode:200,data:findTotalEarning});


    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.trackStatusOfOrder=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        console.log(request.body);
        let data=[];
        return response.status(200).json({success:1,msg:'success',statusCode:200,data:data})
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}


exports.yearlyRevenueData=async(request,response)=>{
    try{


        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // let decryptToken=await UnivershalFunction.DecryptToken(request.headers['authorization']);
        // if(!decryptToken)
        //     return response.status(200).json({statusCode:200,success:0, msg:AppConstraints.INVALID_TOKEN_KEY});
        console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.customerAdmin){

        }else{
            return response.status(400).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }
        let criteria={
            status:AppConstraints.APP_CONST_VALUE.COMPLETED
        }

        let projection={
            createDate:1,
            totalAmount:1
        }

        let prifitData=await Bookings.find(criteria,projection);
       

        let dataToSend=[];

        for(let j=0;j<12;j++){
            let Amount=0;
            for(let i=0;i<prifitData.length;i++){
                let d=new Date(prifitData[i].createDate);
                if(d.getMonth()==j){
                    Amount+=parseFloat(prifitData[i].totalAmount);
                  }
               }
            dataToSend.push({"month":j+1,"amount":Amount});
        }

        return response.status(200).json({success:1,data:dataToSend,success:1,msg:'success'});
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //all



exports.yearlyAddedUserRevenue=async(request,response)=>{
    try{

    }catch(err){

    }
}

exports.serviceItemListingToAdmin=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkQuery('serviceId',AppConstraints.SERVICE_ID).notEmpty().isMongoId();
        // request.checkQuery('categoryId',AppConstraints.SERVICE_ID).notEmpty().isMongoId();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let criteria={}
     
        if(request.query.status=='ACTIVE'){
            criteria={
                serviceId:request.query.serviceId,
                // categoryId:request.query.categoryId,
                isDeleted:false
            }
        }else if(request.query.status=='DELETED'){
            criteria={
                serviceId:request.query.serviceId,
                // categoryId:request.query.categoryId,
                isDeleted:true
            }
        }else{
            criteria={
                serviceId:request.query.serviceId,
                // categoryId:request.query.categoryId,
                isDeleted: false
            }
        }

        if(request.query.categoryId){
            criteria.categoryId = request.query.categoryId;
        }
        console.log(criteria,"criteria");
        

        let findServiceItems=await serviceItem.find(criteria,{},{sort:{series:1}});
        return response.status(200).json({success:1,msg:'Success',data:findServiceItems,statusCode:200});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};  //operational

exports.serviceCategoryListingToAdmin1=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkQuery('serviceId',AppConstraints.SERVICE_ID).notEmpty().isMongoId()
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

            console.log('++++++++++++++', request.query)
            let serviceData, laundryData
            if(request.query.serviceId){
                serviceData = await Service.findOne({_id: mongoose.Types.ObjectId(request.query.serviceId)}) 
            }else if(request.query.laundaryId){
                laundryData = await Laundry.findOne({_id: mongoose.Types.ObjectId(request.query.laundaryId)}) 
            }
            // console.log('++++++++++++++', serviceData)

        let criteria={};

        if(request.query.status=='ACTIVE'){
            criteria={
                // _id: {$in: serviceData.serviceCategory},
                isDeleted:false
            }
            if(serviceData){
                criteria._id = {$in: serviceData.serviceCategory}
            }else if(laundryData){
                criteria._id = {$in: laundryData.serviceCategory}
            }
        }else if(request.query.status=='DELETED'){
            criteria={
                // serviceId:request.query.serviceId,
                // _id: {$in: serviceData.serviceCategory},
                isDeleted:true
            }
            if(serviceData){
                criteria._id = {$in: serviceData.serviceCategory}
            }else if(laundryData){
                criteria._id = {$in: laundryData.serviceCategory}
            }
        }else{
            criteria={
                // _id: {$in: serviceData.serviceCategory},
                // serviceId:request.query.serviceId
            }

            if(serviceData){
                criteria._id = {$in: serviceData.serviceCategory}
            }else if(laundryData){
                criteria._id = {$in: laundryData.serviceCategory}
            }
        }
        console.log('++++++++++++++', criteria)

        let findServiceItems=await serviceCategory.find(criteria);

        return response.status(200).json({success:1,msg:'Success',data:findServiceItems,serviceId:request.query.serviceId||'',statusCode:200});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};  //operational

exports.serviceCategoryListingToAdmin=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        // request.checkQuery('serviceId',AppConstraints.SERVICE_ID).notEmpty().isMongoId()
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        console.log('++++++++++++++', request.query)
        let laundryItemArray = [], serviceData
        let criteria = {}
        if(request.query.laundaryId && request.query.serviceId){
            let criteriaToGet = {
                laundryId: request.query.laundaryId,
                serviceId: request.query.serviceId,
                isDeleted: false
            }

            let laundryitems = await laundryserviceitem.find(criteriaToGet)

            laundryitems.map(obj=>{laundryItemArray.push(obj.categoryId)})
            criteria._id ={ $in: laundryItemArray}

        }else if(request.query.serviceId && !request.query.laundaryId){
            serviceData = await Service.findOne({_id: mongoose.Types.ObjectId(request.query.serviceId)})
            criteria._id = {$in: serviceData.serviceCategory}
        }
        console.log('++++++++++++++', criteria)

        let findServiceItems=await serviceCategory.find(criteria);

        return response.status(200).json({success:1,msg:'Success',data:findServiceItems,serviceId:request.query.serviceId||'',statusCode:200});

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};  //operational //sandeep

exports.editOrDeletePromoCode=async(request,response)=>{
    try{



        console.log(request.body,'')

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.marketingAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('promoCodeId',AppConstraints.PROMO_CODE_ID).notEmpty().isMongoId()
        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

        if(request.body.status=='EDIT'){
            let dataToSet={};

            if(request.body.promoCode){
                 let ifAlreadyPromos=await PromoCode.findOne({promoCode:request.body.promoCode});
                 if(ifAlreadyPromos){
                     if(ifAlreadyPromos._id==request.body.promoCodeId){
                         dataToSet['promoCode']=request.body.promoCode
                     }else{
                         return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_PROMO});
                     }
                 }else{
                     dataToSet['promoCode']=request.body.promoCode
                 }
                 
             }
             
     


             


     
           
             if(request.body.expiryDate){
                 let d1 = new Date();
                 let d2 = new Date(request.body.expiryDate)
         
                 if(d2.getTime()>d1.getTime()){
                     return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.EXPIRY_DATE_VALID})
                 }
                 dataToSet['expiryDate']=request.body.expiryDate
     
             }




             if(request.body.startDate){
                let d1 = new Date();
                let d2 = new Date(request.body.startDate)
        
                // if(d2.getTime()>d1.getTime()){
                //     return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.EXPIRY_DATE_VALID})
                // }



                dataToSet['startDate']=request.body.startDate
    
            }
            
     
             if(request.body.discount){
                 if(parseFloat(request.body.discount)>100){
                     return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.DISCOUNT_NOT_MORE_100})
                 }
                 dataToSet['discount']=parseFloat(request.body.discount);
     
             }
     
     
             if(request.body.message){
                 dataToSet['message']=request.body.message
             }
           
     
             await PromoCode.update({_id:request.body.promoCodeId},{$set:dataToSet});
     





             let findUserTokens=await User.find({isBlocked:false,userType:AppConstraints.USER}).select({deviceToken:1});

             let allTokens=await findUserTokens.map((val)=>{
                 let token=val.deviceToken;
                 return token;
             });
     
     
             let dataToPush={};
     
             dataToPush.msg=request.body.message;
             dataToPush.promocode=request.body.promocode;
             dataToPush.messageType=AppConstraints.APP_CONST_VALUE.PROMO;
             dataToPush.msg=request.body.message;
             dataToPush.promocodeId=request.body.promoCodeId;
     
           
             
             await pushNotification.sendPushToAllUser(allTokens,dataToPush);









     
             let findPromocode=await PromoCode.findOne({_id:request.body.promoCodeId});
     
             return response.status(200).json({success:1,msg:'success',data:findPromocode,statusCode:200});
        }else if(request.body.status=='DELETE'){


            console.log(request.body.status,'===========================status data==================================')

            await PromoCode.update({_id:request.body.promoCodeId},{$set:{isDeleted:true}});
            return response.status(200).json({success:1,msg:'Successfully deleted',statusCode:200});
        }
        
        else{
            return response.status(400).json({success:0,msg:'Invalid status ',statusCode:400});
        }
        

    }catch(err){
        console.log(err,'===============================error data =====================================================================')
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //super


exports.createCoupon = async (request,response) => {
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.marketingAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('couponCode',AppConstraints.PROMO_CODE).notEmpty();
        request.checkBody('expiryDate',AppConstraints.EXPIRY_DATE).notEmpty();
        request.checkBody('startDate',AppConstraints.START_DATE).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});


        let ifAlreadyCoupon=await coupon.findOne({couponCode:request.body.couponCode});


        if(ifAlreadyCoupon)
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_PROMO});

        let d1 = new Date();
        let d2 = new Date(request.body.expiryDate)

        if(d2.getTime()>d1.getTime()){
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.EXPIRY_DATE_VALID})
        }

        let startDate=new Date(request.body.startDate)

        // if(startDate.getTime()<d1.getTime()){
        //     return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.START_DATE_LESSER})
        // }

        let c=new coupon();

        c.couponCode=request.body.couponCode;
        c.expiryDate=new Date(parseInt(request.body.expiryDate)).getTime();
        c.startDate=new Date(parseInt(request.body.startDate)).getTime();



        await c.save();

        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.PROMO_CODE_SUCCESS});            


    }
    catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});       
    }
}   //super



exports.createSlots=async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        request.checkBody('slotTime',AppConstraints.SLOT_TIME).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

        let slot=new slots();
        slot.slotTime=request.body.slotTime;
        slot.timing=request.body.timing;
        slot.millis=request.body.millis;
        let saveSlot=await slot.save();

        return response.status(200).json({success:1,msg:'success',statusCode:200})

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});       
    }
}


exports.versionUpdate = async (request,response) =>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody("version",AppConstraints.VERSION).notEmpty();
        request.checkBody("app_type",AppConstraints.APP_TYPE).notEmpty();
        request.checkBody("platform",AppConstraints.PLATFORM).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});
        let versionAlredyExists = await version.findOne({version:request.body.version,app_type:request.body.app_type,platform:request.body.platform});
        if(versionAlredyExists){
            return response.status(400).json({statusCode:400,msg:"Version already exists",success:0});
        }else{

            let vrsn = new version();
            vrsn.version = request.body.version;
            vrsn.app_type = request.body.app_type;
            vrsn.platform = request.body.platform;
            await vrsn.save();
            console.log("Version new version added");
            return response.status(200).json({statusCode:200,msg:"New version added",success:1});

        }

          
    }
    catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
    }
}   //SUPER


exports.addDistrict = async(request,response)=>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody("districtName",AppConstraints.DISTRICT_NAME).notEmpty();
        request.checkBody("districtLat",AppConstraints.DISTRICT_LAT).notEmpty();
        request.checkBody("districtLong",AppConstraints.DISTRICT_LONG).notEmpty();
        request.checkBody("Address",AppConstraints.ADDRESS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});
            // let nameAlreadyExist = await district.findOne({districtName:request.body.districtName});
            // if(nameAlreadyExist){
            //     return response.status(400).json({statusCode:400,msg:AppConstraints.DISTRICT_NAME_ALREADY,success:0});
            // }

            let dist = new district();
            dist.districtName = request.body.districtName;
            dist.districtLat = request.body.districtLat;
            dist.districtLong= request.body.districtLong;
            dist.Address = request.body.Address;
            dist.Location = [parseFloat(request.body.districtLong),parseFloat(request.body.districtLat)]
            let data = dist.save();

            return response.status(200).json({statusCode:200,msg:"NEW DISTRICT ADDED",success:1});


    }catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});     
    }
}   //operational



exports.getDistrictListing = async(request,response)=>{
    try{if(!request.headers['authorization'])
    return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
    let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
    if(!validateToken)
    return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

    // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
    if(validateToken.superAdmin || validateToken.operationsAdmin){

    }else{
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
    }

    let errors = await request.validationErrors();
    if (errors)
    return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});
let criteria = {};
 if(request.query.status=="BLOCKED"){
    criteria={
        isDeleted: true
    }
}


else if(request.query.status=="ACTIVE"){
    criteria={
        isDeleted: false
    }
}else{
    criteria={
        isDeleted: false
    }
}

if(request.query.page&& request.query.perPage){
    console.log("HELLO");
    let listing = await district.find(criteria).sort({districtName:1}).skip((parseInt(request.query.perPage)*parseInt(request.query.page)) - parseInt(request.query.perPage))
    .limit(parseInt(request.query.perPage));
    return response.status(200).json({statusCode:200,msg:"Listing",success:1,data:listing});
} else{
    let listing2 = await district.find(criteria).sort({districtName:1})
    return response.status(200).json({statusCode:200,msg:"Listing",success:1,data:listing2})
}


;


    }catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});  
    }
}   //operational

exports.getDistrictLaundries = async (request,response)=>{
    try {
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){
        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});
        let criteria = {districtId:request.body.districtId};
        let district1 = await district.findOne({_id:request.body.districtId});
        let getLaundries = await Laundry.find(criteria).skip((parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage))
            .limit(parseInt(request.body.perPage));
        let countLaundries = await Laundry.count(criteria);
        return response.status(200).json({statusCode:200,msg:"Listing",success:1,data:{district:district1,laundries:getLaundries,count:countLaundries}})
    }catch (err) {
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};  //operational

exports.getDistrictDrivers = async (request,response)=>{
    try {
        if(!request.headers['authorization'])
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
            return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin || validateToken.orderAdmin){
        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});
        let criteria = {districtId:{$in:[request.body.districtId]}};
        let district1 = await district.findOne({_id:request.body.districtId});
        let getDrivers = await Driver.find(criteria).skip((parseInt(request.body.perPage)*parseInt(request.body.page)) - parseInt(request.body.perPage))
            .limit(parseInt(request.body.perPage));
        let countDrivers = await Driver.count(criteria);
        return response.status(200).json({statusCode:200,msg:"Listing",success:1,data:{district:district1,Drivers:getDrivers,count:countDrivers}})
    }catch (err) {
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};  //operational

exports.editOrDeleteDistrict=async(request,response)=>{
    try{


        console.log(request.body,'===================================request data=================================')

        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('districtId',AppConstraints.DISTRICT_ID).notEmpty();
        request.checkBody('districtId',AppConstraints.DISTRICT_ID_NOT_VALID).isMongoId();
        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.status==="DELETE"){
            
           await district.update({_id:request.body.districtId},{$set:{isDeleted:true}});
           return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.DISTRICT_DELETED});
        }
        else if(request.body.status==="EDIT"){


            let isDistrict=await district.findOne({_id:request.body.districtId});

            if(!isDistrict)
            return response.status(200).json({success:0,msg:AppConstraints.DISTRICT_ID_NOT_VALID})

            let dataToSet={};
            if(request.body.districtName){
                dataToSet['districtName']=request.body.districtName;
            }
            if(request.body.districtLat){
                dataToSet['districtLat']=request.body.districtLat;
            }

            if(request.body.districtLong){
                dataToSet['districtLong']=request.body.districtLong
            }

            if(request.body.Address){
                dataToSet['Address']=request.body.Address;
            }


            if(request.body.districtLat && request.body.districtLong){
                dataToSet['Location']=[parseFloat(request.body.districtLong),parseFloat(request.body.districtLat)]
            }

            
            await district.update({_id:request.body.districtId},{$set:dataToSet});
     
            let findDistData=await district.findOne({_id:request.body.districtId});

            return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.DISTRICT_UPDATED,data:findDistData});
        }
        else{
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.INVALID_STATUS});
        }

    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational


exports.getLaundryServices = async (request,response) =>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('laundryId',AppConstraints.LAUNDRY_ID).notEmpty();
        
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400, success:0 , msg: errors[0].msg, error: errors});

        let criteria = { "_id" : request.body.laundryId  }

        let laundryServiceData = await Laundry.findOne(criteria);

        let serviceData = await Service.find({ _id: { $in: laundryServiceData.services } } )

        return response.status(200).json({ statusCode: 200, success: 1 , msg: 'success' , data : serviceData });
    }
    catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational


exports.getLaundrySerivceItems = async (request,response) =>{
    try{  if(!request.headers['authorization'])
    return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
    let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
    if(!validateToken)
    return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});

        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

    request.checkBody('laundryId',AppConstraints.LAUNDRY_ID).notEmpty();
    request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
    let errors = await request.validationErrors();
    if (errors)
    return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
    let dataToPush = [];
    let criteria = {
        laundryId:request.body.laundryId,
        serviceId:request.body.serviceId,
        isDeleted:false
    };
    if(request.body.categoryId){
        criteria.categoryId = request.body.categoryId;
    }
    console.log("hello+++++++++++++++", criteria);

    let serviceItemData = await laundryserviceitem.find(criteria).populate({path:'serviceItemId',match: {isDeleted: false},select:{itemName:1,itemNameAr:1,itemPic:1}});
    console.log("hello+++++++++++++++", serviceItemData);

    for(let i = 0 ; i < serviceItemData.length ; i++){
        console.log("hello");
        let jsonToPush = {};
        if(serviceItemData[i].serviceItemId!=null)
        {   console.log("inside if");
            jsonToPush._id= serviceItemData[i]._id;
            jsonToPush.laundryId= serviceItemData[i].laundryId;
            jsonToPush.serviceItemId= serviceItemData[i].serviceItemId;
            jsonToPush.serviceId=serviceItemData[i].serviceId    ;
            jsonToPush.__v= serviceItemData[i].__v;
            jsonToPush.itemInitialCount=serviceItemData[i].itemInitialCount;
            jsonToPush.createDate=serviceItemData[i].createDate;
            jsonToPush.isActive=serviceItemData[i].isActive;
            jsonToPush.isDeleted=serviceItemData[i].isDeleted;
            jsonToPush.amountPerItem=serviceItemData[i].amountPerItem;
            dataToPush.push(jsonToPush);
        }
        
    }

    return response.status(200).json({statusCode:200,success:1,msg:'success',data:dataToPush});


    }
    catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
}   //operational



exports.editOrDeleteServiceItem = async (request,response) =>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});


        // console.log(validateToken,"dddddddddddddddddddddddddddddddddddddddddddddddddd");
        if(validateToken.superAdmin || validateToken.operationsAdmin){

        }else{
            return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        }

        request.checkBody('status',AppConstraints.STATUS).notEmpty();
        request.checkBody('serviceItemId',AppConstraints.SERVICE_ID).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        if(request.body.status==="DELETE"){
       await laundryserviceitem.update({_id:request.body.serviceItemId},{$set:{isDeleted:true}});
            return response.status(200).json({success:1,statusCode:200,msg:"Service item deleted"});
        }
        else if(request.body.status==="EDIT"){
            dataToSet={};
            if(request.body.amountPerItem){
                dataToSet['amountPerItem']=request.body.amountPerItem;
            }
            let dataToUpdate={
                $set:dataToSet
            }
            
            let criteria={
                _id:request.body.serviceItemId
            }

            let editServiceItem=await laundryserviceitem.update(criteria,dataToUpdate,{multi:true,new:true});
            console.log(editServiceItem,"eeeeeeeeeeeeeeeeeeeeddddddddddddd")

            return response.status(200).json({success:1,statusCode:200,msg:"item successfully edited"});
        }

        else {
            return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.SEND_CORRECT.EN});
        }
    }
    catch(err){
    console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});  
    }
}   //operational


exports.activeInActiveItem = async (request,response) => {
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        request.checkBody('serviceItemId',AppConstraints.SERVICE_ITEM_ID).notEmpty();
        request.checkBody('isActive',AppConstraints.IS_ACTIVE).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        await laundryserviceitem.update({_id:request.body.serviceItemId},{$set:{isActive:request.body.isActive}});
        return response.status(200).json({success:1,statusCode:200,msg:"SUCCESS"});


    }
    catch(err){
    console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});  
       
    }
}
exports.restoreItems = async (request,response) =>{
    try{
        if(!request.headers['authorization'])
        return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        if(!validateToken)
        return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        request.checkBody('serviceId',AppConstraints.SERVICE_ID).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
        return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});

        let restore = await Service.update({_id:request.body.serviceId},{$set:{isDeleted:false}},{multi:true});
        console.log(restore,"restoreeeeeeeeeeeeeeeeeee")
        return response.status(200).json({success:1,statusCode:200,msg:"SUCCESS"});

    }catch(err){
    console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});  
    }
}

/***/
exports.forgotPassword  = async ( request, response ) => {
try{
    let query = {
        "email": request.body.email
    }
    // console.log("== query ==",query)
    let searchEmail = await Admin.findOne(query,{"email":1},{lean:true});
    // console.log("== search Email ==", searchEmail)
    if(searchEmail == null) return response.status(400).json(AppConstraints.ADMIN_NOT_FOUND)
    let passwordResetToken = crypto.randomBytes(20).toString('hex');
    let content = 
`Please reset your password through below link 
Click here to reset your password
${process.env.FORGOT_PASSWORD_LINK+passwordResetToken}`;
    
   let subject = 'Request for forgot password'
    
    let promise = [
        Admin.update(query,{$set:{passwordResetToken: passwordResetToken}}),
        UnivershalFunction.sendEmail( request.body.email, content, subject )
    ];
    
    await Promise.all(promise);
    
    return response.status(200).json({ statusCode: 200, success: 1, passwordResetToken: passwordResetToken, msg: "SUCCESS"}) 
}
catch(err){
  console.log(err);
    return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
}
}

exports.resetPassword = async (request, response)=>{
    try{
        let query = {
            "passwordResetToken": request.body.passwordResetToken
        }
    
        let setNewPassword = await Admin.findOneAndUpdate(query,
        { $set: { "password": md5(request.body.newPassword)},
        $unset: { "passwordResetToken": 1 } }  );

   if(setNewPassword == null) return response.status(400).json(AppConstraints.TOKEN_LINK_EXPIRED)
    return response.status(200).json({ statusCode: 200, success: 1, msg: AppConstraints.PASSWORD_SUCCESSFULLY_UPDATED.EN })
    }
    catch(err){
        console.log(err);
          return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error}); 
      }   
}

exports.deleteBlockDriver = async (request, response)=>{
    try {

    }catch (e) {
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
};
