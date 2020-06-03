var https = require('https');
var querystring = require('querystring');
const async = require('async');
const AppConstraints = require('../../config/appConstraints.js');
const User = require('../models/User.js');
const Forgot = require('../models/Forgot.js');
const Service = require('../models/Services.js');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
const validator = require("email-validator");
const geodist = require('geodist');
const md5 = require('md5');
const Laundry = require('../models/Laundry.js');
const Transections = require('../models/transectionLogs');
const UnivershalFunction = require('../UnivershalFunctions/Univershalfunctions.js');
const NodeGeocoder = require('node-geocoder');
const serviceItem = require('../models/serviceItems.js');
const SubscriptionPlane = require('../models/SubscriptionsPlan.js');
const serviceCategory = require('../models/serviceItemCategory.js');
const SubscriptionPlaneItem = require('../models/SubcriptionPlaneItems.js');
const UsersPlan = require('../models/usersPlan.js');
const Bookings = require('../models/Bookings.js');
const Notifications = require('../models/notification.js');
const PromoCode = require('../models/promoCode.js');
const Review = require('../models/reviews.js');
const userAndMemberSubscription = require('../models/userAndMembersSubscriptions');
const randomstring = require('randomstring');
const pushNotification = require('../LIB/pushNotification.js');
const twilio = require('twilio');
const client = new twilio(process.env.ACCOUNT_SID, process.env.ACCOUNT_AUTH_TOKEN);
const phoneverification = require('../models/phoneverification.js');
const Charge = require('../models/charge.js');
const Issue = require('../models/issue');
const NotificationData = require('../models/notification.js');
const userSubscriptionPlan = require('../models/UserSubscriptionPlane');
const coupon = require('../models/coupon.js')
const couponuser = require('../models/couponuser.js');
const log = require('../models/log.js');
const slot = require('../models/slots');
const version = require('../models/Version');
const district = require('../models/district');
const mongoose = require('mongoose');
const laundryserviceitem = require('../models/laundryserviceitem');
const Card = require('../models/Card.js')
const hypertoken = require('../models/hypertoken');
const plan = require('../models/SubscriptionsPlan');
const userSubscription = require('../models/UserSubscriptionPlane');
const axios = require('axios');

exports.sendOtp = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        request.checkBody('phoneNumber', AppConstraints.PHONE_NUMBER).notEmpty();
        request.checkBody('callingCode', AppConstraints.CALLING_CODE).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        if (request.body.email != "" && request.body.email != null) {
            let criteriaEmail = {
                email: request.body.email,
                userType: AppConstraints.USER
            }




            let ifEmailAlready = await User.findOne(criteriaEmail);
            if (ifEmailAlready)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.EMAIL_ALREADY.EN : AppConstraints.EMAIL_ALREADY.AR });
        }

        if (request.body.phoneNumber != "" && request.body.phoneNumber != null) {
            let criteriaPhoneNumber = {
                phoneNumber: request.body.phoneNumber,
                userType: AppConstraints.USER
            }


            let ifPhoneAlready = await User.findOne(criteriaPhoneNumber);
            if (ifPhoneAlready)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.PHONE_ALREADY.EN : AppConstraints.PHONE_ALREADY.AR });

        }

        let randomValue = new Date(new Date().getTime() + 60000).getTime();

        var otpval = Math.floor(1000 + Math.random() * 9000);

        let otpDataVal = langaugeType == "EN" ? AppConstraints.OTP_CODE.EN + otpval : AppConstraints.OTP_CODE.AR + otpval;
        //console.log(otpval);

        let data = {
            phoneNumber: request.body.callingCode + request.body.phoneNumber,
            message: otpDataVal
        }

        let sendOtp = await UnivershalFunction.unifonicMessage(data);





        //console.log('otp data')


        let pv = new phoneverification();
        pv.callingCode = request.body.callingCode;
        pv.phoneNumber = request.body.phoneNumber;
        pv.otp = otpval;
        pv.expiryDate = randomValue;

        let saveOtp = await pv.save();

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.OTP_SEND_SUCCESSFULLY.EN : AppConstraints.OTP_SEND_SUCCESSFULLY.AR, data: saveOtp });


    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.verifyOtp = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        //console.log(request.body,'request data')
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('otpId', langaugeType == "EN" ? AppConstraints.OTP_ID_REQUIRED.EN : AppConstraints.OTP_ID_REQUIRED.AR).notEmpty().isMongoId();
        request.checkBody('otp', langaugeType == "EN" ? AppConstraints.OTP_REQUIRED.EN : AppConstraints.OTP_REQUIRED.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let criteria = {
            _id: request.body.otpId,
            isActive: true,
            otp: request.body.otp
        }


        let findifExist = await phoneverification.findOne(criteria);

        if (!findifExist)
            return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.INVALID_OTP_CODE.EN : AppConstraints.INVALID_OTP_CODE.AR });

        let d = new Date();

        if (findifExist.expiryDate < d.getTime())
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.EXPIRED.EN : AppConstraints.EXPIRED.AR });
        await phoneverification.update(criteria, { $set: { isActive: false } });
        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.OTP_VERIFIED_SUCCESSFULLY.EN : AppConstraints.OTP_VERIFIED_SUCCESSFULLY.AR })


    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.resendOtp = async (request, response) => {
    try {
        let langaugeType = request.query.langaugeType;
        request.checkQuery('otpId', langaugeType == "EN" ? AppConstraints.PHONE_NUMBER.EN : AppConstraints.PHONE_NUMBER).notEmpty().isMongoId();
        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let findPhone = await phoneverification.findOne({ _id: request.query.otpId });
        if (!findPhone)
            return response.status(200).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.INVALID_OTP_ID.EN : AppConstraints.INVALID_OTP_ID.AR });


        var otpval = Math.floor(1000 + Math.random() * 9000);

        let otpDataVal = langaugeType == "EN" ? AppConstraints.OTP_CODE.EN + otpval : AppConstraints.OTP_CODE.AR + otpval;

        let data = {
            phoneNumber: findPhone.callingCode + findPhone.phoneNumber,
            message: otpDataVal
        }

        let sendOtp = await UnivershalFunction.unifonicMessage(data);


        //console.log(sendOtp,'========================sendOtp============================')

        // var message = await client.messages.create({
        //     body:otpDataVal,
        //     to:findPhone.callingCode+findPhone.phoneNumber, 
        //     from:process.env.PHONE_NUMBER
        // });

        // //console.log(message,'message');

        // if(message.error)
        // return response.status(400).json({statusCode:400,success:0,msg:message.error,err:message.error});


        let randomValue = new Date(new Date().getTime() + 60000).getTime();

        //console.log(randomValue,'new expiry date');

        await phoneverification.update({ _id: request.query.otpId }, { $set: { otp: otpval, expiryDate: randomValue, isActive: true } });

        let getOtp = await phoneverification.findOne({ _id: request.query.otpId });

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.OTP_SEND_SUCCESSFULLY.EN : AppConstraints.OTP_SEND_SUCCESSFULLY.AR, data: getOtp });


    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.registerUser = async (request, response) => {
    try {

        //console.log(request.body,'request data');


        let langaugeType = request.body.langaugeType;

        request.checkBody('name', langaugeType == "EN" ? AppConstraints.NAME.EN : AppConstraints.NAME.AR).notEmpty();
        //        request.checkBody('email',langaugeType=="EN"?AppConstraints.EMAIL_ADDRESS.EN:AppConstraints.EMAIL_ADDRESS.AR).notEmpty();
        //    request.checkBody('email',langaugeType=="EN"?AppConstraints.VALID_EMAIL_ADDRESS.EN:AppConstraints.VALID_EMAIL_ADDRESS.AR).isEmail();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('callingCode', langaugeType == "EN" ? AppConstraints.CALLING_CODE.EN : AppConstraints.CALLING_CODE.AR).notEmpty();

        request.checkBody('password', langaugeType == "EN" ? AppConstraints.PASSWORD.EN : AppConstraints.PASSWORD.AR).notEmpty();
        request.checkBody('deviceType', langaugeType == "EN" ? AppConstraints.DEVICE_TYPE.EN : AppConstraints.DEVICE_TYPE.AR).notEmpty();
        request.checkBody('deviceToken', langaugeType == "EN" ? AppConstraints.DEVICE_TOKEN.EN : AppConstraints.DEVICE_TOKEN.AR).notEmpty();

        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.DEVICE_TOKEN.EN : AppConstraints.DEVICE_TOKEN.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        if (!(!isNaN(parseFloat(request.body.phoneNumber)) && isFinite(request.body.phoneNumber)))
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.PHONE_NUMERIC.EN : AppConstraints.PHONE_NUMERIC.AR });

        if (request.body.email != "" && request.body.email != null) {
            let criteriaEmail = {
                email: request.body.email,
                userType: AppConstraints.USER
            }




            let ifEmailAlready = await User.findOne(criteriaEmail);
            if (ifEmailAlready)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.EMAIL_ALREADY.EN : AppConstraints.EMAIL_ALREADY.AR });

        }
        if (request.body.phoneNumber != "" && request.body.phoneNumber != null) {

            let criteriaPhoneNumber = {
                phoneNumber: request.body.phoneNumber,
                userType: AppConstraints.USER
            }

            let ifPhoneAlready = await User.findOne(criteriaPhoneNumber);
            if (ifPhoneAlready)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.PHONE_ALREADY.EN : AppConstraints.PHONE_ALREADY.AR });
        }
        let randomValue = Math.floor(Date.now() / 1000) + (60 * 60);

        let rand = Math.floor((Math.random() * 1000) + 540000);

        let user = new User();

        user.name = request.body.name;
        if (request.body.email != "" && request.body.email != null)
            user.email = request.body.email;
        if (request.body.phoneNumber != "" && request.body.phoneNumber != null)
            user.phoneNumber = request.body.phoneNumber;
        user.callingCode = request.body.callingCode;
        user.password = await md5(request.body.password);
        user.countryName = request.body.countryName;
        user.accessToken = await randomstring.generate(150)
        user.deviceToken = request.body.deviceToken;
        user.deviceType = request.body.deviceType;
        user.emailVerificationcode = rand;
        user.userType = AppConstraints.USER;
        user.countryName = request.body.countryName;
        user.completePhoneNumber = request.body.callingCode + request.body.phoneNumber;
        user.langaugeType = request.body.langaugeType;
        if (request.body.coupon) {
            //console.log("upper",request.body.coupon.toUpperCase());
            const couponId = await coupon.findOne({ couponCode: request.body.coupon.toUpperCase() });
            if (couponId) {
                user.couponId = couponId._id;
                user.couponApplied = true;
            } else {
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_COUPON.EN : AppConstraints.INVALID_COUPON.AR });
            }

        }
        let token = await UnivershalFunction.GenerateToken({ email: request.body.email, userType: AppConstraints.USER });

        let link = `${process.env.BASE_URL}verifyEmailPage?id=${rand}&accessToken=${token}`;

        let content = "<br />" + langaugeType == "EN" ? AppConstraints.CLICK_BELOW.EN + "<br /><a href=" + link + ">" + AppConstraints.CLICK_HERE.EN + "</a>" : AppConstraints.CLICK_BELOW.AR + "<br /><a href=" + link + ">" + AppConstraints.CLICK_HERE.AR + "</a>"


        let welcomeContent, welcomeSubject;
        if (request.body.langaugeType == "EN") {
            welcomeContent = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } ol, ul { list-style-position: outside; } ol li { margin-bottom: 15px; } /* ol{ counter-reset: item } ol li{ display: block } ol li:before { content: counters(item, ".") ". "; counter-increment: item; margin-left: -28px; } */ ul { list-style-type: circle; } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .icon { padding: 10px; border:1px solid; width: 195px; margin: 0 auto; } .icon a .img { height:40px; width:40px; } .icon a { margin-right: 20px; } .icon a:last-child { margin-right: 0px; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> <b>Welcome to 3NDK</b></h4> <p>Dear <span style="color: #fb0018">${request.body.name}</span>,</p> <p style="text-align: center;font-weight: 600;">Welcome to 3NDK and Congratulations. From now you can forget about your long drives to the laundry. 3NDK will take care of your laundry.</p> <p>Make sure to check out our packages and choose the one suitable for your needs and join us on our social media to stay connected with 3NDK.</p> <div class="icon"> <a href="https://www.facebook.com/3NDKapp/"><img class="img" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/F_icon.svg/1000px-F_icon.svg.png"></a> <a href="https://twitter.com/3NDKapp?s=09"><img class="img" src="https://cdn3.iconfinder.com/data/icons/inficons/512/twitter.png"></a> <a href="https://instagram.com/3ndkapp?utm_source=ig_profile_share&igshid=5ge3n86l27sa"><img class="img" src="https://buzzpartners.nl/wp-content/uploads/2017/02/new-instagram-logo-300x300.png"></a> </div> <p>Regards,</p> <p>3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> This email was sent to <span style="color: #fb0018">${request.body.name}</span> as part of your <span style="background-color: #ffff00">3NDK account</span>. To change how you receive emails from us or to unsubscribe from all emails, please use the following links: </td> </tr> <tr> <td width="180px"><b><a href="">Email settings</a></b></td> <td><b><a href="">Unsubscribe</a></b></td> </tr> <tr> <td colspan="2"> <span style="background-color: #ffff00">3NDK</span> – Imam Saud Bin Abdel-Aziz Road, Al Nakkeel, Riyadh 12381 </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`;
            welcomeSubject = `Welcome to 3NDK`;
        } else {
            welcomeContent = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } ol, ul { list-style-position: outside; } ol li { margin-bottom: 15px; } /* ol{ counter-reset: item } ol li{ display: block } ol li:before { content: counters(item, ".") ". "; counter-increment: item; margin-left: -28px; } */ ul { list-style-type: circle; } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .icon { padding: 10px; border:1px solid; width: 195px; margin: 0 auto; } .icon a .img { height:40px; width:40px; } .icon a { margin-right: 20px; } .icon a:last-child { margin-right: 0px; } </style> </head> <body> <div class="container"> <h4> عنوان البريد: <b> تأكيد بريدك الإلكتروني- تطبيقمرحبا ً بك في عندك </b> </h4> <p> ${request.body.name} </p> <p style="text-align: center;font-weight: 600;"> مرحبا بك في عندك وتهانينا. منذ الآن أنت لن تحمل هم مشاوير المغسلة إطلاقا ً. عندك سيتولي أمر غسيلك. </p> <p> لا يفوتك أن تتفقد الباقات التي تقدمها منصة عندك وأن تختار الباقة التي تناسب احتياجاتك، ولا تنسي أيضا ً أن تنضم إلي حسابات عندك بوسائل التواصل الإجتماعي لتبقي علي اتصال دائم بنا. </p> <div class="icon"> <a href="https://www.facebook.com/3NDKapp/"><img class="img" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/F_icon.svg/1000px-F_icon.svg.png"></a> <a href="https://twitter.com/3NDKapp?s=09"><img class="img" src="https://cdn3.iconfinder.com/data/icons/inficons/512/twitter.png"></a> <a href="https://instagram.com/3ndkapp?utm_source=ig_profile_share&igshid=5ge3n86l27sa"><img class="img" src="https://buzzpartners.nl/wp-content/uploads/2017/02/new-instagram-logo-300x300.png"></a> </div> <p> تحيات فريق عندك </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> هذا البريد الإلكتروني تم إرساله إلي <span style="color: #fb0018">${request.body.name} </span> كجزء من <span style="background-color: #ffff00"> حساب عندك </span> . لكي تتحكم في كيفية تلقيك للبريد الإلكتروني الخاص بنا أو إلغاء الاشتراك من قائمتنا البريدية من فضلك اتبع الرابطات التاليان: </td> </tr> <tr> <td width="180px"><b><a href=""> إعدادت البريد الإلكتروني </a></b></td> <td><b><a href=""> إلغاء الاشتراك </a></b></td> </tr> <tr> <td colspan="2"> - طريق الإمام سعود بن عبدالعزيز/ النخيل، الرياض 12381 3NDK </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body> </html>`;
            welcomeSubject = `تأكيد بريدك الإلكتروني- تطبيقمرحبا ً بك في عندك`;
        }
        let getDataSaved = await Promise.all([
            user.save(),
            UnivershalFunction.sendEmail(request.body.email, welcomeContent, welcomeSubject),
            UnivershalFunction.sendEmail(request.body.email, content, langaugeType == "EN" ? AppConstraints.REGISTRATIONS_MESSAGE.EN : AppConstraints.REGISTRATIONS_MESSAGE.AR)
        ]);


        // if(request.body.coupon){
        //     const couponId = await coupon.findOne({couponCode:request.body.coupon});
        //     //console.log(couponId);
        //     if(couponId){
        //         let cu = new couponuser();
        //         cu.couponId=couponId._id;
        //         cu.userId = getDataSaved[0]._id;
        //         cu.expiryDate = couponId.expiryDate;
        //         cu.startDate = couponId.startDate;
        //         await cu.save();
        //     }else{
        //         return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.INVALID_COUPON});
        //     }
        // }


        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS_GOTO_EMAIL.EN : AppConstraints.SUCCESS_GOTO_EMAIL.AR, data: getDataSaved[0] });



    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.verifyEmailPage = async (request, response) => {
    try {
        return response.status(200).render('pages/verificationUser');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.verifyUserEmail = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        // request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('id', langaugeType == "EN" ? AppConstraints.VERIFICATION_ID.EN : AppConstraints.VERIFICATION_ID.AR).notEmpty();
        request.checkBody('accessToken', langaugeType == "EN" ? AppConstraints.TOKEN.EN : AppConstraints.TOKEN.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let decryptToken = await UnivershalFunction.DecryptToken(request.body.accessToken);

        if (!decryptToken)
            return response.status(200).json({ statusCode: 200, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_TOKEN_KEY.EN : AppConstraints.INVALID_TOKEN_KEY.AR });


        let criteria = {
            email: decryptToken.email,
            userType: decryptToken.userType
        }


        let findEmailCode = await User.findOne(criteria);

        if (findEmailCode && (findEmailCode.emailVerificationcode !== parseInt(request.body.id)))
            return response.status(200).json({
                statusCode: 200, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_VERIFICATION_ID.EN : AppConstraints.INVALID_VERIFICATION_ID.AR
            });

        if (findEmailCode && (findEmailCode.emailVerificationcode === parseInt(request.body.id)) && findEmailCode.isEmailVerified)
            return response.status(200).json({ statusCode: 200, success: 0, msg: langaugeType == "EN" ? AppConstraints.EMAIL_ALREADY_VERIFIED.EN : AppConstraints.EMAIL_ALREADY_VERIFIED.AR });

        let dataToSet = {
            $set: { isEmailVerified: true }
        }

        await User.update(criteria, dataToSet);
        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.EMAIL_VERIFIED.EN : AppConstraints.EMAIL_VERIFIED.AR });


    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.loginUser = async (request, response) => {
    try {
        // request.body.langaugeType = 'EN';
        let langaugeType = request.body.langaugeType;
        //console.log(request.body,'request data in login');
        let getUserAllData = {}
        let plansData = []

        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkBody('password', langaugeType == "EN" ? AppConstraints.PASSWORD.EN : AppConstraints.PASSWORD.AR).notEmpty();
        request.checkBody('deviceType', langaugeType == "EN" ? AppConstraints.DEVICE_TYPE.EN : AppConstraints.DEVICE_TYPE.AR).notEmpty();
        request.checkBody('deviceToken', langaugeType == "EN" ? AppConstraints.DEVICE_TOKEN.EN : AppConstraints.DEVICE_TOKEN.AR).notEmpty();

        let errors = await request.validationErrors();

        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });



        if (validator.validate(request.body.email)) {
            let CheckEmailExist = await User.findOne({ email: request.body.email, userType: AppConstraints.USER });
            if (!CheckEmailExist)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.EMAIL_NOT_REGISTERED.EN : AppConstraints.EMAIL_NOT_REGISTERED.AR });
            let findUser = await User.findOne({ email: request.body.email, password: md5(request.body.password), userType: AppConstraints.USER });
            if (!findUser)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_EMAIL_PASSWORD.EN : AppConstraints.INVALID_EMAIL_PASSWORD.AR });


            if (findUser && findUser.isBlocked)
                return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.SUSPENDED_ACCOUNT.EN : AppConstraints.SUSPENDED_ACCOUNT.AR });




            let criteria = {
                email: request.body.email,
                password: md5(request.body.password),
                userType: AppConstraints.USER
            }



            let randomValue = Math.floor(Date.now() / 1000) + (60 * 60);

            let token = await randomstring.generate(150);


            let dataToSet = {
                $set: {
                    isOnline: true,
                    deviceType: request.body.deviceType,
                    deviceToken: request.body.deviceToken,
                    accessToken: token
                }
            }


            await User.update(criteria, dataToSet);



            getUserAllData = await User.findOne(criteria)
                .select({ licencePic: 0, Profilepic: 0 })
                .populate({ path: 'subscryptinPlans', select: {} });



            plansData = await SubscriptionPlaneItem.find({ isDeleted: false, planId: getUserAllData.subscryptinPlans });

            if (getUserAllData.isSubscriptiveUser)
                getUserAllData.planDetails = plansData;



            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESSFULLY_LOG_IN.EN : AppConstraints.SUCCESSFULLY_LOG_IN.AR, data: getUserAllData });

        }
        else if (!isNaN(parseFloat(request.body.email)) && isFinite(request.body.email)) {




            let checkPhoneExist = await User.findOne({ phoneNumber: request.body.email, userType: AppConstraints.USER });

            if (!checkPhoneExist)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.PHONE_NOT_REGISTERED.EN : AppConstraints.PHONE_NOT_REGISTERED.AR });

            let findUser = await User.findOne({ phoneNumber: request.body.email, password: md5(request.body.password), userType: AppConstraints.USER });
            if (!findUser)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_PHONE_PASSWORD.EN : AppConstraints.INVALID_PHONE_PASSWORD.AR });


            if (findUser && findUser.isBlocked)
                return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.SUSPENDED_ACCOUNT.EN : AppConstraints.SUSPENDED_ACCOUNT.AR });




            let criteria = {
                phoneNumber: request.body.email,
                password: md5(request.body.password),
                userType: AppConstraints.USER
            }





            let randomValue = Math.floor(Date.now() / 1000) + (60 * 60);



            let token = await randomstring.generate(150);

            let dataToSet = {
                $set: {
                    isOnline: true,
                    deviceType: request.body.deviceType,
                    deviceToken: request.body.deviceToken,
                    accessToken: token
                }
            }


            await User.update(criteria, dataToSet);



            getUserAllData = await User.findOne(criteria)
                .select({ licencePic: 0, Profilepic: 0 })
                .populate({ path: 'subscryptinPlans', select: {} });


            plansData = await SubscriptionPlaneItem.find({ isDeleted: false, planId: getUserAllData.subscryptinPlans });

            if (getUserAllData.isSubscriptiveUser)
                getUserAllData.planDetails = plansData


            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESSFULLY_LOG_IN.EN : AppConstraints.SUCCESSFULLY_LOG_IN.AR, data: getUserAllData });
        }
        else {
            return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.LOGIN_WITH_EMAIL_PHONE_NUMBER.EN : AppConstraints.LOGIN_WITH_EMAIL_PHONE_NUMBER.AR });
        }

    } catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.sendForgotPasswordLink = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        //console.log(request.body,'request data')
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('forgotField', langaugeType == "EN" ? AppConstraints.FORGOT_FIELD.EN : AppConstraints.FORGOT_FIELD.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        if (validator.validate(request.body.forgotField)) {

            let ifEmailExist = await User.findOne({ email: request.body.forgotField, userType: AppConstraints.USER });
            if (!ifEmailExist)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.NOT_A_VALID_FORGOT_EMAIL.EN : AppConstraints.NOT_A_VALID_FORGOT_EMAIL.AR });


            let token = await UnivershalFunction.GenerateToken({ email: request.body.forgotField, userType: AppConstraints.USER });
            let rand = Math.floor((Math.random() * 1000) + 540000);


            let link = `${process.env.BASE_URL}renderForgotPage?id=${rand}&accessToken=${token}`;


            let content = `<br/>${langaugeType == "EN" ? AppConstraints.CLICK_BELOW_FORGOT.EN : AppConstraints.CLICK_BELOW_FORGOT.AR}<br /><br /><br /><a href=${link}>${langaugeType == "EN" ? "Click here" : "Click here"}</a>`





            let forgot = new Forgot();
            forgot.email = request.body.forgotField;
            forgot.forgotCode = rand;
            forgot.userType = AppConstraints.USER;

            await Promise.all([
                forgot.save(),
                UnivershalFunction.sendEmail(request.body.forgotField, content, langaugeType == "EN" ? AppConstraints.FORGOT_SUBJECT.EN : AppConstraints.FORGOT_SUBJECT.AR)
            ]);


            return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.RESET_PASSWORD_LINK.EN : AppConstraints.RESET_PASSWORD_LINK.AR });


        }
        else if (!isNaN(parseFloat(request.body.forgotField)) && isFinite(request.body.forgotField)) {
            let token = await UnivershalFunction.GenerateToken({ completePhoneNumber: request.body.forgotField, userType: AppConstraints.USER });
            let rand = Math.floor((Math.random() * 1000) + 540000);


            let link = `${process.env.BASE_URL}renderForgotPage?id=${rand}&accessToken=${token}`;


            let content = langaugeType == "EN" ? AppConstraints.CLICK_BELOW_FORGOT.EN + link : AppConstraints.CLICK_BELOW_FORGOT.AR + link



            let data = {
                phoneNumber: request.body.forgotField,
                message: content
            }


            let forgot = new Forgot();
            forgot.email = request.body.forgotField;
            forgot.forgotCode = rand;
            forgot.userType = AppConstraints.USER;

            await Promise.all([
                forgot.save(),
                UnivershalFunction.unifonicMessage(data)
            ]);
            return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.RESET_PASSWORD_LINK_PHONE.EN : AppConstraints.RESET_PASSWORD_LINK_PHONE.AR });

        }
        else {
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_FORGOT_FIELD.EN : AppConstraints.INVALID_FORGOT_FIELD.AR });
        }
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.renderForgotPage = async (request, response) => {
    try {
        return response.status(200).render('pages/forgotUser');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.updateUserPassword = async (request, response) => {
    try {


        request.checkBody('verificationcode', AppConstraints.VERIFICATION_CODE.AR).notEmpty();
        request.checkBody('accessTokenkey', AppConstraints.TOKEN.AR).notEmpty();
        request.checkBody('password', AppConstraints.PASSWORD.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        let decryptToken = await UnivershalFunction.DecryptToken(request.body.accessTokenkey);
        if (!decryptToken)
            return response.status(200).json({ statusCode: 200, success: 0, msg: AppConstraints.INVALID_TOKEN_KEY });
        let checkIfLinkActive = await Forgot.findOne({ email: decryptToken.email, forgotCode: request.body.verificationcode, userType: decryptToken.userType });
        if (!checkIfLinkActive)
            return response.status(200).json({ statusCode: 200, success: 0, msg: AppConstraints.INVALID_TOKEN_KEY_OR_CODE.AR });
        if (checkIfLinkActive && !checkIfLinkActive.isActive)
            return response.status(200).json({ statusCode: 200, success: 0, msg: AppConstraints.LINK_EXPIRED.AR });

        await Promise.all([
            User.update({ email: decryptToken.email, userType: decryptToken.userType }, { $set: { password: md5(request.body.password) } }),
            Forgot.update({ email: decryptToken.email, forgotCode: request.body.verificationcode, userType: decryptToken.userType }, { $set: { isActive: false, isExpired: true } })
        ]);

        response.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.PASSWORD_SUCCESSFULLY_UPDATED.AR });


    } catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}






exports.changePassword = async (request, response) => {
    try {

        //console.log(request.headers['authorization'])
        let langaugeType = request.body.langaugeType;

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });

        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);

        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('newPassword', langaugeType == "EN" ? AppConstraints.NEW_PASSWORD.EN : AppConstraints.NEW_PASSWORD.AR).notEmpty();
        request.checkBody('currentPassword', langaugeType == "EN" ? AppConstraints.CURRENT_PASSWORD.EN : AppConstraints.CURRENT_PASSWORD.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        if (validateToken.password !== md5(request.body.currentPassword))
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_CURRENT_PASSWORD.EN : AppConstraints.INVALID_CURRENT_PASSWORD.AR })

        if (request.body.newPassword === request.body.currentPassword)
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.NEW_NOT_EQUAL_TO_CONFIRM.EN : AppConstraints.NEW_NOT_EQUAL_TO_CONFIRM.AR });
        let randomValue = Math.floor(Date.now() / 1000) + (60 * 60);
        let criteria = {
            _id: validateToken._id,
            userType: validateToken.userType
        }
        let dataToSet = {
            $set: { password: md5(request.body.newPassword) }
        }
        await User.update(criteria, dataToSet);
        let UserData = await User.findOne(criteria);

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.CHANGED_PASSWORD.EN : AppConstraints.CHANGED_PASSWORD.AR, data: UserData });

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.renderAllServices = async (request, response) => {
    try {

        let langaugeType = request.query.langaugeType;
        request.checkQuery('laundryId', langaugeType == "EN" ? AppConstraints.LAUNDRY_ID.EN : AppConstraints.LAUNDRY_ID.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let findServiceToLaundry = await Laundry.findOne({ _id: request.query.laundryId }, { services: 1 })


        let criteria = {
            isDeleted: false,
            _id: { $in: findServiceToLaundry.services }
        }
        let getAllService = await Service.find(criteria);

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: getAllService });

    } catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.renderLaundryList = async (request, response) => {
    try {

        let langaugeType = request.body.langaugeType;



        request.checkBody('lat', langaugeType == "EN" ? AppConstraints.USER_LAT.EN : AppConstraints.USER_LAT.AR).notEmpty();
        request.checkBody('long', langaugeType == "EN" ? AppConstraints.USER_LONG.EN : AppConstraints.USER_LAT.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let long = parseFloat(request.body.long);
        let lat = parseFloat(request.body.lat);
        // let maxDistance=parseFloat(AppConstraints.APP_CONST_VALUE.MAX_DISTANCE);


        //console.log(long,lat,'distant')


        let criteria = {
            Location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [long, lat]
                    },
                    $maxDistance: 5000
                },
            },
            isDeleted: false
        };


        let toFindDistrict = await district.find(criteria);
        //   //console.log(">>>>>>>>>>>>>>>"+toFindDistrict+"<<<<<<<<<<<<<<");
        let distArray = [];
        //   for(let i = 0 ; i< toFindDistrict.length;i++ ){


        //   }

        if (toFindDistrict.length == 0) {
            return response.status(400).json({ success: 1, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.NO_DISTIRCT.EN : AppConstraints.NO_DISTIRCT.AR })
        }

        // let toFindLaundries = await Laundry.find();
        // //console.log(">>>>>>>>>"+toFindLaundries+"<<<<<<<<<<");



        distArray.push(toFindDistrict[0]._id);
        //console.log(distArray,'===================================distArraydistArraydistArraydistArray=======================')

        //await Review.find({laundryId:id},{laundryServiceRating:1})
        // ------------------------------------------------------------------------------
        //         for(let i = 0; i< toFindDistrict.length; i++){
        //             distArray.push(toFindDistrict[i]._id);
        //         }
        // ------------------------------------------------------------------------------

        let resultData = await Promise.all([
            Laundry.find({ districtId: { $in: distArray }, isDeleted: false }),
            Laundry.count({ districtId: { $in: distArray }, isDeleted: false })
        ]);
        if (resultData[0].length) {

        } else {
            for (let i = 0; i < toFindDistrict.length; i++) {
                distArray.push(toFindDistrict[i]._id);
            }
            resultData = await Promise.all([
                Laundry.find({ districtId: { $in: distArray }, isDeleted: false }),
                Laundry.count({ districtId: { $in: distArray }, isDeleted: false })
            ]);
        }

        // let findLaundry=


        let data = []
        // let promises = await resultData[0].map( async( myValue )=> {

        //     // if(!(data.indexOf(""+myValue.districtId)>=0)){

        //     //     data.push(""+myValue.districtId)


        //         return {
        //             _id:myValue._id,

        //             currentLocation:myValue.currentLocation, 
        //             __v:myValue.__v,
        //             isDeleted: myValue.isDeleted,
        //             created_at: myValue.created_at,
        //             isActive: myValue.isActive,
        //             laundryLong:myValue.laundryLong,
        //             laundryLat: myValue.laundryLat,
        //             laundryAddress:myValue.laundryAddress,
        //             laundryName:myValue.laundryName,
        //             distance:geodist({lat:myValue.laundryLat,lon:myValue.laundryLong},{lat:request.body.lat,lon: request.body.long}),
        //             review:x
        //         }
        //     // }


        let alldata = resultData[0];

        // });
        let dataToPush = [];
        for (let i = 0; i < alldata.length; i++) {

            let ratings = await Review.find({ laundryId: alldata[i]._id }, { laundryServiceRating: 1 });
            //console.log(ratings,alldata[i]._id,"ratings ratings ratings ratings <<<<=========================ratings");
            let avgRating = 0;
            let j;
            for (j = 0; j < ratings.length; j++) {
                avgRating = await avgRating + parseFloat(ratings[j].laundryServiceRating);
            }
            //console.log(avgRating/j,"avgRating avgRating avgRating avgRating <<<<==========================avgRating");

            let jsonObject = {}
            jsonObject._id = alldata[i]._id;
            jsonObject.ratings = avgRating / j;
            jsonObject.currentLocation = alldata[i].currentLocation,
                jsonObject.__v = alldata[i].__v,
                jsonObject.isDeleted = alldata[i].isDeleted,
                jsonObject.created_at = alldata[i].created_at,
                jsonObject.isActive = alldata[i].isActive,
                jsonObject.laundryLong = alldata[i].laundryLong,
                jsonObject.laundryLat = alldata[i].laundryLat,
                jsonObject.laundryAddress = alldata[i].laundryAddress,
                jsonObject.laundryName = alldata[i].laundryName,
                jsonObject.distance = geodist({ lat: alldata[i].laundryLat, lon: alldata[i].laundryLong }, { lat: request.body.lat, lon: request.body.long }, { exact: false, unit: 'km' }),
                dataToPush.push(jsonObject);
        }
        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: dataToPush, totalResult: resultData[1] });
        //    return response.status(200).json({statusCode:200,success:1,msg:AppConstraints.SUCCESS});
    } catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}




