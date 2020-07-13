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
const promoModel = require('../models/laundryPromocodes')
const moment = require('moment-timezone')
const pdf = require('html-pdf')
const fs = require('fs')
const json2xls = require('json2xls')
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
        try {
            const ownwer = await laundryModel.findOne({ $and: [{ phoneNumber: request.body.phoneNumber }, { countryCode: request.body.countryCode }] })

            if (ownwer == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_PHONE_PASSWORD });
            const compare = bcrypt.compareSync(request.body.password, ownwer.password)
            if (compare == true) {
                let token = await authToken.generateOwnwerToken(ownwer)
                console.log('sucessful login===============>>>>>>>');
                console.log('owner', ownwer);
                return ({ statusCode: 200, success: 1, msg: AppConstraints.LOGIN_SUCESSFULL, ownwer: ownwer, token: token })
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

        let list = await laundryModel.find({ $and: [{ ownerId: request.body.id }, { isDeleted: false }] })

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
                        vendorServiceId: findService._id
                    }
                    let save = await laundryServiceModel(laundryServices).save()
                    await laundryModel.findByIdAndUpdate({ _id: request.body.id }, { $push: { laundryServices: save._id } })
                    let laundryData = await laundryModel.findOne({ _id: request.body.id }).populate('laundryServices')
                    return response.json({ statusCode: 200, success: 1, Laundry: laundryData })
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

                return response.json({ statusCode: 200, success: 1, Message : 'service item added sucessfully'})
                
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
            let user = await userModel.findOne({ $and: [{ completePhoneNumber: request.body.completePhoneNumber }, { isDeleted: false }] })
            if(!user)  return ({ statusCode: 400, success: 0, msg: AppConstraints.NOT_REGISTER_BOOKING })
            // if(user==null)return response
            // if(user==null)
            console.log('user',user);
            
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
            
            request.body.totalAmount = totalAmount
            request.body.status = 'CONFIRMED'
            request.body.servicePrice = curretAmout
            // console.log('srev',service);
            
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
            let laundry = await laundryModel.findOne({ $and: [{ _id: request.body.id }, { isDeleted: false }] }).populate('laundryServices')
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
            let limit = 10
            if(request.body.limit){
                limit = limit*request.body.limit
            }
            let booking = await bookingModel.find({ laundryId: request.body.id }).sort({_id:-1}).limit(limit).populate('userId')
            return ({ statusCode: 200, success: 1, Booking: booking , Count : booking.length })
        } catch (error) {
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
                findService = await laundryModel.findOne({ $and: [{ _id: request.body.id }, { laundryServices: request.body.serviceId }] })
                console.log('findServices', findService);
                if (findService == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_ID });
                await laundryModel.update({ _id: findService._id }, { $pull: { laundryServices: request.body.serviceId } })
                await laundryServiceModel.deleteOne({ $and: [{ laundryId: findService._id }, { _id: request.body.serviceId }] })
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
            console.log('request',request.body);
            if(await laundryModel.findOne({_id:request.body.laundryId})==null)return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            if(await laundryServiceModel.findOne({_id:request.body.serviceId})==null) ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
            request.body.startDate = moment().unix()
            request.body.expiryDate = moment(request.body.expiryDate).unix()
            let promo = await promoModel(request.body).save()
            return ({ statusCode:200, success: 1,msg:AppConstraints.COUPON_ADDED})
            
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
            console.log('iddd',request.query);

            if(request.query.id){
                
                let promoCodes = await promoModel.findOne({$and:[{laundryId:request.ownerId},{_id:request.query.id}]})
                if(promoCodes==null) return ({ statusCode: 400, success: 0, msg:AppConstraints.VALID_ID})
                return    ({ statusCode: 400, success: 1, promoCodes:promoCodes})
            }
            let promoCodes = await promoModel.find({$and:[{laundryId:request.ownerId}]})
            return    ({ statusCode: 400, success: 1, promoCodes:promoCodes})
        } catch (error) {
            return ({ statusCode: 400, success: 1, Error:error})
        }
    },
 
    downlaodPdf:async(request,response)=>{
        try {
            let booking = await bookingModel.findOne({_id:request.query.bookingId})
        let data1 = data(booking)
    //    let  data2 = data(booking)
             
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
            console.log('...........');
            
           if(request.body.status==1){
            await bookingModel.update({_id:request.body.bookingId},{status:"CONFIRMED"})
            return  ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_CONFIRMED})
           }
           if(request.body.status==2){
            await bookingModel.update({_id:request.body.bookingId},{status:"INPROGRESS"})
            return  ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_INPROGRESS})
           }
           if(request.body.status==3){
            await bookingModel.update({_id:request.body.bookingId},{status:"DELIVERED"})
            return  ({ statusCode: 200, success: 1, msg:AppConstraints.BOOKING_DELIVERED})
           }
        } catch (error) {
            console.log(error);
            
        }
    },
    downloadExcel:async(request,res)=>{
        try {
            let booking = await bookingModel.findOne({_id:request.query.bookingId})
            // let booking  = await bookingModel.aggregate([
            //     {$match:{_id: ObjectId(request.query.bookingId)}},
            //     {$project:{_id:0,servicePrice:1}}
            // ])
            let recipt = []
            // recipt.push({type:booking.type})
            booking.servicePrice.map((object,data)=>{
                recipt.push(object)
            })
            
            // let recipt =[booking.servicePrice[0],booking.servicePrice[0]]
     
            console.log(recipt);
            
            
           res.xls('data.xlsx',recipt);
        //    console.log('data',data);
   

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
    }

}
let data =(booking)=>{
    let orderList = ``;
    console.log('---------',booking.servicePrice)
    // console.log(booking);5efaece5ca3dfe31364a5727
    // break:-5efaece5ca3dfe31364a5727--
    console.log('booo');
    
    booking.servicePrice.map(ele => {
        // console.log(ele)
        for(let i=0;i<3;i++){
        orderList += `
                    <tr>
                        <td style="padding: 20px 0;border-bottom: solid 1px #000;width: 45%;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;">${ele.serviceName}</td>
                        <td style="padding: 20px 0;border-bottom: solid 1px #000;width: 45%;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;">${ele.serviceItemQuantity}</td>
                        <td style="padding: 20px 0;border-bottom: solid 1px #000;font-size: 16px;color: #000;line-height: 22px;font-weight: 400;"> ${ele.totalPrice}</td>
            
                    </tr>`;
                    
        }
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
                                <tr><td colspan="2"><h3 style="margin: 0 0 10px;font-size: 20px;color: #000;font-weight: 600;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;">Purchased By</h3></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Buyer Name:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">${booking.userId.name} </p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Buyer Email:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">${booking.userId.email}</p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Order Id:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">${booking.orderId}</p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Order Time:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">${booking.newDate}</p></td></tr>
                                <tr><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 16px;font-weight: bold;color: #000;line-height: normal;">Order Type:</p></td><td style="padding-bottom: 10px;"><p style="margin: 0;font-size: 15px;font-weight: 400;color: #000;line-height: normal;">Web-Online</p></td></tr>
                            </table>
                        </td>
                        <td align="top" style="vertical-align: top;padding-top: 2rem;width: 30%;">
                            <table colspan="0" cellpadding="0" border="0" style="width:100%;">
                                <tr><td><h3 style="margin: 0 0 10px;font-size: 20px;color: #000;font-weight: 600;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;">Address:</h3></td></tr>
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
                                            <th style="padding: 10px 0;text-align: left;font-size: 16px;color: #000;font-weight: 600;width: 45%;border-bottom: solid 2px #000;">Product Name</th>
                                            <th style="padding: 10px 0;text-align: left;font-size: 16px;color: #000;font-weight: 600;    border-bottom: solid 2px #000;">Quantity</th>
                                            <th style="padding: 10px 0;text-align: left;font-size: 16px;color: #000;font-weight: 600;    border-bottom: solid 2px #000;">Total</th>
                                        </tr>
                                        ${orderList}
                                    </table>
                                </td>
                            </tr>
                                <tr>
                                    <td colspan="4">
                                        <table colspan="0" cellpadding="0" border="0" style="width: 100%;">
                                          
                                            <tr>
                                                <td colspan="4"><h3 style="text-align: right;padding: 20px 0 0;font-size: 18px;font-weight: bold;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform: capitalize;margin: 0;">order Total: <span style="font-weight: 400;color: #333;"> ${booking.totalAmount.toFixed(2)}</span></h3></td>
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