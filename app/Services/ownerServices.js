/* commit first branch  */
const laundryModel = require('../models/Laundry')
const laundrySubscription = require('../models/laundryBuySubscription')
// const ownwerModel = require('../models/owner')
const servicesModel = require('../models/Services')
const categoryModel = require('../models/serviceItemCategory')
const serviceItemModel = require('../models/serviceItems')
const laundryItemsModel = require('../models/laundryItems')
const AppConstraints = require('../../config/appConstraints')
const laundryBooking = require('../models/laundryBooking')
const Transections = require('../models/transectionLogs');
const otpModel = require('../models/otp')
const https = require('https');
let querystring = require('querystring');
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
const promoModel = require('../models/promoCode')
const subscriptionPlan = require('../models/laundrySubscriptionPlans')
const moment = require('moment-timezone')
const Promise = require('bluebird')
let qrdata=''
const qr = require('qrcode');
const pdf = Promise.promisifyAll(require('html-pdf'))
const fs = require('fs')
//const myConsole = new console.Console(fs.createWriteStream('./app/uploader/logs/output1.txt'));
const json2xls = require('json2xls')
let mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
//const myConsole = new console.Console(fs.createWriteStream('./app/uploader/payment.txt'));
const d=new Date()

const myConsole = new console.Console(fs.createWriteStream('./app/uploader/' +d.getTime()+'payment.txt'));
const { default: async } = require('async')
const Laundry = require('../models/Laundry')
const laundryBuySubscription = require('../models/laundryBuySubscription')
const taxModel = require('../models/tax')
module.exports = {
    registerOwner: async (request, response) => {
        try {
            if (request.body.password != request.body.confirmPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD });
            const findEmail = await laundryModel.findOne({ email: request.body.email })
            if (await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }] }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            if (request.body.email) {
                if (await laundryModel.findOne({ email: request.body.email }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMAIL_ALREADY });
            }
            request.body.password = bcrypt.hashSync(request.body.password, salt)
            if (request.files) {
                for (let index in request.files){
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

let completePhoneNumber = request.body.countryCode + request.body.phoneNumber;
let rand = Math.floor((Math.random() * 1000) + 540000);
//let  accessToken1 = await randomString.generate(150)
//let accessToken1="abcd";
let token = await authToken.generateOwnwerToken(laundry)
console.log('usr',request.body)
const user=await userModel({password:request.body.password, name : request.body.laundryName , email : request.body.email,cardRegistationId : [ ], districtId : [ ], weekendFlag : false, langaugeType : "EN", packChoosen : false, couponApplied : false, cityName : "", nationality : "", isRated : false, incentive : 0, completePhoneNumber : completePhoneNumber, location : "", landmark : "", house_flat : "", dateOfBirth : 0, gender : "", load : 0, isAvailable : true, isSubscriptiveUser : false, isActualPurchaser : false, hasSubscribed : false, userType : "USER", isTCAccepted : true, long : 0, lat : 0, licencePic : { "licencePicThumbnail" : "", "licencePicOriginal" : "" }, deviceToken : "12345", isOnline : true, Profilepic : { "thumbnail" : "", "original" : "" }, deviceType : "andriod", isEmailVerified : false, isVerified : false, isDeleted : false, isBlocked : false, isActive : true, emailVerificationcode : "", createDate : Date.now(), accessToken : token, callingCode : request.body.countryCode, phoneNumber : request.body.phoneNumber,referralCode:request.body.referralCode }).save()







    //        let token = await authToken.generateOwnwerToken(laundry)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.REGISTRATIONS_SUCESSFULL, ownwer: laundry, token: token })
        } catch (error) {
            console.log('eer', error);

            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    loginOwner: async (request, response) => {
        try {
            const ownwer = await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { countryCode: request.body.countryCode }] })

            if (ownwer == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_PHONE_PASSWORD });
            const compare = bcrypt.compareSync(request.body.password, ownwer.password)
            if (compare == true) {
                // console.log('owner------->>>>>>',ownwer);
                console.log("date",moment().valueOf());
                console.log("date",moment().format());
                let date = moment().valueOf()
                const checkSubscription = await laundryBuySubscription.findOne({laundryId:ownwer._id,endDate:{$gte:date}})
                const checkSubscriptionBranches = await laundryBuySubscription.findOne({subscriptionBanches:ownwer._id,endDate:{$gte:date}})
                console.log("check Subscription",checkSubscriptionBranches);
                
                console.log("checkSubscription",checkSubscription);
                let token = await authToken.generateOwnwerToken(ownwer);

		await userModel.update({phoneNumber :request.body.phoneNumber},{accessToken:token});
                if(!checkSubscription && !checkSubscriptionBranches) return ({ statusCode: 200, success: 0, msg: AppConstraints.SUBSRIPTION_PENDING ,isSubscription : 0 , ownwer: ownwer, token: token  });
                // console.log('sucessful login===============>>>>>>>');
                // console.log('owner', ownwer);
                return ({ statusCode: 200, success: 1, msg: AppConstraints.LOGIN_SUCESSFULL,isSubscription : 1, ownwer: ownwer, token: token })
            }
            return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_PHONE_PASSWORD })
        } catch (error) {
            console.log('errr', error);

            return ({ statusCode: 400, success: 0, msg: error })
        }


    },
    sendOtp: async (request, response) => {
        try {
            let findOtp = await otpModel.findOne({ phoneNumber: request.body.phoneNumber })
            if (findOtp) {
                await otpModel.deleteMany({ _id: findOtp._id })
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
            let otp = await otpModel.findOne({ otp: request.body.otp,phoneNumber: request.body.phoneNumber, countryCode: request.body.countryCode  })
            if (otp == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_OTP })
            await otpModel.deleteOne({ otp: request.body.otp, phoneNumber: request.body.phoneNumber, countryCode: request.body.countryCode })
            return ({ statusCode: 200, success: 1, msg: AppConstraints.OTP_VERIFIED_SUCCESSFULLY })

        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }

    },
    addBranches: async (request, response) => {
        try {
            console.log('oor', request.body.ownerId, "fa", request.ownerId);
            let findOwner =  await Laundry.findOne({_id:request.ownerId})
            if(findOwner.subscriptionLimit<= 0){
                return ({ statusCode: 400, success: 0, msg: AppConstraints.REACH_MAXIMUM_LIMIT });
            }
            if (request.body.ownerId != request.ownerId.toString()) return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_OWNER_ID })
    //        if (await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }] }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            //  if(await laundryModel.findOne({$and:[{$or:[{phoneNumber:request.body.phoneNumber},{isDeleted:false}]},{$or:[{email:request.body.email},{isDeleted:false}]}]})!=null)  return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })


            //  if(await laundryModel.findOne({$and:[{email:request.body.email},{isDeleted:false}]})!=null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })

            let password = Math.random().toString(36).slice(-8);
            request.body.password = bcrypt.hashSync(password, salt)
            const laundry = await laundryModel(request.body).save()
            await laundryModel.update({_id:request.ownerId},{ $inc: { subscriptionLimit: -1 } })
            await laundryBuySubscription.update({laundryId:request.ownerId},{ $push: { subscriptionBanches: laundry._id } })

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
            console.log('fffif', findData);

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
        try {
            let find = await laundryModel.find({ $and: [{ _id: request.body.id }, { isDeleted: false }] })
            if (request.body.phoneNumber) {
                let findEmailPassword = await laundryModel.find(
                    { $and: [{ phoneNumber: request.body.phoneNumber, isDeleted: false }] }
                )

                if (findEmailPassword.length != 0) {
                    if (findEmailPassword[0]._id.toString() != request.body.id) return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_NUMBER_USED })
                }
                // request.body.isVerified = false
            }
            if (request.body.email) {
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
                // console.log('kjjds',find[0].password);

                const comparePassword = await bcrypt.compare(request.body.password, find[0].password)
                // console.log('jdss', comparePassword);
                console.log('................................');

                if (comparePassword == false) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD })
                request.body.password = bcrypt.hashSync(request.body.newPassword, salt)
                let upadate = await laundryModel.update({ _id: request.body.id }, request.body)
                return ({ statusCode: 200, success: 1, msg: AppConstraints.CHANGE_LAUNDRY_PASSWORD })
            }
            console.log('rew', request.body);

            let upadate = await laundryModel.update({ _id: request.body.id }, request.body)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.PROFILE_SUCCESSFULLY })
        } catch (error) {
            return ({ statusCode: 400, success: 0, err: error })
        }
        // let find = await laundryModel.find({ $and: [{ _id: request.body.id }, { isDeleted: false }] })
        // if (request.body.phoneNumber ) {
        //     let findEmailPassword = await laundryModel.find(
        //             { $and: [{ phoneNumber: request.body.phoneNumber, isDeleted: false }] }    
        //         )

        //     if (findEmailPassword.length != 0) {
        //         if (findEmailPassword[0]._id.toString() != request.body.id) return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_NUMBER_USED })
        //     }
        //     // request.body.isVerified = false
        // }
        // if (request.body.email ) {
        //     let findEmailPassword = await laundryModel.find(
        //             { $and: [{ email: request.body.email, isDeleted: false }] }    
        //         )

        //     if (findEmailPassword.length != 0) {
        //         if (findEmailPassword[0]._id.toString() != request.body.id) return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_NUMBER_USED })
        //     }
        //     // request.body.isVerified = false
        // }
        // if (find == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_ID })
        // if (request.files) {
        //     for (let index in request.files) {
        //         // console.log(demo[index]);

        //         request.files[index].map((currentValue, index, array) => {
        //             console.log('inn', currentValue.fieldname);
        //             if (currentValue.fieldname == 'Document1') {

        //                 request.body.Document1 = '/' + currentValue.filename
        //             }
        //             if (currentValue.fieldname == 'Document2') {
        //                 request.body.Document2 = '/' + currentValue.filename
        //             }
        //             if (currentValue.fieldname == 'Document3') {

        //                 request.body.Document3 = '/' + currentValue.filename
        //             }
        //         })
        //     }
        // }
        // if (request.body.password) {
        //     if (!request.body.newPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_NEW_PASSWORD })
        //     console.log('kjjds',find[0].password);

        //     const comparePassword = await bcrypt.compare(request.body.password, find[0].password)
        //     console.log('jdss', comparePassword);

        //     if (comparePassword == false) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD })
        //     request.body.password = bcrypt.hashSync(request.body.newPassword, salt)
        // }
        // console.log('rew', request.body);

        // let upadate = await laundryModel.update({ _id: request.body.id }, request.body)
        // return ({ statusCode: 200, success: 1, msg: AppConstraints.PROFILE_SUCCESSFULLY })
    },
    getBranchList: async (request, response) => {
        console.log('...................');

        let list = await laundryModel.find({ $or: [{ ownerId: request.body.id },], isDeleted: false  })

        if (list.length == 0) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMPTY, List: list })
        return ({ statusCode: 200, success: 1, List: list })
    },
    getAllBranchList: async (request, response) => {
        console.log('...................');

        let list = await laundryModel.find({ $or: [{ ownerId: request.body.id },{ _id: request.body.id }], isDeleted: false  })

        if (list.length == 0) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMPTY, List: list })
        return ({ statusCode: 200, success: 1, List: list })
    },
    getAllBranchServices: async (request, response) => {
        console.log('...................');
        let ids = request.body.ids.map( id => mongoose.Types.ObjectId(id) )
        let list = await laundryServiceModel.find({'laundryId' : { $in: ids },isDeleted:false}).populate('serviceCategory')
        // let categoriesIds = []
        // list.map((data)=>{
        //     data.serviceCategory.map((ids)=>{
        //         categoriesIds.push(`${ids}`)
             
        //     })
        // })
        // let uniqueIds = [...new Set(categoriesIds)];
        // let 
      

        if (list.length == 0) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMPTY, List: list })
        return ({ statusCode: 200, success: 1, List: list })
    },
    getAllBranchServicesItems: async (request, response) => {
        console.log('...................');
        let laundryIds = request.body.laundryIds.map( id => mongoose.Types.ObjectId(id) )
        let categoriesIds = request.body.categoriesIds.map( id => mongoose.Types.ObjectId(id) )
        let servicesIds = request.body.servicesIds.map( id => mongoose.Types.ObjectId(id) )
        // console.log('cate ',categoriesIds);
        // let list = await laundryItemsModel.find({'laundryId' : { $in: request.body.laundryIds },'serviceId':{$in: request.body.servicesIds},'categoryId':{$in: request.body.categoriesIds},isDeleted:false})
//         var cars = [{ make: 'audi', model: 'r8', year: '2012' }, { make: 'audi', model: 'rs5', year: '2013' }, { make: 'ford', model: 'mustang', year: '2012' }, { make: 'ford', model: 'fusion', year: '2015' }, { make: 'kia', model: 'optima', year: '2012' }],
//     result = cars.reduce(function (r, a) {
//         r[a.make] = r[a.make] || [];
//         r[a.make].push(a);
//         return r;
//     }, Object.create(null));

// console.log(result)

// var cars = [{ make: 'audi', model: 'r8', year: '2012' }, { make: 'audi', model: 'rs5', year: '2013' }, { make: 'ford', model: 'mustang', year: '2012' }, { make: 'ford', model: 'fusion', year: '2015' }, { make: 'kia', model: 'optima', year: '2012' }],
//     result = list.reduce(function (r, a) {
//         r[a.categoryId] = r[a.categoryId] || [];
//         r[a.categoryId].push(a);
//         return r;
//     }, Object.create(null));

// console.log(result)
        let list = await categoryModel.aggregate([
            {
                $match :  {  '_id' : { $in: categoriesIds }}
            },
            {
                $lookup: {
                    from: 'laundaryitems',
                    let: { categoryId: "$category._id", id: "$_id" },

                    pipeline: [
                        {
                            $match:
                            {
                                laundryId : { $in: laundryIds},
                                serviceId : {$in:servicesIds}
                                
                            },
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$$id", "$categoryId"] },

                                        ]
                                }
                            }
                        },
                    ],
                    as: 'serviceItem'
                }

            },
         
        ])
        // let categoriesIds = []
        // list.map((data)=>{
        //     data.serviceCategory.map((ids)=>{
        //         categoriesIds.push(`${ids}`)
             
        //     })
        // })
        // let uniqueIds = [...new Set(categoriesIds)];
        // let 
      

        if (list.length == 0) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMPTY, List: list })
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

            console.log('reeee', request.body.id);

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
                {
                    $unwind: {
                        path: "$category", preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'serviceitems',
                        let: { categoryId: "$category._id", serviceId: "$_id" },
                        // let: { categoryId: "$category._id" },

                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$categoryId", "$$categoryId"] },
                                                { $eq: ["$serviceId", "$$serviceId"] },

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
                        _id: "$_id",
                        name: { $first: "$serviceName" },
                        serviceNameAr: { $first: "$serviceNameAr" },
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
                await request.body.services.map(async (object) => {

                    let findService = await servicesModel.findOne({ _id: object.serviceId })
                    console.log('finnnd', findService);

                    let laundryServices = {
                        serviceName: findService.serviceName,
                        servicePic: findService.servicePic,
                        hexString: findService.hexString,
                        serviceCategory: object.serviceCategory,
                        laundryId: request.body.id,
                        vendorServiceId: findService._id
                    }
                    let save = await laundryServiceModel(laundryServices).save()
                    console.log('..............................');

                    await laundryModel.findByIdAndUpdate({ _id: request.body.id }, { $push: { laundryServices: save._id } }) // add services in launderies
                    await object.serviceCategory.map(async (categories, index) => {
                        let findItems = await serviceItemModel.find({ $and: [{ serviceId: object.serviceId }, { categoryId: categories }] })
                        await findItems.map(async (laundryServiceItems) => {
                            let items = {
                                itemName: laundryServiceItems.itemName,
                                itemNameAr: laundryServiceItems.itemNameAr,
                                itemPic: laundryServiceItems.itemPic,
                                amountPerItem:parseInt(laundryServiceItems.amountPerItem),
                                categoryId: laundryServiceItems.categoryId,
                                serviceId: save._id,
                                series: laundryServiceItems.series,
                                laundryId: request.body.id,
                                vendorItemId: laundryServiceItems._id,
                                instant : parseInt(laundryServiceItems.amountPerItem)
                            }
                            let savesItems = await laundryItemsModel(items).save()
                        })

                    })
                    laundry = await laundryModel.findOne({ _id: request.body.id }).populate({ path: 'laundryServices', populate: { path: "serviceCategory" } })
                    return response.json({ statusCode: 200, success: 1, Laundry: laundry })

                })

            }
            if (request.body.serviceCategory) {
                console.log('sdjsdhsd');

                request.body.serviceCategory.category.map(async (category) => {


                    let findItems = await serviceItemModel.find({ $and: [{ serviceId: request.body.serviceCategory.serviceId }, { categoryId: category }] })
                    // console.log('finndd',findItems);
                    let laundryServices = await laundryServiceModel.update({ _id: request.body.serviceCategory.launderyServiceId }, { $push: { serviceCategory: category } })
                    console.log('lauundryyy', laundryServices);

                    await findItems.map(async (laundryServiceItems) => {


                        let items = {
                            itemName: laundryServiceItems.itemName,
                            itemNameAr: laundryServiceItems.itemNameAr,
                            itemPic: laundryServiceItems.itemPic,
                            amountPerItem:parseInt(laundryServiceItems.amountPerItem),
                            categoryId: category,
                            serviceId: request.body.serviceCategory.launderyServiceId,
                            series: laundryServiceItems.series,
                            laundryId: request.body.serviceCategory.id,
                            vendorItemId: laundryServiceItems._id,
                            instant : parseInt(laundryServiceItems.amountPerItem)
                        }
                        let savesItems = await laundryItemsModel(items).save()
                    })



                })
                return response.json({ statusCode: 200, success: 1, services: AppConstraints.SERVICES_ADDED })
            }
            if (request.body.emptyServices) {
               let findServicesData = await laundryServiceModel.findOne({laundryId: request.body.id,vendorServiceId: request.body.emptyServices[0].serviceId,isDeleted:false})
                if(findServicesData){
                    return response.json({ statusCode: 200, success: 1, message :'already added' })
                }
               let findExistService = await laundryServiceModel.findOne({laundryId: request.body.id,vendorServiceId: request.body.emptyServices[0].serviceId,isDeleted:true})
                if(findExistService){   
                    await laundryServiceModel.update({laundryId: request.body.id,vendorServiceId: request.body.emptyServices[0].serviceId,isDeleted:true},{isDeleted:false})
                     let laundryData = await laundryModel.findByIdAndUpdate({ _id: request.body.id }, { $push: { laundryServices: findExistService._id } })
                    return response.json({ statusCode: 200, success: 1, Laundry :laundryData })
                }
                laundry = await laundryModel.findOne({ _id: request.body.id })

                if (laundry == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_LAUNDRY_ID })
                await request.body.emptyServices.map(async (object, index) => {
                    let findService = await servicesModel.findOne({ _id: object.serviceId })
                    let laundryServices = {
                        serviceName: findService.serviceName,
                        servicePic: findService.servicePic,
                        hexString: findService.hexString,
                        serviceCategory: object.serviceCategory,
                        laundryId: request.body.id,
                        vendorServiceId: findService._id,
                        vendorlaundryDate:moment(findService.createDate).unix()

                    }
                    let save = await laundryServiceModel(laundryServices).save()
                    await laundryModel.findByIdAndUpdate({ _id: request.body.id }, { $push: { laundryServices: save._id } })
                    let laundryData = await laundryModel.findOne({ _id: request.body.id }).populate('laundryServices')
                    return response.json({ statusCode: 200, success: 1,Laundry :laundryData})
                }
                )

            }
            if(request.body.serviceItems){
                // console.log('service id',request.body.serviceItems.serviceItemId);
                // console.log('laundryId',request.body.serviceItems.laudryId);
                // console.log('laundry service is',request.body.serviceItems.laundryServiceId);
                // console.log('category id',request.body.serviceItems.categoryId);
                let  findCopyItems = await laundryItemsModel.findOne({isDeleted:false,vendorItemId:request.body.serviceItems.serviceItemId,laundryId:request.body.serviceItems.laudryId,serviceId:request.body.serviceItems.laundryServiceId,categoryId:request.body.serviceItems.categoryId})
                if(findCopyItems) return response.json({ statusCode: 400, success: 1, message:AppConstraints.SERVICE_ITEMS_EXIST })

                let serviceItemData = await serviceItemModel.findOne({_id:request.body.serviceItems.serviceItemId})
                if(!serviceItemData)  return response.json({ statusCode: 400, success: 1, message:AppConstraints.INVALID_SERVICE_ITEM_ID })

                let laudryData = await laundryModel.findOne({_id:request.body.serviceItems.laudryId})
                if(!laudryData)  return response.json({ statusCode: 400, success: 1, message:AppConstraints.INVALID_SERVICE_ITEM_ID })

                let laundryServiceData = await laundryServiceModel.findOne({_id:request.body.serviceItems.laundryServiceId,laundryId:request.body.serviceItems.laudryId})
                if(!laundryServiceData)  return response.json({ statusCode: 400, success: 1, message:AppConstraints.INVALID_LAUNDRY_SERVICE_ID })


                let categoryData = await categoryModel.findOne({_id:request.body.serviceItems.categoryId})
                if(!categoryData)  return response.json({ statusCode: 400, success: 1, message:AppConstraints.INVALID_CATEGORY_ID })


                // let laundryItems = {
                //     itemName: serviceItemData.itemName,
                //     itemNameAr: serviceItemData.itemNameAr,
                //     itemPic: serviceItemData.itemPic,
                //     amountPerItem:parseInt(serviceItemData.amountPerItem),
                //     categoryId: request.body.serviceItems.categoryId,
                //     serviceId: request.body.serviceItems.laundryServiceId,
                //     series: serviceItemData.series,
                //     laundryId: request.body.serviceItems.laudryId,
                //     vendorItemId: serviceItemData._id,
                //     instant : parseInt(serviceItemData.amountPerItem)
                // }
                // console.log('laundrt',serviceItemData._id);
                // console.log('laun',serviceItemData);
                let items = await laundryItemsModel.update({isDeleted:true,vendorItemId:request.body.serviceItems.serviceItemId,laundryId:request.body.serviceItems.laudryId,serviceId:request.body.serviceItems.laundryServiceId,categoryId:request.body.serviceItems.categoryId},{isDeleted:false})

                return response.json({ statusCode: 200, success: 1, Items : items})
                
            }



        } catch (error) {
            console.log('eee', error);

        }

    },
    findEmailNumber: async (request, response) => {
        if (request.body.phoneNumber) {
            let find = await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { isDeleted: false }] })
            if (find != null) return ({ statusCode: 400, success: 1, msg: AppConstraints.PHONE_ALREADY })
        }
        if (request.body.email) {
            let find = await laundryModel.findOne({ $and: [{ email: request.body.email }, { isDeleted: false }] })
            if (find != null) return ({ statusCode: 400, success: 1, msg: AppConstraints.EMAIL_ALREADY })
        }
        return ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_PHONE_NOT_REGISTER })
    },
    deleteData: async (request, response) => {
        await laundryServiceModel.deleteMany({ laundryId: request.body.id })
    },
    updatePrice: async (request, response) => {
        console.log('reee', request.body.laundryId);
        try {
            let findItems = await laundryItemsModel.findOne({ $and: [{ _id: request.body.id }, { laundryId: request.body.laundryId }] })
            // console.log('djdsd', findItems);
            if(request.body.instant&&request.body.amountPerItem){
                if(request.body.amountPerItem>request.body.instant){
                    return ({ statusCode: 400, success: 0,msg:AppConstraints.STANDRAD_NOT_GREATER});
                }
                await laundryItemsModel.update({ _id: findItems._id }, request.body)
                return ({ statusCode: 200, success: 1, msg: AppConstraints.UPDATE_PRICE })
            }
            if(request.body.instant&&request.body.instant<findItems.amountPerItem) return ({ statusCode: 400, success: 0,msg:AppConstraints.STANDRAD_NOT_LESS});
            if(request.body.amountPerItem>findItems.instant)  return ({ statusCode: 400, success: 0,msg:AppConstraints.STANDRAD_NOT_GREATER});
            if (findItems == null) return response.json({ statusCode: 400, sucess: 0, msg: AppConstraints.INVALID_ID })
            console.log('req',request.body);
            
            await laundryItemsModel.update({ _id: findItems._id }, request.body)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.UPDATE_PRICE })
        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }

    },
    listing: async (request, response) => {
        // let list = await servicesModel.find()
        if (request.body.id && request.body.categoryId) {
            let serviceItems = await serviceItemModel.find({ $and: [{ serviceId: request.body.id }, { categoryId: request.body.categoryId }] })
console.log('serviceId',request.body.id);
console.log('CatId',request.body.categoryId);

         console.log('service========>>>>>',serviceItems.length);
            
            return ({ statusCode: 200, success: 1, ServiceItems: serviceItems })
        }
        if (request.body.id) {
            let list = await servicesModel.findOne({ _id: request.body.id }).populate('serviceCategory')
            return ({ statusCode: 200, success: 1, List: list })
        }
        let list = await servicesModel.find({})
        return ({ statusCode: 200, success: 1, List: list })
    },
    itemsPrice: async (request, response) => {
        console.log('innnnsahadgsh');

        try {
            let itemPrice = await laundryItemsModel.find({ $and: [{ categoryId: request.body.categoryId }, { serviceId: request.body.serviceId }, { laundryId: request.body.laundryId }] })
            if (itemPrice == null) return response.json({ statusCode: 400, success: 0, msg: AppConstraints.VALID_ID })
            return ({ statusCode: 200, success: 1, priceList: itemPrice })
        } catch (error) {

        }
    },
    createBookings: async (request, response) => {
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
		console.log('complete phone number',request.body );
            let phonenumber=  request.body.completePhoneNumber ;
		console.log('phonenumber',phonenumber);
            let user = await userModel.findOne({ $and: [{ completePhoneNumber: phonenumber }, { isDeleted: false }] })
            if(!user)  return ({ statusCode: 400, success: 0, msg: AppConstraints.NOT_REGISTER_BOOKING })
            // if(user==null)return response
            // if(user==null)
            // console.log('user',user);
            console.log('req===========>>>>>>>>>',request.laundryId);
            
            request.body.userId = user._id
            let current = 0
            let totalAmount = 0
            let curretAmout = []
            let amount
            let servicePrice = []
            let count 
            let items = 0 
            await request.body.bookingData.map(async (values, index1) => {
              
                let data = values.serviceItem.serviceItem
                await values.serviceItem.map((service, index) => {
                   
                    items+=service.serviceItemQuantity
                    // console.log('serr',service.serviceItemQuantity);
                    items = items
                    current += service.price * service.serviceItemQuantity
                    totalAmount += service.price * service.serviceItemQuantity
                    if(index ==values.serviceItem.length-1 ){
                        curretAmout.push({totalPrice:current,serviceName:values.serviceName,serviceNameAr:values.serviceNameAr,serviceItemQuantity:items})
                        current = 0  
                        items = 0                      
                    }
                 
                })
            
                
            })
            // console.log('curret',curretAmout);
		
		let tax=request.body.tax
            tax=tax*totalAmount/100
            totalAmount=totalAmount+tax            

            request.body.totalAmount = totalAmount
            request.body.status = 'CONFIRMED'
            request.body.servicePrice = curretAmout
            // console.log('srev',service);
            request.body.createDate = moment().valueOf()
		
            //request.body.tax='70'
            let booking = await bookingModel(request.body).save()
            booking.data = curretAmout
            console.log('bbb',booking.data);
            
            return ({ statusCode: 200, success: 1, msg: AppConstraints.BOOKING_ACCEPTED, Booking: booking})


        } catch (error) {
            console.log(error);

        }
    },
    laundryDetails: async (request, response) => {
        let laudry = await laundryModel.aggregate([
            { $match: { _id: ObjectId(request.body.id) } },
            {
                $lookup: {
                    from: 'laundryservices',
                    localField: "laundryServices",
                    foreignField: "_id",
                    as: 'laundryServices'
                }
            },
            
            {
                $unwind: {
                    path: "$laundryServices", preserveNullAndEmptyArrays: false
                }
            },

            {
                $lookup: {
                    from: 'servicecategories',
                    localField: "laundryServices.serviceCategory",
                    foreignField: "_id",
                    as: 'laundryServices.$serviceCategory'
                }
            },
            // {
            //     $unwind: {
            //         path: "$laundryServices.serviceCategory", preserveNullAndEmptyArrays: false
            //     }
            // },
            // {
            //     $lookup: {
            //         from: 'laundaryitems',
            //         let: { categoryId: "$laundryServices.serviceCategory._id", serviceId: "$laundryServices._id" },
            //         // let: { categoryId: "$category._id" },

            //         pipeline: [
            //             {
            //                 $match:
            //                 {
            //                     $expr:
            //                     {
            //                         $and:
            //                             [
            //                                 { $eq: ["$categoryId", "$$categoryId"] },
            //                                 //    { $eq: [ "$serviceId",  "$$serviceId" ] },

            //                             ]
            //                     }
            //                 }
            //             },
            //             //    { $group: {  _id: "$_id",laundryServices:{$addToSet:"$laundryServices"} } },
                      
            //         ],
            //         as: 'laundryServices.serviceCategory.serviceItems'
            //     }
            // },
          
            {
                $group:{
                    // _id:"$_id",
                    _id:"$_id",
                    laundryServices:{$push:"$laundryServices"},
                    // laundryServices: {  $push: "$laundryServices"} 
                }
            },
          
         
        ])
        response.json(laudry)
    },
    laundryService: async (request, response) => {
        if (request.body.status == 'service') {
            let laundry = await laundryServiceModel.find({ $and: [{ laundryId: request.body.id }, { isDeleted: false }] }).sort({vendorlaundryDate:1})
            return ({ statusCode: 200, success: 1, Laundry: laundry })
        }
        if (request.body.status == 'category') {
            let category = await laundryServiceModel.findOne({ $and: [{ _id: request.body.serviceId }, { laundryId: request.body.id }] }).populate('serviceCategory')
            return ({ statusCode: 200, success: 1, Category: category })
        }
        if (request.body.status == 'serviceItems') {
            let serviceItems = await laundryItemsModel.find({ $and: [{ categoryId: request.body.categoryId }, { serviceId: request.body.serviceId }, { laundryId: request.body.id },{isDeleted : false}] })
            return ({ statusCode: 200, success: 1, Serviceitems: serviceItems })
        }
    },
    getBookings: async (request, response) => {
        try {
            let limit = 10 , skip = 0
            if(request.body.skip == null || request.body.skip == 0 ){
                skip = 0
            }else{
                skip = request.body.skip *10
            }
            let booking = await bookingModel.find({ laundryId: request.body.id }).sort({_id:-1}).skip(skip).limit(limit).populate('userId')
            let count = await bookingModel.find({ laundryId: request.body.id })
	   let totalRevenue=await bookingModel.find({laundryId: request.body.id},{totalAmount:1,_id:0});
 let totalAmmountToSend=0.0;
console.log("count",totalRevenue.length);
console.log("countdirect",count);
      for(let i=0;i<totalRevenue.length;i++){
          console.log(totalRevenue[i].totalAmount,'=======================amiount')
        totalAmmountToSend+=parseFloat(totalRevenue[i].totalAmount);
        console.log(totalAmmountToSend,'=================================')
      }
            let recipt = []
            if(skip !=0){
                limit = limit*skip
            }
            let bookingPdf = await bookingModel.find({ laundryId: request.body.id }).sort({_id:-1}).limit(limit).populate('userId laundryId')
            let laundryDetails = bookingPdf[0].laundryId
            bookingPdf.map((bookingData)=>{
                let paymentOption 
                if(bookingData.paymentOption== "CASH_ON_DELIVERY"){
                    paymentOption = "Cash"
                }
                if(bookingData.paymentOption== "NET_BANKING"){
                    paymentOption = "Net Banking"
                }
                if(bookingData.paymentOption== "CREDIT_DEBIT_CARD"){
                    paymentOption = "Card"
                }
                recipt.push({orderId:bookingData.orderId,totalAmount:bookingData.totalAmount,paymentOption:paymentOption,deliveryChoice:bookingData.deliveryChoice})
            }) 
            console.log('recipt',recipt);  
            console.log('uuidv4()',uuidv4()); 
        let data1 = await pdfData(recipt,laundryDetails)
        console.log('dir',__dirname);
        let id = uuidv4()
        let Pdflink = await pdf.createAsync(data1, { format: 'A4', filename: './app/uploader/'+id+"order"+'.pdf' }); 
            return ({ statusCode: 200, success: 1, Booking: booking , Count : count.length,  TotalAmountToSend : totalAmmountToSend,pdfLinK :  `/${id}order.pdf` })
        } catch (error) 
{
            console.log("error",error);
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    getBookingsByDate: async (request, response) => {
        try {
            let limit = 10 , skip = 0
            if(request.body.skip == null || request.body.skip == 0 ){
                skip = 0
            }else{
                skip = request.body.skip *10
            }
            let query = {}
            let data = []
         
            if(request.body.status){
                // query["status"] = request.body.status
                query.status = request.body.status
                data.push({query:request.body.status})
            }
            if(request.body.startDate && request.body.endDate){
                console.log('data-----',moment(request.body.startDate).startOf("day").format());
                console.log('data====>>',moment(request.body.endDate).endOf("day").format());
                query.createDate = { $gte:moment(request.body.startDate).startOf("day").valueOf() ,$lte:moment(request.body.endDate).endOf("day").valueOf() }
                
                data.push({  createDate : { $gte:moment(request.body.startDate).startOf('day').valueOf() ,$lte:moment(request.body.endDate).endOf('day').valueOf() }})
            }
            if(request.body.bagNo){
                query.bagNo = request.body.bagNo
                data.push({bagNo:request.body.bagNo})
            }
            query.laundryId = mongoose.Types.ObjectId(request.laundryId)
            if(request.body.orderId){
               
                   // query["status"] = request.body.status
                   query.orderId = request.body.orderId
                
               }

            
            if(request.body.deliveryChoice||request.body.serviceType){
                if(request.body.deliveryChoice == "both"&&request.body.serviceType == "both"){
                    console.log('innnnn');
                    query["$or"] = [ { deliveryChoice: "From store" }, { deliveryChoice: "Home delivery" },{ type: "standard" }, { type: "instant" } ]
                }
                else{
                    if(request.body.serviceType == "both"){
                    
                        query["$or"] = [ { type: "standard" }, { type: "instant" } ]
                    }
                    else if(request.body.serviceType){
                        query.type = request.body.serviceType  
                    }
                    if(request.body.deliveryChoice == "both"){
                        query["$or"] = [ { deliveryChoice: "From store" }, { deliveryChoice: "Home delivery" } ]
                    }
                    else if(request.body.deliveryChoice){
                       query.deliveryChoice = request.body.deliveryChoice
                    }
                }
            }
            console.log('query',query);
            let count = await bookingModel.find({ laundryId: mongoose.Types.ObjectId(request.laundryId)})
            if(request.body.number){
                const user = await userModel.findOne({completePhoneNumber:request.body.number})
                if(!user)   return ({ statusCode: 200, success: 1, Booking: [] , Count : count.length })
                query.userId = mongoose.Types.ObjectId(user._id)
            }
            let booking = await bookingModel.find(query).sort({_id:-1}).skip(skip).limit(limit).populate('userId')
            if(skip !=0){
                limit = limit*skip
            }
            let bookingPdf = await bookingModel.find(query).sort({_id:-1}).skip(skip).limit(limit).populate('userId laundryId')

            let recipt = []
            console.log('daat',bookingPdf[0].laundryId);
            let laundryDetails = bookingPdf[0].laundryId
	 let totalRevenue=await bookingModel.find(query);
 let totalAmmountToSend=0.0;
console.log("count",totalRevenue.length);
console.log("countdirect",count);
      for(let i=0;i<totalRevenue.length;i++){
          console.log(totalRevenue[i].totalAmount,'=======================amiount')
        totalAmmountToSend+=parseFloat(totalRevenue[i].totalAmount);
        console.log(totalAmmountToSend,'=================================')
      }

           bookingPdf.map((bookingData)=>{
                let paymentOption 
                if(bookingData.paymentOption== "CASH_ON_DELIVERY"){
                    paymentOption = "Cash"
                }
                if(bookingData.paymentOption== "NET_BANKING"){
                    paymentOption = "Net Banking"
                }
                if(bookingData.paymentOption== "CREDIT_DEBIT_CARD"){
                    paymentOption = "Card"
                }
                 
                recipt.push({orderId:bookingData.orderId,totalAmount:bookingData.totalAmount,paymentOption:paymentOption,deliveryChoice:bookingData.deliveryChoice})
            }) 
            console.log('recipt',recipt);  
            console.log('uuidv4()',uuidv4()); 
        let data1 = await pdfData(recipt,laundryDetails)
        console.log('dir',__dirname);
        let id = uuidv4()
        let Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+"order"+'.pdf' }); 
        console.log('data',Pdflink.filename);      
            return ({ statusCode: 200, success: 1, Booking: booking , Count : totalRevenue.length, TotalAmountToSend : totalAmmountToSend , pdfLinK :  `/${id}order.pdf` })
        } catch (error) {
            console.log('errr',error);
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    getOrderById: async (request, response) => {
        try {


            let booking = await bookingModel.findOne({ orderId: request.params.orderId }).populate('userId')
            return ({ statusCode: 200, success: 1, Booking: booking })
        } catch (error) {

        }
    },
    deleteServices: async (request, response) => {
        try {
            if (request.body.status == 'service') {
                findService = await laundryModel.findOne({ _id: request.body.id, laundryServices: request.body.serviceId  })
                console.log('findServices', findService);
                if (findService == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_ID });
                await laundryModel.update({ _id: findService._id }, { $pull: { laundryServices: request.body.serviceId } })
                await laundryServiceModel.update( { _id: request.body.serviceId},{isDeleted:true,serviceCategory:[]})
                await laundryItemsModel.deleteMany({ $and: [{ laundryId: findService._id }, { serviceId: request.body.serviceId }] })
                return ({ statusCode: 200, success: 1, msg: AppConstraints.DELETED })
            }
            if (request.body.status == 'category') {
                let findCategory = await laundryServiceModel.findOne({ $and: [{ laundryId: request.body.id }, { serviceCategory: request.body.categoryId }, { _id: request.body.serviceId }] })
                console.log('find category', findCategory);

                if (findCategory == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_ID });
                await laundryServiceModel.update({ _id: findCategory._id }, { $pull: { serviceCategory: request.body.categoryId } })
                //   let data = await laundryItemsModel.find({$and:[{laundryId:request.body.id},{serviceId:request.body.serviceId},{categoryId:request.body.categoryId}]})
                // let data = await laundryItemsModel.find({$and:[{laundryId:request.body.id},{serviceId:request.body.serviceId},{categoryId:request.body.categoryId}]})

                //   console.log('data',data);

                await laundryItemsModel.deleteMany({ $and: [{ laundryId: request.body.id }, { serviceId: request.body.serviceId }, { categoryId: request.body.categoryId }] })
                return ({ statusCode: 200, success: 1, msg: AppConstraints.DELETED })
            }
        } catch (error) {
            console.log('error', error);

        }
    },
    updatePassword: async (request, response) => {
        try {
            if (!request.body.newPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_NEW_PASSWORD })
            // console.log('kjjds',find[0].password);
            let find = await laundryModel.findOne({ _id: request.body.id })
            const comparePassword = await bcrypt.compare(request.body.password, find.password)
            // console.log('jdss', comparePassword);
            console.log('................................');

            if (comparePassword == false) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD })
            request.body.password = bcrypt.hashSync(request.body.newPassword, salt)
            let upadate = await laundryModel.update({ _id: request.body.id }, request.body)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.CHANGE_LAUNDRY_PASSWORD })
        } catch (error) {
            return ({ statusCode: 400, success: 0, Error: error })
        }
    },
    serviceFullDetails:async(request,response)=>{
        try {
            let details = await laundryServiceModel.aggregate([
                {$match:{$and:[{_id:ObjectId(request.body.id) },{laundryId:ObjectId(request.body.laundryId)}]} },
                {
                    $lookup:{
                        from:'servicecategories',
                        localField:'serviceCategory',
                        foreignField:'_id',
                        as:'serviceCategory'
                    }
                },
                {
                    $unwind: {
                        path: "$serviceCategory", preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'laundaryitems',
                        let: { categoryId: "$serviceCategory._id", serviceId: "$_id" },
                        // let: { categoryId: "$category._id" },

                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$categoryId", "$$categoryId"] },
                                                { $eq: ["$serviceId", "$$serviceId"] },
                                                { $eq: ["$isDeleted", false] }

                                            ]
                                    }
                                }
                            },
                        ],
                        as: 'serviceCategory.serviceItem'
                    }

                },
                {
                    $group:{
                        _id:"$_id",
                        laundryId:{$first:"$laundryId"},
                        vendorServiceId:{$first:"$vendorServiceId"},
                        isActive:{$first:"$isActive"},
                        serviceCategory: {$push:"$serviceCategory"}

                    }
                }
            ])
            
            return ({ statusCode: 200, success: 1, Services: details})
            
        } catch (error) {
            console.log('err',error);
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    createPromo:async(request,response)=>{
        try {
            // console.log('request',request);
            // if(await laundryModel.findOne({_id:request.body.laundryId})==null)return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            if(await laundryServiceModel.findOne({_id:request.body.serviceId})==null) ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            request.body.laundryId = request.laundryId
            // console.log('data=============', Math.random().toString(36).substring(8));
            request.body.promoCode =  Math.random().toString(36).substring(8)
            if(request.body.startDate && request.body.expiryDate){
            
                request.body.startDate = moment(request.body.startDate).valueOf()
                request.body.expiryDate = moment(request.body.expiryDate).valueOf()
                if(moment(request.body.expiryDate).valueOf()< moment(request.body.startDate).valueOf()){
                    return ({ statusCode:200, success: 0,msg:AppConstraints.START_DATE_LESS_THEN_EXPIRE , })
                }
            }
          console.log('date----------->>>>>>',moment("2020-01-19T09:05:08+05:30").format());
            let promo = await promoModel(request.body).save()
            return ({ statusCode:200, success: 1,msg:AppConstraints.COUPON_ADDED ,Promo:promo })
            
        } catch (error) {
            console.log('err',error);
            
        }
    },
    updatePromo:async(request,response)=>{
        try {
            console.log('request===========>>>>>>>>>>>>');
            if(await promoModel.findOne({_id:request.body.promoId,laundryId:request.ownerId,isDeleted:"false"})==null)return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            if(await laundryServiceModel.findOne({_id:request.body.serviceId})==null) ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            // request.body.laundryId = request.laundryId
            // request.body.startDate = moment().unix()
            // request.body.expiryDate = moment(request.body.expiryDate).unix()
            console.log('date----------->>>>>>',moment(1631267321491).format());
            if(request.body.startDate && request.body.expiryDate){
                console.log('start date',request.body.startDate)
                console.log('end date',request.body.expiryDate);
               request.body.startDate = moment(request.body.startDate).valueOf()
                request.body.expiryDate = moment(request.body.expiryDate).valueOf()
                if(moment(request.body.expiryDate).valueOf()< moment(request.body.startDate).valueOf()){
                    return ({ statusCode:200, success: 0,msg:AppConstraints.START_DATE_LESS_THEN_EXPIRE , })
                }
            }
            
            let promo = await promoModel.findByIdAndUpdate({_id:request.body.promoId,isDeleted:false},request.body,{new:true})
            return ({ statusCode:200, success: 1,msg:AppConstraints.COUPON_UPDATED ,promo : promo  })
            
        } catch (error) {
            console.log('err',error);
            
        }
    },
    applyPromo:async(request,response)=>{
        try {
            let booking = await bookingModel.findOne({_id:request.body.bookingId})
            let promo = await promoModel.findOne( { $and:[{_id:request.body.promoId},{isDeleted:false}]})
            if(promo.expiryDate<moment().unix()) return response.json({statusCode:400,sucess:1,msg:AppConstraints.COUPON_EXPIRE})
            let promoData = 0 
            booking.bookingData.map((object,index)=>{
                if(object.serviceId==promo.serviceId){
                    promo.categoryId.map((promoObject,index)=>{
                        object.serviceItem.map((serviceitems,index)=>{
                            if(promoObject==serviceitems.categoryId){
                                promoData += serviceitems.serviceItemQuantity * serviceitems.price  
                            }
                        })  
                    })  
                }
            })
            if(promoData<promo.minimumAmount)return  ({ statusCode: 400, success: 0, msg:AppConstraints.MINI_DISCOUNT_PRICE})
            console.log(booking.totalAmount);
            let discoutPrice = 0
            promo.discount = 100/promo.discount
            discoutPrice = promoData/promo.discount
            discoutPrice =promoData-discoutPrice
            booking.totalAmount -= promoData
            booking.totalAmount+=discoutPrice
            await bookingModel.update({_id:request.body.bookingId},{totalAmount:booking.totalAmount})
            return  ({ statusCode: 400, success: 0, msg:AppConstraints.COUPON_APPLIES})
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
            
        }
    },
    getlaundryCoupons : async(request,response)=>{
        try {
           

           
                
                let promoCodes = await promoModel.find({laundryId:request.ownerId,isDeleted:"false"}).sort({_id:-1}).populate('laundryId branchesId serviceId categoryId serviceItems')
                // if(promoCodes==null) return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
                return    ({ statusCode: 400, success: 1, promoCodes:promoCodes})
           
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    getlaundryCouponsById : async(request,response)=>{
        try {
            console.log('iddd',request.laundryId);

           
                
                let promoCodes = await promoModel.findOne({$and:[{laundryId:request.laundryId,_id:request.params.id,isDeleted:"false"}]}).populate('laundryId branchesId serviceId categoryId serviceItems')
                if(promoCodes==null) return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
                return    ({ statusCode: 200, success: 1, promoCodes:promoCodes})
         
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    deletelaundryCoupons : async(request,response)=>{
        try {
            

        
                
                let promoCodes = await promoModel.find({$and:[{laundryId:request.ownerId,_id:request.body.promoId,isDeleted:"false"}]})
                if(promoCodes==null) return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
                 await promoModel.update({_id:request.body.promoId,isDeleted:false},{isDeleted:"true"})
                return    ({ statusCode: 200, success: 1,msg:AppConstraints.COUPON_DELETED })
          
        } catch (error) {
            console.log('error',error);
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
 
    downlaodPdf:async(request,response)=>{
        try {
            let booking = await bookingModel.find({laundryId:request.query.laundryId,createDate : { $gte:moment(request.query.startDate).startOf('day').valueOf() ,$lte:moment(request.query.endDate).endOf('day').valueOf() }},{   orderId:1,
                totalAmount:1,
               paymentOption:1,
               deliveryChoice:1,
               laundryId:1
            }).populate('laundryId')

            let recipt = []
            let laundryDetails = booking[0].laundryId
            booking.map((bookingData)=>{
                let paymentOption 
                if(bookingData.paymentOption== "CASH_ON_DELIVERY"){
                    paymentOption = "Cash"
                }
                if(bookingData.paymentOption== "NET_BANKING"){
                    paymentOption = "Net Banking"
                }
                if(bookingData.paymentOption== "CREDIT_DEBIT_CARD"){
                    paymentOption = "Card"
                }
                recipt.push({orderId:bookingData.orderId,totalAmount:bookingData.totalAmount,paymentOption:paymentOption,deliveryChoice:bookingData.deliveryChoice})
            })    
        let data1 = data(recipt,laundryDetails)
    //    let  data2 = data(booking)
             
    
    console.log("========>>>>>>>>>>",recipt);
            pdf.create(data1).toFile('./'+"order"+'.pdf',(err,match)=>{
                // console.log('errr',err);
                // console.log('match',match);
                response.download(match.filename)
            })

            
            // payload(data)
        } catch (error) {
            console.log(error);
            
            return ({ statusCode: 400, success: 1, Error:error})
        }

    },

    changeBookingStatus:async(request,response)=>{
        try {
            let findBooking = await bookingModel.find({$and:[{_id:request.body.bookingId},{isDeleted:false}]})
            if(findBooking==null)  return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            // if(request.body.sat)
            console.log('...........',request.body);
            
           if(request.body.status==1){
            await bookingModel.update({_id:request.body.bookingId},{status:"CONFIRMED"})
            return  ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_CONFIRMED})
           }
           if(request.body.status==2){
            await bookingModel.update({_id:request.body.bookingId},{status:"INPROGRESS"})
            return  ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_INPROGRESS})
           }
           if(request.body.status==3){
            /***card/cash changes***/
            
               let paymentOpt
        if(request.body.paymentOption =='Cash'){
            console.log("cash sel")
            paymentOpt =  "CASH_ON_DELIVERY"
        }
        else if(request.body.paymentOption =='Card'){
            console.log("card sel")
	        paymentOpt = "CREDIT_DEBIT_CARD"
        }
        console.log(paymentOpt,request.body.paymentOption+"..");
            if(request.body.paymentOption==null)   
            await bookingModel.update({_id:request.body.bookingId},{status:"DELIVERED"})
            else
            await bookingModel.update({_id:request.body.bookingId},{status:"DELIVERED",paymentOption:paymentOpt})
            return  ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_DELIVERED})
           }
        } catch (error) {
            console.log(error);
            
        }
    },
    downloadExcel:async(request,res)=>{
        try {
            console.log('start date',moment(request.body.startDate).startOf('day').format());
            let booking = await bookingModel.aggregate([
                
                { $match: {laundryId:mongoose.Types.ObjectId(request.query.laundryId)},
                },
                {$match:{createDate : { $gte:moment(request.query.startDate).startOf('day').valueOf() ,$lte:moment(request.query.endDate).endOf('day').valueOf() }}},
                {
                    $project:{
                        _id:0,
                        orderId:1,
                         totalAmount:1,
                        paymentOption:1,
                        deliveryChoice:1
                    }
                }
            ])
            let recipt = []
            booking.map((bookingData)=>{
                let paymentOption 
                if(bookingData.paymentOption== "CASH_ON_DELIVERY"){
                    paymentOption = "Cash"
                }
                if(bookingData.paymentOption== "NET_BANKING"){
                    paymentOption = "Net Banking"
                }
                if(bookingData.paymentOption== "CREDIT_DEBIT_CARD"){
                    paymentOption = "Card"
                }
                recipt.push({"Order No":bookingData.orderId,"Amount":bookingData.totalAmount,"Payment Mode":paymentOption,"Delivery Type":bookingData.deliveryChoice})
            })
           res.xls('Bookings.xlsx',recipt);
        } catch (error) {
            console.log(error);
            
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    getBagById : async(request,response)=>{
        try {
            const findBooking = await bookingModel.findOne({bagNo:request.params.bagNo})
            if(findBooking==null) return ({ statusCode: 400, success: 1, Error:AppConstraints.VALID_ID})
            return  ({ statusCode: 400, success: 1, Booking:findBooking})
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    deleteServiceItem : async(request,response)=>{
        try {
            const items = await laundryItemsModel.findOne({_id:request.body.itemsId})
            if(items==null) return ({ statusCode: 400, success: 1, Error:AppConstraints.INVALID_SERVICE_ITEM_ID})
            await laundryItemsModel.update({_id:request.body.itemsId},{isDeleted:true})
            return  ({ statusCode: 200, success: 1, items:AppConstraints.DELETED})
        } catch (error) {
            
        }
    },
    
    getplandates: async(request,response)=>{

let plandet={};    
    let  SUCCESS=false;
    console.log("date getplandates",moment().format());
     myConsole.log("date getplandates",moment().format());
            var findPalns=request.query
            if(findPalns==null)
            return("No data given!");
            
            console.log("query"+ moment().startOf("day").format('DD-MM-YYYY'),findPalns)
            console.log("body",request.body)
            myConsole.log("query"+ moment().startOf("day").format('DD-MM-YYYY'),findPalns)
            myConsole.log("body",request.body)
            const plans = await subscriptionPlan.find({"planName":findPalns.planName})
            console.log("plans",plans)
            myConsole.log("plans",plans)
            
            if(plans.length == 0){
            //response.json({Msg:"No matching plans"});
            response.writeHead(302 , {
           'Location' : 'https://mgaseldocs.online/testform/adminfeatures/addplanresponse.php?countryCode='+request.query.countryCode+'&phoneNumber='+request.query.phoneNumber+'&planName='+request.query.planName+'&Msg=No Matching Plans found' 
// This is your url which you want
        });
response.end();
            
            }
            
             const ownwer = await laundryModel.findOne({ $and: [{ phoneNumber: findPalns.phoneNumber }, { countryCode: findPalns.countryCode }] })
            console.log("owner",ownwer)
             myConsole.log("owner",ownwer)
            //console.log("ownerid",ownwer._id)
            response.setHeader("Content-Type", "text/html");
            if(ownwer == null){
//            response.json({Msg:"No user found with this phone number"});
 response.writeHead(302 , {
           'Location' : 'https://mgaseldocs.online/testform/adminfeatures/addplanresponse.php?countryCode='+request.query.countryCode+'&phoneNumber='+request.query.phoneNumber+'&planName='+request.query.planName+'&Msg=No user found with this number'
 // This is your url which you want
        });
response.end();


	}
		let date = moment().valueOf()
			 let checkSubscription = await laundryBuySubscription.findOne({laundryId:ownwer._id,endDate:{$gte:date}})
			 if(checkSubscription)
			 {
			    // plans=checkSubscription
        // response.json({Msg:"Plan already added for user/User has valid subscription"});
         response.writeHead(302 , {
           'Location' : 'https://mgaseldocs.online/testform/adminfeatures/addplanresponse.php?countryCode='+request.query.countryCode+'&phoneNumber='+request.query.phoneNumber+'&planName='+request.query.planName+'&Msg=Plan already added for user/User has valid subscription'
 // This is your url which you want
        });
response.end();
			 }
    
   if(findPalns.planName=="Annually"){ 
 plansdet={
planName:'Annually',  //plans.planName,
planAmount:'585', //plans.planAmount,
perPeriod:'1 Year' //plans.planName
}

		var curdate=moment().startOf("day").valueOf()
            
		console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		console.log("enddate",moment().add(365,'days').endOf("day").format('DD-MM-YYYY'))
		
		myConsole.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		myConsole.log("enddate",moment().add(365,'days').endOf("day").format('DD-MM-YYYY'))
		
			console.log("start:..",moment().startOf("day").valueOf())
			console.log("end:..",moment().add(365, 'days').endOf("day").valueOf())
			
				myConsole.log("start:..",moment().startOf("day").valueOf())
			myConsole.log("end:..",moment().add(365, 'days').endOf("day").valueOf())
			
		//	console.log("laundryId=",request.body.laundryId)
//			console.log("subscriptionplanid=",request.body.subscriptionId)
//			//var laundrid=mongoose.Types.ObjectId(request.body.laundryId.toString())
			//var subsid= mongoose.Types.ObjectId(request.body.subscriptionId.toString())
		
            
                            let subscription =  await laundryBuySubscription({
                                laundryId:ownwer._id,
                                subscriptionPlanId :'6059aa481781e2e59c6eeb2b',  //plans._id,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(365, 'days').endOf("day").valueOf()
                            }).save()
                       
                            await Laundry.updateOne({_id:ownwer._id},{subscriptionLimit:1})
                            console.log("save done");
                            myConsole.log("save done");
                            
                            
//            response.json({Msg:"Annually plan successfully added"});

 //response.writeHead(302 , {
   //        'Location' : 'https://78.47.198.99/adminfeatures/addplanresponse.php?countryCode='+request.query.countryCode+'&phoneNumber='+request.query.phoneNumber+'&planName='+request.query.planName+'&Msg=Annually plan successfully added!' 
     //   });
//response.end();

SUCCESS=true;



       }
			else if(findPalns.planName=="6 Months"){
			    
plansdet={
planName:'6 Months',  //plans.planName,
planAmount:'325', //plans.planAmount,
perPeriod:'6 Months' //plans.planName
}
				var curdate=moment().startOf("day").valueOf()
            
		console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		console.log("enddate",moment().add(180,'days').endOf("day").format('DD-MM-YYYY'))
		
		myConsole.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		myConsole.log("enddate",moment().add(180,'days').endOf("day").format('DD-MM-YYYY'))
		
		let subscription =  await laundryBuySubscription({
                                laundryId:ownwer._id,
                                subscriptionPlanId :plans._id,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(180, 'days').endOf("day").valueOf()
                            }).save()
                       
            await Laundry.updateOne({_id:ownwer._id},{subscriptionLimit:1})
                            

// response.writeHead(302 , {
  //         'Location' : 'https://78.47.198.99/adminfeatures/addplanresponse.php?countryCode='+request.query.countryCode+'&phoneNumber='+request.query.phoneNumber+'&planName='+request.query.planName+'Msg=6 months plan successfully added!' 
//        });
//response.end();

SUCCESS=true;
			}


if(SUCCESS){
 //console.log("date sendplanmail",moment().format());
    
    console.log('....send plan mail.....');
    
    var addr=ownwer.laundryAddress
    var addrarr=addr.split(",")
    
    
try
{
    
   
let jsonRes= {
  
  paymentType: 'CASH',
   paymentBrand: 'CASH',
  
    customer: {
     givenName: ownwer.laundryName,
     surname:ownwer.laundryName,
    email: ownwer.email,
    phoneno: ownwer.phoneNumber,
    
     ipCountry: 'SA'
   },
   billing: {
     /*street1: '8863 Ibn Al Haitham, , Saudi Arabia',
     city: 'An Nahdah, Riyadh  3779',
     state: 'Riyadh  3779',
     postcode: '13222',*/
     country: 'SA',
     
     address: ownwer.laundryAddress
     
   },
 }
 


console.log('invoice start pdf');
let id =uuidv4() 

let data1=await pdfCreate(jsonRes,plansdet);
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
//response.json(msg)

 response.writeHead(302 , {
         'Location' : 'https://mgaseldocs.online/adminfeatures/addplanresponse.php?countryCode='+request.query.countryCode+'&phoneNumber='+request.query.phoneNumber+'&planName='+request.query.planName+'&Msg= '+request.query.planName+ 'plan successfully added! Download invoice @'+Pdflink.filename
        });
response.end();

			
}

  },
    addPlans : async(request,response)=>{
        try {
            const plans = await subscriptionPlan(request.body).save()
            // if(findBooking==null) return ({ statusCode: 400, success: 1, Error:AppConstraints.VALID_ID})
            return  ({ statusCode: 400, success: 1, Plans:plans})
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    getPlans : async(request,response)=>{
        try {
	   console.log("in getplans")
            const plans = await subscriptionPlan.find({"isDeleted":false})
            // if(findBooking==null) return ({ statusCode: 400, success: 1, Error:AppConstraints.VALID_ID})
            return  ({ statusCode: 200, success: 1,msg: AppConstraints.FETCHED_SUCESSFULLY, Plans:plans})
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    buyPlans : async(request,response)=>{
        try {
            const plans = await subscriptionPlan.find({isDeleted:false})
            // if(findBooking==null) return ({ statusCode: 400, success: 1, Error:AppConstraints.VALID_ID})
            const LaundryPalns = await laundryBuySubscription.findOne({laundryId:request.laundryId})
            return  ({ statusCode: 200, success: 1,msg: AppConstraints.FETCHED_SUCESSFULLY, Plans:plans,laundryPalns:LaundryPalns})
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
    hyperPayStep1 : async (request, response) => {
        try {
          //  console.log('shabana');
            //console.log('req.id');
            // console.log(request.body, "bodyyyyyyyyyyyyyyy hyperPayStep1");
            // if (!request.headers['authorization'])
            //     return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.ACCESS_TOKEN.EN });
            // let validateToken = await UnivershalFunction.ValidateUserAccessToken(request.headers['authorization']);
            // if (!validateToken)
           //     return response.status(401).json({ statusCode: 401, success: 0, msg: AppConstraints.UNAUTHORIZED.EN });
            // let errors = await request.validationErrors();
            // if (errors)
            //     return response.status(400).json({ statusCode: 400, success: 0, msg: errors[0].msg, error: errors });
    
            // const random = Math.random() * (1000 - 50) + 1000;
    
            //   if (validateToken.isSubscriptiveUser) return response.status(400).json({ statusCode: 400, success: 0, msg: AppConstraints.PURCHASED_SUB.EN });
            // request.body.cardNumber = '424242424242'
            //console.log(request.body.amount, 'amount');
            //console.log(request.body.currency, 'currency');
            //console.log(request.body.paymentType, 'paymentType');
            //console.log(request.body.notificationUrl, 'notificationUrl');
            //console.log(request.body.isSubscriptionPlan, 'isSubscriptionPlan');
            // console.log(request.body, 'cardNumber');
            findPalns = await subscriptionPlan.findOne({_id:request.body.subscriptionId}).lean()
            console.log('findPalns------',findPalns.planAmount);   
            //    }
            let jsonRes = {};
            var path = '/v1/checkouts';
            var d = {
                //   'authentication.userId': '8ac9a4ca68c1e6640168d9f9c8b65f69',
                //   'authentication.password': 'Kk8egrf9Fh',
                //   'authentication.entityId': '8a8294174d0595bb014d05d829cb01cd',
                'entityId': '8acda4c96ade4a49016afe7f214811e3',//moto

    
                'amount': Number.parseFloat(Number(findPalns.planAmount)).toFixed(2),
                // amount: '1',

                'currency': request.body.currency,
                'paymentType': request.body.paymentType,
                // notificationUrl: request.body.notificationUrl,
                 'merchantTransactionId': request.body.merchantTransactionId,
                'customer.email': request.body.email,
                'customer.givenName': request.body.givenName,
                'customer.surname': request.body.surname,
                'billing.street1': "Olayih",
                'billing.city': "Riyadh",
                'billing.state': "Central",
                'billing.country': "SA",
                'billing.postcode': "12611",
               'createRegistration': 'true'
            };
            //    d.authentication = {}
            // d['authentication.userId'] = '8ac7a4c7679c71ed0167b705a421278d'
            // d['authentication.password'] = '7MbQFsQdCj'
    
            // if (request.body.isSubscriptionPlan) {
            //     d.recurringType = "INITIAL";
            //     // d['authentication.entityId'] = '8ac7a4c86b308f7b016b46012a211942'//moto
            //     d['authentication.entityId'] = '8acda4c96ade4a49016afe7f214811e3'//moto
            //     //console.log(">>>>>>>>>>>>>>>>>>>>>d3",d)
            // } else {
            //     // d['authentication.entityId'] = '8ac7a4c7679c71ed0167b705fd7a2791'
            //     d['authentication.entityId'] = '8ac9a4ca68c1e6640168d9fa15e35f6d'
            // }



            console.log(d);
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
                    'Authorization':
                        'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA=='
                }
            };
            let x;
		console.log('hyperpaystep1',data);
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
                    // console.log('asdadadadasdasda', chunk);
                    // let jsonRes = JSON.parse(chunk);
                    // console.log('---------asdaadadasdasda', resp);
                    // let jsonRes = resp.data
                    console.log('asdadadadasdasda', chunk);
                    console.log('response', res);
                    console.log('request check',request.body);
			let cardCheck = await Laundry.findOneAndUpdate({ _id: request.laundryId,
                         'cardRegistationId.cardNumber': { $ne: request.body.cardNumber } 
                        }, { $addToSet: { cardRegistationId: { cardNumber: request.body.cardNumber, registrationId: jsonRes.id } } })
                    console.log('++++++++++++++*****************', cardCheck)
			console.log('jsonResId',jsonRes.id)
                    let cardCheckStatus = true
                    if (cardCheck && cardCheck._id) {
                        cardCheckStatus = false
                    }
                     x = JSON.parse(chunk);
                     console.log('chunk',x);
                    jsonRes.cardCheckStatus = cardCheckStatus
                     console.log('cardcheckstatus', cardCheckStatus)
			console.log('jsonRes step1',jsonRes);
        
                    // return response.send(1)
                    // return  ({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: jsonRes})
                    console.log('innnnnnnnnnnnnnnn');
                    return response.json({ success: 1, statusCode: 200, msg: AppConstraints.SUCCESS.EN, data: jsonRes , Chunk : x });
                })
                // .catch(err => {
                //     console.log('err', err);
                //     return response.status(500).json({ success: 0, statusCode: 500, msg: err.message, err: err.message })
                // })
            });
            postRequest.write(data);
            postRequest.end();
        } catch (err) {
            console.log('eerr',err);
            return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
        }
    },
    recurringPayment : async (request, response) => {
         console.log('recurringggggggggg step');
         console.log('recurring request',request);

        request.checkBody('amount', AppConstraints.AMOUNT).notEmpty();
        request.checkBody('cardRegId', AppConstraints.CARD_REG_ID).notEmpty();
        console.log('request.body recurring', request.body)
        const cardRegId = request.body.cardRegId;
       console.log('cardregId',cardRegId); 
        const amount = Number(request.body.amount);
        const random = Math.random() * (1000 - 50) + 1000;
        //url = `https://test.oppwa.com/v1/registrations/${cardRegId}/payments`;
        findPalns = await subscriptionPlan.findOne({_id:request.body.subscriptionId}).lean()
        console.log('findPalns------',findPalns.planAmount); 
        url = `https://oppwa.com/v1/checkouts/${cardRegId}/payment`;
          //url = `https://oppwa.com/v1/jp5dBAVtcwFzr9coregistrations/${cardRegId}/payments`;
          console.log('url',url);
        var d = {
          // "entityId": '8ac7a4c86b308f7b016b46012a211942', //you need to use the recurring entityID
            "entityId": '8ac9a4ca68c1e6640168d9fa15e35f6d',
            "amount": Number.parseFloat(findPalns.planAmount).toFixed(2),
            "currency": 'SAR',
            "paymentType": 'DB',
               merchantTransactionId: random,
           // "merchantTransactionId": request.body.merchantTransactionId,
            "recurringType": 'INITIAL', //For recurring
        };
        try {
            var data = querystring.stringify(d);
           var path='/v1/checkouts/${cardRegId}/payment';
	//path += '?entityId=8a8294174d0595bb014d05d82e5b01d2';
           // var path = `/v1/registrations/${cardRegId}/payments`
    		path += '?entityId=8ac9a4ca68c1e6640168d9fa15e35f6d';
            var options = {
                port: 443,
                // host: 'test.oppwa.com',
                host: 'oppwa.com',
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length,
                    'Authorization':
                        'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA=='
                }
            };
            // console.log(data, '#############')
    
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
                    console.log("###################");
                    let jsonRes = JSON.parse(chunk);
                    // console.log('asdadadadasdasda', jsonRes);
                    //console.log(res.data,'res.data');
                    // jsonRes = res.data;
                    const resultCode = jsonRes.result.code;
		console.log('recurring response',res);
			console.log('payment response',jsonRes);
                    //console.log(resultCode,"resulttttttttttt")
                    const successPattern = /(000\.000\.|000\.100\.1|000\.[36])/;
                    const manuallPattern = /(000\.400\.0[^3]|000\.400\.100)/;
                    const match1 = successPattern.test(resultCode);
                    const match2 = manuallPattern.test(resultCode);
                    console.log('result code',resultCode);
                    console.log('match',match1);
                    console.log('mtch---',match2);
                    let msg = '';
                    let paymentStatus = 0;
                     if (match1 || match2) {
                        console.log('laundry id',request.laundryId);
                        if(findPalns.planName=="Monthly"){       //"Basic"){
                      let subscription =  await laundryBuySubscription({
                            laundryId:request.laundryId,
                            subscriptionPlanId : request.body.subscriptionId,
                            startDate : moment().startOf("day").valueOf(),
                            endDate : moment().add(30, 'days').endOf("day").valueOf()
                        }).save()
                    
                        await Laundry.update({_id:request.laundryId},{subscriptionLimit:1})
                        }
                        else if(findPalns.planName=="Annually"){ 
		var curdate=moment().startOf("day").valueOf()
                console.log('recurring response',res);
		console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		console.log("enddate",moment().add(365,'days').endOf("day").format('DD-MM-YYYY'))
                            let subscription =  await laundryBuySubscription({
                                laundryId:request.laundryId,
                                subscriptionPlanId : request.body.subscriptionId,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(365, 'days').endOf("day").valueOf()
                            }).save()
                       
                            await Laundry.update({_id:request.laundryId},{subscriptionLimit:3})
                            }
			else{
				var curdate=moment().startOf("day").valueOf()
                console.log('recurring response',res);
		console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		console.log("enddate",moment().add(180,'days').endOf("day").format('DD-MM-YYYY'))
                            let subscription =  await laundryBuySubscription({
                                laundryId:request.laundryId,
                                subscriptionPlanId : request.body.subscriptionId,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(90, 'days').endOf("day").valueOf()
                            }).save()
                       
                            await Laundry.update({_id:request.laundryId},{subscriptionLimit:3})
			}

                        let transection = new Transections();
                        transection.jsonRes = jsonRes;
                     
                        transection.save();
                        return response.status(200).json({
                            success: 1,
                            statusCode: 200,
                            msg: 'success',
                            data: jsonRes,
                        });
                     } 
                     else {
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
    },
    hyperPayStep2 : async (request, response) => {
        try {
              console.log('step2 request',request.body);
            var path = `/v1/checkouts/${request.body.cardRegId}/payment`;
                //path += '?authentication.userId=8ac9a4ca68c1e6640168d9f9c8b65f69';
                //path += '&authentication.password=Kk8egrf9Fh';
                //path += '&authentication.entityId=8ac9a4ca68c1e6640168d9fa15e35f6d';
            // path += '?authentication.userId=8ac7a4c7679c71ed0167b705a421278d'
            // path += '&authentication.password=7MbQFsQdCj'
            //MODO 8acda4c96ade4a49016afe7f214811e3
             request.body.isSubscriptionPlan = true

/**************** */
            // if (request.body.isSubscriptionPlan) {
            //     // d.recurringType = "INITIAL";
            //     //path += '&authentication.entityId=8ac7a4c86b308f7b016b46012a211942'
            //     path += '?authentication.entityId=8acda4c96ade4a49016afe7f214811e3'
            // } else {
            //     // path += '&authentication.entityId=8ac7a4c7679c71ed0167b705fd7a2791'
            //     path += '?authentication.entityId=8ac9a4ca68c1e6640168d9fa15e35f6d'
            // }
           console.log('step2 path', path);
    /*********** */
    path += '?entityId=8acda4c96ade4a49016afe7f214811e3'
    //  path += '?entityId=8ac9a4ca68c1e6640168d9fa15e35f6d'
 console.log('step2 path', path);

//console.log('++++++++++++++++++', path);
             var options = {
                 port: 443,
                 host: 'oppwa.com',
                 //host: 'test.oppwa.com',
                 path: path,
                 method: 'GET',
                 headers: {
                     Authorization:
                         'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA=='
                 }
             };
            console.log('++++++++++++++++++opt', options);
        //let url = `test.oppwa.com` + path
//	let url =  `oppwa.com` + path;
  let url = 'https://oppwa.com' + path
console.log('step2 url', url);
            /*await axios.get(url, {
                headers: {
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                    // 'Content-Length': data.length,
                    "Authorization": 'Bearer OGFjOWE0Y2E2OGMxZTY2NDAxNjhkOWY5YzhiNjVmNjl8S2s4ZWdyZjlGaA==',
                    // "Authorization": 'Bearer OGFjN2E0Yzc2NzljNzFlZDAxNjdiNzA1YTQyMTI3OGR8N01iUUZzUWRDag==',
                },
            }).then(async resp => {*/
                 var postRequest = await https.request(options, function (res) {
    
                     res.setEncoding('utf8');
                     res.on('data', async function (chunk) {
                         //console.log('++++++++++++++++++chunk', chunk);
    
                         jsonRes = JSON.parse(chunk);
              //  let jsonRes = resp.data
                console.log("jsonRes", jsonRes, "jsonRes");
 console.log('invoice start pdf');
let id = uuidv4()
let data1=await pdfCreate(jsonRes,findPalns);
console.log("html",data1);
Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+"invoice"+'.pdf' });
        console.log('data',Pdflink);

let Email=[];
Email.push(jsonRes.customer.email,"shabana1128@gmail.com");
let emailcontent="<p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Thanks for purchasing the subsciption plan.</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Please find the invoice attached. </p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'>Regards,</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Mgasel Team</p>";
let emailsubj="Receipt of subscription- mgasel";
await universal.sendEmailwithpdf(Email,emailcontent,emailsubj,Pdflink.filename,id+"invoice"+'.pdf');

                let transection = new Transections();
                transection.jsonRes = jsonRes;
                transection.save();
                // let findToken = await hypertoken.findOne({ userId: validateToken._id, token: jsonRes.registrationId });
    
                const resultCode = jsonRes.result.code;
                console.log('resultCode',resultCode)
                const successPattern = /(000\.000\.|000\.100\.1|000\.[36])/;
                const manuallPattern = /(000\.400\.0[^3]|000\.400\.100)/;
                const match1 = successPattern.test(resultCode);
                const match2 = manuallPattern.test(resultCode);
                let msg = '';
                let paymentStatus = 0;
                if (match1 || match2) {
			console.log('laundry id',request.laundryId);
                        if(findPalns.planName=="Monthly"){       //"Basic"){
                      let subscription =  await laundryBuySubscription({
                            laundryId:request.laundryId,
                            subscriptionPlanId : request.body.subscriptionId,
                            startDate : moment().startOf("day").valueOf(),
                            endDate : moment().add(30, 'days').endOf("day").valueOf()
                        }).save()
                    
                        await Laundry.update({_id:request.laundryId},{subscriptionLimit:1})
                        }
                        else if(findPalns.planName=="Annually"){ 
		var curdate=moment().startOf("day").valueOf()
                console.log('recurring response',res);
		console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		console.log("enddate",moment().add(365,'days').endOf("day").format('DD-MM-YYYY'))
                            let subscription =  await laundryBuySubscription({
                                laundryId:request.laundryId,
                                subscriptionPlanId : request.body.subscriptionId,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(365, 'days').endOf("day").valueOf()
                            }).save()
                       
                            await Laundry.update({_id:request.laundryId},{subscriptionLimit:1})
                            }
			else if(findPalns.planName=="6 Months") {
				var curdate=moment().startOf("day").valueOf()
                console.log('recurring response',res);
		console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
		console.log("enddate",moment().add(180,'days').endOf("day").format('DD-MM-YYYY'))
                            let subscription =  await laundryBuySubscription({
                                laundryId:request.laundryId,
                                subscriptionPlanId : request.body.subscriptionId,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(180, 'days').endOf("day").valueOf()
                            }).save()
                       
                            await Laundry.update({_id:request.laundryId},{subscriptionLimit:1})
			}
			 else if(findPalns.planName=="3 Months") {
                                var curdate=moment().startOf("day").valueOf()
                console.log('recurring response',res);
                console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
                console.log("enddate",moment().add(90,'days').endOf("day").format('DD-MM-YYYY'))
                            let subscription =  await laundryBuySubscription({
                                laundryId:request.laundryId,
                                subscriptionPlanId : request.body.subscriptionId,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(90, 'days').endOf("day").valueOf()
                            }).save()

                            await Laundry.update({_id:request.laundryId},{subscriptionLimit:1})
                        }
			else{
		//for testing in else
		console.log("after step2 response","in else for testing")
			 var curdate=moment().startOf("day").valueOf()
                console.log('recurring response',res);
                console.log("startdate",moment().startOf("day").format('DD-MM-YYYY'))
                console.log("enddate",moment().add(90,'days').endOf("day").format('DD-MM-YYYY'))
                            let subscription =  await laundryBuySubscription({
                                laundryId:request.laundryId,
                                subscriptionPlanId : request.body.subscriptionId,
                                startDate : moment().startOf("day").valueOf(),
                                endDate : moment().add(90, 'days').endOf("day").valueOf()
                            }).save()

                            await Laundry.update({_id:request.laundryId},{subscriptionLimit:1})

}

                     console.log('step2 response', jsonRes);
/*			console.log('invoice start pdf');
let id = uuidv4()
let data1=await pdfCreate(jsonRes,findPalns);
console.log("html",data1);
Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+"invoice"+'.pdf' }); 
        console.log('data',Pdflink);  

let Email=[];
Email.push("shabana1128@gmail.com");
let emailcontent="<p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Thanks for purchasing the subsciption plan.</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Please find the invoice attached. </p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'>Regards,</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Mgasel Team</p>";
let emailsubj="Receipt of subscription- mgasel";
await UnivershalFunction.sendEmailwithpdf(Email,emailcontent,emailsubj,Pdflink.filename,id+"invoice"+'.pdf');*/

                   /* const card = new Card({
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
console.log("card details " +card);
                    const cardSavingResult = await card.save();
                    const reverseResult = await reversePayment(jsonRes.id);
                    console.log(reverseResult);*/
                    msg = 'Payment is Successful';
                    console.log('msg',msg);
                    paymentStatus = 1;
    
                } else {
                    msg = 'Payment is Rejected';
                    paymentStatus = 0;
    
                    return response
                        .status(400)
                        .json({ success: 1, statusCode: 400, msg: jsonRes.result.description, paymentStatus: paymentStatus, data: jsonRes });
                }
    
    /*
                if (match1 || match2) {
                    if (jsonRes.registrationId != null || jsonRes.registrationId != undefined) {
                        let token = new hypertoken();
                        token.userId = validateToken._id;
                        token.token = jsonRes.registrationId;
                        let x = await token.save();
                        //console.log(x);
                    }
                }*/
    
                //console.log('_______________________', jsonRes, msg, paymentStatus)
        //let Pdflink = pdfCreate(jsonRes,request.laundryId);
/*
let id = uuidv4()
let data1=await pdfCreate(jsonRes,findPalns);
console.log("html",data1);
Pdflink = await pdf.createAsync(data1, { filename: './app/uploader/'+id+"order"+'.pdf' }); 
        console.log('data',Pdflink);  

let Email=[];
Email.push("shabana1128@gmail.com");
let emailcontent="<p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Thanks for purchasing the subsciption plan.</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Please find the invoice attached. </p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'>Regards,</p><br/><p style='margin: 0;font-size: 16px;font-weight: 400;color: #000;line-height: normal;'> Mgasel Team</p>";
let emailsubj="Receipt of subscription- mgasel";
await UnivershalFunction.sendEmailwithpdf(Email,emailcontent,emailsubj,Pdflink.filename,id+"order"+'.pdf');*/
        // console.log("pdflink",Pdflink);
                return response
                    .status(200)
                    .json({ success: 1, statusCode: 200, msg: msg, paymentStatus: paymentStatus, data: jsonRes });
})    
   
   /*     }).catch(err => {
                console.log('_______________________', err)
                return response
                    .status(500)
                    .json({ success: 0, statusCode: 500, msg: err.message, err: err.message })
            })
    */
            });
             postRequest.on('error', (error) => {
                 console.log(error, 'errorerrorerrorerrorerrorerror')
             })
             postRequest.end();
        } catch (err) {
            return response.status(500).json({ statusCode: 500, success: 0, msg: err.message, err: err.message });
        }
    },
    checkSubscription: async (request, response) => {
        try {
            const checkSubscription = await laundryBuySubscription.findOne({laundryId:request.laundryId})
            const checkSubscriptionBranches = await laundryBuySubscription.findOne({subscriptionBanches:request.laundryId})
            if(!checkSubscription && !checkSubscriptionBranches) return ({ statusCode: 400, success: 0, msg: AppConstraints.SUBSRIPTION_PENDING   });    
             return ({ statusCode: 200, success: 1, msg: AppConstraints.SUBSRIPTION_VALID })
            
      
        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error })
        }


    },

     getTax: async (request, response) => {
                console.log('.....get tax.......');
	try{	/*	const plans = await subscriptionPlan.find({})*/
                const taxs = await taxModel.find({ownerid:request.query.ownerid})
    console.log(taxs,request.query);
console.log('tax record',taxs);    
                if ( taxs == null||taxs.length == 0) 
			return ({ statusCode: 400, success: 0, msg: "record not found" })
                else return ({ statusCode: 200, success: 1, Message:{"En":"tax record found","Ar":""},Tax:taxs[0]})
}catch (error) {
        	return ({ statusCode: 400, success: 1, Msg:error})
                }
        },
	
	 updateTax: async(request,response)=>{
        try{
	console.log('....update tax.....');
        
	//if(request.body.taxperc >100) 
		//return ({statusCode:400,success: 0,msg: "Incorrect tax percentage!"})
        const owner=  await taxModel.findOne({ownerid: request.body.ownerid})

	console.log("owner found",owner);
        
        if (owner == null){ 

		const owntx = await taxModel(request.body).save()
		  console.log("insert tax",owntx)
		return ({ statusCode: 200, success: 0, msg:"inserted tax record"})}
		else 		

		{	
		//{statusCode:400,success: 0,msg: "Incorrect tax percentage!"})
        
		//request.body._id=owner._id
		console.log("update tax",request.body)
        	let upadate = await taxModel.update({ ownerid: request.body.ownerid }, request.body)
		  console.log("update tax1",upadate)
        	return ({ statusCode: 200, success: 1, msg: "tax updated succesfully" })
		}
        } catch (error) {
                    return ({ statusCode: 400, success: 0, err: error })
                }
        
        },
 /*    generateQr: link => {
    qrcode.toDataURL(link)
       .then(data => {
          const qrCodeDataUrl = data;
          qrdata=qrCodeDataUrl;
          // ...
       })
       .catch(err => {
          console.error(error);
          // ...
       });
  },*/

    
       
 getBookingswithtax: async (request, response) => {
console.log("get booking called");
        try {
            let limit = 10 , skip = 0
            if(request.body.skip == null || request.body.skip == 0 ){
                skip = 0
            }else{
                skip = request.body.skip *10
            }
//	return ({ statusCode: 200, success: 0, msg: "hi" });
            let booking = await bookingModel.find({ laundryId: request.body.id }).sort({_id:-1}).skip(skip).limit(limit).populate('userId')
            let count = await bookingModel.find({ laundryId: request.body.id })
            let recipt = []
            if(skip !=0){
                limit = limit*skip
            }
            let bookingPdf = await bookingModel.find({ laundryId: request.body.id }).sort({_id:-1}).limit(limit).populate('userId laundryId')
            let laundryDetails = bookingPdf[0].laundryId
            bookingPdf.map((bookingData)=>{
                let paymentOption
                if(bookingData.paymentOption== "CASH_ON_DELIVERY"){
                    paymentOption = "Cash"
                }
                if(bookingData.paymentOption== "NET_BANKING"){
                    paymentOption = "Net Banking"
                }
                if(bookingData.paymentOption== "CREDIT_DEBIT_CARD"){
                    paymentOption = "Card"
                }
                recipt.push({orderId:bookingData.orderId,totalAmount:bookingData.totalAmount,paymentOption:paymentOption,deliveryChoice:bookingData.deliveryChoice})
            })
            console.log('recipt',recipt);
            console.log('uuidv4()',uuidv4());
        let data1 = await pdfData(recipt,laundryDetails)
        console.log('dir',__dirname);
        let id = uuidv4()
        let Pdflink = await pdf.createAsync(data1, { format: 'A4', filename: './app/uploader/'+id+"order"+'.pdf' });
            return ({ statusCode: 200, success: 1, Booking: booking , Count : count.length,  pdfLinK :  `/${id}order.pdf` })
        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },


}
let pdfData = async(booking,laundryDetails)=>{
    console.log('data',laundryDetails);
    console.log('laundry details',laundryDetails.email);
    let orderList = ``;
    console.log('---------',booking)
    // console.log(booking);5efaece5ca3dfe31364a5727
    // break:-5efaece5ca3dfe31364a5727--
    console.log('booo');
    
   await booking.map(ele => {
        // console.log(ele)
        // for(let i=0;i<3;i++){
        orderList += `
                    <tr>
                        <td style="display:inherit;text-align:ceneter;padding: 20px ;border-bottom: solid 1px #000;width: 45%;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;">${ele.orderId}</td>
                        <td style="display:inherit;text-align:ceneter;padding: 20px ;border-bottom: solid 1px #000;width: 45%;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;">${ele.totalAmount}</td>
                        <td style="display:inherit;text-align:ceneter;padding: 20px ;border-bottom: solid 1px #000;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;"> ${ele.paymentOption}</td>
                        <td style="display:inherit;text-align:ceneter;padding: 20px ;border-bottom: solid 1px #000;width: 45%;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;">${ele.deliveryChoice}</td>

            
                    </tr>`;
                    
        // }
    });
    return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <table colspan="0" cellpadding="0" border="0" style="width:600px;line-height: normal;border: solid 1px #ddd;padding: 20px;">
        <tr>
            <td>
                <table colspan="0" cellpadding="0" border="0" style="width:100%;">
                    <tr>
                        <td colspan="2"><h3 style="margin: 0;font-size: 22px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Order Receipt</h3></td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top;padding-top: 2rem;width: 60%;">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;border-collapse: collapse;">                                                                                                                                                                                                                 
                                <tr><td style="texpadding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Laundry Name:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">${laundryDetails.laundryName!=undefined?laundryDetails.laundryName:"N.A"} </p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Email:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">${laundryDetails.email != undefined ?laundryDetails.email: "N.A" }</p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Phone Number :</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;"> ${laundryDetails.countryCode }${laundryDetails.phoneNumber }</p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Address :</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;"> ${laundryDetails.laundryAddress != undefined ? laundryDetails.laundryAddress : "N.A" }</p></td></tr>

                            </table>
                        </td>
                        <td align="top" style="vertical-align: top;padding-top: 2rem;width: 30%;">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;">
                    
                                <tr><td><p style="font-size: 16px;line-height: 22px;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight: 500;">${booking.pickUpAddress ? booking.pickUpAddress: '' }</p></td></tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="width:100%" colspan="2">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;">
                                <tr>
                                    <td colspan="2"><h3 style="margin: 0;font-size: 22px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding: 30px 0 15px;">Order Summary</h3></td>
                                </tr>
                                <tr>
                                <td >
                                    <table colspan="0" cellpadding="5" border="1" style="width:100%;border-collapse: collapse;border-top: solid 2px #000;">
                                        <tr>
                                            <th style="padding: 10px ;text-align: left;font-size: 16px;color: #000;font-weight: 600;width: 45%;border-bottom: solid 2px #000;">Order No</th>
                                            <th style="padding: 0px ;text-align: left;font-size: 16px;color: #000;font-weight: 600;    border-bottom: solid 2px #000;">Amount</th>
                                            <th style="padding: 20px ;text-align: left;font-size: 16px;color: #000;font-weight: 600;    border-bottom: solid 2px #000;">Paymeny Mode</th>
                                            <th style="padding: 20px ;text-align: left;font-size: 16px;color: #000;font-weight: 600;    border-bottom: solid 2px #000;">Delivery Type</th>

                                        </tr>
                                        ${orderList}
                                    </table>
                                </td>
                            </tr>
                                <tr>
                                    <td colspan="4">
                                        <table colspan="0" cellpadding="0" border="0" style="width: 100%;">
                                          
                                            <tr>
                                               
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
    `;
}
let generateQr=async link => {
    const qrCodeDataUrl = await qr.toDataURL(link);
    qrdata=qrCodeDataUrl;
    // ...
  }



    // If the input is null return "Empty Data" error
//    if (url.length === 0) res.send("Empty Data!");
 /*  
    let data1="";
    
     qr.toDataURL(url, (err, src) => {
       // if (err) res.send("Error occured");
     if (err) res.send("Error occured");
     
      console.log("qrgenerated",src);
     console.log("qrurl",url);
        // Let us return the QR code image as our response and set it to be the source used in the webpage
      //  res.render("scan", { src });
     qc={src};
        
     });*/


    
let pdfCreate =  async(invoice,plans)=>{
    console.log('invoice',invoice);
    console.log('plans',plans);
    let orderList = ``;
    //console.log('---------',booking)
    // console.log(booking);5efaece5ca3dfe31364a5727
    // break:-5efaece5ca3dfe31364a5727--
    console.log('entered');

    let currentDate = new Date();
let currdate=currentDate.getDate()+'/'+(currentDate.getMonth()+1)+'/'+currentDate.getFullYear() + currentDate.getHours()+':'+currentDate.getMinutes() +':' +currentDate.getSeconds();
let ran=Math.floor(Math.random()*10) + 1;
let billNo=currentDate.getDate()+'/'+(currentDate.getMonth()+1)+'/'+currentDate.getFullYear() + currentDate.getHours()+'/'+currentDate.getMinutes() +'/' +currentDate.getSeconds() + '/'+ran.toString();
let  url= 'https://mgaseldocs.online/qrcode/mgaselbarcodefile.pdf'
const ejs = require('ejs');

// In some route
let qrCodeDataUrl = await generateQr(url);
qrCodeDataUrl=qrdata;
const html = ejs.render('<img src="<%= qrCodeDataUrl %>" style="width:100px;height:100px;"/>', {qrCodeDataUrl});
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
                    <td colspan="2"><p style="margin: 0;font-size: 8px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Invoice/Receipt No :${billNo}</p></td>
                    </tr>
                     <tr>
                    <td colspan="2"><p style="margin: 0;font-size: 8px;color: #000;line-height: normal;font-weight: 600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">CR  No : 1010457615</p></td>
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
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.street1 != undefined ? invoice.billing.street1 : "N.A"}</p></td></tr>
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.city != undefined?invoice.billing.city  : "N.A" }</p></td></tr>
                                                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.state != undefined?invoice.billing.state  : "N.A"} </p></td></tr>
                                                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.country != undefined?invoice.billing.country  : "N.A"} </p></td></tr>
                                <tr><td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.postcode != undefined?invoice.billing.postcode  : "N.A" }</p></td></tr>
                                                                <tr><td style="padding-bottom: 10px; "><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.country} </p></td></tr>

                            </table>
                        </td>
 <td style="vertical-align: top;padding-top: 2rem;align: right;">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;border-collapse: collapse;align: right;">   <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;"> :دفع إلى<br/></p>                                                                                    
                                <tr><td style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.customer.givenName} </p></td></tr>
                                <tr><td  style="align: right;" ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.customer.email}</p></td></tr>
                                 
                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.street1 != undefined ? invoice.billing.street1 : invoice.billing.address} </p></td></tr>
                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.city }</p></td></tr>
                                                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.state != undefined?invoice.billing.state  : ""} </p></td></tr>
                                <tr><td  style="align: right;"><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">${invoice.billing.postcode != undefined?invoice.billing.postcode  : "" }</p></td></tr>
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
                                                ${invoice.paymentBrand} ending with </p></td>
  <td style="padding-bottom: 5px; align: right;">
                                                <p style="margin: 0;font-size: 8px;font-weight: bold;color: #000;line-height: normal;"> :طريقة الدفع او السداد </p>
                                                <p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;align: right;">
                                                ${invoice.paymentBrand} ending with  </p></td>
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
<td style="text-align: center;"> 
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> ${plans.planName != undefined ? plans.planName : "N.A" }</p>
</td>
<td  style="text-align: center;" >
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">SAR ${plans.planAmount != undefined ? plans.planAmount : "N.A" }</p>
</td>
<td  style="text-align: center;" >
<p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;"> ${plans.perPeriod != undefined ? plans.perPeriod : "N.A" }</p>
</td>
</tr>
                            </table>
                        </td>
                                                </tr>
                                                 <tr>
 <td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;">Thank you for purchasing the Plan!</p></td>
                        <td ><p style="margin: 0;font-size: 8px;font-weight: 400;color: #000;line-height: normal;align:right;">! شكرا لك على شراء الخطة</p>  </t
                        d>
                         <td >
                                 ${html}
                                 </td>
                    </tr>
</table>
 </td>
        </tr>
    </table>
</div>    `;
}

