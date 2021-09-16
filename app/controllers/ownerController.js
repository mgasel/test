const laundryModel = require('../models/Laundry')
const laundryBuySubscription = require('../models/laundryBuySubscription')
const AppConstraints = require('../../config/appConstraints')
const ownwerServices = require('../Services/ownerServices')
const servicesCategoryModel = require('../models/serviceItemCategory')
//const nodemailer = require("nodemailer")
const UnivershalFunction=require('../UnivershalFunctions/Univershalfunctions.js');
//const sesTransport=require('nodemailer-ses-transport');
const Promise = require('bluebird')
const pdf = Promise.promisifyAll(require('html-pdf'));
const date = require('date-and-time')
const moment = require('moment-timezone')
const qr = require('qrcode');
const universal = require('../../app/UnivershalFunctions/Univershalfunctions')
exports.getplandate=async(request,response)=>{
    let planupdate = await ownwerServices.getplandates(request,response)
   // return response.json({updatetx})
			return ({ statusCode: 200, success: 1, Message:"hi"})
			

}

exports.sendPlanMail=async(request,response)=>
{
try
{
let jsonRes= {
   id: '8ac9a4a178d4f98a0178dbc7e2bc46a1',
   registrationId: '8ac9a4a178d4f98a0178dbc7e2464678',
  paymentType: 'DB',
   paymentBrand: 'VISA',
   card: {
     bin: '471110',
    binCountry: 'US',
    last4Digits: '0000',
     holder: 'HSHHAH',
     expiryMonth: '06',
     expiryYear: '2030'
   },
   customer: {
     givenName: 'abcd',
     surname: 'abcd',
    email: 'shabana1128@gmail.com',
    ip: '106.208.55.182',
     ipCountry: 'IN'
   },
   billing: {
     street1: 'Olayih',
     city: 'Riyadh',
     state: 'CENTRAL',
     postcode: '12611',
     country: 'SA'
   },
 }
let plans={
planName:'Annually',
planamount:'585',
perPeriod:'Annually'
}
console.log('invoice start pdf');
let id = "new999999"
//uuidv4()
let data1=await pdfCreate(jsonRes,plans);
console.log("html",data1);
Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+"invoice"+'.pdf' });
        console.log('data',Pdflink);

let Email=[];
console.log('pdf created.. mail start');
Email.push(jsonRes.customer.email,"shabana1128@gmail.com");
let emailcontent="<p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;'> Thanks for purchasing the subsciption plan.</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;'> Please find the invoice attached. </p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;'>Regards,</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;'> Mgasel Team</p>";
let emailsubj="Receipt of subscription- mgasel";
await universal.sendEmailwithpdf(Email,emailcontent,emailsubj,Pdflink.filename,id+"invoice"+'.pdf');
console.log('mail sent');
}catch(error){
console.log(error);

            return ({ statusCode: 400, success: 1, Error:error})
}