exports.updateProfile = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        //console.log(request.body,'request data');

        let getUserAllData = [];

        //console.log(request.headers['authorization'],'request header data');

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.ACCESS_TOKEN.AR });


        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();


        let dataToSet = {};


        if (request.body.email) {


            request.checkBody('email', langaugeType == "EN" ? AppConstraints.INVALID_EMAIL_ADDRESS.EN : AppConstraints.INVALID_EMAIL_ADDRESS.AR).notEmpty().isEmail();

            let errors = await request.validationErrors();
            if (errors)
                return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });



            let findUser = await User.findOne({ email: request.body.email, userType: AppConstraints.USER });




            if (!findUser) {
                dataToSet['email'] = request.body.email;
            }

            else {
                if ("" + validateToken._id === "" + findUser._id) {
                    dataToSet['email'] = request.body.email;
                }

                else {
                    //console.log('here');
                    return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.EMAIL_ALREADY.EN : AppConstraints.EMAIL_ALREADY.AR });
                }

            }

        }


        if (request.body.name) {
            dataToSet['name'] = request.body.name;
        }

        if (request.body.phoneNumber) {
            let findUser = await User.findOne({ phoneNumber: request.body.phoneNumber, userType: AppConstraints.USER });

            if (!findUser) {
                dataToSet['phoneNumber'] = request.body.phoneNumber;
            }

            else {


                if ("" + validateToken._id === "" + findUser._id) {
                    dataToSet['phoneNumber'] = request.body.phoneNumber;
                }

                else {
                    return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.PHONE_ALREADY.EN : AppConstraints.PHONE_ALREADY.AR });
                }




            }

        }



        if (request.body.callingCode) {
            dataToSet['callingCode'] = request.body.callingCode;
        }


        if (request.body.callingCode && request.body.phoneNumber) {
            dataToSet['completePhoneNumber'] = request.body.callingCode + request.body.phoneNumber;
        }


        if (request.body.gender) {
            dataToSet['gender'] = request.body.gender;
        }


        if (request.body.countryName) {
            dataToSet['countryName'] = request.body.countryName;
        }


        if (request.body.original) {
            dataToSet['Profilepic.original'] = request.body.original;
        }

        if (request.body.thumbnail) {
            dataToSet['Profilepic.thumbnail'] = request.body.thumbnail;
        }



        if (request.body.dateOfBirth) {
            dataToSet['dateOfBirth'] = request.body.dateOfBirth;
        }


        if (request.body.house_flat != null) {
            dataToSet['house_flat'] = request.body.house_flat;
        }


        if (request.body.landmark != null) {
            dataToSet['landmark'] = request.body.landmark;
        }




        if (request.body.location) {
            dataToSet['location'] = request.body.location;
        }


        if (request.body.lat) {
            dataToSet['lat'] = request.body.lat;
        }


        if (request.body.long) {
            dataToSet['long'] = request.body.long;
        }

        if (request.body.lat && request.body.long) {
            dataToSet['currentLocation'] = [parseFloat(request.body.long), parseFloat(request.body.lat)]
        }

        if (request.body.nationality) {
            dataToSet['nationality'] = request.body.nationality
        }



        let criteria = {
            _id: validateToken._id,
            userType: validateToken.userType
        }



        await User.update(criteria, { $set: dataToSet });


        let findUserDataToSend = await User.findOne(criteria).select({ licencePic: 0, Profilepic: 0 }).populate({ path: 'subscryptinPlans', select: {} });

        let plansData = await SubscriptionPlaneItem.find({ isDeleted: false, planId: findUserDataToSend.subscryptinPlans });

        if (findUserDataToSend.isSubscriptiveUser)
            findUserDataToSend.planDetails = plansData;

        //console.log(findUserDataToSend.planDetails);

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.PROFILE_SUCCESSFULLY.EN : AppConstraints.PROFILE_SUCCESSFULLY.AR, data: findUserDataToSend });







    } catch (err) {
        //console.log(err,'error data');
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.logoutUser = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });
        let criteria = {
            _id: validateToken._id,
            userType: AppConstraints.USER
        }

        let dataToSet = {
            $set: {
                isOnline: false,
                accessToken: ""
            }
        }

        await User.update(criteria, dataToSet);


        return response.status(200).json({
            success: 1,
            statusCode: 200,
            msg: langaugeType == "EN" ? AppConstraints.LOGOUT.EN : AppConstraints.LOGOUT.AR
        });


    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.serviceCategoryListing = async (request, response) => {
    try {
        // if(!request.headers['authorization'])
        //     return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        // let validateToken=await UnivershalFunction.validateAdminAccessToken(request.headers['authorization']);
        // if(!validateToken)
        //     return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED_ADMIN});
        request.checkQuery('serviceId', AppConstraints.SERVICE_ID).notEmpty().isMongoId()
        // request.checkQuery('userId',AppConstraints.USER_ID).notEmpty().isMongoId()
        request.checkQuery('laundryId', AppConstraints.SERVICE_ID).notEmpty().isMongoId()
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let criteria = {};

        if (request.query.status == 'ACTIVE') {
            criteria = {
                // serviceId:request.query.serviceId,
                isDeleted: false
            }
        } else if (request.query.status == 'DELETED') {
            criteria = {
                // serviceId:request.query.serviceId,
                isDeleted: true
            }
        } else {
            criteria = {
                // serviceId:request.query.serviceId
            }
        }

        // let findServiceItems=await serviceCategory.find(criteria);

        let toExludeItem = await laundryserviceitem.aggregate([{
            $match: {
                serviceId: mongoose.Types.ObjectId(request.query.serviceId),
                laundryId: mongoose.Types.ObjectId(request.query.laundryId),
                isDeleted: false
            }
        }, {
            $group: {
                _id: "$categoryId"
            }
        }])

        let checkArray = []

        if (toExludeItem && toExludeItem.length) {
            toExludeItem.map(obj => { checkArray.push(mongoose.Types.ObjectId(obj._id)) })
        }

        // //console.log(request.query,"requesttttttttt", checkArray);
        let pipeline = [
            { $match: { isDeleted: false, isActive: true, _id: { $in: checkArray } } },
            {
                $lookup: {
                    from: 'laundryserviceitems',
                    let: { categoryId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                isActive: true,
                                serviceId: mongoose.Types.ObjectId(request.query.serviceId),
                                laundryId: mongoose.Types.ObjectId(request.query.laundryId),
                                $expr: { $eq: ["$categoryId", "$$categoryId"] },
                                // serviceItemId: {$exists: true}
                            },
                        }, { $sort: { series: 1 } }
                    ],
                    as: 'laundryserviceitems'
                }
            }, {
                $sort: { series: 1 }
            }
        ]
        // //console.log(JSON.stringify(pipeline))
        let findServiceItems = await serviceCategory.aggregate(pipeline);
        findServiceItems = await serviceCategory.populate(findServiceItems, [{ path: 'laundryserviceitems.serviceId', select: { serviceName: 1, servicePic: 1, serviceNameAr: 1 }, model: 'Service' },
        { path: 'laundryserviceitems.serviceItemId', select: { itemPic: 1, itemName: 1, itemNameAr: 1 }, model: 'serviceItems' },
        { path: 'laundryserviceitems.laundryId', select: {}, model: 'Laundry' }
        ]);

        // //console.log('_____________', JSON.stringify(findServiceItems))
        if (request.query.userId != "") {
            let previousData = await Bookings.aggregate([
                {
                    $match: {
                        "userId": mongoose.Types.ObjectId(request.query.userId),
                        laundryId: mongoose.Types.ObjectId(request.query.laundryId),
                        // serviceId:mongoose.Types.ObjectId(request.query.serviceId),
                    }
                },
                { $sort: { createDate: -1 } },
                { $unwind: "$bookingData" },
                { $match: { 'bookingData.serviceId': request.query.serviceId } },
                { $unwind: "$bookingData.serviceItem" },
                {
                    $group: {
                        _id: "$userId",
                        laundryserviceitems: { $addToSet: "$bookingData.serviceItem.serviceItemId" }
                    }
                }
            ]);
            // //console.log(previousData,"previousDatapreviousData");
            if (previousData.length) {
                let laundryitemListing = await laundryserviceitem.find({ serviceItemId: { $in: previousData[0].laundryserviceitems }, laundryId: request.query.laundryId });  //
                // //console.log("let laundryitemListing",laundryitemListing);
                laundryitemListing = await Laundry.populate(laundryitemListing, [{ path: 'serviceId', select: { serviceName: 1, servicePic: 1, serviceNameAr: 1 }, model: 'Service' },
                { path: 'serviceItemId', select: { itemPic: 1, itemName: 1, itemNameAr: 1 }, model: 'serviceItems' },
                { path: 'laundryId', select: {}, model: 'Laundry' }]);
                previousData[0].series = 0;
                previousData[0].createDate = new Date();
                previousData[0].isActive = true;
                previousData[0].isDeleted = false;
                previousData[0].categoryPic = {
                    categoryPicThumbnail: "",
                    categoryPicOriginal: ""
                };
                previousData[0].categoryNameAr = "الطلبات السابقة";
                previousData[0].categoryName = "Previous Orders";
                previousData[0].laundryserviceitems = laundryitemListing;
                findServiceItems.unshift(previousData[0]);
            }
        }
        // previousData = await Bookings.populate(previousData,[{path:'laundryserviceitems',select:{itemPic:1,itemName:1,itemNameAr:1},model:'serviceItems'}]);
        // .populate({path:'laundryserviceitems.laundryId',select:{}});
        return response.status(200).json({ success: 1, msg: 'Success', data: findServiceItems, serviceId: request.query.serviceId, statusCode: 200 });

    } catch (err) {
        // //console.log(err,"errrrrrrrrrrrrrrrr");
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message.error });
    }
};

exports.getServiceItemListing = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        // //console.log(request.body,'request data in service item listing');

        request.checkBody('serviceId', langaugeType == "EN" ? AppConstraints.SERVICE_ID.EN : AppConstraints.SERVICE_ID.AR).notEmpty();
        // request.checkBody('categoryId',langaugeType=="EN"?AppConstraints.SERVICE_ID.EN:AppConstraints.SERVICE_ID.AR).notEmpty();
        request.checkBody('laundryId', langaugeType == "EN" ? AppConstraints.LAUNDRY_ID.EN : AppConstraints.LAUNDRY_ID.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let criteria = {
            // categoryId:request.body.categoryId,
            serviceId: request.body.serviceId,
            laundryId: request.body.laundryId,
            isDeleted: false,
            isActive: true
        };
        if (request.body.categoryId) { criteria.categoryId = request.body.categoryId }
        let dataToPush = [];

        let findServiceItems = await laundryserviceitem.find(criteria).populate({ path: 'serviceId', select: { serviceName: 1, servicePic: 1, serviceNameAr: 1 } }).populate({ path: 'serviceItemId', select: { itemPic: 1, itemName: 1, itemNameAr: 1 } }).populate({ path: 'laundryId', select: {} });
        let findCharge = await Charge.find();
        // //console.log(findServiceItems.length,"length length length");
        for (let i = 0; i < findServiceItems.length; i++) {
            // //console.log("hello");
            let jsonToPush = {};
            if (findServiceItems[i].serviceItemId != null) {
                // //console.log("inside if");
                jsonToPush._id = findServiceItems[i]._id;
                jsonToPush.laundryId = findServiceItems[i].laundryId;
                jsonToPush.serviceItemId = findServiceItems[i].serviceItemId;
                jsonToPush.serviceId = findServiceItems[i].serviceId;
                jsonToPush.__v = findServiceItems[i].__v;
                jsonToPush.itemInitialCount = findServiceItems[i].itemInitialCount;
                jsonToPush.createDate = findServiceItems[i].createDate;
                jsonToPush.isActive = findServiceItems[i].isActive;
                jsonToPush.isDeleted = findServiceItems[i].isDeleted;
                jsonToPush.amountPerItem = findServiceItems[i].amountPerItem;
                dataToPush.push(jsonToPush);
            }

        }
        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: dataToPush, charge: findCharge });

    } catch (err) {
        // //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.subscriptionPlaneListing = async (request, response) => {
    try {

        let langaugeType = request.query.langaugeType;
        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        let findSubscriptionList = await SubscriptionPlane.aggregate([
            { $match: { isDeleted: false } },
            {
                $lookup:
                {
                    from: 'subscriptionplanitems',
                    localField: '_id',
                    foreignField: 'planId',
                    as: 'planDetails'
                }
            },

            {
                $project: {
                    "_id": 1,
                    "isDeleted": 1,
                    "isSelected": 1,
                    "created_at": 1,
                    "isActive": 1,
                    "perPeriod": 1,
                    "planAmount": 1,
                    "planName": 1,
                    "planNameAr": 1,
                    "planAmountAr": 1,
                    "noOfWeeklyOrders": 1,
                    "noOfUsers": 1,
                    "weekendService": 1,
                    "isBlocked": 1,
                    "perPeriodAr": 1,
                    "__v": 1,
                    planDetails: {
                        $filter: {
                            input: "$planDetails",
                            as: "item",
                            cond: { $eq: ["$$item.isDeleted", false] }
                        }
                    }
                }
            }
        ])


        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: findSubscriptionList })

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}






