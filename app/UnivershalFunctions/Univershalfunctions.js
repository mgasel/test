const jwt = require('jsonwebtoken');
const md5 = require('md5');
const async=require('async');
const nodemailer = require("nodemailer");
const sesTransport=require('nodemailer-ses-transport');
const User=require('../models/User.js');
const Driver=require('../models/User.js');
const Admin=require('../models/Admin.js');
const twilio = require('twilio');
const request = require('request');

exports.GenerateToken=async(val)=>{
    try{
       let createToken=await jwt.sign(val,process.env.JWT_SECRET);
       return createToken;

    }catch(err){
        console.log(err,'error data');  
    }
}


exports.EncryptPassword=async(password)=>{
    try{
        let createPassword=await md5(password);
        return createPassword;
    }catch(err){
        console.log(err,'error data');
    }
}





exports.sendEmailByNodemailerOnly=async(email,content,subject)=>{
    try{

        const transporter = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user:process.env.EMAIL_ADDRESS_DUMMY,
            pass:process.env.PASSWORD
            }
        });


        var mailOptions = {
            from:process.env.EMAIL_ADDRESS_DUMMY,
            to:email,
            subject:subject,
            html:content
        };


       let sendEmail=await transporter.sendMail(mailOptions);

       if(sendEmail.error)   console.log(sendEmai.error,'error while sending email');
      

       return true;


    }catch(err){
        console.log(err,'error data');
        return false;
    }
}



exports.sendEmail = async(email,content,subject)=>{
    try{
        const transporter = await nodemailer.createTransport(sesTransport({
        accessKeyId:process.env.ACCESS_KEY_ID,
        secretAccessKey:process.env.SECRET_ACCESS_KEY,
        region:process.env.REGION
        }));


        const mailOptions = {
            from:process.env.EMAIL_ADDRESS,
            to:email,
            subject:subject,
            html: content
        }

        const sendEmai=await transporter.sendMail(mailOptions);

        if(sendEmai.error)   console.log(sendEmai.error,'error while sending email');
      

        return true;

    }catch(err){
        console.log(err);
        return false;
    }
}



exports.sendEmailToAdmin=async(content,subject)=>{
    try{
        const transporter = await nodemailer.createTransport(sesTransport({
        accessKeyId:process.env.ACCESS_KEY_ID,
        secretAccessKey:process.env.SECRET_ACCESS_KEY,
        region:process.env.REGION
        }));
        const mailOptions={
            from:process.env.EMAIL_ADDRESS,
            to:process.env.EMAIL_ADDRESS,
            subject:subject,
            html:content
        }
        const sendEmai=await transporter.sendMail(mailOptions);
        if(sendEmai.error)   console.log(sendEmai.error,'error while sending email');
      

        return true;

    }catch(err){
        console.log(err);
        return false;
    }
}


exports.DecryptToken=async(val)=>{
    try{
        let decryptValue=await jwt.verify(val,process.env.JWT_SECRET);
        if(!decryptValue)
        return false;
        return decryptValue;
    }catch(err){
        console.log(err,'error decrypt');
        return false;
    }
}


exports.ValidateUserAccessToken=async(token)=>{
    try{
        let tokenData=token.split(" ");
        if(tokenData[1] == "" || tokenData[1] == null)
        {
            return false
        }
        let findAccessToken=await User.findOne({accessToken:tokenData[1]});
        if(!findAccessToken)
        return false;       
        return findAccessToken;
       
   }catch(err){
        console.log(err,'error decrypt');
        return false;
    }
}



exports.validateAdminAccessToken=async(token)=>{
    try{
        let tokenData=token.split(" ");
        let findAccessToken=await Admin.findOne({accessToken:tokenData[1]});
        if(!findAccessToken)
        return false;
        return findAccessToken;
       
    }
    catch(err){
        console.log(err,'error decrypt');
        return false;
    }
}



exports.ValidateDriverAccessToken=async(token)=>{
    try{
        let tokenData=token.split(" ");
        let findAccessToken=await Driver.findOne({accessToken:tokenData[1]});
        if(!findAccessToken)
        return false;       
        return findAccessToken;
      
    }
    catch(err){
        console.log(err,'error decrypt');
        return false;
    }
}


exports.sortByKey=(array, key) =>{
    return array.sort(function(a, b) {
        var x = a[key]; 
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}



exports.unifonicMessage=(data)=>{
    return new Promise(function(resolve, reject) {
        let option={
                method: 'POST',
                url: 'http://api.unifonic.com/rest/Messages/Send',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `AppSid=${process.env.UNIFONIC_APP_SID}&Recipient=${data.phoneNumber}&Body=${data.message}`
          }

        request.post(option,function optionalCallback(err, httpResponse, body) {
          if (err) {

            console.log(err,'error data')

            reject(err);
          } else {

            console.log('body')

            resolve(body);
          }
        })
    })
}









exports.sendMessage=async(phoneNumber,messagedata)=>{
    try{
        
        const client = new twilio(process.env.ACCOUNT_SID, process.env.ACCOUNT_AUTH_TOKEN);

        var message = await client.messages.create({
            body:messagedata,
            to:phoneNumber, 
            from:process.env.PHONE_NUMBER
        });
    
        if(message.error){
            console.log(message.error,'error');
            return message.error;
        }

        else return true;


    }catch(err){
        console.log(err,'error ');
    }
}


exports.getDistanceBetweenPoints = (origin, destination)=>{
    let start = new GeoPoint(origin.lat, origin.long);
    let end = new GeoPoint(destination.lat, destination.long);
    return  start.distanceTo(end, true);
};