const md5=require('md5');
const async=require('async');
const laundryAdmin=require('../models/laundryAdmin.js');
const AppConstraints=require('../../config/appConstraints.js');
const UnivershalFunction=require('../UnivershalFunctions/Univershalfunctions.js');
const jwt=require('jsonwebtoken');
const User=require('../models/User.js');
const Service=require('../models/Services.js');
const Forgot=require('../models/Forgot.js');
const Laundry=require('../models/Laundry.js');
const Bookings=require('../models/Bookings.js');
const mongoose=require('mongoose');


exports.registerAdmin = async(request,response)=>{
console.log("in register admin");
console.log(request.body);
    request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();
    request.checkBody('password',AppConstraints.PASSWORD).notEmpty();
    request.checkBody('confirmPassword',AppConstraints.CHANGED_PASSWORD).notEmpty()
    request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    request.checkBody('Name',AppConstraints.NAME).notEmpty();
    request.checkBody('email',AppConstraints.EMAIL_ADDRESS).notEmpty();
     /*
     let errors = await request.validationErrors();
     console.log(errors);
      if (errors)
      return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
    */

request.body.password=md5(request.body.password);
   if (await laundryAdmin.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }] }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            if (request.body.email) {
                if (await laundryAdmin.findOne({ email: request.body.email }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMAIL_ALREADY });
            }
   console.log("not found");
   
    const admin= await laundryAdmin(request.body).save()
    //const  admin = await ownwerServices.registerOwner(request,response)
    return response.json(admin)
}



exports.loginlaundryAdmin=async(request,response)=>{
    console.log("login");
  try{
request.checkBody('phoneNumber',AppConstraints.PHONE_NUMBER).notEmpty();      
request.checkBody('password',AppConstraints.PASSWORD).notEmpty();
request.checkBody('countryCode',AppConstraints.REQUIRED_COUNTRY).notEmpty();
    /* let errors = await request.validationErrors();
      if (errors)
      return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors});
*/
console.log(request.body.phoneNumber)
      let islaundryAdmin=await laundryAdmin.findOne({$and: [{countryCode:request.body.countryCode},{phoneNumber:request.body.phoneNumber},{password:md5(request.body.password)}]});
console.log(islaundryAdmin)
      if(!islaundryAdmin)
      return response.status(400).json({statusCode:400,success:0,msg:AppConstraints.INVALID_EMAIL_PASSWORD.EN});
  
/*    let payloadData={
          email:request.body.email,
          password:request.body.password,
          exp: Math.floor(Date.now() / 1000) + (60 * 60*60)
      }

	let createToken=await jwt.sign(payloadData,process.env.JWT_SECRET);
      await laundryAdmin.update({email:request.body.email,password:md5(request.body.password)},{$set:{accessToken:createToken}});*/

      return response.status(200).json({statusCode:200,success:1,msg:"success",user:islaundryAdmin});


 }catch(err){
     console.log("error"+err)
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
  }
  
 // return("success");
}