exports.getSubscriptionPlaneItem = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkBody('planId', langaugeType == "EN" ? AppConstraints.PLANE_ID.EN : AppConstraints.PLANE_ID.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let criteria = {
            planId: request.body.planId,
            isDeleted: false
        }

        let findplaneItem = await SubscriptionPlaneItem.find(criteria);


        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: findplaneItem });


    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.acceptUpgradeSubscriptionPlan = async (request, response) => {
    try {


        let langaugeType = request.body.langaugeType;

        //console.log(request.body,'==============subscription plan data====================fghfhgh================')



        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        request.checkBody('planId', langaugeType == "EN" ? AppConstraints.PLANE_ID.EN : AppConstraints.PLANE_ID.AR).notEmpty();
        // request.checkBody('planId',AppConstraints.PLANE_ID).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        // if(validateToken.isSubscriptiveUser){
        //     return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ALREADY_SUBSCRIBED});
        // }


        let checkPlanId = await SubscriptionPlane.findOne({ _id: request.body.planId });
        if (!checkPlanId)
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.NOT_VALID_PLAN });
        if (checkPlanId.planName == "Plus" || checkPlanId.planName == "Family" || checkPlanId.planName == "Business") {
            await User.update({ _id: validateToken._id }, { $set: { weekendFlag: true } });
        }
        await User.update({ _id: validateToken._id }, { $set: { subscryptinPlans: request.body.planId, hasSubscribed: true, isSubscriptiveUser: true, isActualPurchaser: true } });    //,subscriptionPlanMsgForRepurchase:0


        let findUserData = await User.findOne({ _id: validateToken._id })
            .select({ licencePic: 0, Profilepic: 0 })
            .populate({ path: 'subscryptinPlans', select: {} });


        let currentDate = new Date();


        let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

        //console.log(expiryDate,'==============expiryDate========');

        let userplane = new userSubscriptionPlan();
        userplane.userId = validateToken._id;
        userplane.purchaserId = validateToken._id;
        userplane.subscriptionPlanId = request.body.planId;
        userplane.perchageDate = new Date();
        userplane.expiryDate = expiryDate
        userplane.reciept = request.body.reciept;
        userplane.registrationId = request.body.registrationId;

        let dataToSave = await userplane.save();

        let userplan = new userAndMemberSubscription();
        userplan.userId = validateToken._id;
        userplan.purchaserId = validateToken._id;
        userplan.subscriptionPlanId = request.body.planId;
        userplan.userSubscriptionPlanId = userplane._id;
        userplan.perchageDate = new Date();
        userplan.expiryDate = expiryDate
        userplan.reciept = request.body.reciept;

        let dataToSav = await userplan.save();

        let forPlanName = await SubscriptionPlane.findOne({ _id: request.body.planId });
        let subject, content;
        if (validateToken.langaugeType == "EN") {
            if (forPlanName.planName == "Basic") {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #6bbb7e; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> 3NDK Basic Package- 3NDK App</h4> <p>Dear ${validateToken.name},</p> <p>Thank you for your trust in our services and choosing 3NDK Basic package. By subscribing to this package, you enjoy the following features:</p> <table class="table table-border table1"> <tr> <th class="td1">Features/Subscription</th> <th class="td2">3ndk basic</th> </tr> <tr> <td class="td1">Number of users</td> <td class="td2">1</td> </tr> <tr> <td class="td1">Number of weekly pickup/delivery</td> <td class="td2">1/Week</td> </tr> <tr> <td class="td1">Laundry selection</td> <td class="td2">Available</td> </tr> <tr> <td class="td1">"Weekend" service (Thurday, Friday & Saturday)</td> <td class="td2">Not available</td> </tr> <tr> <td class="td1">"Quick service" (pickup/delivery on same day)</td> <td class="td2">Not available</td> </tr> <tr> <td class="td1">Subscription price</td> <td class="td2">SR 49/Month</td> </tr> <tr> <td class="td1">Maximum laundy</td> <td class="td2">Unlimited</td> </tr> </table> <p class="color">Regards,</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> This email was sent to <span style="color: #fb0018">(USER EMAIL)</span> as part of your <span style="background-color: #ffff00">3NDK account</span>. To change how you receive emails from us or to unsubscribe from all emails, please use the following links: </td> </tr> <tr> <td width="180px"><b><a href="">Email settings</a></b></td> <td><b><a href="">Unsubscribe</a></b></td> </tr> <tr> <td colspan="2"> <span style="background-color: #ffff00">3NDK</span> – Imam Saud Bin Abdel-Aziz Road, Al Nakkeel, Riyadh 12381 </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "3NDK Basic Package- 3NDK App"
            } else if (forPlanName.planName == "Plus") {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #5b8bbdb3; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> 3NDK Plus Package- 3NDK App</h4> <p>Dear ${validateToken.name},</p> <p>Thank you for your trust in our services and choosing 3NDK Plus package. By subscribing to this package, you enjoy the following features:</p> <table class="table table-border table1"> <tr> <th class="td1">Features/Subscription</th> <th class="td2">3ndk plus</th> </tr> <tr> <td class="td1">Number of users</td> <td class="td2">2</td> </tr> <tr> <td class="td1">Number of weekly pickup/delivery</td> <td class="td2">2 Weekly</td> </tr> <tr> <td class="td1">Laundry selection</td> <td class="td2">Available</td> </tr> <tr> <td class="td1">"Weekend" service (Thurday, Friday & Saturday)</td> <td class="td2">Available</td> </tr> <tr> <td class="td1">"Quick service" (pickup/delivery on same day)</td> <td class="td2">Coming soon</td> </tr> <tr> <td class="td1">Subscription price</td> <td class="td2">SR 99/Month</td> </tr> <tr> <td class="td1">Maximum laundy</td> <td class="td2">Unlimited</td> </tr> </table> <p class="color">Regards,</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> This email was sent to <span style="color: #fb0018">(USER EMAIL)</span> as part of your <span style="background-color: #ffff00">3NDK account</span>. To change how you receive emails from us or to unsubscribe from all emails, please use the following links: </td> </tr> <tr> <td width="180px"><b><a href="">Email settings</a></b></td> <td><b><a href="">Unsubscribe</a></b></td> </tr> <tr> <td colspan="2"> <span style="background-color: #ffff00">3NDK</span> – Imam Saud Bin Abdel-Aziz Road, Al Nakkeel, Riyadh 12381 </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "3NDK Plus Package- 3NDK App"
            } else if (forPlanName.planName == "Family") {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #efb874b3; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> 3NDK Family Package- 3NDK App</h4> <p>Dear ${validateToken.name},</p> <p>Thank you for your trust in our services and choosing 3NDK Family package. By subscribing to this package, you enjoy the following features:</p> <table class="table table-border table1"> <tr> <th class="td1">Features/Subscription</th> <th class="td2">3ndk family</th> </tr> <tr> <td class="td1">Number of users</td> <td class="td2">Up to 4</td> </tr> <tr> <td class="td1">Number of weekly pickup/delivery</td> <td class="td2">3 Weekly</td> </tr> <tr> <td class="td1">Laundry selection</td> <td class="td2">Available</td> </tr> <tr> <td class="td1">"Weekend" service (Thurday, Friday & Saturday)</td> <td class="td2">Available</td> </tr> <tr> <td class="td1">"Quick service" (pickup/delivery on same day)</td> <td class="td2">Coming soon</td> </tr> <tr> <td class="td1">Subscription price</td> <td class="td2">SR 199/Month</td> </tr> <tr> <td class="td1">Maximum laundy</td> <td class="td2">Unlimited</td> </tr> </table> <p class="color">Regards,</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> This email was sent to <span style="color: #fb0018">(USER EMAIL)</span> as part of your <span style="background-color: #ffff00">3NDK account</span>. To change how you receive emails from us or to unsubscribe from all emails, please use the following links: </td> </tr> <tr> <td width="180px"><b><a href="">Email settings</a></b></td> <td><b><a href="">Unsubscribe</a></b></td> </tr> <tr> <td colspan="2"> <span style="background-color: #ffff00">3NDK</span> – Imam Saud Bin Abdel-Aziz Road, Al Nakkeel, Riyadh 12381 </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "3NDK Family Package- 3NDK App"
            } else {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #f1e661c9; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> 3NDK Family Package- 3NDK App</h4> <p>Dear ${validateToken.name},</p> <p>Thank you for your trust in our services and choosing 3NDK Family package. By subscribing to this package, you enjoy the following features:</p> <table class="table table-border table1"> <tr> <th class="td1">Features/Subscription</th> <th class="td2">3ndk Business</th> </tr> <tr> <td class="td1">Number of users</td> <td class="td2">Unlimited</td> </tr> <tr> <td class="td1">Number of weekly pickup/delivery</td> <td class="td2">Daily</td> </tr> <tr> <td class="td1">Laundry selection</td> <td class="td2">Available</td> </tr> <tr> <td class="td1">"Weekend" service (Thurday, Friday & Saturday)</td> <td class="td2">Working days + weekend</td> </tr> <tr> <td class="td1">"Quick service" (pickup/delivery on same day)</td> <td class="td2">Not available</td> </tr> <tr> <td class="td1">Subscription price</td> <td class="td2">Contact us</td> </tr> <tr> <td class="td1">Maximum laundy</td> <td class="td2">Unlimited</td> </tr> </table> <p class="color">Regards,</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> This email was sent to <span style="color: #fb0018">(USER EMAIL)</span> as part of your <span style="background-color: #ffff00">3NDK account</span>. To change how you receive emails from us or to unsubscribe from all emails, please use the following links: </td> </tr> <tr> <td width="180px"><b><a href="">Email settings</a></b></td> <td><b><a href="">Unsubscribe</a></b></td> </tr> <tr> <td colspan="2"> <span style="background-color: #ffff00">3NDK</span> – Imam Saud Bin Abdel-Aziz Road, Al Nakkeel, Riyadh 12381 </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = " 3NDK Family Package- 3NDK App"
            }
        }

        if (validateToken.langaugeType == "AR") {
            if (forPlanName.planName == "Basic") {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #f1e661c9; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> عنوان البريد: باقة عندك أساسية- تطبيق عندك </h4> <p> ${validateToken.name} العزيز</p> <p> شكرا ً لثقتك بنا وإشتراكك في باقة عندك أساسية. من خلال إشتراكك بهذه الباقة فأنت تتمتع بالمزايا التالية: </p> <table class="table table-border table1"> <tr> <th class="td1">سعر الاشتراك</th> <th class="td2"> 49 ريال/شهريا </th> </tr> <tr> <td class="td1">المزايا / الباقة</td> <td class="td2"> عندك أساسية </td> </tr> <tr> <td class="td1">عدد المستخدمين</td> <td class="td2"> 1 </td> </tr> <tr> <td class="td1">عدد مرات الاستلام والتوصيل في الأسبوع</td> <td class="td2"> 1 </td> </tr> <tr> <td class="td1">اختيار المغسلة المفضلة</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">خدمة "ويكيند" (أيام الخميس والجمعة والسبت)</td> <td class="td2"> غير متوفر </td> </tr> <tr> <td class="td1">خدمة "مستعجل" (الاستلام والتوصيل بنفس اليوم)</td> <td class="td2"> غير متوفر </td> </tr> <tr> <td class="td1">الحد الأقصى للملابس لكل طلب</td> <td class="td2"> غير محدود </td> </tr> </table> <p class="color">تحيات فريق عندك</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> هذا البريد الإلكتروني تم إرساله إلي (بريد المستخدم) كجزء من <span style="background-color: #ffff00">حساب عندك.</span>لكي تتحكم في كيفية تلقيك للبريد الإلكتروني الخاص بنا أو إلغاء الاشتراك من قائمتنا البريدية من فضلك اتبع الرابطات التاليان: </td> </tr> <tr> <td width="180px"><b><a href="">إعدادت البريد الإلكتروني</a></b></td> <td><b><a href="">إلغاء الاشتراك </a></b></td> </tr> <tr> <td colspan="2"> – طريق الإمام سعود بن عبدالعزيز/ النخيل، الرياض 12381 3NDK </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "عنوان البريد: باقة عندك أساسية"
            } else if (forPlanName.planName == "Plus") {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #f1e661c9; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4> عنوان البريد: باقة عندك بلس- تطبيق عندك </h4> <p>${validateToken.name} العزيز</p> <p> شكرا ً لثقتك بنا وإشتراكك في باقة عندك بلس. من خلال إشتراكك بهذه الباقة فأنت تتمتع بالمزايا التالية: </p> <table class="table table-border table1"> <tr> <th class="td1">سعر الاشتراك</th> <th class="td2"> 99 ريال/شهريا </th> </tr> <tr> <td class="td1">المزايا / الباقة</td> <td class="td2"> عندك بلس </td> </tr> <tr> <td class="td1">عدد المستخدمين</td> <td class="td2"> 2 </td> </tr> <tr> <td class="td1">عدد مرات الاستلام والتوصيل في الأسبوع</td> <td class="td2"> 2 </td> </tr> <tr> <td class="td1">اختيار المغسلة المفضلة</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">خدمة "ويكيند" (أيام الخميس والجمعة والسبت)</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">خدمة "مستعجل" (الاستلام والتوصيل بنفس اليوم)</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">الحد الأقصى للملابس لكل طلب</td> <td class="td2"> غير محدود </td> </tr> </table> <p class="color">تحيات فريق عندك</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> هذا البريد الإلكتروني تم إرساله إلي (بريد المستخدم) كجزء من <span style="background-color: #ffff00">حساب عندك.</span>لكي تتحكم في كيفية تلقيك للبريد الإلكتروني الخاص بنا أو إلغاء الاشتراك من قائمتنا البريدية من فضلك اتبع الرابطات التاليان: </td> </tr> <tr> <td width="180px"><b><a href="">إعدادت البريد الإلكتروني</a></b></td> <td><b><a href="">إلغاء الاشتراك </a></b></td> </tr> <tr> <td colspan="2"> – طريق الإمام سعود بن عبدالعزيز/ النخيل، الرياض 12381 3NDK </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "عنوان البريد: باقة عندك بلس"
            } else if (forPlanName.planName == "Family") {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #f1e661c9; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4>عنوان البريد: باقة عندك فاميلي- تطبيق عندكعنوان البريد: باقة عندك أعمال- تطبيق عندك</h4> <p>${validateToken.name} العزيز </p> <p> شكرا ً لثقتك بنا وإشتراكك في باقة عندك فاميلي. من خلال إشتراكك بهذه الباقة فأنت تتمتع بالمزايا التالية: </p> <table class="table table-border table1"> <tr> <th class="td1">سعر الاشتراك</th> <th class="td2"> 199 ريال/شهريا </th> </tr> <tr> <td class="td1">المزايا / الباقة</td> <td class="td2"> عندك فاميلي </td> </tr> <tr> <td class="td1">عدد المستخدمين</td> <td class="td2"> حتى 4 حسابات </td> </tr> <tr> <td class="td1">عدد مرات الاستلام والتوصيل في الأسبوع</td> <td class="td2"> 3 </td> </tr> <tr> <td class="td1">اختيار المغسلة المفضلة</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">خدمة "ويكيند" (أيام الخميس والجمعة والسبت)</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">خدمة "مستعجل" (الاستلام والتوصيل بنفس اليوم)</td> <td class="td2"> متوفر </td> </tr> <tr> <td class="td1">الحد الأقصى للملابس لكل طلب</td> <td class="td2"> غير محدود </td> </tr> </table> <p class="color">تحيات فريق عندك</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> هذا البريد الإلكتروني تم إرساله إلي (بريد المستخدم) كجزء من <span style="background-color: #ffff00">حساب عندك.</span>لكي تتحكم في كيفية تلقيك للبريد الإلكتروني الخاص بنا أو إلغاء الاشتراك من قائمتنا البريدية من فضلك اتبع الرابطات التاليان: </td> </tr> <tr> <td width="180px"><b><a href="">إعدادت البريد الإلكتروني</a></b></td> <td><b><a href="">إلغاء الاشتراك </a></b></td> </tr> <tr> <td colspan="2"> – طريق الإمام سعود بن عبدالعزيز/ النخيل، الرياض 12381 3NDK </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "عنوان البريد: باقة عندك فاميلي- تطبيق عندكعنوان البريد: باقة عندك أعمال"
            } else {
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; /* color: #007bff; */ } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } .table1 { width:60%; margin: 0 auto; } .td1 { font-weight: 800; background-color: #c3c3c3; } .td2 { background-color: #f1e661c9; } .color { color: #007bff; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4>عنوان البريد: باقة عندك أعمال- تطبيق عندك</h4> <p>${validateToken.name} العزيز </p> <p>شكرا ً لثقتك بنا وإشتراكك في باقة عندك أعمال. من خلال إشتراكك بهذه الباقة فأنت تتمتع بالمزايا التالية:</p> <table class="table table-border table1"> <tr> <th class="td1">سعر الاشتراك</th> <th class="td2">تواصل معنا</th> </tr> <tr> <td class="td1">المزايا / الباقة</td> <td class="td2">عندك أعمال</td> </tr> <tr> <td class="td1">عدد المستخدمين</td> <td class="td2">غير محدود</td> </tr> <tr> <td class="td1">عدد مرات الاستلام والتوصيل في الأسبوع</td> <td class="td2">يوميا</td> </tr> <tr> <td class="td1">اختيار المغسلة المفضلة</td> <td class="td2">متوفر</td> </tr> <tr> <td class="td1">خدمة "ويكيند" (أيام الخميس والجمعة والسبت)</td> <td class="td2">متوفر</td> </tr> <tr> <td class="td1">خدمة "مستعجل" (الاستلام والتوصيل بنفس اليوم)</td> <td class="td2">غير متوفر</td> </tr> <tr> <td class="td1">الحد الأقصى للملابس لكل طلب</td> <td class="td2">غير متوفر</td> </tr> </table> <p class="color">تحيات فريق عندك</p> <p class="color">3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> هذا البريد الإلكتروني تم إرساله إلي (بريد المستخدم) كجزء من <span style="background-color: #ffff00">حساب عندك.</span>لكي تتحكم في كيفية تلقيك للبريد الإلكتروني الخاص بنا أو إلغاء الاشتراك من قائمتنا البريدية من فضلك اتبع الرابطات التاليان: </td> </tr> <tr> <td width="180px"><b><a href="">إعدادت البريد الإلكتروني</a></b></td> <td><b><a href="">إلغاء الاشتراك </a></b></td> </tr> <tr> <td colspan="2"> – طريق الإمام سعود بن عبدالعزيز/ النخيل، الرياض 12381 3NDK </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
                subject = "عنوان البريد: باقة عندك أعمال"
            }
        }


        await UnivershalFunction.sendEmail(validateToken.email, content, subject);
        //console.log(dataToSave,'dataToSave')

        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESSFULLY_UPGRADE.EN : AppConstraints.SUCCESSFULLY_UPGRADE.AR, data: findUserData });

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.addMembersInPlan = async (request, response) => {
    try {
        //language
        let langaugeType = request.body.langaugeType;

        //authorization
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        request.checkBody('phoneNumber', AppConstraints.PHONE_NUMBER).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        //mainFunction
        let date = new Date();
        //console.log(date,"dddddddddddddddddd")
        let purchaserId = await userSubscriptionPlan.find({ userId: validateToken._id, subscriptionPlanId: validateToken.subscryptinPlans, expiryDate: { $gte: date }, isExpired: false }).sort({ _id: -1 });
        purchaserId = purchaserId[0]
        //console.log(purchaserId,"purchaseIdddddddd",validateToken,"Date",Date.now());
        // let getMembersAndUsers = await userAndMemberSubscription.find({})
        if (validateToken.subscryptinPlans) {
            let getPlan = await plan.findOne({ _id: validateToken.subscryptinPlans });
            let memberUser = await userAndMemberSubscription.find({ purchaserId: validateToken._id, userSubscriptionPlanId: purchaserId._id, expiryDate: { $gte: Date.now() }, isDelete: false });
            //console.log(memberUser.length,"memberUserCount");

            // no of users check
            //console.log(getPlan.noOfUsers, memberUser.length,"getPlan.noOfUsers, memberUser.length");
            if (getPlan.noOfUsers <= memberUser.length) {
                //console.log(getPlan.noOfUsers, memberUser.length,"getPlan.noOfUsers, memberUser.length");
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.CANT_ADD_MORE_MEMBERS.EN : AppConstraints.CANT_ADD_MORE_MEMBERS.AR });
            } else {
                //console.log("can add more members");
            }


            // if ((validateToken._id).toString() == (find.userId).toString()){
            //     return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.CANT_REMOVE_PURCHASER.EN:AppConstraints.CANT_REMOVE_PURCHASER.AR});
            // }

            // is user already subscriptive
            let getUser = await User.findOne({ phoneNumber: request.body.phoneNumber, isBlocked: false, isDeleted: false });
            if (!getUser) {
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.NOT_REGISTERED.EN : AppConstraints.NOT_REGISTERED.AR });
            } else {
                if (getUser.isSubscriptiveUser) {
                    return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ALREADY_SUBSCRIBED.EN : AppConstraints.ALREADY_SUBSCRIBED.AR });
                }
            }

            // already 
            let findUserAlreadyInList = await userAndMemberSubscription.findOne({ userId: getUser._id, purchaserId: validateToken._id, expiryDate: { $gte: new Date() }, isDelete: false });
            if (findUserAlreadyInList) {
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ALREADY_ADDED.EN : AppConstraints.ALREADY_ADDED.AR });
            }
            let userplane = new userAndMemberSubscription();
            userplane.userId = getUser._id;
            userplane.purchaserId = validateToken._id;
            userplane.subscriptionPlanId = purchaserId.subscriptionPlanId;
            userplane.userSubscriptionPlanId = purchaserId._id;
            userplane.perchageDate = purchaserId.perchageDate;
            userplane.expiryDate = purchaserId.expiryDate;
            userplane.reciept = purchaserId.reciept;

            let dataToSave = await userplane.save();

            await User.update({ _id: getUser._id }, { $set: { subscryptinPlans: purchaserId.subscriptionPlanId, hasSubscribed: true, isSubscriptiveUser: true } });    //,subscriptionPlanMsgForRepurchase:0

            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESSFULLY_ADDED_USER.EN : AppConstraints.SUCCESSFULLY_ADDED_USER.AR, data: dataToSave });
        } else {
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.NOT_PURCHASER.EN : AppConstraints.NOT_PURCHASER.AR });
        }

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.listMembers = async (request, response) => {
    try {
        //language
        let langaugeType = request.query.langaugeType;

        //authorization
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        let list = await userAndMemberSubscription.find({ purchaserId: validateToken._id, expiryDate: { $gte: Date.now() }, isDelete: false }).populate({ path: 'userId' });

        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: list, count: list.length });

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.removeMemberFromPlan = async (request, response) => {
    try {
        //language
        let langaugeType = request.body.langaugeType;

        //authorization
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        let find = await userAndMemberSubscription.findOne({ _id: request.body.membershipId }, {});
        if ((validateToken._id).toString() == (find.userId).toString()) {
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.CANT_REMOVE_PURCHASER.EN : AppConstraints.CANT_REMOVE_PURCHASER.AR });
        }
        let remove = await userAndMemberSubscription.findOneAndUpdate({
            _id: request.body.membershipId,
            purchaserId: validateToken._id,
            // expiryDate:{$gte:Date.now()},
            // userId:request.body.userId
        }, { $set: { isDelete: true } });
        if (remove) {
            let userProfileUpdate = await User.findOneAndUpdate({ _id: remove.userId }, { $unset: { subscryptinPlans: 1 }, $set: { hasSubscribed: false, isSubscriptiveUser: false } });
            //console.log(userProfileUpdate,"userProfileUpdateee");
            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: remove });
        } else {
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.NOT_FOUND.EN : AppConstraints.ACCESS_TOKEN.AR });
        }
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.autoRenewFunction = async (request, response) => {
    try {
        //    crone hai ye
        let getSubscribedActualPurchasersUnsubscribed = await userSubscriptionPlan.find({ expiryDate: { lte: new Date() }, isExpired: false, isDelete: true });

        for (let i = 0; i < getSubscribedActualPurchasersUnsubscribed.length; i++) {
            let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({ _id: getSubscribedActualPurchasersUnsubscribed[i]._id }, { $set: { isExpired: true } }, { new: true });
            let updateMembers = userAndMemberSubscription.update({ userSubscriptionPlanId: updateUserSubscriptions._id }, { $set: { isExpired: true, isDelete: true } }, { multi: true });
            let getMemberUsers = await userAndMemberSubscription.find({ userSubscriptionPlanId: updateUserSubscriptions._id });
            for (let j = 0; j < getMemberUsers.length; j++) {
                let update = await User.findOneAndUpdate({ _id: getMemberUsers[j].userId }, { $set: { isSubscriptiveUser: false, isActualPurchaser: false }, $unset: { subscryptinPlans: 1 } }, { new: true });
            }
        }

        let getSubscribedActualPurchasersSubscribed = await userSubscriptionPlan.find({ expiryDate: { lte: new Date() }, isExpired: false, isDelete: false });

        let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        for (let i = 0; i < getSubscribedActualPurchasersSubscribed.length; i++) {
            if (payment) {//done
                let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({ _id: getSubscribedActualPurchasersSubscribed[i]._id }, { $set: { expiryDate: expiryDate } }, { new: true });
                let updateMembers = userAndMemberSubscription.update({ userSubscriptionPlanId: updateUserSubscriptions._id }, { $set: { expiryDate: expiryDate } }, { multi: true });
            } else {//failed
                let updateUserSubscriptions = await userSubscriptionPlan.findOneAndUpdate({ _id: getSubscribedActualPurchasersSubscribed[i]._id }, { $set: { isExpired: true, isDelete: true } }, { new: true });
                let updateMembers = userAndMemberSubscription.update({ userSubscriptionPlanId: updateUserSubscriptions._id }, { $set: { isExpired: true, isDelete: true } }, { multi: true });
                let getMemberUsers = await userAndMemberSubscription.find({ userSubscriptionPlanId: updateUserSubscriptions._id });
                for (let j = 0; j < getMemberUsers.length; j++) {
                    let update = await User.findOneAndUpdate({ _id: getMemberUsers[j].userId }, { $set: { isSubscriptiveUser: false, isActualPurchaser: false }, $unset: { subscryptinPlans: 1 } }, { new: true });
                }
            }
        }
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.unsubscribePlan = async (request, response) => {
    try {
        //language
        let langaugeType = request.body.langaugeType;

        //authorization
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        let unsubscribe = await userSubscriptionPlan.findOneAndUpdate({ userId: validateToken._id, purchaserId: validateToken._id, isExpired: false, subscriptionPlanId: validateToken.subscryptinPlans }, { $set: { isDelete: true } }, { new: true });
        if (unsubscribe) {
            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: unsubscribe });
        }
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.myBookingList2 = async (request, response) => {
    try {

        let langaugeType = request.body.langaugeType;
        //console.log('bokings api',request.headers['authorization']);


        //console.log(request.query,'query data')

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        let criteria;

        if (request.query.status) {
            if (request.query.status === AppConstraints.APP_CONST_VALUE.PENDING) {
                criteria = {
                    $and: [{ userId: validateToken._id },
                    { $or: [{ status: AppConstraints.APP_CONST_VALUE.PENDING }, { status: AppConstraints.APP_CONST_VALUE.ASSIGNED }, { status: AppConstraints.APP_CONST_VALUE.REASSIGNED }] }
                    ]
                };
            }
            if (request.query.status === AppConstraints.APP_CONST_VALUE.ACCEPTED) {

                criteria = {
                    $and: [{ userId: validateToken._id },
                    { $or: [{ status: AppConstraints.APP_CONST_VALUE.ACCEPTED }, { status: AppConstraints.APP_CONST_VALUE.REASSIGNED }, { status: AppConstraints.APP_CONST_VALUE.ASSIGNED }] }]
                }


            }
            if (request.query.status === AppConstraints.APP_CONST_VALUE.COMPLETED) {
                criteria.status = AppConstraints.APP_CONST_VALUE.COMPLETED
            }
        }
        let bookingsData = await Bookings.find(criteria)
            .sort({ "_id": -1 })
            .populate({ path: 'laundryId', select: {} });





        return response.status(200).json({ success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: bookingsData });



    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}








exports.myBookings = async (request, response) => {
    try {
        let langaugeType = request.query.langaugeType;


        //console.log('bokings api',request.headers['authorization']);


        //console.log(request.query,'query data')

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let criteria;

        // {status:AppConstraints.APP_CONST_VALUE.DELIVERED}

        if (request.body.status == 'COMPLETED') {
            criteria = {
                userId: validateToken._id,
                $or: [{ status: AppConstraints.APP_CONST_VALUE.COMPLETED }]




            };
        } else {


            criteria = {

                userId: validateToken._id,
                status: { $ne: AppConstraints.APP_CONST_VALUE.COMPLETED },
                status: { $ne: AppConstraints.APP_CONST_VALUE.CANCELLED }


            }

        }











        let bookingsData = await Bookings.find(criteria)
            .sort({ "_id": -1 })
            .populate({ path: 'laundryId', select: {} });







        return response.status(200).json({ success: 1, msg: langaugeType ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: bookingsData });



    } catch (err) {
        //console.log(err,'error')
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}









exports.renderNotificationList = async (request, response) => {
    try {

        let langaugeType = request.body.langaugeType;

        //console.log('fsgdfg',request.headers)

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.ACCESS_TOKEN.AR });
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();



        // //console.log()


        let criteria = {
            recieverId: validateToken._id,
            // isRead:false
        }

        let getAllNotification = await Notifications.find(criteria).sort({ _id: -1 });

        await Notifications.updateMany(criteria, { $set: { isRead: true } });


        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: getAllNotification });


    } catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}