let msg=Pdflink
response.json(msg)
}
exports.register = async(request,response)=>{

    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('password',AppConstraints.PASSWORD).notEmpty();
    request.checkBody('confirmPassword',AppConstraints.CHANGED_PASSWORD).notEmpty()
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    request.checkBody('laundryName',AppConstraints.LAUNDRY_NAME).notEmpty();
    request.checkBody('laundryAddress',AppConstraints.LAUNDRY_ADDRESS).notEmpty();
    request.checkBody('laundryLat',AppConstraints.LAUNDRY_LAT).notEmpty();
    request.checkBody('laundryLong',AppConstraints.LAUNDRY_LONG).notEmpty();
    // request.checkBody('districtId',AppConstraints.DISTRICT_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    const  laundry = await ownwerServices.registerOwner(request,response)
    return response.json(laundry)
}
exports.login=async(request,response)=>{
    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('password',AppConstraints.PASSWORD).notEmpty();
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty()
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    const laundry = await ownwerServices.loginOwner(request,response)
    return response.json(laundry)
}
exports.sendOtp=async(request,response)=>{
    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    const otp = await ownwerServices.sendOtp(request,response)
    return response.json(otp)
}
exports.verifyOtp=async(request,response)=>{
    request.checkBody('otp',AppConstraints.OTP_REQUIRED).notEmpty();
    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    const verifyOtp = await ownwerServices.verifyOtp(request,response)
    return response.json(verifyOtp)
}
exports.branches= async(request,response)=>{
    console.log('.....');
    
    request.checkBody('ownerId',AppConstraints.ENTER_OWNER_ID).notEmpty();
    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    request.checkBody('laundryName',AppConstraints.LAUNDRY_NAME).notEmpty();
    request.checkBody('laundryAddress',AppConstraints.LAUNDRY_ADDRESS).notEmpty();
    request.checkBody('laundryLat',AppConstraints.LAUNDRY_LAT).notEmpty();
    request.checkBody('laundryLong',AppConstraints.LAUNDRY_LONG).notEmpty();
    // request.checkBody('districtId',AppConstraints.DISTRICT_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    console.log('======>>>>>>>>>>>');
    
    const branches = await ownwerServices.addBranches(request,response)
    return response.json(branches)
}
exports.forgotPassword = async(request,response)=>{
    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    request.checkBody('password',AppConstraints.PASSWORD).notEmpty();
    request.checkBody('confirmPassword',AppConstraints.CHANGED_PASSWORD).notEmpty()
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let verification = await ownwerServices.forgotPassword(request,response)
    return response.json(verification)
}
exports.update = async(request,response)=>{
    // console.log();
    
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let update = await ownwerServices.update(request,response)
    return response.json(update)
}
exports.getList = async(request,response)=>{
    console.log('k,,,,,,,,,');
    
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    console.log('.................');
    
    let branchList = await ownwerServices.getBranchList(request,response)
    return response.json(branchList)
}
exports.getAllBranchesList = async(request,response)=>{
    console.log('k,,,,,,,,,');
    
    // request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    // let errors = request.validationErrors();
    // if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    // console.log('.................');
    
    let branchList = await ownwerServices.getAllBranchList(request,response)
    return response.json(branchList)
}
exports.getAllBranchesServices  = async(request,response)=>{
    console.log('k,,,,,,,,,');
    
    // request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    // let errors = request.validationErrors();
    // if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    // console.log('.................');
    
    let branchList = await ownwerServices.getAllBranchServices(request,response)
    return response.json(branchList)
}
exports.getAllBranchesServicesItems  = async(request,response)=>{
    console.log('k,,,,,,,,,');
    
    // request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    // let errors = request.validationErrors();
    // if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
     console.log('.................');
    
    let branchList = await ownwerServices.getAllBranchServicesItems(request,response)
    return response.json(branchList)
}
exports.addCategories = async(request,response)=>{
    let data = await ownwerServices.addCategory(request,response)
    return response.json(data)
}
exports.addServices = async(request,response)=>{
    let data = await ownwerServices.addServices(request,response)
    return response.json(data)
}
exports.addServiceItem = async(request,response)=>{
    let serviceItems = await ownwerServices.serviceItem(request,response)
    return response.json(serviceItems)
}
exports.verifyLaundry =async(request,response)=>{
    let verification = await ownwerServices.verifyLaundry(request,response)
    return response.json(verification)
}
exports.ownwerServicesList = async(request,response)=>{
    let servicesList  = await ownwerServices.getList(request,response)
    response.json(servicesList)
}
exports.updateServices = async(request,response)=>{
   await ownwerServices.updateLaundryServices(request,response)
    // return response.json(services)
}
exports.findEmailPhone = async(request,response)=>{
    let check = await ownwerServices.findEmailNumber(request,response)
    return response.json(check)
}
exports.delete = async(request,response)=>{
    let data = await ownwerServices.deleteData(request,response)
}
exports.updaetPrice = async(request,response)=>{
    let updatePrice = await ownwerServices.updatePrice(request,response)
    return response.json(updatePrice)
}
exports.getLists = async(request,response)=>{
    let list = await ownwerServices.listing(request,response)
    return response.json(list)
}
exports.createBooking = async(request,response)=>{
    // console.log('sadslkasdj');
    
    let bookings = await ownwerServices.createBookings(request,response)
    return response.json(bookings)
}
exports.itemPrice = async(request,response)=>{
    let price = await ownwerServices.itemsPrice(request,response)
    return response.json({price})
}
exports.laundryDetails = async(request,response)=>{
    let laundryDescription = await ownwerServices.laundryDetails(request,response)
    return response.json(laundryDescription)
}
exports.laundryServices = async(request,response)=>{
    let laundryServices = await ownwerServices.laundryService(request,response)
    return response.json(laundryServices)
}
exports.getBooking = async(request,response)=>{
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let bookings = await ownwerServices.getBookings(request,response)
    return response.json(bookings)
}
exports.getBookingByDate = async(request,response)=>{
    // request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    // let errors = request.validationErrors();
    // if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let bookings = await ownwerServices.getBookingsByDate(request,response)
    return response.json(bookings)
}
exports.ordersById = async(request,response)=>{
    let bookings =  await ownwerServices.getOrderById(request,response)
    return response.json(bookings)
}
exports.deleteService = async(request,response)=>{
    let services = await ownwerServices.deleteServices(request,response)
    response.json(services)
}
exports.updatePassword = async(request,response)=>{
      
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let updatePassword = await ownwerServices.updatePassword(request,response)
    return response.json(updatePassword)
}
exports.servciceDetails = async(request,response)=>{
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    request.checkBody('laundryId',AppConstraints.INVALID_ID).notEmpty();

    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let servicesDetails = await ownwerServices.serviceFullDetails(request,response)
    response.json(servicesDetails)
}
exports.createPromo = async(request,response)=>{
   let promo = await ownwerServices.createPromo(request,response)
    return response.json(promo)
}
exports.updatePromo = async(request,response)=>{
    let promo = await ownwerServices.updatePromo(request,response)
     return response.json(promo)
 }