exports.getAdmindashboarddata=async(request,response)=>{
  try{

let islaundryAdmin=await laundryAdmin.findOne({phoneNumber:request.body.phoneNumber});

      let criteriaUser={
          phoneNumber:{"$in": islaundryAdmin.customerphNumbers}
      }
      let criteriaService={
            isDeleted:false
      }
      let lids=[]
      // let ids = request.body.ids.map( id => mongoose.Types.ObjectId(id) )
      //let lids=islaundryAdmin.customerLaundries.map(id=>islaundryAdmin.customerLaundries._id)
     for(let k=0;k<islaundryAdmin.customerLaundries.length;k++)
      lids[k]=islaundryAdmin.customerLaundries[k]._id.toString()
      
      console.log("objects"+islaundryAdmin.customerLaundries)
      //console.log("ids"+islaundryAdmin.customerLaundries[0]._id);
      console.log("ids"+islaundryAdmin.customerLaundries[0]);
      console.log("lids"+lids);
      //"60b8b6f7601e901238a6ba58","607d6f34419e355817b4c0f8"
      
      let criteriaLaundry={
          _id: {$in: lids }
            
      }
      let completedCriteria={
          laundryId:{$in:lids},
          status:AppConstraints.APP_CONST_VALUE.COMPLETED
      }
      let criteriaBooking={
          laundryId:{$in:lids}
      }

	var now = new Date();
	//start.setHours(0,0,0,0);
	var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	var end = new Date();
	end.setHours(23,59,59,999);

console.log(startOfToday+"  start date");
console.log(end+" end date");

	let todayCriteriabooking={
	    laundryId:{"$in":lids},
    createDate: {$gte: startOfToday}
	/* isDeleted:false*/
	}
	
	let todayCriteriauser={
	    phoneNumber:{"$in": islaundryAdmin.customerphNumbers},
		createDate: {$gte: startOfToday}
	/* isDeleted:false*/
	}
	

     let totalRevenue=await Bookings.find(criteriaBooking,{totalAmount:1,_id:0}); //,{status:AppConstraints.APP_CONST_VALUE.COMPLETED}
       
     console.log(totalRevenue,'=================')

      let totalAmmountToSend=0.0;
      for(let i=0;i<totalRevenue.length;i++){
//          console.log(totalRevenue[i].totalAmount,'=======================amiount')
        totalAmmountToSend+=parseFloat(totalRevenue[i].totalAmount);
  //      console.log(totalAmmountToSend,'=================================')
      }


let todayRevenue=await Bookings.find(todayCriteriabooking,{totalAmount:1,_id:0});//,{status:AppConstraints.APP_CONST_VALUE.COMPLETED}
       
     console.log(todayRevenue,'=================today')

      let todayAmmountToSend=0.0;
      for(let i=0;i<todayRevenue.length;i++){
          console.log(todayRevenue[i].totalAmount,'=======================amiount')
        todayAmmountToSend+=parseFloat(todayRevenue[i].totalAmount);
        console.log(todayAmmountToSend,'=================================')
      }


 let findData=await Promise.all([
          laundryAdmin.findOne({phoneNumber:request.body.phoneNumber}),
          User.count(criteriaUser),
          Laundry.count(criteriaLaundry),
          Bookings.count(completedCriteria),
	Bookings.count(criteriaBooking),
User.count(todayCriteriauser),
Bookings.count(todayCriteriabooking)
      ])

      return response.status(200).json({
                                        statusCode:200,
                                        success:1,
                                        msg:'success',
                                        data:{
                                                adminData:findData[0],
                                                totalUser:findData[1],
                                                totalLaundry:findData[2],
                                                totalOrderRequest:findData[4],
                                                totalOrderComplete:findData[3],
                                                totalRevenue:totalAmmountToSend.toFixed(2),
						todaysOrders:findData[6],
						todaysUsers:findData[5],
						todayRevenue:todayAmmountToSend
                                            }
                                        });

//return response.status(200).json("success");
  }catch(err){
       console.log("error dashboard"+err)
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
  }
}

exports.addlaundrytoAdmin=async(request,response)=>{
    try{
console.log("add laundry  to admn");
console.log(request.body);
	let criteria={
            phoneNumber:request.body.laundryPhnumber,
        }


        let checkIfLaundryexists=await Laundry.findOne(criteria);

        if(!checkIfLaundryexists)
        return response.status(200).json({success:0,statusCode:400,msg:"No laundry found with phone number"+request.body.laundryPhnumber});
        
        console.log("laundry exists");

        let criteriaadmin={
	phoneNumber:request.body.phoneNumber,
	countryCode:request.body.countryCode
	}
	
	        let adminobj = await laundryAdmin.findOne({phoneNumber:request.body.phoneNumber}); //{countryCode:request.body.countryCode},
        
        console.log(checkIfLaundryexists)
       
        if(adminobj!=null)
        {
             console.log(adminobj.customerLaundries)
//let phonecriteria={
          //  request.body.laundryPhnumber: {$in: adminobj.customerPhnumbers }
       
        for(let k=0;k<adminobj.customerPhnumbers.length;k++)
       {
           if(adminobj.customerPhnumbers[k].toString() == request.body.laundryPhnumber)
           {
               console.log("already added")
            return response.status(200).json({success:0,statusCode:400,msg:"Laundry already added with phone number "+request.body.laundryPhnumber});
           }
       }
       console.log("NOT already added")
        
        // let checkIfLaundryexists=await laundryAdmin.findOne(phonecriteria);
	adminobj.customerLaundries.push(checkIfLaundryexists)
console.log(adminobj.customerLaundries)

	adminobj.customerPhnumbers.push(request.body.laundryPhnumber);
	
console.log(request.body.laundryPhnumber);

	await laundryAdmin.findOneAndUpdate({_id:adminobj._id},{$set:{customerLaundries:adminobj.customerLaundries,customerPhnumbers:adminobj.customerPhnumbers}});

        return response.status(200).json({statusCode:200,success:1,msg:"Successfully added"});
        }
      
 }catch(err){
      return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
  }
}