exports.createBookings = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        //console.log(request.body,"HELLO WORLD!");
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('laundryId', langaugeType == "EN" ? AppConstraints.LAUNDRY_ID.EN : AppConstraints.LAUNDRY_ID.AR).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        //  request.checkBody('districtId',AppConstraints.DISTRICT_ID).notEmpty();
        request.checkBody('totalAmmount', langaugeType == "EN" ? AppConstraints.AMOUNT_REQUIRED.EN : AppConstraints.AMOUNT_REQUIRED.AR).notEmpty();
        request.checkBody('isQuickService', langaugeType == "EN" ? AppConstraints.QUICK_SERVICE.EN : AppConstraints.QUICK_SERVICE.AR).notEmpty().isBoolean();
        request.checkBody('pickUpAddress', langaugeType == "EN" ? AppConstraints.PICKUP_ADDRESS.EN : AppConstraints.PICKUP_ADDRESS.AR).notEmpty();
        // request.checkBody('pickUpTime',AppConstraints.PICK_UP_TIME).notEmpty();
        request.checkBody('pickUpDate', langaugeType == "EN" ? AppConstraints.PICK_UP_DATE.EN : AppConstraints.PICK_UP_DATE.AR).notEmpty();
        request.checkBody('deliveryDate', langaugeType == "EN" ? AppConstraints.DELIVERED_DATE.EN : AppConstraints.DELIVERED_DATE.AR).notEmpty();
        request.checkBody('serviceCharge', langaugeType == "EN" ? AppConstraints.SERVICE_CHARGE.EN : AppConstraints.SERVICE_CHARGE.AR).notEmpty();
        request.checkBody('deliveryCharge', langaugeType == "EN" ? AppConstraints.DELIVERY_CHARGE.EN : AppConstraints.DELIVERY_CHARGE.AR).notEmpty();
        request.checkBody('quickCharge', langaugeType == "EN" ? AppConstraints.QUICK_CHARGE.EN : AppConstraints.QUICK_CHARGE.AR).notEmpty();
        request.checkBody('bookingData', langaugeType == "EN" ? AppConstraints.BOOKING_DATA.EN : AppConstraints.BOOKING_DATA.AR).notEmpty();

        request.checkBody('pickUpLat', langaugeType == "EN" ? AppConstraints.PICK_UP_LAT.EN : AppConstraints.PICK_UP_LAT.AR).notEmpty();
        request.checkBody('pickUpLong', langaugeType == "EN" ? AppConstraints.PICK_UP_LONG.EN : AppConstraints.PICK_UP_LONG.AR).notEmpty();
        request.checkBody('slotId', langaugeType == "EN" ? AppConstraints.SLOT_ID.EN : AppConstraints.SLOT_ID.AR).isMongoId().notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });



        let fordistrict0 = await Laundry.findOne({ _id: request.body.laundryId, isDeleted: false });
        // //console.log(">>>>>>>>>>>>>"+fordistrict0.districtId+"<<<<<<<<<<<<<<<<<<<<<<");
        if (!fordistrict0)
            return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.BLOCKED.EN : AppConstraints.BLOCKED.AR })


        let criteria0 = {
            userType: AppConstraints.DRIVER,
            //  cityName:findLaundryCity.cityName,
            districtId: { $in: [fordistrict0.districtId] },
            isAvailable: true,
            isOnline: true,
        };


        let findDriver0 = await User.find(criteria0).sort({ load: 1 }).limit(1);


        // //console.log("++++++++++",findDriver0,"++++++++++++")
        //////////////////////////////////////////////check if slot is open///////////////////////////////////

        let dateData = new Date(parseInt(request.body.pickUpDate));

        let slotCriteria = {
            slotId: request.body.slotId,
            driverId: findDriver0[0]._id,
            pickUpDate: { $gte: new Date(dateData.setUTCHours(0, 0, 0)).getTime(), $lte: new Date(dateData.setUTCHours(24, 0, 0)).getTime() }
        }


        let findBookingStatus = await Bookings.findOne(slotCriteria)

        // //console.log(slotCriteria,"SLOT CRITERIA");

        // //console.log(findBookingStatus,"findBookingStatus");


        // if(findBookingStatus){
        //     return response.status(400).json({statusCode:400,success:0,msg:'Slot has filled, in case your money is deducted, we will refund your amount.'})
        // }




        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////handel weekly//////////////////////////////////////////////





        let found = await log.findOne({ userId: validateToken._id });
        // //console.log(found,"FOUND");
        let discount = 0;

        if (found) {//&& (found.orderfree == true)){//&&(found.freeOrderCount>0)){
            if (found.freeOrderCount == 1) {
                //console.log("HERE1");
                await log.update({ userId: validateToken._id }, { $inc: { freeOrderCount: -1 } });
                await log.update({ userId: validateToken._id }, { $set: { isActive: false } });
                discount = found.discount;
            } else if (found.freeOrderCount == 2) {
                //console.log("HERE2");
                await log.update({ userId: validateToken._id }, { $inc: { freeOrderCount: -1 } });
                discount = found.discount;
            } else {

                if (validateToken.isSubscriptiveUser) {
                    //console.log("BAUGHT");
                    let userSubsciptionPlan = {};

                    if (validateToken.subscryptinPlans)
                        userSubsciptionPlan = await SubscriptionPlane.findOne({ _id: validateToken.subscryptinPlans });

                    //console.log("ONE");

                    if (userSubsciptionPlan) {
                        let current = new Date(parseInt(request.body.pickUpDate));
                        let weekstart = current.getDate() - current.getDay() + 1;
                        let weekend = weekstart + 6;
                        let monday = new Date(current.setDate(weekstart)).getTime();
                        let sunday = new Date(current.setDate(weekend)).getTime();
                        //console.log("TWO");

                        if (userSubsciptionPlan.planName == "Basic") {
                            //console.log("THREE");

                            let criteria = {
                                pickUpDate: { $gte: monday, $lte: sunday },
                                laundryId: request.body.laundryId,
                                userId: validateToken._id,
                                status: { $ne: AppConstraints.APP_CONST_VALUE.CANCELLED },
                                subplanid: validateToken.subscryptinPlans
                            }
                            let findBookingInThisWeek = await Bookings.count(criteria)
                            if (findBookingInThisWeek == 1) { }
                            // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_ONE_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_ONE_IN_THIS_WEEK.AR})
                        }

                        if (userSubsciptionPlan.planName == "Plus") {
                            //console.log("FOUR");

                            let criteria = {
                                pickUpDate: { $gte: monday, $lte: sunday },
                                laundryId: request.body.laundryId,
                                userId: validateToken._id,
                                status: { $ne: AppConstraints.APP_CONST_VALUE.CANCELLED },
                                subplanid: validateToken.subscryptinPlans

                            }
                            let findBookingInThisWeek = await Bookings.count(criteria)
                            if (findBookingInThisWeek == 2) { }
                            // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_TWO_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_TWO_IN_THIS_WEEK.AR})    
                        }


                        if (userSubsciptionPlan.planName == "Family") {
                            // //console.log("FOUR");

                            let criteria = {
                                pickUpDate: { $gte: monday, $lte: sunday },
                                laundryId: request.body.laundryId,
                                userId: validateToken._id,
                                status: { $ne: AppConstraints.APP_CONST_VALUE.CANCELLED },
                                subplanid: validateToken.subscryptinPlans

                            }
                            let findBookingInThisWeek = await Bookings.count(criteria)
                            if (findBookingInThisWeek == 3) { }
                            // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_THREE_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_THREE_IN_THIS_WEEK.AR})    
                        }

                    }
                }//else{

                // return response.status(400).json({statusCode:400,success:0,msg:'YOUR FREE ORDERS ARE OVER'})
                //   }


            }
        } else {//if(found && found.monthfree==true){
            let userSubsciptionPlan = {};
            //console.log("111111111111111111111111111111111111111111111111111");
            if (validateToken.subscryptinPlans)
                userSubsciptionPlan = await SubscriptionPlane.findOne({ _id: validateToken.subscryptinPlans });

            // if(userSubsciptionPlan){
            //     let current = new Date(parseInt(request.body.pickUpDate));
            //     let weekstart = current.getDate()-current.getDay() +1;
            // let weekend = weekstart+6;
            // let monday = new Date(current.setDate(weekstart)).getTime();
            // let sunday = new Date(current.setDate(weekend)).getTime();
            //
            // if(userSubsciptionPlan.planName=="Basic"){
            //     let criteria={
            //         pickUpDate:{$gte:monday,$lte:sunday},
            //         laundryId:request.body.laundryId,
            //         userId:validateToken._id,
            //         status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
            //         subplanid:validateToken.subscryptinPlans
            //
            //     }
            //     //console.log(criteria)
            //     //console.log(validateToken.subscryptinPlans);
            //     //console.log("22222222222222222222222222222222222222222222222");
            //     let findBookingInThisWeek=await Bookings.count(criteria)
            //     // //console.log(findBookingInThisWeek);
            //
            //     if(findBookingInThisWeek==1){}
            //     // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_ONE_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_ONE_IN_THIS_WEEK.AR})
            // }
            //
            // if(userSubsciptionPlan.planName=="Plus"){
            //     let criteria={
            //         pickUpDate:{$gte:monday,$lte:sunday},
            //         laundryId:request.body.laundryId,
            //         userId:validateToken._id,
            //         status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
            //         subplanid:validateToken.subscryptinPlans
            //
            //     }
            //     //console.log(validateToken.subscryptinPlans);
            //
            //     //console.log("33333333333333333333333333333333333333333333333333333333");
            //     let findBookingInThisWeek=await Bookings.count(criteria)
            //     //console.log(findBookingInThisWeek);
            //
            //     if(findBookingInThisWeek==2){}
            //     // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_TWO_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_TWO_IN_THIS_WEEK.AR})
            // }
            //
            // if(userSubsciptionPlan.planName=="Family"){
            //     // //console.log("FOUR");
            //
            //     let criteria={
            //         pickUpDate:{$gte:monday,$lte:sunday},
            //         laundryId:request.body.laundryId,
            //         userId:validateToken._id,
            //         status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
            //         subplanid:validateToken.subscryptinPlans
            //
            //     }
            //     //console.log(validateToken.subscryptinPlans);
            //
            //     //console.log("444444444444444444444444444444");
            //     let findBookingInThisWeek=await Bookings.count(criteria)
            //     //console.log(findBookingInThisWeek);
            //
            //     if(findBookingInThisWeek==3){}
            //     // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_THREE_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_THREE_IN_THIS_WEEK.AR})
            // }
            // }
        }


















































        // //console.log("discount",discount,"discount");

        // let findUserPlan=await SubscriptionPlane.findOne({_id:validateToken.subscryptinPlans});

        // if(findUserPlan && findUserPlan.planName=="Basic"){

        //     // //console.log('=========================inside basic plan==============================')


        //     if(parseFloat(request.body.totalAmmount)>100)
        //     return response.status(400).json({success:0,msg:langaugeType=="EN"?AppConstraints.UPGRADE_PLANE_TO_PLACE_MORE_THAN_100.EN:AppConstraints.UPGRADE_PLANE_TO_PLACE_MORE_THAN_100.AR,statusCode:400});
        // }

        // let findLaundryCity=await Laundry.findOne({_id:request.body.laundryId},{cityName:1})
        let fordistrict = await Laundry.findOne({ _id: request.body.laundryId });
        // //console.log(fordistrict.districtId+"11111111111111");

        let criteria = {
            userType: AppConstraints.DRIVER,
            //  cityName:findLaundryCity.cityName,
            districtId: { $in: [fordistrict.districtId] },
            isAvailable: true,
            isOnline: true,
        };


        let findDriver = await User.find(criteria).sort({ load: 1 }).limit(1);


        let randomOrder = await randomstring.generate(6);
        let d = 0;
        if (request.body.promoCode) { //console.log("INSIDE PROMOCODE THIS123")
            let disc = await PromoCode.findOne({ promoCode: request.body.promoCode });
            if (disc) {
                d = (request.body.totalAmmount * disc.discount) / 100
                // //console.log(d,"disco");
            }
        }
        //console.log(request.body.deliveryAddress,"request.body.deliveryAddress");
        let booking = new Bookings();
        booking.userId = validateToken._id;
        booking.laundryId = request.body.laundryId;
        booking.totalAmmount = parseFloat(request.body.totalAmmount);
        booking.isQuickService = request.body.isQuickService;
        booking.pickUpDate = new Date(parseInt(request.body.pickUpDate)).getTime();
        booking.deliveryDate = new Date(parseInt(request.body.deliveryDate)).getTime();
        booking.serviceCharge = parseFloat(request.body.serviceCharge);
        booking.deliveryCharge = parseFloat(request.body.deliveryCharge);
        booking.deliveryCharge = parseFloat(request.body.deliveryCharge);
        booking.totalAmount = request.body.totalAmmount;
        booking.createDate = new Date().getTime();
        booking.paymentOption = request.body.paymentOption;
        booking.orderId = randomOrder;
        booking.deliveryAddress = request.body.deliveryAddress;
        booking.pickUpAddress = request.body.pickUpAddress;
        booking.pickUpLat = parseFloat(request.body.pickUpLat);
        booking.pickUpLong = parseFloat(request.body.pickUpLong);
        booking.pickUpLocation = [parseFloat(request.body.pickUpLong), parseFloat(request.body.pickUpLat)];
        booking.bookingData = (request.body.bookingData instanceof Object) ? request.body.bookingData : JSON.parse(request.body.bookingData);
        booking.slotId = request.body.slotId;


        booking.discount = discount + d;


        booking.subplanid = validateToken.subscryptinPlans;

        let saveBooking;
        if (findDriver[0] && findDriver[0]._id) {

            booking.driverId = findDriver[0]._id;
            booking.status = AppConstraints.APP_CONST_VALUE.CONFIRMED;
            await User.update({ _id: findDriver[0]._id }, { $inc: { load: 1 } })

            saveBooking = await booking.save();
            // //console.log(validateToken+"{{{{{{{{{{{{{{{");

            let user = await User.findOne({ _id: validateToken._id });

            let criteria = {
                recieverId: findDriver[0]._id,
                isRead: false
            }

            let findTotalUnreadCount = await NotificationData.count(criteria);
            let d = new Date();
            let dataToPush = {
                msg: findDriver[0].langaugeType == "EN" ? AppConstraints.BOOKING_ASSIGNED.EN : AppConstraints.BOOKING_ASSIGNED.AR,
                messageType: AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER,
                userId: validateToken._id,
                bookingId: saveBooking._id,
                count: findTotalUnreadCount + 1
            }
            let newNotification = new NotificationData();
            newNotification.recieverId = findDriver[0]._id,
                newNotification.bookingId = saveBooking._id;
            newNotification.msg = AppConstraints.BOOKING_ASSIGNED.EN;
            newNotification.msgAr = AppConstraints.BOOKING_ASSIGNED.AR;
            newNotification.messageType = AppConstraints.APP_CONST_VALUE.ASSIGNED_ORDER;
            newNotification.createDate = new Date().getTime()
            let criteriaUser = {
                recieverId: validateToken._id,
                isRead: false
            };
            let findTotalUnreadCountUser = await NotificationData.count(criteriaUser);
            let dataToPushUser1 = {
                msg: user.langaugeType == "EN" ? AppConstraints.BOOKING_CONFIRMED.EN : AppConstraints.BOOKING_CONFIRMED.AR,
                messageType: AppConstraints.APP_CONST_VALUE.CONFIRMED,
                driverId: findDriver[0]._id,
                bookingId: saveBooking._id,
                count: findTotalUnreadCountUser + 1
            }
            let newNotificationUser1 = new NotificationData();
            newNotificationUser1.recieverId = validateToken._id,
                newNotificationUser1.bookingId = saveBooking._id,
                newNotificationUser1.msg = AppConstraints.BOOKING_CONFIRMED.EN;
            newNotificationUser1.msgAr = AppConstraints.BOOKING_CONFIRMED.AR;
            newNotificationUser1.messageType = AppConstraints.APP_CONST_VALUE.CONFIRMED;
            newNotificationUser1.createDate = new Date().getTime()
            let dataMessage = {
                phoneNumber: validateToken.callingCode + validateToken.phoneNumber,
                message: user.langaugeType == "EN" ? AppConstraints.BOOKING_CONFIRMED2.EN + randomOrder : AppConstraints.BOOKING_CONFIRMED2.AR + randomOrder
            }
            let dataToUser = await Promise.all([
                UnivershalFunction.unifonicMessage(dataMessage),
                pushNotification.sendPush(findDriver[0].deviceToken, dataToPush),
                newNotification.save(),
                pushNotification.sendPushToUser(user.deviceToken, dataToPushUser1),
                newNotificationUser1.save()
            ])

            // //console.log(dataToUser[0],'send message==================')




        }
        else {
            booking.status = AppConstraints.APP_CONST_VALUE.PENDING;
            saveBooking = await booking.save();
            let criteriaUser = {
                recieverId: validateToken._id,
                isRead: false
            };
            let findTotalUnreadCountUser = await NotificationData.count(criteriaUser);
            let dataToPushUser1 = {
                msg: user.langaugeType == "EN" ? AppConstraints.BOOKING_CONFIRMED.EN : AppConstraints.BOOKING_CONFIRMED.AR,
                messageType: AppConstraints.APP_CONST_VALUE.CONFIRMED,
                bookingId: saveBooking._id,
                count: findTotalUnreadCountUser + 1
            }

            let newNotificationUser1 = new NotificationData();
            newNotificationUser1.recieverId = validateToken._id,
                newNotificationUser1.bookingId = saveBooking._id,
                newNotificationUser1.msg = AppConstraints.BOOKING_CONFIRMED.EN;
            newNotificationUser1.msgAr = AppConstraints.BOOKING_CONFIRMED.AR;
            newNotificationUser1.messageType = AppConstraints.APP_CONST_VALUE.CONFIRMED;
            newNotificationUser1.createDate = new Date().getTime()

            let dataToPushUser2 = {
                msg: user.langaugeType == "EN" ? AppConstraints.RESCHEDULE_ORDER.EN : AppConstraints.RESCHEDULE_ORDER.AR,
                messageType: AppConstraints.APP_CONST_VALUE.ASK_RESCHEDULE,
                bookingId: saveBooking._id,
                count: findTotalUnreadCountUser + 1
            }

            let newNotificationUser2 = new NotificationData();
            newNotificationUser2.recieverId = validateToken._id,
                newNotificationUser2.bookingId = saveBooking._id,
                newNotificationUser2.msg = AppConstraints.RESCHEDULE_ORDER.EN;
            newNotificationUser2.msgAr = AppConstraints.RESCHEDULE_ORDER.AR;
            newNotificationUser2.messageType = AppConstraints.APP_CONST_VALUE.ASK_RESCHEDULE;
            newNotificationUser2.createDate = new Date().getTime()
            let user = await User.findOne({ _id: validateToken._id });
            let dataMessage = {
                phoneNumber: validateToken.callingCode + validateToken.phoneNumber,
                message: user.langaugeType == "EN" ? AppConstraints.BOOKING_CONFIRMED2.EN + randomOrder : AppConstraints.BOOKING_CONFIRMED2.AR + randomOrder
            }
            let dataToUser = await Promise.all([
                UnivershalFunction.unifonicMessage(dataMessage),
                pushNotification.sendPushToUser(user.deviceToken, dataToPushUser1),
                newNotificationUser1.save(),
                pushNotification.sendPushToUser(user.deviceToken, dataToPushUser2),
                newNotificationUser2.save()
            ]);


            // //console.log(dataToUser[0],'==================send unifonic message============================')

            await UnivershalFunction.sendEmail(process.env.EMAIL_ADDRESS, langaugeType == "EN" ? AppConstraints.NEW_ORDER_PLACE.EN : AppConstraints.NEW_ORDER_PLACE.AR, langaugeType == "EN" ? AppConstraints.NODRIVERFOUND_ONLINE.EN : AppConstraints.NODRIVERFOUND_ONLINE.AR)
        }




        if (request.body.promoCode) {

            await PromoCode.update({ promoCode: request.body.promoCode }, { $addToSet: { usedBy: validateToken._id } });
        }





        let checkIfFirstOrder = await Bookings.count({ userId: validateToken._id })
        if (checkIfFirstOrder == 1) {
            let content, subject;
            if (validateToken.langaugeType == "EN") {
                subject = "Congratulations for your First Order from 3NDK!";
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; color: #007bff; } ol, ul { list-style-position: outside; } ol li { margin-bottom: 15px; } /* ol{ counter-reset: item } ol li{ display: block } ol li:before { content: counters(item, ".") ". "; counter-increment: item; margin-left: -28px; } */ ul { list-style-type: circle; } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"><b>Congraulations for your First Order from 3NDK!</b></h4> <p>Dear ${validateToken.name},</p> <p>Congratulations on your first order with 3NDK. This is the beginning of an exciting journey and a totally new way of dealing with your laundry. Tell us about your first 3NDK experience. Whether you have a suggestion, a question or a complaint, your feedback is always appreciated.</p> <p>Contact: <a href="mailTO:info@3ndk.com">info@3ndk.com</a></p> <p>Regards,</p> <p>3NDK team </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> This email was sent to <span style="color: #fb0018">${validateToken.name}</span> as part of your <span style="background-color: #ffff00">3NDK account</span>. To change how you receive emails from us or to unsubscribe from all emails, please use the following links: </td> </tr> <tr> <td width="180px"><b><a href="">Email settings</a></b></td> <td><b><a href="">Unsubscribe</a></b></td> </tr> <tr> <td colspan="2"> <span style="background-color: #ffff00">3NDK</span> – Imam Saud Bin Abdel-Aziz Road, Al Nakkeel, Riyadh 12381 </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body></html>`
            } else {
                subject = "تهانينا علي طلبك الأول من تطبيق عندك"
                content = `<!DOCTYPE html><html> <head> <title>Verification Email</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Latest compiled and minified CSS --> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"> <!-- jQuery library --> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> <!-- Popper JS --> <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script> <!-- Latest compiled JavaScript --> <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> <style> .container { text-align: justify; color: #007bff; } ol, ul { list-style-position: outside; } ol li { margin-bottom: 15px; } /* ol{ counter-reset: item } ol li{ display: block } ol li:before { content: counters(item, ".") ". "; counter-increment: item; margin-left: -28px; } */ ul { list-style-type: circle; } .heading { margin: 20px 0px; text-align: center; } table a, .a { text-decoration: underline; color:#0000008c; } a { text-decoration: underline; } </style> </head> <body> <!-- <div class="container.fluid heading"> <h1>Verification Email</h1> </div> --> <div class="container"> <h4><b> تهانينا علي طلبك الأول من تطبيق عندك </b> </h4> <p>${validateToken.name} العزيز  </p> <p> تهانينا علي طلبك الأول بإستخدام منصة عندك. هذه هي البداية لرحلة مثيرة وطريقة جديدة تماما ً في التعامل مع الغسيل. أخبرنا عن تجربتك الأولي مع عندك. إذا كان لديك اقتراح أو سؤال أو شكوي فرأيك في الخدمة يهمنا كثيرا ً. </p> <p> تواصل معنا: <a href="mailTo:info@3ndk.com">info@3ndk.com</a></p> <p> تحيات فريق عندك </p> <p><a href="www.3NDK.com" class="a">WWW.3NDK.COM</a></p> <table class="table table-bordered" style="color:#0000008c"> <tr> <td colspan="2"> هذا البريد الإلكتروني تم إرساله إلي <span style="color: #fb0018"> ${validateToken.name} </span> كجزء من <span style="background-color: #ffff00"> حساب عندك </span> . لكي تتحكم في كيفية تلقيك للبريد الإلكتروني الخاص بنا أو إلغاء الاشتراك من قائمتنا البريدية من فضلك اتبع الرابطات التاليان: </td> </tr> <tr> <td width="180px"><b><a href=""> إعدادت البريد الإلكتروني </a></b></td> <td><b><a href=""> إلغاء الاشتراك </a></b></td> </tr> <tr> <td colspan="2"> - طريق الإمام سعود بن عبدالعزيز/ النخيل، الرياض 12381 3NDK </td> </tr> </table> <p style="color:#0000008c">+966 11 2472611</p> </div> </body> </html>`
            }

            await UnivershalFunction.sendEmail(validateToken.email, content, subject)
        }


        let bookingsData = await Bookings.findOne({ _id: saveBooking._id })
            .populate({ path: 'laundryId', select: {} });


        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.BOOKING_CREATED.EN : AppConstraints.BOOKING_CREATED.AR, data: bookingsData });
    } catch (err) {
        //console.log(err,'error data')
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

// exports.createBookings = async (request,response) =>{
//     try{
//         let langaugeType = request.body.langaugeType;

//         if(!request.headers['authorization'])
//         return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
//         let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
//         if(!validateToken)
//         return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});
//         request.checkBody('laundryId',langaugeType=="EN"?AppConstraints.LAUNDRY_ID.EN:AppConstraints.LAUNDRY_ID.AR).notEmpty();
//         request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
//         request.checkBody('totalAmmount',langaugeType=="EN"?AppConstraints.AMOUNT_REQUIRED.EN:AppConstraints.AMOUNT_REQUIRED.AR).notEmpty();
//         request.checkBody('isQuickService',langaugeType=="EN"?AppConstraints.QUICK_SERVICE.EN:AppConstraints.QUICK_SERVICE.AR).notEmpty().isBoolean();
//         request.checkBody('pickUpAddress',langaugeType=="EN"?AppConstraints.PICKUP_ADDRESS.EN:AppConstraints.PICKUP_ADDRESS.AR).notEmpty();
//         request.checkBody('pickUpDate',langaugeType=="EN"?AppConstraints.PICK_UP_DATE.EN:AppConstraints.PICK_UP_DATE.AR).notEmpty();
//         request.checkBody('deliveryDate',langaugeType=="EN"?AppConstraints.DELIVERED_DATE.EN:AppConstraints.DELIVERED_DATE.AR).notEmpty();
//         request.checkBody('serviceCharge',langaugeType=="EN"?AppConstraints.SERVICE_CHARGE.EN:AppConstraints.SERVICE_CHARGE.AR).notEmpty();
//         request.checkBody('deliveryCharge',langaugeType=="EN"?AppConstraints.DELIVERY_CHARGE.EN:AppConstraints.DELIVERY_CHARGE.AR).notEmpty();
//         request.checkBody('quickCharge',langaugeType=="EN"?AppConstraints.QUICK_CHARGE.EN:AppConstraints.QUICK_CHARGE.AR).notEmpty();
//         request.checkBody('bookingData',langaugeType=="EN"?AppConstraints.BOOKING_DATA.EN:AppConstraints.BOOKING_DATA.AR).notEmpty();
//         request.checkBody('pickUpLat',langaugeType=="EN"?AppConstraints.PICK_UP_LAT.EN:AppConstraints.PICK_UP_LAT.AR).notEmpty();
//         request.checkBody('pickUpLong',langaugeType=="EN"?AppConstraints.PICK_UP_LONG.EN:AppConstraints.PICK_UP_LONG.AR).notEmpty();
//         request.checkBody('slotId',langaugeType=="EN"?AppConstraints.SLOT_ID.EN:AppConstraints.SLOT_ID.AR).isMongoId().notEmpty();
//         let errors = await request.validationErrors();
//         if (errors)
//         return response.status(400).json({statusCode:400,success:0,msg:errors[0].msg,error:errors});

//         let fordistrict0 = await Laundry.findOne({_id:request.body.laundryId});
//         let criteria0 = {
//             userType:AppConstraints.DRIVER,
//             districtId:{$in:[fordistrict0.districtId]},
//             isAvailable: true,
//             isOnline:true,
//         };

//         let findDriver0=await User.find(criteria0).sort({load:1}).limit(1);

//         let dateData = new Date(parseInt(request.body.pickUpDate));

//         let slotCriteria={
//             slotId:request.body.slotId,
//             driverId:findDriver0[0]._id,
//             pickUpDate:{$gte:new Date(dateData.setUTCHours(0,0,0)).getTime(),$lte:new Date(dateData.setUTCHours(24,0,0)).getTime()}
//         }

//         let findBookingStatus=await Bookings.findOne(slotCriteria)
//         if(findBookingStatus){
//             return response.status(400).json({statusCode:400,success:0,msg:'Slot has filled'})
//         }

//         let found = await log.findOne({userId:validateToken._id});

//             if(found && (found.orderfree == true) && (found.freeOrderCount>0)){

//             }else if(found && found.monthfree==true){

//             }


//     }catch(err){
//     //console.log(err,'error data')
//     return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});     
//     }
// }

exports.raisAnIssueBYUser = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });
        request.checkBody('issue', langaugeType == "EN" ? AppConstraints.ISSUE.EN : AppConstraints.ISSUE.AR).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkBody('issueType', langaugeType == "EN" ? AppConstraints.ISSUE_TYPE.EN : AppConstraints.ISSUE_TYPE.AR).notEmpty();
        // request.checkBody('original',AppConstraints.ORIGINAL).notEmpty();
        // request.checkBody('thumbnail',AppConstraints.THUMBNAIL).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        let content = '<br /> ' + validateToken.name + " with email address " + validateToken.email + " has raise isuue type " + request.body.issueType + "<br />" + request.body.issue;
        await UnivershalFunction.sendEmailToAdmin(content, langaugeType == "EN" ? AppConstraints.ISSUE_BY_USER.EN : AppConstraints.ISSUE_BY_USER.AR);
        //console.log(request.query.issue,'issues===============')
        let issueData = new Issue();
        issueData.userId = validateToken._id;
        issueData.issue = request.body.issue;
        issueData.issueType = request.body.issueType;
        issueData.userType = AppConstraints.USER;
        if (request.body.original) {
            issueData.imageUrl['original'] = request.body.original;
        }
        if (request.body.thumbnail) {
            issueData.imageUrl['thumbnail'] = request.body.thumbnail;
        }
        await issueData.save();

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.ISSUE_CREATED_SUCCESS.EN : AppConstraints.ISSUE_CREATED_SUCCESS.AR });
    } catch (err) {
        //console.log(err,'error');
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}