exports.applyPromo = async(request,response)=>{
   let promo = await ownwerServices.applyPromo(request,response)
   return response.json(promo)
}
exports.laundriesCoupons = async(request,response)=>{
    let allPromos = await ownwerServices.getlaundryCoupons(request,response)
    return response.json(allPromos)
}
exports.laundriesCouponsById = async(request,response)=>{
    let allPromos = await ownwerServices.getlaundryCouponsById(request,response)
    return response.json(allPromos)
}
exports.deleteLaundryCoupon = async(request,response)=>{
    let allPromos = await ownwerServices.deletelaundryCoupons(request,response)
    return response.json(allPromos)
}
exports.pdf = async(request,response)=>{
    await ownwerServices.downlaodPdf(request,response)
}
exports.excel = async(request,response)=>{
    await ownwerServices.downloadExcel(request,response)
}
exports.changeStatus = async(request,response)=>{
    request.checkBody('status',AppConstraints.INVALID_ID).notEmpty();
    request.checkBody('bookingId',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    const bookingStatus = await ownwerServices.changeBookingStatus(request,response)
    response.json(bookingStatus)
}
exports.getBookingByBag = async(request,response)=>{
    const booking = await ownwerServices.getBagById(request,response)
    response.json(booking)
}
exports.deleteItems = async(request,response)=>{
    const items = await ownwerServices.deleteServiceItem(request,response)
    response.json(items)
}
exports.addPlan = async(request,response)=>{
    const booking = await ownwerServices.addPlans(request,response)
    response.json(booking)
}
exports.getPlan = async(request,response)=>{
    const booking = await ownwerServices.getPlans(request,response)
    response.json(booking)
}
exports.buyPlan = async(request,response)=>{
    const booking = await ownwerServices.buyPlans(request,response)
    response.json(booking)
}

exports.hyperPayStep1 = async(request,response)=>{
    const booking = await ownwerServices.hyperPayStep1(request,response)
    // console.log('booking',booking);
    // response.json(booking)
}
exports.recurringPayment = async(request,response)=>{
    const booking = await ownwerServices.recurringPayment(request,response)
    // console.log('booking',booking);
    // response.json(booking)
}
exports.hyperPayStep2 = async(request,response)=>{
    const booking = await ownwerServices.hyperPayStep2(request,response)
    // console.log('booking',booking);
    // response.json(booking)
}
exports.checkSubscription = async(request,response)=>{
    const booking = await ownwerServices.checkSubscription(request,response)
    // console.log('booking',booking);
    response.json(booking)
}

exports.pdfReceipt = async(request,response)=>{
console.log("pdf request received");
let Pdflink="";
let jsonRes= {
   id: '8ac9a4a178d4f98a0178dbc7e2bc46a1',
   registrationId: '8ac9a4a178d4f98a0178dbc7e2464678',
  paymentType: 'DB',
   paymentBrand: 'VISA',  
   card: {
     bin: '471110',
    binCountry: 'US',
    last4Digits: '0000',
     holder: 'HSHHAH',
     expiryMonth: '06',
     expiryYear: '2030'
   },
   customer: {
     givenName: 'abcd',
     surname: 'abcd',
    email: 'ahmadfarewai@nasher.co',
    ip: '106.208.55.182',
     ipCountry: 'IN'
   },
   billing: {
     street1: 'Olayih',
     city: 'Riyadh',
     state: 'CENTRAL',
     postcode: '12611',
     country: 'SA'
   },
 }
let plans={
planName:'Basic',
planamount:'100',
perPeriod:'1 Month'
}
try{
//let data1="test"
let id = "123"
//uuidv4()
let data1=await pdfCreate(jsonRes,plans);
console.log("html",data1);
Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+"invoice"+'.pdf' }); 
        console.log('data',Pdflink);  

}catch(error){
console.log(error);

            return ({ statusCode: 400, success: 1, Error:error})
}

            
let msg=Pdflink
response.json(msg)

}