exports.getAdminLaundryList=async(request,response)=>{
    try{
console.log("get laundries started");
let adminobj = await laundryAdmin.findOne({phoneNumber:request.body.phoneNumber});
console.log(adminobj);
//let laundryIds= JSON.parse(adminobj.customerLaundries);
let criteria;

/*criteria={
         
	     phoneNumber:{$in:adminobj.customerPhnumbers}           
} */

let lids=[]

      // let ids = request.body.ids.map( id => mongoose.Types.ObjectId(id) )
      //let lids=islaundryAdmin.customerLaundries.map(id=>islaundryAdmin.customerLaundries._id)
     for(let k=0;k<adminobj.customerLaundries.length;k++){
      lids[k]=adminobj.customerLaundries[k]._id.toString()
      
      }
      
      console.log("objects"+adminobj.customerLaundries)
      
      console.log("lids"+lids);
      //"60b8b6f7601e901238a6ba58","607d6f34419e355817b4c0f8"
      
      criteria={
          _id: {$in: lids }
            
      }



let getData
console.log(adminobj.customerPhnumbers);
   
         getData= await Laundry.find(criteria);
         //await Service.find({_id: {$in: JSON.parse(request.body.serviceId)}})
         
         
let laundryRevenue=[] 
let laundrySales=[]
let laundrytotalRevenue=[]
let laundrytotalSales=[]
          for(let l=0;l<getData.length;l++){
              console.log("laundryId"+getData[l]._id);
         laundryRevenue[l]=await Bookings.find({$and:[{laundryId:getData[l]._id.toString()},{ "status" : "DELIVERED"}]},{totalAmount:1,_id:0});
         
         let totalAmmountsum=0;
      for(let i=0;i<laundryRevenue[l].length;i++){

        totalAmmountsum+=parseFloat(laundryRevenue[l][i].totalAmount);
  
      }
         laundrySales[l]=totalAmmountsum.toFixed(2); //getData[l].countryCode+","+getData[l].phoneNumber+","+totalAmmountsum.toFixed(2);
         console.log("sales delivered"+totalAmmountsum);
         
         laundrytotalRevenue[l]=await Bookings.find({laundryId:getData[l]._id.toString()},{totalAmount:1,_id:0});
         
         let totalAmmountall=0;
      for(let i=0;i<laundrytotalRevenue[l].length;i++){

        totalAmmountall+=parseFloat(laundrytotalRevenue[l][i].totalAmount);
  
      }
         laundrytotalSales[l]=totalAmmountall.toFixed(2); 
         console.log("sales total"+totalAmmountall);
        
         
          }
          
          
 return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:getData,salesdet:laundrySales,totalsales:laundrytotalSales});
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
} 

exports.getTodayAdminLaundryList=async(request,response)=>{
    try{
console.log("get today laundries started");
let adminobj = await laundryAdmin.findOne({phoneNumber:request.body.phoneNumber});
console.log(adminobj);
//let laundryIds= JSON.parse(adminobj.customerLaundries);
let criteria;

/*criteria={
         
	     phoneNumber:{$in:adminobj.customerPhnumbers}           
} */

let lids=[]
      // let ids = request.body.ids.map( id => mongoose.Types.ObjectId(id) )
      //let lids=islaundryAdmin.customerLaundries.map(id=>islaundryAdmin.customerLaundries._id)
     for(let k=0;k<adminobj.customerLaundries.length;k++)
      lids[k]=adminobj.customerLaundries[k]._id.toString()
      
      console.log("objects"+adminobj.customerLaundries)
      
      console.log("lids"+lids);
      //"60b8b6f7601e901238a6ba58","607d6f34419e355817b4c0f8"
      
      criteria={
          _id: {$in: lids }
            
      }


	var start = new Date();
	start.setHours(0,0,0,0);

	var end = new Date();
	end.setHours(23,59,59,999);
	
	let todayCriteriauser={
	    //phoneNumber:{"$in": adminobj.customerphNumbers},
	    _id: {$in: lids },
	 createDate: {$gte: start}
	/* isDeleted:false*/
	}


let getData
console.log(adminobj.customerPhnumbers);
   
         getData= await Laundry.find(todayCriteriauser);
         //await Service.find({_id: {$in: JSON.parse(request.body.serviceId)}})
    

console.log(getData);

 return response.status(200).json({success:1,msg:AppConstraints.SUCCESS,data:getData,totalResult:""});
    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }
} 