exports.createAReview = async (request, response) => {
    try {
        //console.log(request.body,"request.body");
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('bookingId', langaugeType == "EN" ? AppConstraints.BOOKING_ID.EN : AppConstraints.BOOKING_ID.AR).notEmpty();
        // request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkBody('overAllExperienceRating', langaugeType == "EN" ? AppConstraints.OVER_ALL_EXPERIENCE.EN : AppConstraints.OVER_ALL_EXPERIENCE.AR).notEmpty()
        request.checkBody('laundryServiceRating', langaugeType == "EN" ? AppConstraints.LAUNDRY_SERVICE.EN : AppConstraints.LAUNDRY_SERVICE.AR).notEmpty();
        request.checkBody('driverRating', langaugeType == "EN" ? AppConstraints.DRIVER_REVIEW.EN : AppConstraints.DRIVER_REVIEW.AR).notEmpty();
        request.checkBody('description', langaugeType == "EN" ? AppConstraints.RATING_DESCRIPTION.EN : AppConstraints.RATING_DESCRIPTION.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        let forDriverId = await Bookings.findOne({ _id: request.body.bookingId })
        //console.log(forDriverId.driverId);


        let findIfAlreadyReviewed = await Review.findOne({ userId: validateToken._id })
        if (findIfAlreadyReviewed) {
            let dataToUpdate = {};


            //console.log(forDriverId.laundryId+"<<<<<<<<<<<<<<<<<<<<<<<")
            if (request.body.bookingId) {
                dataToUpdate['driverId'] = forDriverId.driverId;
                //dataToUpdate['bookingId'] = request.body.bookingId;
                // dataToUpdate['laundryId'] = forDriverId.laundryId;
            }
            // if(forDriverId.laundryId){
            //     dataToUpdate['laundryId'] = forDriverId.laundryId;
            // }
            if (request.body.overAllExperienceRating) {
                dataToUpdate['overAllExperienceRating'] = request.body.overAllExperienceRating;
            }
            if (request.body.laundryServiceRating) {
                dataToUpdate['laundryServiceRating'] = request.body.laundryServiceRating;
            }
            if (request.body.driverRating) {
                dataToUpdate['driverRating'] = request.body.driverRating;
            }
            if (request.body.description) {
                dataToUpdate['description'] = request.body.description;
            }
            dataToUpdate.driverId = forDriverId.driverId;
            dataToUpdate.laundryId = forDriverId.laundryId;
            await Review.update({ userId: validateToken._id }, { $set: dataToUpdate });

            let isReviewed = await Bookings.update({ _id: request.body.bookingId }, { $set: { isReviewd: true } });
            //console.log(isReviewed,"isReviewed=================================")

            let findReview = await Review.findOne({ userId: validateToken._id });
            //console.log("222222222222222222222@@@@@@@@");

            return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.REVIEW_UPDATED.EN : AppConstraints.REVIEW_UPDATED.AR, data: findReview })
        }

        //console.log("11111111111111111111111111");

        let review = new Review();
        review.userId = validateToken._id;
        review.driverId = forDriverId.driverId;
        review.bookingId = request.body.bookingId;
        review.laundryId = forDriverId.laundryId;
        review.overAllExperienceRating = request.body.overAllExperienceRating;
        review.laundryServiceRating = request.body.laundryServiceRating;
        review.driverRating = request.body.driverRating
        review.ratings = request.body.ratings;
        review.description = request.body.description;
        reviewcreateDate = new Date().getTime()
        let saveReviews = await review.save();

        let isReviewed = await Bookings.update({ _id: request.query.bookingId }, { $set: { isReviewd: true } });
        console, log(isReviewed, "isReviewed=================================")
        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.REVIEW_CREATED.EN : AppConstraints.REVIEW_CREATED.AR, data: saveReviews });



    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.reviewListToUser = async (request, response) => {
    try {
        let langaugeType = request.query.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkQuery('perPage', AppConstraints.PER_PAGE).notEmpty();
        request.checkQuery('page', AppConstraints.PAGE).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let criteria = {
            isDeleted: false
        };




        let findReviews = await Promise.all([
            Review.find(criteria)
                .sort({ "_id": -1 })
                .skip((parseInt(request.query.perPage) * parseInt(request.query.page)) - parseInt(request.query.perPage))
                .limit(parseInt(request.query.perPage))
                .populate({ path: 'userId', select: { name: 1 } }),
            Review.count(criteria)

        ]);


        //console.log(findReviews[1],'total reviews count');

        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: findReviews[0], totalResult: findReviews[1] });





    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.getPromocodeDetails = async (request, response) => {
    try {
        let langaugeType = request.query.langaugeType;

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });

        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkQuery('promoCode', langaugeType == "EN" ? AppConstraints.PROMO_CODE.EN : AppConstraints.PROMO_CODE.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        let isPromocodeValid = await PromoCode.findOne({ promoCode: request.query.promoCode });
        if (!isPromocodeValid)
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_PROMO_CODE.EN : AppConstraints.INVALID_PROMO_CODE.AR });



        // let d1 = new Date();
        // let d2 = new Date(isPromocodeValid.expiryDate);


        // if(d1.getTime()>d2.getTime())
        // return response.status(400).json({success:0,statusCode:400,msg:AppConstraints.PROMO_EXPIRED});



        let criteria = {
            promoCode: request.query.promoCode,
            usedBy: { $in: [validateToken._id] }
        };

        let findIfAlreadyUsed = await PromoCode.findOne(criteria);
        //console.log(findIfAlreadyUsed,"fffffffffffffffffffffffffffffff",request.query,"validateToken._id",validateToken._id);
        if (findIfAlreadyUsed)
            return response.status(400).json({ success: 0, statusCode: 400, msg: langaugeType == "EN" ? AppConstraints.ALREADY_USED.EN : AppConstraints.ALREADY_USED.AR });
        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: isPromocodeValid });

    } catch (err) {
        //console.log(err,'error in promo details');
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.checkLinkExpired = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        // //console.log(request.body,'request data');

        // request.checkBody('langaugeType',langaugeType=="EN"?AppConstraints.LANGUAGE_TYPE.EN:AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('verificationcode', langaugeType == "EN" ? AppConstraints.VERIFICATION_CODE.EN : AppConstraints.VERIFICATION_CODE.AR).notEmpty();
        request.checkBody('accessTokenkey', langaugeType == "EN" ? AppConstraints.TOKEN.EN : AppConstraints.TOKEN.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        let decryptToken = await UnivershalFunction.DecryptToken(request.body.accessTokenkey);
        if (!decryptToken)
            return response.status(200).json({ statusCode: 200, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_TOKEN_KEY.EN : AppConstraints.INVALID_TOKEN_KEY.AR });
        let checkIfLinkActive = await Forgot.findOne({
            email: decryptToken.email,
            forgotCode: request.body.verificationcode,
            userType: decryptToken.userType
        });





        if (!checkIfLinkActive)
            return response.status(200).json({ statusCode: 200, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_TOKEN_KEY_OR_CODE.EN : AppConstraints.INVALID_TOKEN_KEY_OR_CODE.AR });
        if (checkIfLinkActive && !checkIfLinkActive.isActive)
            return response.status(200).json({ statusCode: 200, success: 0, msg: langaugeType == "EN" ? AppConstraints.LINK_EXPIRED.EN : AppConstraints.LINK_EXPIRED.AR });

        return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR });


    } catch (err) {
        //console.log(err,'error in promo details');
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}