exports.sendEmail=async(request,response)=>{
let msg="success mail";
let Email=[];
			
//Email.push("farheena@ymail.com");
await UnivershalFunction.sendEmailByNodemailerOnly("farheena@ymail.com","helo world","fromnodejs");

 response.json(msg)
}


/*exports.sendEmail = async(request,response)=>{
 let msg;
    try{

var mailOptions = {
  from: 'shabana1128@gmail.com',
  to: 'farheena.had@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
console.log("we are here");
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
      
         console.log("success");
        msg="success"

    }catch(err){
        console.log("email error",err);

        msg="error";
    }
    response.json(msg)
}*/


exports.getTax = async(request,response)=>{
/*    request.checkBody('ownerid',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}*/
	let tax = await ownwerServices.getTax(request,response)
    return response.json(tax)
}

exports.updateTax = async(request,response)=>{
    let updatetx = await ownwerServices.updateTax(request,response)
    return response.json({updatetx})
}

exports.getplandate=async(request,response)=>{
    let planupdate = await ownwerServices.getplandates(request,response)
   // return response.json({updatetx})
			return ({ statusCode: 200, success: 1, Message:"hi"})
			

}

exports.testqrcode=async(request,response)=>{
    let Pdflink="";
    const url = request.query.url;

let qc=null;
    // If the input is null return "Empty Data" error
    if (url.length === 0) res.send("Empty Data!");
    
    let data1="";
    
     qr.toDataURL(url, (err, src) => {
       // if (err) res.send("Error occured");
      
        // Let us return the QR code image as our response and set it to be the source used in the webpage
    //    res.render("scan", { src });
     qc=src;
     console.log("qrgenerated",src);
        
     });
        
try{
//let data1="test"
let id = "123"
//uuidv4()
data1=`
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <img src=<%=${qc}%> style="width:100px;height:100px;"/></div>`;
console.log("html",data1);
Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+'qr'+'.pdf' }); 
console.log('qrdata',Pdflink);  

}catch(error){
console.log(error);

            return ({ statusCode: 400, success: 1, Error:error})
}

            
let msg=Pdflink
response.json(msg)
        
    
return ({ statusCode: 200, success: 1, Message:"hi"})
			

}