exports.getOrderdetails=async(request,response)=>{

try{
        console.log(request.body,'request data');
        console.log("get order details started");
let adminobj = await laundryAdmin.findOne({phoneNumber:request.body.phoneNumber});
console.log(adminobj);

//request.checkBody('perPage',AppConstraints.PER_PAGE).notEmpty();
  //      request.checkBody('page',AppConstraints.PAGE).notEmpty();
    //    request.checkBody('status',AppConstraints.STATUS_BOOKING).notEmpty();
      //  let errors = await request.validationErrors();
        //if (errors)
        //return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});
       let lids=[]
      // let ids = request.body.ids.map( id => mongoose.Types.ObjectId(id) )
      //let lids=islaundryAdmin.customerLaundries.map(id=>islaundryAdmin.customerLaundries._id)
     for(let k=0;k<adminobj.customerLaundries.length;k++)
      lids[k]=adminobj.customerLaundries[k]._id.toString()
      
      console.log("objects"+adminobj.customerLaundries)
      
      console.log("lids"+lids);
      //"60b8b6f7601e901238a6ba58","607d6f34419e355817b4c0f8"
      
      let criteriaLaundry={
          laundryId: {$in: lids }
            
      }
        
        
        if(request.body.startDate && request.body.endDate){
            criteriaLaundry.createDate={$gte:request.body.startDate,$lte:request.body.endDate}
        }
        console.log(criteriaLaundry,"criteria");
        let getBooking=await Promise.all([
            Bookings.count(criteriaLaundry),
            Bookings.find(criteriaLaundry)
            .sort({"_id":-1})
        //    .skip((parseInt(request.body.perPage)*parseInt(request.body.page))-parseInt(request.body.perPage))
          //  .limit(parseInt(request.body.perPage))
        //    .populate({path:'laundryId',select:{},populate:{path:'districtId'}})
          //  .populate({path:'userId',select:{password:0,accessToken:0,licencePic:0}})
    //        .populate({path:'driverId',select:{password:0,accessToken:0}})
        ]);


        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS,data:getBooking[1],totalResult:getBooking[0]});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }

}

exports.getTodayOrderdetails=async(request,response)=>{

try{
        console.log(request.body,'request data');
        console.log("get order details started");
let adminobj = await laundryAdmin.findOne({phoneNumber:request.body.phoneNumber});
console.log(adminobj);

//request.checkBody('perPage',AppConstraints.PER_PAGE).notEmpty();
  //      request.checkBody('page',AppConstraints.PAGE).notEmpty();
    //    request.checkBody('status',AppConstraints.STATUS_BOOKING).notEmpty();
      //  let errors = await request.validationErrors();
        //if (errors)
        //return response.status(400).json({statusCode:400,success:0,msg: errors[0].msg, error:errors});
       let lids=[]
      
     for(let k=0;k<adminobj.customerLaundries.length;k++)
      lids[k]=adminobj.customerLaundries[k]._id.toString()
      
      console.log("objects"+adminobj.customerLaundries)
      
      console.log("lids"+lids);
      //"60b8b6f7601e901238a6ba58","607d6f34419e355817b4c0f8"
      
      
   var now = new Date();
	//start.setHours(0,0,0,0);
	var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	var end = new Date();
	end.setHours(23,59,59,999);
	let todayCriteriabooking={
	    laundryId:{"$in":lids},
		createDate: {$gte: startOfToday}
	/* isDeleted:false*/
	}
      
      let criteriaLaundry={
          laundryId: {$in: lids }
            
      }
        
        
        console.log(todayCriteriabooking,"criteria");
        let getBooking=await Promise.all([
            Bookings.count(todayCriteriabooking),
            Bookings.find(todayCriteriabooking)
            .sort({"_id":-1})
        ]);


        return response.status(200).json({success:1,statusCode:200,msg:AppConstraints.SUCCESS,data:getBooking[1],totalResult:getBooking[0]});



    }catch(err){
        return response.status(500).json({statusCode:500,success:0,msg:err.message,err:err.message.error});
    }

}