exports.sendMessage = async (request, response) => {
    try {


        let otpval = Math.floor(1000 + Math.random() * 9000);


        //console.log('sghgdhgsjdg api get hitted')

        let data = {
            phoneNumber: request.body.callingCode + request.body.phoneNumber,
            message: 'Testing'
        }

        let sendOtp = await UnivershalFunction.unifonicMessage(data);

        //console.log(sendOtp,'==========')

        return response.status(200).json({ success: 1, msg: sendOtp });




    } catch (err) {

        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.orderDetailsForUser = async (request, response) => {
    try {
        let langaugeType = request.query.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkQuery('bookingId', langaugeType == "EN" ? AppConstraints.BOOKING_ID.EN : AppConstraints.BOOKING_ID.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        let findOrderDetail = await Bookings.findOne({ _id: request.query.bookingId })
            .populate({ path: "laundryId", select: {} })
            .populate({ path: "userId", select: {} });

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: findOrderDetail });

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.getPromoCodeListing = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let d = new Date().getTime();

        let criteria = {
            usedBy: { $nin: [validateToken._id] },
            isDeleted: false,
            expiryDate: { $gte: d },
            startDate: { $lte: d }
        }

        let findPromocode = await PromoCode.find(criteria);

        //console.log(findPromocode,'==========================findPromocode=====================================')

        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, data: findPromocode })

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}



exports.userAvailability = async (request, response) => {
    try {

        let langaugeType = request.query.langaugeType;

        //console.log(request.query,'===========================request data========================')

        //console.log(request.headers,'ddhsdfghsgdhg')
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkQuery('bookingId', langaugeType == "EN" ? AppConstraints.BOOKING_ID.EN : AppConstraints.BOOKING_ID.AR).notEmpty();
        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        let criteria = {
            _id: request.query.bookingId
        }
        let findbookingData = await Bookings.findOne(criteria).populate({ path: "driverId", select: { deviceToken: 1 } })

        if (!findbookingData)
            return response.status(400).json({ success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_BOOKING_ID.EN : AppConstraints.INVALID_BOOKING_ID.AR, statusCode: 400 })
        if (request.query.isAvailable === 'true' || request.query.isAvailable === true || request.query.isAvailable === 1 || request.query.isAvailable === '1') {
            let criteriaDriver = {
                recieverId: findbookingData.driverId._id,
                isRead: false
            }
            let findTotalUnreadCountDriver = await NotificationData.count(criteriaDriver);

            let dataToPushDriver = {
                msg: findbookingData.driverId.langaugeType == "EN" ? AppConstraints.USER_ACCEPTED_ORDER.EN : AppConstraints.USER_ACCEPTED_ORDER.AR,
                messageType: AppConstraints.APP_CONST_VALUE.ACCEPTED,
                userId: validateToken._id,
                bookingId: findbookingData._id,
                count: findTotalUnreadCountDriver
            }


            let newNotificationDriver = new NotificationData();
            newNotificationDriver.recieverId = findbookingData.driverId._id,
                newNotificationDriver.bookingId = findbookingData._id
            newNotificationDriver.msg = AppConstraints.USER_ACCEPTED_ORDER.EN
            newNotificationDriver.msgAr = AppConstraints.USER_ACCEPTED_ORDER.AR
            newNotificationDriver.messageType = AppConstraints.APP_CONST_VALUE.ACCEPTED
            newNotificationDriver.createDate = new Date().getTime()


            await Promise.all([
                Bookings.update({ _id: request.query.bookingId }, { $set: { status: AppConstraints.APP_CONST_VALUE.ACCEPTED, approved: true } }),
                newNotificationDriver.save(),
                pushNotification.sendPush(findbookingData.driverId.deviceToken, dataToPushDriver)
            ])

            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.MAKE_USER_SUCCESSFULLY_AVAILABLED.EN : AppConstraints.MAKE_USER_SUCCESSFULLY_AVAILABLED.AR });
        }

        else if (request.query.isAvailable === 'false' || request.query.isAvailable === false || request.query.isAvailable === 0 || request.query.isAvailable === '0') {
            let dataToSet = {
                status: AppConstraints.APP_CONST_VALUE.ASSIGNED,
                isRejected: true
            };
            await Promise.all([
                Bookings.update({ _id: request.query.bookingId }, { $set: dataToSet })
            ])
            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.MAKE_USER_SUCCESSFULLY_UNABAILABLE.EN : AppConstraints.MAKE_USER_SUCCESSFULLY_UNABAILABLE.AR });
        }



    } catch (err) {
        //console.log(err,'error data ==================')
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.getServiceToLaundry = async (request, response) => {
    try {
        let langaugeType = request.query.langaugeType;
        //console.log(request.headers,'ddhsdfghsgdhg')
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkQuery('laundryId', langaugeType == "EN" ? AppConstraints.LAUNDRY_ID.EN : AppConstraints.LAUNDRY_ID.AR).notEmpty().isMongoId();
        request.checkQuery('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let findServices = await Laundry.findOne({ _id: request.query.laundryId }, { services: 1 });

        //console.log(findServices,'findServices')

        let criteria = {
            _id: { $in: [findServices.services] }
        }

        let findeServicesDetail = await Service.find(criteria);
        return response.status(200).json({ statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, success: 1, data: findeServicesDetail })

    } catch (err) {
        //console.log(err,'error data ==================')
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}









exports.rechdedulebooking = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });
        request.checkBody('bookingId', langaugeType == "EN" ? AppConstraints.BOOKING_ID.EN : AppConstraints.BOOKING_ID.AR).notEmpty();
        request.checkBody('status', langaugeType == "EN" ? AppConstraints.RESCHEDULE_VALUE.EN : AppConstraints.RESCHEDULE_VALUE.AR).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        if (request.body.status === 'RESCHEDULE') {

            let findAlreadyRescheduled = await Bookings.count({ _id: request.body.bookingId, isRescheduledBookingByUser: true })

            //console.log("RESCHEDULED BY USER",findAlreadyRescheduled,"RESCHEDULED BY USER");

            if (findAlreadyRescheduled > 0)
                return response.status(400).json({ status: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ALREADY_RESCHEDULED.EN : AppConstraints.ALREADY_RESCHEDULED.AR })

            //console.log("xyzabcdwsefwsefwefwefwefwfwefwefwefwefewwefe");
            let newDataShift = new Date().getTime()
            await Bookings.update({ _id: request.body.bookingId }, { $inc: { pickUpDate: 86400000 } });
            await Bookings.update({ _id: request.body.bookingId }, { $set: { isRescheduledBookingByUser: true, isRescheduledBookingByUserDate: 86400000 + (+new Date()) } });
            await Bookings.update({ _id: request.body.bookingId }, { $inc: { deliveryDate: 86400000 } });

            let b = await Bookings.findOne({ _id: request.body.bookingId });

            let criteria = {
                recieverId: b.driverId,
                isRead: false
            }

            let findTotalUnreadCount = await NotificationData.count(criteria);
            let driver = await User.findOne({ _id: b.driverId });

            let d = new Date();
            let dataToPush = {
                msg: driver.langaugeType == "EN" ? AppConstraints.BOOKING_RESCHEDULED.EN : AppConstraints.BOOKING_RESCHEDULED.AR,
                messageType: AppConstraints.APP_CONST_VALUE.RESCHEDULED,
                userId: validateToken._id,
                bookingId: b._id,
                count: findTotalUnreadCount + 1
            }


            let newNotification = new NotificationData();
            newNotification.recieverId = b.bookingId,
                newNotification.bookingId = b._id;
            newNotification.msg = AppConstraints.BOOKING_RESCHEDULED.EN;
            newNotification.msgAr = AppConstraints.BOOKING_RESCHEDULED.AR;
            newNotification.messageType = AppConstraints.APP_CONST_VALUE.RESCHEDULED;
            newNotification.createDate = new Date().getTime()

            let criteriaUser = {
                recieverId: validateToken._id,
                isRead: false
            };

            let findTotalUnreadCountUser = await NotificationData.count(criteriaUser);
            let dataToPushUser = {
                msg: validateToken.langaugeType == "EN" ? AppConstraints.RESCHEDULE_CONFIRMED.EN : AppConstraints.RESCHEDULE_CONFIRMED.AR,
                messageType: AppConstraints.APP_CONST_VALUE.RESCHEDULE,
                driverId: b.driverId,
                bookingId: b._id,
                count: findTotalUnreadCountUser + 1
            }

            let newNotificationUser = new NotificationData();
            newNotificationUser.recieverId = validateToken._id,
                newNotificationUser.bookingId = b._id;
            newNotificationUser.createDate = new Date().getTime()
            newNotificationUser.msg = AppConstraints.RESCHEDULE_CONFIRMED.EN;
            newNotificationUser.msgAr = AppConstraints.RESCHEDULE_CONFIRMED.AR;
            newNotificationUser.messageType = AppConstraints.APP_CONST_VALUE.RESCHEDULE;

            await Promise.all([
                pushNotification.sendPush(driver.deviceToken, dataToPush),
                newNotification.save(),
                pushNotification.sendPushToUser(validateToken.deviceToken, dataToPushUser),
                newNotificationUser.save()
            ])


            return response.status(200).json({ statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESSESSFULLY_RESCHEDULED.EN : AppConstraints.SUCCESSESSFULLY_RESCHEDULED.AR, success: 1 })
        }
        else if (request.body.status === 'CANCEL') {
            let alreadyPicked = await Bookings.findOne({ _id: request.body.bookingId, isPickedUp: true });
            if (alreadyPicked) {
                return response.status(400).json({ status: 400, msg: AppConstraints.ALREADY_PICKED, statusCode: 400 })
            }

            let findIforderAlreadyCancelled = await Bookings.findOne({ _id: request.body.bookingId, status: AppConstraints.APP_CONST_VALUE.CANCELLED })

            if (findIforderAlreadyCancelled)
                return response.status(400).json({ status: 400, msg: AppConstraints.ORDER_ALREADY_CANCELLED, statusCode: 400 })

            let findBookingData = await Bookings.findOne({ _id: request.body.bookingId }).populate({ path: 'driverId', select: {} })
            if (findBookingData && findBookingData.driverId) {
                let findTotalUnreadCountUser = await NotificationData.count({ driverId: findBookingData.driverId._id });
                let dataToPushUser = {
                    msg: findBookingData.driverId.langaugeType == "EN" ? AppConstraints.BOOKING_CANELLED.EN : AppConstraints.BOOKING_CANELLED.AR,
                    messageType: AppConstraints.APP_CONST_VALUE.CANCELLED,
                    driverId: findBookingData.driverId._id,
                    bookingId: findBookingData._id,
                    count: findTotalUnreadCountUser + 1

                }



                let newNotificationUser = new NotificationData();
                newNotificationUser.recieverId = findBookingData.driverId._id,
                    newNotificationUser.bookingId = findBookingData._id,
                    newNotificationUser.msg = AppConstraints.BOOKING_CANELLED.EN;
                newNotificationUser.msgAr = AppConstraints.BOOKING_CANELLED.AR;
                newNotificationUser.messageType = AppConstraints.APP_CONST_VALUE.CANCELLED;
                newNotificationUser.createDate = new Date().getTime()

                await Promise.all([
                    User.update({ _id: findBookingData.driverId._id }, { $inc: { load: -1 } }),
                    Bookings.update({ _id: request.body.bookingId }, { $set: { status: AppConstraints.APP_CONST_VALUE.CANCELLED } }),
                    newNotificationUser.save(),
                    pushNotification.sendPush(findBookingData.driverId.deviceToken, dataToPushUser)
                ]);
            } else {

                await Promise.all([

                    Bookings.update({ _id: request.body.bookingId }, { $set: { status: AppConstraints.APP_CONST_VALUE.CANCELLED } })
                ]);
            }





            return response.status(200).json({ statusCode: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.ORDER_CANELLED_SUCCESSFULLY.EN : AppConstraints.ORDER_CANELLED_SUCCESSFULLY.AR })
        }


    }
    catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.updateLaundryId = async (request, response) => {
    try {

        let langaugeType = request.body.langaugeType;

        //console.log(request.body,'request data')

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED });
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        request.checkBody('laundryId', AppConstraints.LAUNDRY_ID).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        //console.log(request.body.laundryId);
        await User.update({ _id: validateToken._id }, { $set: { laundryId: request.body.laundryId } });

        return response.status(200).json({ statusCode: 200, success: 1, msg: "Laundry Update" })

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.termsAndCondition = async (request, response) => {
    try {
        return response.status(200).render('pages/termscondition');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.privacyPolicy = async (request, response) => {
    try {
        return response.status(200).render('pages/privacyPolicy');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}


exports.choosePack = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('choice', AppConstraints.CHOICE).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        //console.log("=validateToken._id================",validateToken._id)

        let found = await log.findOne({ userId: validateToken._id });

        if (found) {
            if (found.isActive)
                return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.LOG_FOUND });
        }


        if (request.body.choice == "MONTHFREE") {

            const lg = new log();
            lg.userId = validateToken._id;
            lg.fromDate = new Date().getTime();
            lg.tillDate = new Date().getTime() + 2678400000;
            lg.monthfree = true;
            lg.planId = request.body.planId;
            let logdata = await lg.save();

            let checkPlanId = await SubscriptionPlane.findOne({ _id: request.body.planId });
            if (!checkPlanId)
                return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.NOT_VALID_PLAN.EN : AppConstraints.NOT_VALID_PLAN.AR });


            let dataToSet = {
                subscryptinPlans: request.body.planId,
                isSubscriptiveUser: true,
                packChoosen: true
            }

            await User.update({ _id: validateToken._id }, { $set: dataToSet });

            let currentDate = new Date();


            let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

            //console.log(expiryDate,'==============expiryDate========');

            let userplane = new userSubscriptionPlan();
            userplane.userId = validateToken._id;
            userplane.subscriptionPlanId = request.body.planId;
            userplane.perchageDate = new Date();
            userplane.expiryDate = expiryDate
            userplane.reciept = request.body.reciept;

            let dataToSave = await userplane.save();

            //    let data = await log.findOne({userId:validateToken._id}).populate({path:'planId',select:{planName:1}})
            //    //console.log(dataToSave,'dataToSave')
            //    let data2 = await User.findOne({_id:validateToken._id});
            getUserAllData = await User.findOne({ _id: validateToken._id })
                .select({ licencePic: 0, Profilepic: 0 })
                .populate({ path: 'subscryptinPlans', select: {} });



            plansData = await SubscriptionPlaneItem.find({ isDeleted: false, planId: getUserAllData.subscryptinPlans });

            if (getUserAllData.isSubscriptiveUser)
                getUserAllData.planDetails = plansData;
            return response.status(200).json({ statusCode: 200, success: 1, msg: "MONTH FREE", data: getUserAllData })


        } else if (request.body.choice == "ORDERFREE") {
            const lg = new log();
            lg.userId = validateToken._id;
            lg.fromDate = new Date().getTime();
            lg.tillDate = new Date().getTime() + 2678400000;
            lg.orderfree = true;
            lg.freeOrderCount = 2;
            lg.discount = 19;
            let logdata = await lg.save();
            await User.findOneAndUpdate({ _id: validateToken._id }, { $set: { packChoosen: true } });
            return response.status(200).json({ statusCode: 200, success: 1, msg: "ORDER FREE", data: logdata })

        } else {
            return response.status(400).json({ status: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.INVALID_CHOICE.EN : AppConstraints.INVALID_CHOICE.AR })
        }
    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }

}



exports.findLog = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        //console.log("=validateToken._id================",validateToken._id)

        let found = await log.findOne({ userId: validateToken._id }).populate({ path: 'planId', select: { planName: 1 } });
        if (found && found.isActive == true && found.orderfree == true) {
            if (found.freeOrderCount > 0) {
                return response.status(200).json({ statusCode: 200, success: 1, msg: "LOG DATA", data: found })
            }
        } else if (found && found.isActive == true && found.monthfree == true) {
            return response.status(200).json({ statusCode: 200, success: 1, msg: "LOG DATA", data: found })

        } else if (found && found.freeOrderCount == 0) {
            return response.status(200).json({ statusCode: 200, success: 1, msg: "EXPIRED" })
        }
        else {
            return response.status(200).json({ status: 200, success: 1, msg: langaugeType == "EN" ? AppConstraints.NOT_FOUND.EN : AppConstraints.NOT_FOUND.AR })
        }
    }
    catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}





exports.getSlots = async (request, response) => {
    try {

        let langaugeType = request.body.langaugeType;
        // //console.log(">>>>>>>>>>>"+JSON.stringify(request.body)+"{{{{{{{{{{{{{{{");
        // if(!request.headers['authorization'])
        // return response.status(400).json({statusCode:400,success:0,msg:langaugeType=="EN"?AppConstraints.ACCESS_TOKEN.EN:AppConstraints.ACCESS_TOKEN.AR});
        // let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        // if(!validateToken)
        // return response.status(401).json({statusCode:401,success:0,msg:langaugeType=="EN"?AppConstraints.UNAUTHORIZED.EN:AppConstraints.UNAUTHORIZED.AR});

        //console.log(request.body)
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        request.checkBody('laundryId', AppConstraints.LAUNDRY_ID).notEmpty();
        request.checkBody('localTime', AppConstraints.LOCAL_TIME).notEmpty();
        request.checkBody('pickUpDate', AppConstraints.PICK_UP_DATE).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        // //console.log(request.body.pickUpDate,"PICKUPDATE");
        let dateData = new Date(parseInt(request.body.pickUpDate));
        // let dateData=new Date();
        // //console.log(dateData,"DateDataDateDataDateDataDateDataDateDataDateData")
        let fordistrict0 = await Laundry.findOne({ _id: request.body.laundryId });
        //console.log(">>>>>>>>>>>>>"+fordistrict0.districtId+"<<<<<<<<<<<<<<<<<<<<<<");        
        let criteria0 = {
            userType: AppConstraints.DRIVER,
            //  cityName:findLaundryCity.cityName,
            districtId: { $in: [fordistrict0.districtId] },
            isAvailable: true,
            isOnline: true,
        };


        let findDriver0 = await User.find(criteria0).sort({ load: 1 }).limit(1);
        //console.log(">>>>>>>>>>>>>"+findDriver0.length+"<<<<<<<<<<<<<<<<<<<<<<");        

        if (findDriver0.length == 0) {
            return response.status(200).json({ success: 0, msg: langaugeType == "EN" ? AppConstraints.NODRIVER.EN : AppConstraints.NODRIVER.AR, statusCode: 200, isDriverFound: false })
        }
        let criteria = {
            driverId: findDriver0[0]._id,
            pickUpDate: { $gte: new Date(dateData.setUTCHours(0, 0, 0)).getTime(), $lte: new Date(dateData.setUTCHours(24, 0, 0)).getTime() }

        }
        //console.log(criteria,"criteria")

        let projection = {
            pickUpDate: 1,
            slotId: 1
        }

        let findAllBooking = await Bookings.find(criteria, projection);
        //console.log('^^^^^^^^^^^^^^^^^^', findAllBooking)


        let slotId = []

        for (let i = 0; i < findAllBooking.length; i++) {


            slotId.push("" + findAllBooking[i].slotId);
        }

        //console.log(request.body.localTime,'^^^^^^^^^^^^^^^^^^', slotId)

        let slotData = await slot.find();
        //console.log(slotData,"slotDataslotDataslotDataslotData");
        let dataToSend = [];




        if (request.body.pickUpDate > (+new Date())) {
            for (let j = 0; j < slotData.length; j++) {





                let jsonToPush = {}
                jsonToPush._id = slotData[j]._id;
                jsonToPush.slotTime = slotData[j].slotTime;
                jsonToPush.timing = slotData[j].timing;


                jsonToPush.isActive = true;

                if (slotId.indexOf("" + slotData[j]._id) > -1) {
                    jsonToPush.isActive = false;


                }


                dataToSend.push(jsonToPush)
            }
        } else {

            for (let j = 0; j < slotData.length; j++) {



                if (request.body.localTime <= ((+new Date().setUTCHours(0, 0, 0)) + slotData[j].millis)) {


                    let jsonToPush = {}
                    jsonToPush._id = slotData[j]._id;
                    jsonToPush.slotTime = slotData[j].slotTime;
                    jsonToPush.timing = slotData[j].timing;


                    jsonToPush.isActive = true;

                    if (slotId.indexOf("" + slotData[j]._id) > -1) {
                        jsonToPush.isActive = false;


                    }


                    dataToSend.push(jsonToPush)
                }
            }




            // //console.log('++++++++++++++++++++++', dataToSend)







        }

        return response.status(200).json({ success: 1, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR, statusCode: 200, data: dataToSend, isDriverFound: true })


    }
    catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}




function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}