exports.getBookingswithtax = async(request,response)=>{
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
  let bookings = await ownwerServices.getBookingswithtax(request,response)
  return response.json(bookings)
//return response.json("Success")
}
let pdfCreate =  async(invoice,plans)=>{
    console.log('invoice',invoice);
    console.log('plans',plans);
    let orderList = ``;
    //console.log('---------',booking)
    // console.log(booking);5efaece5ca3dfe31364a5727
    // break:-5efaece5ca3dfe31364a5727--
    console.log('entered');
 //console.log('customer data',customerdata);
// Formatting the date and time
// by using date.format() method
const value = date.format((new Date('December 17, 1995 03:24:00')),'YYYY/MM/DD HH:mm:ss');

// Display the result
console.log("date and time : " + value)

   let currentDate = new Date('1618696800000');
let tDate = moment().valueOf()
//new Date()
 let currentDate1 = date.format((new Date('1618696800000')),'YYYY/MM/DD HH:mm:ss');
console.log("currentDate",currentDate1);
let currdate=currentDate.getDate()+'/'+(currentDate.getMonth()+1)+'/'+currentDate.getFullYear();
console.log("currdate",currdate);
console.log("currdate",tDate);


let link1='./app/uploader/MgaselLogo.jpeg';
let link2='./app/uploader/MgaselQRCode.jpeg';
console.log('link1',link1);
    return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table colspan="0" cellpadding="0" border="1" style="width:600px;line-height: normal;border: solid 1px #ddd;padding: 20px;">
        <tr>
            <td>
                <table colspan="0" cellpadding="0" border="0" style="width:100%;">
<tr>
                                <td >
                                 <img src='https://static1.s123-cdn-static-a.com/uploads/4647316/2000_60cf39e34e3ed.jpg' style="width:100px;height:100px;"/>
                                 </td>


                                <td >
                                 <img src='https://static1.s123-cdn-static-a.com/uploads/4647316/2000_60d07c6de0289.jpg' style="width:100px;height:100px; align:right;"/>
                                 </td>
                                </tr>
              
                <tr>
                <td colspan="2"><h3 style="margin: 0;font-size: 12px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Mgasel Laundry App</h3></td>
            </tr>
                    <tr>
                    <td colspan="2"><p style="margin: 0;font-size: 8px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Invoice/Receipt</p></td>
                    </tr>
<tr>
                        <td colspan="2"><p style="margin: 0;font-size: 8px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">VAT Registration Number: 310265289900003 </p></td>
                    </tr>
  <tr>
                        <td style="vertical-align: top;padding-top: 2rem;width: 60%;">




 <table colspan="0" cellpadding="0" border="0" style="width:100%;border-collapse: collapse;">                                     

                                <tr>
				<td style="padding-bottom: 5px;">
				<p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height:normal;">Billed From :</p>
				</td>
				</tr>

				<tr>
				<td>
	<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> Closets Solutions Co. Ltd,</p>
			</td>
			</tr>
			<tr>
			<td> 
			<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> Imam Saud Bin Abdulaziz Road,</p>
			</td>
			</tr>
                       <tr>
			<td>
			 <p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> An Nakheel, Riyadh 12381</p>
			</td>
                        </tr>
			</table>
			</td>
 <td style="vertical-align: top;padding-top: 2rem;width: 60%; align:right;">
			<table colspan="0" cellpadding="0" border="0" style="width:100%;border-collapse: collapse; align:right;">                                     

                               <tr>
				
			
			<td style="padding-bottom: 5px; align:right;">
			<p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;">:وصفت من </p>
			</td>
			</tr>
 <tr>
				
			<td style=" align:right;">
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> Closets Solutions Co. Ltd,</p>
</td>
			</tr>
 <tr>
				
			<td style=" align:right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">الرياض،النخيل،الامام سعود عبدالعزي ،1238</p></td>
</tr>

                            </table>

                        </td>
                                        </tr>
                                         <tr>
                        <td style="vertical-align: top;padding-top: 2rem;width: 60%;">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;border-collapse: collapse;">   <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;">Billed To :<br/></p>                                                                                    
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.customer.givenName} </p></td></tr>
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.customer.email}</p></td></tr>
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.street1} </p></td></tr>
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.city}</p></td></tr>
                                                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.state} </p></td></tr>
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.postcode}</p></td></tr>
                                                                <tr><td style="padding-bottom: 10px; "><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.country} </p></td></tr>

                            </table>
                        </td>
 <td style="vertical-align: top;padding-top: 2rem;align: right;">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;border-collapse: collapse;align: right;">   <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;"> :دفع إلى<br/></p>                                                                                    
                                <tr><td style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.customer.givenName} </p></td></tr>
                                <tr><td  style="align: right;" ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.customer.email}</p></td></tr>
                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.street1} </p></td></tr>
                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.city}</p></td></tr>
                                                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.state} </p></td></tr>
                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.postcode}</p></td></tr>
                                                                <tr><td style="padding-bottom: 10px;align: right; "><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.country} </p></td></tr>

                            </table>
                        </td>

                                                </tr>
                                                <tr>
                                                <td style="padding-bottom: 10px; width:60%;">
 <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;">Purchase date :</p>

                                                <p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">
                                                ${currdate}</p></td>
