const laundryModel = require('../models/Laundry')
// const ownwerModel = require('../models/owner')
const servicesModel = require('../models/Services')
const categoryModel = require('../models/serviceItemCategory')
const serviceItemModel = require('../models/serviceItems')
const laundryItemsModel = require('../models/laundryItems')
const AppConstraints = require('../../config/appConstraints')
const laundryBooking = require('../models/laundryBooking')
const otpModel = require('../models/otp')
const laundryServiceModel = require('../models/laundryService')
const bcrypt = require('bcrypt')
const salt = 10
const authToken = require('../../config/authenticate')
const otp = require('../models/otp')
const universal = require('../../app/UnivershalFunctions/Univershalfunctions')
let ObjectId = require('mongoose').Types.ObjectId
const bookingModel = require('../models/Bookings')
const userModel = require('../models/User')
let uuid = require('uid-safe')
module.exports = {
    registerOwner: async (request, response) => {
        try {
            if (request.body.password != request.body.confirmPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD });
            const findEmail = await laundryModel.findOne({ email: request.body.email })
            if (await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }] }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            if(request.body.email){
            if (await laundryModel.findOne({ email: request.body.email }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMAIL_ALREADY });
            }
            request.body.password = bcrypt.hashSync(request.body.password, salt)
            if (request.files) {
                for (let index in request.files) {
                    // console.log(demo[index]);

                    request.files[index].map((currentValue, index, array) => {
                        console.log('inn', currentValue.fieldname);
                        if (currentValue.fieldname == 'Document1') {

                            request.body.Document1 = '/' + currentValue.filename
                        }
                        if (currentValue.fieldname == 'Document2') {
                            request.body.Document2 = '/' + currentValue.filename
                        }
                        if (currentValue.fieldname == 'Document3') {

                            request.body.Document3 = '/' + currentValue.filename
                        }
                    })
                }
            }
            request.body.owner = true
            console.log('req,,', request.body);

            const laundry = await laundryModel(request.body).save()
            let token = await authToken.generateOwnwerToken(laundry)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.REGISTRATIONS_SUCESSFULL, ownwer: laundry, token: token })
        } catch (error) {
            console.log('eer', error);

            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    loginOwner: async (request, response) => {
        const ownwer = await laundryModel.findOne({ $and:[{phoneNumber:request.body.phoneNumber},{countryCode:request.body.countryCode}]})
        console.log('ownnw',ownwer);
        
        if (ownwer == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_PHONE_PASSWORD });
        const compare = bcrypt.compareSync(request.body.password, ownwer.password)
        if (compare == true) {
            let token = await authToken.generateOwnwerToken(ownwer)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.LOGIN_SUCESSFULL, ownwer: ownwer, token: token })
        }
        return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_PHONE_PASSWORD })

    },
    sendOtp: async (request, response) => {
        try {
            let findOtp = await otpModel.findOne({ phoneNumber: request.body.phoneNumber })
            if(findOtp){
                await otpModel.deleteMany({_id:findOtp._id})
            }
            let otp = Math.floor(1000 + Math.random() * 9000)

            const genrateOtp = await otpModel({ otp: otp, phoneNumber: request.body.phoneNumber, countryCode: request.body.countryCode }).save()
            console.log('dgee', genrateOtp);

    
            let data = {
                phoneNumber: request.body.countryCode + request.body.phoneNumber,
                message: `OTP is ${otp}`
            }
            await universal.unifonicMessage(data)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.OTP_SEND_SUCCESSFULLY, otp: genrateOtp })

        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    verifyOtp: async (request, response) => {
        try {
            let otp = await otpModel.findOne({ otp: request.body.otp })
            if (otp == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_OTP })
            await otpModel.deleteOne({ otp: request.body.otp })
            return ({ statusCode: 200, success: 1, msg: AppConstraints.OTP_VERIFIED_SUCCESSFULLY })

        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }

    },
    addBranches: async (request, response) => {
        try {
            console.log('oor', request.body.ownerId, "fa", request.ownerId);

            if (request.body.ownerId != request.ownerId.toString()) return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_OWNER_ID })
            if (await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }] }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            //  if(await laundryModel.findOne({$and:[{$or:[{phoneNumber:request.body.phoneNumber},{isDeleted:false}]},{$or:[{email:request.body.email},{isDeleted:false}]}]})!=null)  return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })


            //  if(await laundryModel.findOne({$and:[{email:request.body.email},{isDeleted:false}]})!=null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })

            let password = Math.random().toString(36).slice(-8);
            request.body.password = bcrypt.hashSync(password, salt)
            const laundry = await laundryModel(request.body).save()
            let token = await authToken.generateOwnwerToken(laundry)
            let data = {
                phoneNumber: request.body.countryCode + request.body.phoneNumber,
                message: `Laundry Password is ${password}`
            }
            await universal.unifonicMessage(data)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.REGISTRATIONS_SUCESSFULL, ownwer: laundry, token: token })

        } catch (error) {
            console.log('error', error);

            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    forgotPassword: async (request, response) => {
        try {
            let findData = await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }, { countryCode: request.body.countryCode }] })
            console.log('fffif',findData);
            
            if (findData == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_INVALID })
            // const verifyOtp = await otpModel.findOne({$and:[{otp:request.body.otp},{phoneNumber:request.body.phoneNumber}]})
            // if(verifyOtp == null)return ({ statusCode: 400, success: 0, msg: AppConstraints. }) 
            if (request.body.password != request.body.confirmPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD });
            request.body.password = bcrypt.hashSync(request.body.password, salt)
            await laundryModel.update({ phoneNumber: request.body.phoneNumber }, { password: request.body.password })
            return ({ statusCode: 200, success: 1, msg: AppConstraints.PASSWORD_SUCCESSFULLY_UPDATED })
        } catch (error) {
            console.log('erro', error);

            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    update: async (request, response) => {
        let find = await laundryModel.find({ $and: [{ _id: request.body.id }, { isDeleted: false }] })
        if (request.body.phoneNumber ) {
            let findEmailPassword = await laundryModel.find(
                    { $and: [{ phoneNumber: request.body.phoneNumber, isDeleted: false }] }    
                )
           
            if (findEmailPassword.length != 0) {
                if (findEmailPassword[0]._id.toString() != request.body.id) return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_NUMBER_USED })
            }
            request.body.isVerified = false
        }
        if (request.body.email ) {
            let findEmailPassword = await laundryModel.find(
                    { $and: [{ email: request.body.email, isDeleted: false }] }    
                )
           
            if (findEmailPassword.length != 0) {
                if (findEmailPassword[0]._id.toString() != request.body.id) return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_NUMBER_USED })
            }
            // request.body.isVerified = false
        }
        if (find == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_ID })
        if (request.files) {
            for (let index in request.files) {
                // console.log(demo[index]);

                request.files[index].map((currentValue, index, array) => {
                    console.log('inn', currentValue.fieldname);
                    if (currentValue.fieldname == 'Document1') {

                        request.body.Document1 = '/' + currentValue.filename
                    }
                    if (currentValue.fieldname == 'Document2') {
                        request.body.Document2 = '/' + currentValue.filename
                    }
                    if (currentValue.fieldname == 'Document3') {

                        request.body.Document3 = '/' + currentValue.filename
                    }
                })
            }
        }
        if (request.body.password) {
            if (!request.body.newPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_NEW_PASSWORD })
            console.log('kjjds',find[0].password);
            
            const comparePassword = await bcrypt.compare(request.body.password, find[0].password)
            console.log('jdss', comparePassword);

            if (comparePassword == false) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD })
            request.body.password = bcrypt.hashSync(request.body.newPassword, salt)
        }
        console.log('rew', request.body);

        let upadate = await laundryModel.update({ _id: request.body.id }, request.body)
        return ({ statusCode: 200, success: 1, msg: AppConstraints.PROFILE_SUCCESSFULLY })
    },
    getBranchList: async (request, response) => {
        console.log('...................');
        
        let list = await laundryModel.find({ $and: [{ ownerId: request.body.id }, { isDeleted: false }] })
           
        if(list.length==0) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMPTY,List:list })
        return ({ statusCode: 200, success: 1, List: list })
    },
    addServices: async (request, response) => {
        let Services = await servicesModel(request.body).save()
        response.json({ Services: Services })
    },
    addCategory: async (request, response) => {
        console.log('ijnnnnn');
        try {
            let Services = await categoryModel(request.body).save()
            return Services
        } catch (error) {
            console.log('eee', error);

        }
    },
    verifyLaundry: async (request, response) => {
        try {
            let otp = await otpModel.findOne({ $and: [{ otp: request.body.otp, phoneNumber: request.body.phoneNumber, countryCode: request.body.countryCode }] })
            if (otp == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_OTP })
            await otpModel.deleteOne({ otp: request.body.otp })
            await otpModel.deleteMany({ $and: [{ phoneNumber: request.body.phoneNumber, countryCode: request.body.countryCode }] })
            const find = await laundryModel.findOne({ phoneNumber: request.body.phoneNumber })
            if (find == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.OTP_VERIFIED_SUCCESSFULLY })
            await laundryModel.update({ phoneNumber: request.body.phoneNumber }, { isVerified: true })
            return ({ statusCode: 200, success: 1, msg: AppConstraints.OTP_VERIFIED_SUCCESSFULLY })

        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    serviceItem: async (request, response) => {

        try {
            let serviceItem = await serviceItemModel(request.body).save()
            return serviceItem

        } catch (error) {

        }
    },
    getList: async (request, response) => {
        try {
            
            console.log('reeee',request.body.id);
            
            let serviceList = await servicesModel.aggregate([
                // {
                //     $match: { _id: ObjectId(request.body.id) }

                // },
                // {$unwind:"$services"},
                {
                    $lookup: {
                        from: 'servicecategories',
                        localField: "serviceCategory",
                        foreignField: "_id",
                        as: 'category'
                    }
                },
                { $unwind:{path: "$category",    preserveNullAndEmptyArrays: true
            } },
                
                {
                    $lookup:{
                        from: 'serviceitems',
                        let: { categoryId: "$category._id", serviceId: "$_id" },
                        // let: { categoryId: "$category._id" },

                        pipeline: [
                           { $match:
                              { $expr:
                                 { $and:
                                    [
                                      { $eq: [ "$categoryId",  "$$categoryId" ] },
                                   { $eq: [ "$serviceId",  "$$serviceId" ] },

                                    ]
                                 }
                              }
                           },
                        ],
                        as: 'category.serviceItem'
                    }
                    
                },
                {
                    $group: {
                      _id : "$_id",
                      name: { $first: "$serviceName" },
                      serviceNameAr : {$first:"$serviceNameAr"},
                      category: { $push: "$category" }
                    }
                  }
            

            ])
            console.log('ervii', serviceList);
            return serviceList

        } catch (error) {
            console.log(error);
            
        }
    },
 updateLaundryServices: async (request, response) => {
        try {
            console.log('innnn');

            // laundry = await laundryModel.findOne({ _id: request.body.id })
            // if (laundry == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_LAUNDRY_ID })
            if (request.body.services) {
                laundry = await laundryModel.findOne({ _id: request.body.id })
                if (laundry == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_LAUNDRY_ID })
                await request.body.services.map(async(object)=>{
                    
                    let findService = await servicesModel.findOne({_id:object.serviceId})
                        let laundryServices = {
                            serviceName:findService.serviceName,
                            servicePic:findService.servicePic,
                            hexString:findService.hexString,
                            serviceCategory:object.serviceCategory,
                            laundryId:request.body.id
                        }
                        let save = await laundryServiceModel(laundryServices).save()
                        console.log('..............................');
                        
                        await laundryModel.findByIdAndUpdate({_id:request.body.id},{$push:{laundryServices:save._id}}) // add services in launderies
                       await object.serviceCategory.map(async(categories,index)=>{           
                            let findItems = await serviceItemModel.find({$and:[{serviceId:object.serviceId},{categoryId:categories}]})
                           await findItems.map(async(laundryServiceItems)=>{
                                let items = {
                                    itemName : laundryServiceItems.itemName,
                                    itemNameAr: laundryServiceItems.itemNameAr,
                                    itemPic:laundryServiceItems.itemPic,
                                    amountPerItem:laundryServiceItems.amountPerItem,
                                    categoryId:laundryServiceItems.categoryId,
                                    serviceId:save._id,
                                    series : laundryServiceItems.series,
                                    laundryId : request.body.id
                                }
                                
                                let savesItems = await laundryItemsModel(items).save()
                            })
                          
                        })
                        laundry = await laundryModel.findOne({_id:request.body.id}).populate({path:'laundryServices',populate:{path:"serviceCategory"}})
                       return response.json({ statusCode: 200, success: 1, Laundry: laundry })

                })
              
            }
            if(request.body.serviceCategory){
                console.log('sdjsdhsd');
                
                request.body.serviceCategory.category.map(async(category)=>{
                    
                    
                    let findItems = await serviceItemModel.find({$and:[{serviceId:request.body.serviceCategory.serviceId},{categoryId:category}]})
                    // console.log('finndd',findItems);
                    let laundryServices = await laundryServiceModel.update({_id:request.body.serviceCategory.launderyServiceId},{$push:{serviceCategory:category}})
                    console.log('lauundryyy',laundryServices);
                    
                    await findItems.map(async(laundryServiceItems)=>{
                
                        
                        let items = {
                            itemName : laundryServiceItems.itemName,
                            itemNameAr: laundryServiceItems.itemNameAr,
                            itemPic:laundryServiceItems.itemPic,
                            amountPerItem:laundryServiceItems.amountPerItem,
                            categoryId:category,
                            serviceId:request.body.serviceCategory.launderyServiceId,
                            series : laundryServiceItems.series,
                            laundryId:  request.body.serviceCategory.id
                        }
                        let savesItems = await laundryItemsModel(items).save()
                    })
                    
                   
                    
                })
                return response.json({ statusCode: 200, success: 1, services: AppConstraints.SERVICES_ADDED })
            }
            if(request.body.emptyServices){
                laundry = await laundryModel.findOne({ _id: request.body.id })
                console.log('asndasdasdashdkasl');
                
                if (laundry == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_LAUNDRY_ID })
                await request.body.emptyServices.map(async(object,index)=>{
                    let findService = await servicesModel.findOne({_id:object.serviceId})
                    let laundryServices = {
                        serviceName:findService.serviceName,
                        servicePic:findService.servicePic,
                        hexString:findService.hexString,
                        serviceCategory:object.serviceCategory,
                        laundryId:request.body.id
                    }
                    let save = await laundryServiceModel(laundryServices).save()
                    await laundryModel.findByIdAndUpdate({_id:request.body.id},{$push:{laundryServices:save._id}})

                })
                laundry = await laundryModel.findOne({_id:request.body.id}).populate({path:'laundryServices',populate:{path:"serviceCategory"}})
                return response.json({ statusCode: 200, success: 1, Laundry: laundry })
            }
          
                        
       

        } catch (error) {
            console.log('eee',error);
            
        }

    },
    findEmailNumber : async(request,response)=>{
        if(request.body.phoneNumber){
            let find = await laundryModel.findOne({$and:[{phoneNumber:request.body.phoneNumber},{isDeleted:false}]})
            if(find!=null)  return ({ statusCode: 400, success: 1, msg: AppConstraints.PHONE_ALREADY })
        }
        if(request.body.email){
            let find = await laundryModel.findOne({$and:[{email:request.body.email},{isDeleted:false}]})
            if(find!=null)  return ({ statusCode: 400, success: 1, msg: AppConstraints.EMAIL_ALREADY })
        }
        return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_PHONE_NOT_REGISTER })
    },
    deleteData:async(request,response)=>{
        await laundryServiceModel.deleteMany({laundryId:request.body.id})
    },
    updatePrice:async(request,response)=>{
        console.log('reee',request.body.laundryId);
        
        let findItems = await laundryItemsModel.findOne({$and:[{_id:request.body.id},{laundryId:request.body.laundryId}]})
        console.log('djdsd',findItems);
        
        if(findItems== null)return response.json({statusCode:400,sucess:0,msg:AppConstraints.INVALID_ID})
        await laundryItemsModel.update({_id:findItems._id},{amountPerItem:request.body.price})
        return ({ statusCode: 200, success: 1, msg: AppConstraints.UPDATE_PRICE })
    },
    listing:async(request,response)=>{
        // let list = await servicesModel.find()
        if(request.body.id){
            let list = await servicesModel.findOne({_id:request.body.id}).populate('serviceCategory')
            return ({ statusCode: 200, success: 1, List:list })
        }
        let list = await servicesModel.find({})
        return ({ statusCode: 200, success: 1, List:list })
    },
    itemsPrice:async(request,response)=>{
        console.log('innnnsahadgsh');
        
        try {
            let itemPrice = await laundryItemsModel.find({$and:[{categoryId:request.body.categoryId},{serviceId:request.body.serviceId},{laundryId:request.body.laundryId}]})
            if(itemPrice==null) return response.json({ statusCode: 400, success: 0,  msg :AppConstraints.VALID_ID })
            return ({ statusCode: 200, success: 1, priceList:itemPrice })
        } catch (error) {
            
        }
    },
    createBookings:async(request,response)=>{
        try {
          
            // let nearDriver = await userModel.findOne({$and:[{    currentLocation:
            //     { $near :
            //        {
            //          $geometry: { type: "Point",  coordinates: [30.712905, 
            //             76.709302 ] },
            //          $minDistance: 0,
            //          $maxDistance: 10000
            //        }
            //     }},{ userType : "DRIVER"},{isOnline : true},{isAvailable: true}]})

            // console.log('neq',nearDriver);
            // if(nearDriver == null)  return ({ statusCode: 400, success: 1, msg:AppConstraints.DRIVER_NOT_AVAILABLE }) 
            // request.body.driverId = nearDriver._id
            request.body.orderId = uuid.sync(4)
            let user = await userModel.findOne({$and:[{completePhoneNumber:request.body.completePhoneNumber},{isDeleted:false}]})
            
            request.body.userId = user._id
            let totalAmount = 0
            await request.body.bookingData.map(async(values,index)=>{
                await values.serviceItem.map((service,index)=>{
                 
                    totalAmount +=service.serviceItemPrice * service.serviceItemQuantity
                    
                })
            })
            request.body.totalAmount = totalAmount
            request.body.status = 'CONFIRMED'
            
            let booking = await bookingModel(request.body).save()
            return ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_ACCEPTED,Booking:booking })
            
            
        } catch (error) {
            console.log(error);
            
        }
    }
}