exports.verifyCoupon = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        request.checkBody('coupon', langaugeType == "EN" ? AppConstraints.COUPON.EN : AppConstraints.COUPON.AR).notEmpty();
        //console.log("verifyCoupon");
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        const couponId = await coupon.findOne({ couponCode: request.body.coupon.toUpperCase() });
        //console.log("verifyCoupon",couponId,request.body.coupon.toUpperCase());
        if (!couponId) {
            return response.status(200).json({ statusCode: 200, success: 0, msg: 'FALSE' });
        } else {
            return response.status(200).json({ statusCode: 200, success: 1, msg: "TRUE" })

        }

    }
    catch (err) {
        //console.log(err)
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.aboutus = async (request, response) => {
    try {
        return response.status(200).render('pages/aboutus');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.versionChecker = async (request, response) => {
    try {
        // if(!request.headers['authorization'])
        // return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN});
        // let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        // if(!validateToken)
        // return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED});
        request.checkBody('version', AppConstraints.VERSION).notEmpty();
        request.checkBody('app_type', AppConstraints.APP_TYPE).notEmpty();
        request.checkBody('platform', AppConstraints.PLATFORM).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let latestVersion = await version.find({ app_type: request.body.app_type, platform: request.body.platform }).sort({ version: -1 }).limit(1);

        if (latestVersion[0].version > request.body.version) {
            // let criteria={
            //     recieverId:validateToken._id,
            //     isRead:false
            // }
            // let findTotalUnreadCount=await NotificationData.count(criteria);

            // let dataToPush={
            //     msg:AppConstraints.UPDATE_APPLICATION,
            //     messageType:AppConstraints.APP_CONST_VALUE.UPDATE,
            //     count:findTotalUnreadCount
            // }

            // let newNotification=new NotificationData();
            // newNotification.recieverId=validateToken._id
            // newNotification.msg=AppConstraints.UPDATE_APPLICATION
            // newNotification.messageType=AppConstraints.APP_CONST_VALUE.UPDATE
            // newNotification.createDate=new Date().getTime()

            // await Promise.all([
            //     pushNotification.sendPushToUser(validateToken.deviceToken,dataToPush),
            //     newNotification.save()
            // ]);
            return response.status(200).json({ success: 0, statusCode: 200 });
        } else {
            return response.status(200).json({ success: 1, statusCode: 200 });
        }
    }
    catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.subscriptionChecker = async (request, response) => {
    try {
        //console.log(request.body,"request.body");
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });

        let user = await User.findOne({ _id: validateToken._id }, {}, {});
        if (user.subscriptionPlanMsgForRepurchase == 0) {
            return response.status(200).json({ statusCode: 200 });
        }

        let checkPlan = await userSubscriptionPlan.findOne({ userId: validateToken._id, isExpired: false }).sort({ expiryDate: -1 });
        if (!checkPlan) {
            return response.status(200).json({ statusCode: 200 });
        } else {
            if (checkPlan.expiryDate < Date.now()) {
                await userSubscriptionPlan.findAndUpdate({ _id: checkPlan._id }, { $set: { isExpired: true } }, {});
                await User.update({ _id: validateToken._id }, { $set: {} });
                await User.update({ _id: validateToken._id }, { $set: { weekendFlag: false, subscryptinPlans: request.body.planId, hasSubscribed: false, isSubscriptiveUser: false, subscriptionPlanMsgForRepurchase: 1 } });
                return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.PLAN_EXPIRED });
            } else {
                return response.status(200).json({ statusCode: 200 });
            }
        }
    }
    catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.termsAndConditionArabic = async (request, response) => {
    try {
        //console.log('4444444444444444444444')
        return response.status(200).render('pages/termsandconditionsarabic.ejs');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.aboutusarabic = async (request, response) => {
    try {
        return response.status(200).render('pages/aboutusarabic');
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.changeLanguage = async (request, response) => {
    try {//console.log("change language to",request.body.langaugeType)
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        await User.update({ _id: validateToken._id }, { $set: { langaugeType: request.body.langaugeType } });
        return response.status(200).json({ success: 1, statusCode: 200, msg: langaugeType == "EN" ? AppConstraints.SUCCESS.EN : AppConstraints.SUCCESS.AR });

    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.getUserData = async (request, response) => {
    try {
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        let alluserdata = await User.findOne({ _id: validateToken._id });

        let plansData = [];
        plansData = await SubscriptionPlaneItem.find({ isDeleted: false, planId: getUserAllData.subscryptinPlans });

        if (alluserdata.isSubscriptiveUser)
            alluserdata.planDetails = plansData;

        return response.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: alluserdata });

    }
    catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}
exports.notify = async (req, res) => {
    return res.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN });
}
exports.shopee = async (req, res) => {
    return res.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN });
}
// exports.hyperPayStep1 = async (request,response) =>{
//     try{
//         if(!request.headers['authorization'])
//         return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN.EN});
//         let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
//         if(!validateToken)
//         return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED.EN});
//         let errors =await request.validationErrors();
//         if (errors)
//         return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});

//         //console.log(request.body.amount,"amount");
//         //console.log(request.body.currency,"currency");
//         //console.log(request.body.paymentType,"paymentType");
//         //console.log(request.body.notificationUrl,"notificationUrl");
//         let jsonRes={};
//         var path='/v1/checkouts';
//         var d = {
//             'authentication.userId':'8ac9a4ca68c1e6640168d9f9c8b65f69',
//             'authentication.password':'Kk8egrf9Fh',
//             'authentication.entityId':'8ac9a4ca68c1e6640168d9fa15e35f6d',

//             // 'authentication.userId':'8ac7a4c7679c71ed0167b705a421278d',
//             // 'authentication.password':'7MbQFsQdCj',
//             // 'authentication.entityId':'8ac7a4c7679c71ed0167b705fd7a2791',
//             'amount':request.body.amount,
//             'currency':request.body.currency,
//             'paymentType':request.body.paymentType,
//             'notificationUrl':request.body.notificationUrl,
//         };

//         let findToken = await hypertoken.find({userId:validateToken._id});
//         if(findToken.length>0){
//             for(let i = 0 ; i < findToken.length; i++){
//                 if(findToken[i].token !="" ||findToken[i].token!=null ){
//                 d[`registrations[${[i]}].id`]=findToken[i].token;}
//             }            
//         }
//         //console.log(d);
//         var data = querystring.stringify(d);
//         //console.log(data);
//         var options = {
//             port: 443,
//            // host:'test.oppwa.com',
//             host: 'oppwa.com',
//             path: path,
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'Content-Length': data.length
//             }
//         };
//         let x;
//         var postRequest = await https.request(options,  function(res) {
//             res.setEncoding('utf8');
//             res.on('data', function (chunk) {
//                 //console.log("asdadadadasdasda",JSON.parse(chunk))
//                 jsonRes = JSON.parse(chunk);
//                 x = JSON.parse(chunk);
//                 //console.log(x);
//                 return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS.EN,data:x});
//             });
//         });
//          postRequest.write(data);
//          postRequest.end();


//     }catch(err){
//     return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});      
//     }
// }


// exports.hyperPayStep2 = async (request,response)=> {
//     try{
//         if(!request.headers['authorization'])
//         return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN.EN});
//         let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
//         if(!validateToken)
//         return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED.EN});
//         let errors =await request.validationErrors();
//         if (errors)
//         return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg,error:errors});

//         var path=`/v1/checkouts/${request.body.checkoutId}/payment`;
//         path += '?authentication.userId=8ac9a4ca68c1e6640168d9f9c8b65f69';
//         path += '&authentication.password=Kk8egrf9Fh';
//         path += '&authentication.entityId=8ac9a4ca68c1e6640168d9fa15e35f6d';
//         var options = {
//             port: 443,
//             host: 'oppwa.com',
//             path: path,
//             method: 'GET',
//         };
//         var postRequest = https.request(options, function(res) {
//             res.setEncoding('utf8');
//             res.on('data', async function (chunk) {
//                 jsonRes = JSON.parse(chunk);
//                 let findToken = await hypertoken.findOne({userId:validateToken._id,token:jsonRes.registrationId});
//                 if(!findToken){
//                     if(jsonRes.registrationId!=null ||jsonRes.registrationId!=undefined ){
//                         let token = new hypertoken();
//                         token.userId = validateToken._id;
//                         token.token = jsonRes.registrationId;
//                         let x = await token.save();
//                         //console.log(x);
//                     }

//                 }    

//                 return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS.EN,data:jsonRes});
//             });
//         });
//         postRequest.end();
//     }catch(err){
//     return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message});      
//     }

// }


exports.hyperPayStep1 = async (request, response) => {
    try {
        console.log(request.body, "bodyyyyyyyyyyyyyyy hyperPayStep1");
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        // const random = Math.random() * (1000 - 50) + 1000;

        //   if (validateToken.isSubscriptiveUser) return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.PURCHASED_SUB.EN });
        // request.body.cardNumber = '424242424242'
        //console.log(request.body.amount, 'amount');
        //console.log(request.body.currency, 'currency');
        //console.log(request.body.paymentType, 'paymentType');
        //console.log(request.body.notificationUrl, 'notificationUrl');
        //console.log(request.body.isSubscriptionPlan, 'isSubscriptionPlan');
        // console.log(request.body, 'cardNumber');
        let jsonRes = {};
        var path = '/v1/checkouts';
        var d = {
            //   'authentication.userId': '8ac9a4ca68c1e6640168d9f9c8b65f69',
            //   'authentication.password': 'Kk8egrf9Fh',
            //   'authentication.entityId': '8ac9a4ca68c1e6640168d9fa15e35f6d',

            amount: Number.parseFloat(Number(request.body.amount)).toFixed(2),
            currency: request.body.currency,
            paymentType: request.body.paymentType,
            notificationUrl: request.body.notificationUrl,
            merchantTransactionId: request.body.merchantTransactionId,
            'customer.email': request.body.email,
            'customer.givenName': request.body.givenName,
            'customer.surname': request.body.surname,
            'billing.street1': "Olayih",
            'billing.city': "Riyadh",
            'billing.state': "Central",
            'billing.country': "SA",
            'billing.postcode': "12611",
            createRegistration: 'true'
        };
        //    d.authentication = {}
        // d['authentication.userId'] = '8ac7a4c7679c71ed0167b705a421278d'
        // d['authentication.password'] = '7MbQFsQdCj'

        if (request.body.isSubscriptionPlan) {
            d.recurringType = "INITIAL";
            // d['authentication.entityId'] = '8ac7a4c86b308f7b016b46012a211942'//moto
            d['authentication.entityId'] = '8acda4c96ade4a49016afe7f214811e3'//moto
            //console.log(">>>>>>>>>>>>>>>>>>>>>d3",d)
        } else {
            // d['authentication.entityId'] = '8ac7a4c7679c71ed0167b705fd7a2791'
            d['authentication.entityId'] = '8ac9a4ca68c1e6640168d9fa15e35f6d'
        }
        //console.log(d);
        //    let findToken = await hypertoken.find({ userId: validateToken._id });
        //    if (findToken.length > 0) {
        //       for (let i = 0; i < findToken.length; i++) {
        //          if (findToken[i].token != '' || findToken[i].token != null) {
        //             d[`registrations[${[ i ]}].id`] = findToken[i].token;
        //          }
        //       }
        //    }
        //console.log(d);
        var data = querystring.stringify(d);
        var options = {
            port: 443,
            //host: 'test.oppwa.com',
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
        let x;
        // let url = 'https://oppwa.com' + path
        // await axios.post(url, data, {
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //         'Content-Length': data.length,
        //         "Authorization": 'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA==',
        //         // "Authorization": 'Bearer OGFjN2E0Yzc2NzljNzFlZDAxNjdiNzA1YTQyMTI3OGR8N01iUUZzUWRDag==',
        //     },
        // }).then( async (resp) => {
        var postRequest = await https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', async function (chunk) {
                //  //console.log('asdadadadasdasda', JSON.stringify(JSON.parse(chunk)));
                console.log('asdadadadasdasda', chunk);
                let jsonRes = JSON.parse(chunk);
                // console.log('---------asdadadadasdasda', resp);
                // let jsonRes = resp.data
                console.log('asdadadadasdasda', jsonRes);

                let cardCheck = await User.findOneAndUpdate({ _id: validateToken._id, 'cardRegistationId.cardNumber': { $ne: request.body.cardNumber } }, { $addToSet: { cardRegistationId: { cardNumber: request.body.cardNumber, registrationId: jsonRes.id } } })
                //console.log('++++++++++++++*****************', cardCheck)
                let cardCheckStatus = true
                if (cardCheck && cardCheck._id) {
                    cardCheckStatus = false
                }
                //  x = JSON.parse(chunk);
                //  //console.log(x);
                jsonRes.cardCheckStatus = cardCheckStatus
                // console.log('+++++++++++++111111', JSON.stringify(jsonRes))
                return response
                    .status(200)
                    .json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: jsonRes });
            })
            // .catch(err => {
            //     console.log('err', err);
            //     return response.status(500).json({ success: 0, statusCode: 500, msg: err.message, err: err.message })
            // })
        });
        postRequest.write(data);
        postRequest.end();
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.hyperPayStep2 = async (request, response) => {
    try {
        console.log(request.body, typeof (request.body.isSubscriptionPlan), "bodyyyyyyyyyyyyyyy hyperPayStep2");
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        var path = `/v1/checkouts/${request.body.checkoutId}/payment`;
        //    path += '?authentication.userId=8ac9a4ca68c1e6640168d9f9c8b65f69';
        //    path += '&authentication.password=Kk8egrf9Fh';
        //    path += '&authentication.entityId=8ac9a4ca68c1e6640168d9fa15e35f6d';
        // path += '?authentication.userId=8ac7a4c7679c71ed0167b705a421278d'
        // path += '&authentication.password=7MbQFsQdCj'
        //MODO 8acda4c96ade4a49016afe7f214811e3
        // request.body.isSubscriptionPlan = true
        if (request.body.isSubscriptionPlan) {
            // d.recurringType = "INITIAL";
            //path += '&authentication.entityId=8ac7a4c86b308f7b016b46012a211942'
            path += '?authentication.entityId=8acda4c96ade4a49016afe7f214811e3'
        } else {
            // path += '&authentication.entityId=8ac7a4c7679c71ed0167b705fd7a2791'
            path += '?authentication.entityId=8ac9a4ca68c1e6640168d9fa15e35f6d'
        }
        console.log('++++++++++++++++++', path);

        // var options = {
        //     port: 443,
        //     host: 'oppwa.com',
        //     //host: 'test.oppwa.com',
        //     path: path,
        //     method: 'GET',
        //     headers: {
        //         Authorization:
        //             'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA=='
        //     }
        // };
        //console.log('++++++++++++++++++opt', options);
        let url = `https://oppwa.com` + path
        await axios.get(url, {
            headers: {
                // 'Content-Type': 'application/x-www-form-urlencoded',
                // 'Content-Length': data.length,
                "Authorization": 'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA==',
                // "Authorization": 'Bearer OGFjN2E0Yzc2NzljNzFlZDAxNjdiNzA1YTQyMTI3OGR8N01iUUZzUWRDag==',
            },
        }).then(async resp => {
            // var postRequest = https.request(options, function (res) {

            //     res.setEncoding('utf8');
            //     res.on('data', async function (chunk) {
            //         //console.log('++++++++++++++++++chunk', chunk);

            //         jsonRes = JSON.parse(chunk);
            let jsonRes = resp.data
            console.log("jsonRes", jsonRes, "jsonRes");
            let transection = new Transections();
            transection.jsonRes = jsonRes;
            transection.save();
            let findToken = await hypertoken.findOne({ userId: validateToken._id, token: jsonRes.registrationId });

            const resultCode = jsonRes.result.code;
            //console.log(resultCode,"resulttttttttttt")
            const successPattern = /(000\.000\.|000\.100\.1|000\.[36])/;
            const manuallPattern = /(000\.400\.0[^3]|000\.400\.100)/;
            const match1 = successPattern.test(resultCode);
            const match2 = manuallPattern.test(resultCode);
            let msg = '';
            let paymentStatus = 0;
            if (match1 || match2) {
                // console.log('__________', jsonRes)
                const card = new Card({
                    userId: validateToken._id,
                    token: jsonRes.registrationId,
                    brand: jsonRes.paymentBrand,
                    bin: jsonRes.card.bin,
                    last4Digits: jsonRes.card.last4Digits,
                    expiryMonth: jsonRes.card.expiryMonth,
                    expiryYear: jsonRes.card.expiryYear,
                    holder: jsonRes.card.holder,
                    merchantTransactionId: jsonRes.merchantTransactionId
                });
                const cardSavingResult = await card.save();
                const reverseResult = await reversePayment(jsonRes.id);
                //console.log(reverseResult);
                msg = 'Payment is Successful';
                paymentStatus = 1;

            } else {
                msg = 'Payment is Rejected';
                paymentStatus = 0;

                return response
                    .status(400)
                    .json({ success: 1, statusCode: 400, msg: jsonRes.result.description, paymentStatus: paymentStatus, data: jsonRes });
            }


            if (!findToken && (match1 || match2)) {
                if (jsonRes.registrationId != null || jsonRes.registrationId != undefined) {
                    let token = new hypertoken();
                    token.userId = validateToken._id;
                    token.token = jsonRes.registrationId;
                    let x = await token.save();
                    //console.log(x);
                }
            }

            //console.log('_______________________', jsonRes, msg, paymentStatus)
            return response
                .status(200)
                .json({ success: 1, statusCode: 200, msg: msg, paymentStatus: paymentStatus, data: jsonRes });
        }).catch(err => {
            console.log('_______________________', err)
            return response
                .status(500)
                .json({ success: 0, statusCode: 500, msg: err.message, err: err.message })
        })

        // });
        // postRequest.on('error', (error) => {
        //     console.log(error, 'errorerrorerrorerrorerrorerror')
        // })
        // postRequest.end();
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

const reversePayment = async (userId, paymentId) => {
    var path = `/v1/payments/${paymentId}`;
    var data = querystring.stringify({
        // entityId: '8ac7a4c7679c71ed0167b705fd7a2791',
        entityId: '8ac9a4ca68c1e6640168d9fa15e35f6d',
        paymentType: 'RV',
    });
    //const url = 'https://test.oppwa.com/' + path;
    const url = 'https://oppwa.com/' + path;
    try {
        const result = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
                // Authorization:
                //     'Bearer OGFjN2E0Yzc2NzljNzFlZDAxNjdiNzA1YTQyMTI3OGR8N01iUUZzUWRDag==',
                Authorization:
                    'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA==',
            },
        });
        const transaction = new Transaction({
            userId: request.userId,
            payLoad: JSON.stringify(data),
        });
        const savingTransactionResult = await transaction.save();

        return 1;
    } catch (err) {
        //  //console.log(err);
        return 0;
    }
};

exports.recurringPayment = async (request, response) => {
    request.checkBody('amount', AppConstraints.AMOUNT).notEmpty();
    request.checkBody('cardRegId', AppConstraints.CARD_REG_ID).notEmpty();
    console.log(request.body, 'request.body')
    const cardRegId = request.body.cardRegId;
    const amount = Number(request.body.amount);
    const random = Math.random() * (1000 - 50) + 1000;
    //url = `https://test.oppwa.com/v1/registrations/${cardRegId}/payments`;
    url = `https://oppwa.com/v1/registrations/${cardRegId}/payments`;
    var d = {
        //"entityId": '8ac7a4c86b308f7b016b46012a211942', //you need to use the recurring entityID
        "entityId": '8acda4c96ade4a49016afe7f214811e3',
        "amount": Number.parseFloat(amount).toFixed(2),
        "currency": 'SAR',
        "paymentType": 'DB',
        //   merchantTransactionId: random,
        "merchantTransactionId": request.body.merchantTransactionId,
        "recurringType": 'REPEATED', //For recurring
    };
    try {
        var data = querystring.stringify(d);
        var path = `/v1/registrations/${cardRegId}/payments`

        var options = {
            port: 443,
            //host: 'test.oppwa.com',
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
        console.log(data, 'data')

        // const res = await axios.post(url, data, {
        //     headers: {
        //         // 'Content-Type': 'application/x-www-form-urlencoded',
        //         // 'Content-Length': data.length,
        //         "Authorization": 'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA==',
        //         // "Authorization": 'Bearer OGFjN2E0Yzc2NzljNzFlZDAxNjdiNzA1YTQyMTI3OGR8N01iUUZzUWRDag==',
        //     },
        // });

        var postRequest = await https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', async function (chunk) {
                //  //console.log('asdadadadasdasda', JSON.stringify(JSON.parse(chunk)));

                let jsonRes = JSON.parse(chunk);
                console.log('asdadadadasdasda', jsonRes);
                //console.log(res.data,'res.data');
                // jsonRes = res.data;
                const resultCode = jsonRes.result.code;
                //console.log(resultCode,"resulttttttttttt")
                const successPattern = /(000\.000\.|000\.100\.1|000\.[36])/;
                const manuallPattern = /(000\.400\.0[^3]|000\.400\.100)/;
                const match1 = successPattern.test(resultCode);
                const match2 = manuallPattern.test(resultCode);
                let msg = '';
                let paymentStatus = 0;
                if (match1 || match2) {

                    let transection = new Transections();
                    transection.jsonRes = jsonRes;
                    transection.save();
                    return response.status(200).json({
                        success: 1,
                        statusCode: 200,
                        msg: 'success',
                        data: jsonRes,
                    });
                } else {
                    msg = 'Payment is Rejected';
                    paymentStatus = 0;

                    return response
                        .status(500)
                        .json({ success: 1, statusCode: 500, msg: jsonRes.result.description, paymentStatus: paymentStatus, data: jsonRes });
                }
            })
        })
        postRequest.write(data);
        postRequest.end();
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            statusCode: 500,
            success: 0,
            msg: error.message,
            err: error.message,
        });
    }
};

exports.cardCheck = async (request, response) => {
    try {
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        if (request.body.registrationId) {
            let criteria = {
                _id: validateToken._id,
            }
            if (request.body.cardNumber) criteria['cardRegistationId.cardNumber'] = request.body.cardNumber
            if (request.body.registrationId) criteria['cardRegistationId.registrationId'] = request.body.registrationId

            let checkCard = await User.findOne(criteria)
            if (checkCard && checkCard._id) {
                return response
                    .status(200)
                    .json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: { status: true } });
            } else {
                return response
                    .status(200)
                    .json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: { status: false } });
            }
        }
    } catch (e) {
        //console.log(e)
    }
}

exports.hyperPayPlanPurchaseToken = async (request, response) => {
    try {
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let getPlan //= await

        var path = '/v1/payments';
        var data = querystring.stringify({
            'authentication.userId': '8ac9a4ca68c1e6640168d9f9c8b65f69',
            'authentication.password': 'Kk8egrf9Fh',
            'authentication.entityId': '8ac9a4ca68c1e6640168d9fa15e35f6d',
            'amount': '10',//plan.price,
            'currency': 'EUR',
            'paymentBrand': request.body.paymentBrand,
            'paymentType': 'DB',
            'card.number': request.body.number,
            'card.holder': request.body.holderName,
            'card.expiryMonth': request.body.expiryMonth,
            'card.expiryYear': request.body.expiryYear,
            'card.cvv': request.body.cvv,
            'recurringType': 'INITIAL',
            'createRegistration': 'true'
        });
        var options = {
            port: 443,
            //host: 'https://test.oppwa.com',
            host: 'https://oppwa.com',
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
            }
        };
        var postRequest = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                jsonRes = JSON.parse(chunk);
                return callback(jsonRes);
            });
        });
        postRequest.write(data);
        postRequest.end();
    } catch (err) {

    }
};

exports.hyperpayPlanPurchaseToken1 = async (request, response) => {
    try {
        var path = '/v1/registrations' + request.body.registrationId + '/payments';
        var d = {
            'authentication.userId': '8ac9a4ca68c1e6640168d9f9c8b65f69',
            'authentication.password': 'Kk8egrf9Fh',
            'authentication.entityId': '8acda4c96ade4a49016afe7f214811e3',//moto
            amount: request.body.amount,
            currency: request.body.currency,
            // paymentType: request.body.paymentType,
            paymentType: "DB",
            recurringType: "REPEATED",
            notificationUrl: request.body.notificationUrl,
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
        // }
        //console.log(d,'hyperpayPlanPurchaseToken1');
        // let findToken = await hypertoken.find({ userId: validateToken._id });
        // if (findToken.length > 0) {
        //     for (let i = 0; i < findToken.length; i++) {
        //         if (findToken[i].token != '' || findToken[i].token != null) {
        //             d[`registrations[${[ i ]}].id`] = findToken[i].token;
        //         }
        //     }
        // }
        // //console.log(d);
        var data = querystring.stringify(d);
        //console.log(data);
        var options = {
            port: 443,
            //host: 'test.oppwa.com',
            host: 'oppwa.com',
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };
        let x;
        var postRequest = await https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //console.log('asdadadadasdasda', JSON.parse(chunk));
                jsonRes = JSON.parse(chunk);
                x = JSON.parse(chunk);
                //console.log(x);
                return response
                    .status(200)
                    .json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: x });
            });
        });
        postRequest.write(data);
        postRequest.end();
    } catch (err) {
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};