<td style="padding-bottom: 10px; align: right;">
 <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;">: تاريخ الشراء </p>

                                                <p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">
                                                ${currdate}</p></td>
</tr>

                                                <tr>
                                                <td style="padding-bottom: 5px; width:60%;">
                                                <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;">Payment Method :</p>
                                                <p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">
                                                ${invoice.paymentBrand} ending with ${invoice.card.last4Digits} </p></td>
  <td style="padding-bottom: 5px; align: right;">
                                                <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;"> :طريقة الدفع او السداد </p>
                                                <p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;align: right;">
                                                ${invoice.paymentBrand} ending with ${invoice.card.last4Digits} </p></td>
                                                </tr>
                                                <tr>
 <td style="padding-bottom: 5px; width:60%;" >
                        <p style="font-size: 8px;font-weight: bold;color: #000;line-height: normal;">Plan Details :</p></td><td style="padding-bottom: 5px;align: right;">
                        <p style="font-size: 8px;font-weight: bold;color: #000;line-height: normal;text-align: right;">: تفاصيل الخطة</p></td></tr>
<tr>

                        <td style="vertical-align: top;width: 100%;">
	                             <table colspan="0" cellpadding="0" border="1" style="border-collapse: collapse;width:100%" >                                                                                                                                                                                                             
                        <tr>
                                            <th ><p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;"> اسم الخطة</p></th>
                                            <th><p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;"> مبلغ الخطة</p></th>
                                            <th><p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;">  مدة الخطة</p></th>
                                           
                                        </tr>
                           <tr>
<td   style="text-align: center;">
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> ${plans.planName != undefined ? plans.planName : "N.A" }</p>
</td>
<td  style="text-align: center;">
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> ${plans.planAmount != undefined ? plans.planAmount : "N.A" }</p>
</td>
<td  style="text-align: center;">
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> ${plans.perPeriod != undefined ? plans.perPeriod : "N.A" }</p>
</td>
</tr>
                            </table>
                        </td>
                                                </tr>
                                                 <tr>
 <td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">Thank you for purchasing the Plan!</p></td>
                        <td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;align:right;">! شكرا لك على شراء الخطة</p>  </td>
                    </tr>
</table>
 </td>
        </tr>
    </table>
</div>    `;
}