exports.bookingDetails = async (request, response) => {
    try {

        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        request.checkBody('bookingId', 'booking id is required').notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });



        let bookingsData = await Bookings.findOne({ _id: request.body.bookingId })
            .sort({ "_id": -1 })
            .populate({ path: 'laundryId', select: {} });
        return response.status(200).json({ success: 1, msg: "SUCCESS", data: bookingsData });
    } catch (err) {

    }
}
// db.createUser(
//     {
//       user: "adminLaundry",
//       pwd: "6B42385C9980C1201B667663FD30B65E7221C793B46B3C54C604BA72BBBCFA0C",
//       roles: [ { role: "root", db: "admin" } ]
//     }
//      )


//      db.createUser({
//            user: "laundryDev",
//            pwd: "6B42385C9980C1201B667663FD30B65E7221C793B46B3C54C604BA72BBBCFA0C",
//            roles: [ { role: "dbOwner", db: "3ndk" } ]
//     })


// mongo --port 27017 -u "laundryDev" -p "6B42385C9980C1201B667663FD30B65E7221C793B46B3C54C604BA72BBBCFA0C" --authenticationDatabase "3ndk"

exports.cardPayment = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });




        var path = "/v1/checkouts";
        var d = {
            "authentication.userId": "8ac7a4ca6712a86301672c352c423ff7",
            "authentication.password": "36zGNTtS6G",
            "authentication.entityId": "8ac7a4ca6712a86301672c35628f3ffb",
            amount: "1.00",
            currency: "SAR",
            // testMode: "EXTERNAL",
            paymentType: "DB",
            // 'shopperResultUrl': "3ndkpayment://result",
            'notificationUrl': request.body.notificationUrl,
        };

        var data = querystring.stringify(d);
        var options = {
            port: 443,
            host: "oppwa.com",
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": data.length
            }
        };
        var postRequest = https.request(options, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                var jsonRes = JSON.parse(chunk);

                return response.status(200).json({ success: 1, data: jsonRes })
            });
        });
        postRequest.write(data);
        postRequest.end();



        // var path = '/v1/payments';
        // var data = querystring.stringify({
        //     // 'authentication.userId':"8ac7a4c7679c71ed0167b705a421278d",
        //     // 'authentication.password':"7MbQFsQdCj" ,
        //     // 'authentication.entityId': "8ac7a4c7679c71ed0167b705fd7a2791",
        //     // 'amount': request.body.amount,
        //     // 'currency': request.body.currency,
        //     // 'paymentBrand': request.body.paymentBrand,
        //     // 'paymentType': request.body.paymentType,
        //     // 'card.number': request.body.cardNumber,
        //     // 'card.holder': request.body.cardHolder,
        //     // 'card.expiryMonth': request.body.cardExpiryMonth,
        //     // 'card.expiryYear': request.body.cardExpiryYear,
        //     // 'card.cvv': request.body.cardCvv,
        //     // 'shopperResultUr,
        //     // 'createRegistration': 'true'

        //         'authentication.userId':'8ac7a4c7679c71ed0167b705a421278d',
        //         'authentication.password':'7MbQFsQdCj',
        //         'authentication.entityId':'8ac7a4c7679c71ed0167b705fd7a2791',
        //         'amount':request.body.amount,
        //         'currency':request.body.currency,
        //         'paymentType':request.body.paymentType,
        //         'shopperResultUrl': "3ndkpayment://result",
        //         'notificationUrl':request.body.notificationUrl,
        //         'testMode':'EXTERNAL',

        //     // 'createRegistration':'true'


        // });
        // var options = {
        //     port: 443,
        //     host: "test.oppwa.com",
        //     path: path,
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //         'Content-Length': data.length
        //     }
        // };










        // var postRequest = https.request(options, function (res) {
        //     res.setEncoding('utf8');
        //     res.on('data', function (chunk) {
        //         jsonRes = JSON.parse(chunk);
        //         if (jsonRes.result.code == "000.100.110")
        //         {
        //             return response.status(400).json({success:0,statusCode:400,msg:"Fail",data:jsonRes});
        //         } else{
        // let c = new card();
        // c.userId = validateToken._id,
        // c.token = jsonRes.registrationId,
        // c.bin = jsonRes.card.bin,
        // c.last4Digits = jsonRes.card.last4Digits,
        // c.holder = jsonRes.card.holder,
        // c.expiryMonth = jsonRes.card.expiryMonth,
        // c.expiryYear = jsonRes.card.expiryYear
        // c.save();
        // return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS.EN,data:jsonRes});

        //         }
        //     });
        // });
        // postRequest.write(data);
        // postRequest.end();
    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });

    }
};


exports.getAllCards = async (request, response) => {
    try {
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? AppConstraints.ACCESS_TOKEN.EN : AppConstraints.ACCESS_TOKEN.AR });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: langaugeType == "EN" ? AppConstraints.UNAUTHORIZED.EN : AppConstraints.UNAUTHORIZED.AR });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        //console.log('_____________', validateToken._id)
        let cardData = await Card.find({ userId: validateToken._id });
        return response.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: cardData });


    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.deleteCard = async (request, response) => {
    const cardId = request.body.cardId;
    const cardRegId = request.body.cardRegId;
    //console.log(cardId, cardRegId);
    //let url = `https://test.oppwa.com/v1/registrations/${cardRegId}?entityId=8ac7a4c7679c71ed0167b705fd7a2791`;
    let url = `https://oppwa.com/v1/registrations/${cardRegId}?entityId=8ac9a4ca68c1e6640168d9fa15e35f6d`;

    try {
        const res = await axios.delete(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Authorization:
                //     'Bearer OGFjN2E0Yzc2NzljNzFlZDAxNjdiNzA1YTQyMTI3OGR8N01iUUZzUWRDag==',
                Authorization:
                    'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA==',
            },
        });

        //console.log(res);

        //   const transaction = new Transaction({
        //     userId: request.userId,
        //     payLoad: JSON.stringify(res.data),
        //   });
        //   const savingTransactionResult = await transaction.save();
        if (res) {
            const deleteResult = await Card.findOneAndRemove({ _id: cardId });
            //console.log(deleteResult);
        }
        return response.json({ message: 'successfully deleted' });
    } catch (err) {
        //console.log(err);
    }
};

exports.checkout = async (request, response) => {
    try {
        var path = '/v1/checkouts';
        var data = querystring.stringify({
            // 'authentication.userId': "8ac7a4c7679c71ed0167b705a421278d",
            // 'authentication.password': "7MbQFsQdCj",
            // 'authentication.userId': '8ac9a4ca68c1e6640168d9f9c8b65f69',
            //   'authentication.password': 'Kk8egrf9Fh',
            // 'authentication.entityId': "8ac7a4c7679c71ed0167b705fd7a2791",
            'authentication.entityId': "8ac9a4ca68c1e6640168d9fa15e35f6d",
            'amount': request.body.amount,
            'currency': request.body.currency,
            'paymentType': request.body.paymentType,
            'registrations[0].id': request.body.id,
            'createRegistration': 'true'
        });
        var options = {
            port: 443,
            //host: "test.oppwa.com",
            host: "oppwa.com",
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
                Authorization:
                    'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA=='
            }
        };
        var postRequest = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                jsonRes = JSON.parse(chunk);
                //console.log(jsonRes);
                if (jsonRes.result.code == "000.200.100") {
                    return response.status(400).json({ success: 0, statusCode: 400, msg: "Fail", data: jsonRes });
                } else
                    return response.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: jsonRes });

            });
        });
        postRequest.write(data);
        postRequest.end();
    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
};


exports.checkBookingsCount = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let maxCount = false;   //true for deliveryChargesApplied false for not applied
        let plan;
        let planb = validateToken.subscryptinPlans;
        //console.log(planb,"ppppppppppppppppppppppppppppp", validateToken.subscryptinPlans)
        // if(!validateToken.isSubscriptiveUser || planb.toString() == "5b1621e148151c4f79f9af55"){
        //     //  thrusday , friday , saturday;
        //     let offset = 10800000;
        //     let date = +new Date();
        //     date = date + offset;
        //     let day = new Date(date).getDay();
        //     //console.log(day,date,"day dateeeeeeeeeeee")
        //     // if(day == 4 || day == 5 || day == 6){
        //     //     return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?"No plan added":"لم تتم إضافة أي خطة"});
        //     // }
        // }
        let userSubsciptionPlan = {};

        if (validateToken.subscryptinPlans)
            userSubsciptionPlan = await SubscriptionPlane.findOne({ _id: validateToken.subscryptinPlans });

        //console.log("ONE", request.query.pickUpDate);

        if (userSubsciptionPlan) {
            let current = new Date(parseInt(request.query.pickUpDate));
            let weekstart = current.getDate() - current.getDay();
            let weekend = weekstart + 6;
            let monday = new Date(current.setDate(weekstart)).setHours(0, 0, 0, 0);
            let sunday = new Date(current.setDate(weekend)).setHours(24, 0, 0, 0);
            //console.log("TWO", monday, sunday);

            if (!userSubsciptionPlan.weekendService) {
                let date = new Date(parseInt(request.query.pickUpDate));
                let day = date.getDay();
                if (day == 5 || day == 6 || day == 0) {//friday,saturday,sunday
                    //console.log("choose another date for subscription plan");
                    maxCount = true;
                } else {
                    //console.log("can order");
                    maxCount = false;
                }
            } else {
                //console.log("plan order");
                maxCount = false;
            }
            let users = [];
            //console.log(users,"userMemberuserMemberuserMemberuserMemberuserMember");
            let userMember = await userAndMemberSubscription.find({ userId: validateToken._id, isExpired: false }).sort({ perchageDate: -1 }).limit(1);
            //console.log(userMember,"userMemberuserMemberuserMemberuserMemberuserMember");
            // let purchaseId = userMember.userSubscriptionPlanId
            if (userMember.length) {
                let listMembers = await userAndMemberSubscription.find({ userSubscriptionPlanId: userMember[0].userSubscriptionPlanId, isExpired: false, isDelete: false }).sort({ perchageDate: -1 });
                //console.log(listMembers,"listmemberslistmemberslistmemberslistmemberslistmembers");
                if (listMembers.length) {
                    for (let i = 0; i < listMembers.length; i++) {
                        users.push(listMembers[i].userId);
                    }
                }
            }
            let criteria = {
                pickUpDate: { $gte: monday, $lte: sunday },
                // userId:validateToken._id,
                userId: { $in: users },
                status: { $ne: AppConstraints.APP_CONST_VALUE.CANCELLED },
                subplanid: validateToken.subscryptinPlans
            };
            //console.log("bc",criteria,"bc");
            let findBookingInThisWeek = await Bookings.count(criteria);
            //console.log(findBookingInThisWeek,"findBookingInThisWeekfindBookingInThisWeekfindBookingInThisWeek", userSubsciptionPlan);
            if ((findBookingInThisWeek) >= userSubsciptionPlan.noOfWeeklyOrders) {
                maxCount = true
            } else {
                if (maxCount) {
                    maxCount = false
                }
            }

            // if(userSubsciptionPlan.planName=="Basic"){
            //
            //
            //
            //     // let offset = 10800000;
            //     // let date = +new Date();
            //     // date = date + offset;
            //     // let day = new Date(date).getDay();
            //     // //console.log(day,date,"day dateeeeeeeeeeee")
            //     // if(day == 4 || day == 5 || day == 6){
            //     //     return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?"No plan added":"لم تتم إضافة أي خطة"});
            //     // }
            //
            //
            //
            //     //console.log("THREE");
            //     plan = "Basic";
            //     let criteria={
            //         pickUpDate:{$gte:monday,$lte:sunday},
            //         userId:validateToken._id,
            //         status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
            //         subplanid:validateToken.subscryptinPlans
            //     };
            //     //console.log("bc",criteria,"bc");
            //    let findBookingInThisWeek=await Bookings.count(criteria);
            //     if(findBookingInThisWeek>=1){
            //         maxCount = true;
            //     }
            // }
            //
            // if(userSubsciptionPlan.planName=="Plus"){
            //     //console.log("FOUR");
            //     plan = "Plus"
            //
            //     let criteria={
            //         pickUpDate:{$gte:monday,$lte:sunday},
            //         userId:validateToken._id,
            //         status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
            //         subplanid:validateToken.subscryptinPlans
            //
            //     }
            //     let findBookingInThisWeek=await Bookings.count(criteria)
            //     if(findBookingInThisWeek>=2)
            //     maxCount = true;
            // }
            //
            //
            // if(userSubsciptionPlan.planName=="Family"){
            //     plan = "Family"
            //
            //     let criteria={
            //         pickUpDate:{$gte:monday,$lte:sunday},
            //         userId:validateToken._id,
            //         status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
            //         subplanid:validateToken.subscryptinPlans
            //     }
            //     let findBookingInThisWeek=await Bookings.count(criteria)
            //     if(findBookingInThisWeek>=3)
            //     maxCount = true;
            // }
            data = {
                maxCount: maxCount,
                plan: userSubsciptionPlan.planName
            }

            //console.log(maxCount, userSubsciptionPlan.planName)
            return response.status(200).json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: data });
        }
        // }
        //
        //
        // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?"No plan added":"لم تتم إضافة أي خطة"});




    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.cancleSubscription = async (request, response) => {
    try {
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });

        let userData = await User.findOne({ _id: validateToken._id })
        let user = await User.findOneAndUpdate({ _id: validateToken._id }, { $set: { hasSubscribed: false, subscryptinPlans: null, isSubscriptiveUser: false } }, { lean: true });//subscriptitioti_plan:null
        if (user.isActualPurchaser) {
            let userArray = [], _idArray = []

            //console.log('***********7',user._id, userData.subscryptinPlans)
            let subPlanData = await userSubscriptionPlan.findOneAndUpdate({ userId: user._id, subscriptionPlanId: userData.subscryptinPlans }, { $set: { isDelete: true } }, { lean: true });

            //console.log('***********8',subPlanData.subscriptionPlanId, subPlanData.userId)
            let getUserAndMemberData = await userAndMemberSubscription.find({ subscriptionPlanId: userData.subscryptinPlans, purchaserId: subPlanData.userId, isDelete: false })

            //console.log('***********9',getUserAndMemberData)
            if (getUserAndMemberData && getUserAndMemberData.length) {
                getUserAndMemberData.map(obj => {
                    userArray.push(obj.userId)
                    _idArray.push(mongoose.Types.ObjectId(obj._id))
                })
            }

            //console.log('***********10',userArray, _idArray)
            if (_idArray.length) {
                for (let a of _idArray) {
                    await userAndMemberSubscription.findOneAndUpdate({ _id: a }, { $set: { isDelete: true } }, { lean: true })
                }
            }

            if (userArray.length) {
                await User.findOneAndUpdate({ _id: { $in: userArray } }, { $set: { hasSubscribed: false, subscryptinPlans: null, isSubscriptiveUser: false } })
            }
        } else {
            let updateData = await userAndMemberSubscription.findOneAndUpdate({ subscriptionPlanId: userData.subscryptinPlans, purchaserId: userData._id }, { $set: { isDeleted: true } })
            //console.log('**************11',updateData)
        }

        let userUpdatedData = await User.findOne({ _id: validateToken._id })
        return response.status(200).json({ success: 1, statusCode: 200, msg: `SUCCESSFULLY CANCELED SUBSCRIPTION`, data: userUpdatedData });

    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.subscriptionStatus = async (request, response) => {
    try {
        if (!request.headers['authorization'])
            return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
        let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        if (!validateToken)
            return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });


        let ifsubscribed = await User.findOne({ _id: validateToken._id });
        if (ifsubscribed.isSubscriptiveUser == false || ifsubscribed.isSubscriptiveUser == "false") {
            // return response.status(400).json({success:0,statusCode:400,msg:`NOT SUBSCRIBED TO ANY PLAN`});
            let data = {
                planNameAR: null,
                planNameEN: null,
                startDate: null,
                expiryDate: null,
                hasSubscribed: validateToken.hasSubscribed

            }
            return response.status(200).json({ success: 1, statusCode: 200, msg: "SUCCESS", data: data });

        }

        let plandata = await plan.findOne({ _id: validateToken.subscryptinPlans });
        let latesPlanItem = await userSubscription.find({ userId: validateToken._id, subscriptionPlanId: validateToken.subscryptinPlans }).sort({ perchageDate: -1 }).limit(1);
        let data = {};
        if (latesPlanItem.length) {
            //console.log(latesPlanItem,"latesPlan_Itemlates_PlanItem")
            data = {
                planNameAR: plandata.planNameAr,
                planNameEN: plandata.planName,
                startDate: latesPlanItem[0].perchageDate,
                expiryDate: new Date(latesPlanItem[0].expiryDate).getTime(),
                hasSubscribed: validateToken.hasSubscribed
            }
        }
        return response.status(200).json({ success: 1, statusCode: 200, msg: "SUCCESS", data: data });

    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}
exports.freeOrderAndSlotChecker = async (request, response) => {
    try {
        let langaugeType = request.body.langaugeType;

        // if(!request.headers['authorization'])
        // return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.ACCESS_TOKEN.EN});
        // let validateToken=await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
        // if(!validateToken)
        // return response.status(401).json({statusCode:401,success:0,msg:AppConstraints.UNAUTHORIZED.EN});
        request.checkBody('pickUpDate', AppConstraints.PICK_UP_DATE).notEmpty();
        request.checkBody('slotId', AppConstraints.SLOT_ID).notEmpty();
        request.checkBody('laundryId', AppConstraints.LAUNDRY_ID).notEmpty();
        request.checkBody('langaugeType', langaugeType == "EN" ? AppConstraints.LANGUAGE_TYPE.EN : AppConstraints.LANGUAGE_TYPE.AR).notEmpty();

        let errors = await request.validationErrors();
        if (errors)
            return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
        let dateData = new Date(parseInt(request.body.pickUpDate));

        // let found = await log.findOne({userId:validateToken._id});
        // //console.log(found,"FOUND");
        let discount = 0;

        //         if(found){//&& (found.orderfree == true)){//&&(found.freeOrderCount>0)){
        //             if(found.freeOrderCount ==1){
        //                 //console.log("HERE1");
        //                 // await log.update({userId:validateToken._id},{$inc:{freeOrderCount:-1}});
        //                 // await log.update({userId:validateToken._id},{$set:{isActive:false}});
        //                 discount = found.discount;
        //             } else if(found.freeOrderCount == 2){
        //                 //console.log("HERE2");
        //                 // await log.update({userId:validateToken._id},{$inc:{freeOrderCount:-1}});
        //                 // discount = found.discount;
        //             }else {

        //                 if(validateToken.isSubscriptiveUser){
        //                     //console.log("BAUGHT");
        //                     let userSubsciptionPlan={};

        //                     if(validateToken.subscryptinPlans)
        //                     userSubsciptionPlan=await SubscriptionPlane.findOne({_id:validateToken.subscryptinPlans});

        //                     //console.log("ONE");

        //                     if(userSubsciptionPlan){
        //                         let current = new Date(parseInt(request.body.pickUpDate));
        //                         let weekstart = current.getDate()-current.getDay() +1;    
        //                         let weekend = weekstart+6;
        //                         let monday = new Date(current.setDate(weekstart)).getTime();  
        //                         let sunday = new Date(current.setDate(weekend)).getTime();
        //                         //console.log("TWO");

        //                         if(userSubsciptionPlan.planName=="Basic"){
        //                             //console.log("THREE");

        //                             let criteria={
        //                                 pickUpDate:{$gte:monday,$lte:sunday},
        //                                 laundryId:request.body.laundryId,
        //                                 userId:validateToken._id,
        //                                 status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
        //                                 subplanid:validateToken.subscryptinPlans
        //                             }
        //                         // let findBookingInThisWeek=await Bookings.count(criteria)
        //                             // if(findBookingInThisWeek==1)
        //                             // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_ONE_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_ONE_IN_THIS_WEEK.AR})
        //                         }

        //                         if(userSubsciptionPlan.planName=="Plus"){
        //                             //console.log("FOUR");

        //                             let criteria={
        //                                 pickUpDate:{$gte:monday,$lte:sunday},
        //                                 laundryId:request.body.laundryId,
        //                                 userId:validateToken._id,
        //                                 status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
        //                                 subplanid:validateToken.subscryptinPlans

        //                             }
        //                             // let findBookingInThisWeek=await Bookings.count(criteria)
        //                             // if(findBookingInThisWeek==2)
        //                             // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_TWO_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_TWO_IN_THIS_WEEK.AR})    
        //                         }


        //                         if(userSubsciptionPlan.planName=="Family"){
        //                             // //console.log("FOUR");

        //                             let criteria={
        //                                 pickUpDate:{$gte:monday,$lte:sunday},
        //                                 laundryId:request.body.laundryId,
        //                                 userId:validateToken._id,
        //                                 status:{$ne:AppConstraints.APP_CONST_VALUE.CANCELLED},
        //                                 subplanid:validateToken.subscryptinPlans

        //                             }
        //                             // let findBookingInThisWeek=await Bookings.count(criteria)
        //                             // if(findBookingInThisWeek==3)
        //                             // return response.status(400).json({success:0,statusCode:400,msg:langaugeType=="EN"?AppConstraints.ALREADY_BOOK_THREE_IN_THIS_WEEK.EN:AppConstraints.ALREADY_BOOK_THREE_IN_THIS_WEEK.AR})    
        //                         }

        //                     }
        //                 }else{

        //                     return response.status(400).json({statusCode:400,success:0,msg:'YOUR FREE ORDERS ARE OVER'})
        //                 }


        //     } 
        // }
        let fordistrict = await Laundry.findOne({ _id: request.body.laundryId });
        // //console.log(fordistrict.districtId+"11111111111111");

        let criteria = {
            userType: AppConstraints.DRIVER,
            //  cityName:findLaundryCity.cityName,
            districtId: { $in: [fordistrict.districtId] },
            isAvailable: true,
            isOnline: true,
        };


        let findDriver0 = await User.find(criteria).sort({ load: 1 }).limit(1);


        let slotCriteria = {
            slotId: request.body.slotId,
            driverId: findDriver0[0]._id,
            pickUpDate: { $gte: new Date(dateData.setUTCHours(0, 0, 0)).getTime(), $lte: new Date(dateData.setUTCHours(24, 0, 0)).getTime() }
        }


        let findBookingStatus = await Bookings.findOne(slotCriteria)

        //console.log(slotCriteria,"SLOT CRITERIA");

        //console.log(findBookingStatus,"findBookingStatus");


        if (findBookingStatus) {
            return response.status(400).json({ statusCode: 400, success: 0, msg: langaugeType == "EN" ? 'Slot has filled' : 'الموعد محجوز' })
        }


        return response.status(200).json({ statusCode: 200, success: 1, msg: 'SUCCESS' })

    } catch (err) {
        //console.log(err);
        return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
    }
}

exports.editLocation = async () => {
    try {

    }
    catch (err) {
        throw err
    }
}