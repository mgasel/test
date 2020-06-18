const laundryModel = require('../models/Laundry')
const AppConstraints = require('../../config/appConstraints')
const ownwerServices = require('../Services/ownerServices')
const servicesCategoryModel = require('../models/serviceItemCategory')
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
    request.checkBody('id',AppConstraints.INVALID_ID).notEmpty();
    let errors = request.validationErrors();
    if (errors){ return response.status(400).json({statusCode:400,success:0 , msg: errors[0].msg, error:errors})}
    let branchList = await ownwerServices.getBranchList(request,response)
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
    let services = await ownwerServices.updateLaundryServices(request,response)
    return response.json(services)
}
exports.findEmailPhone = async(request,response)=>{
    let check = await ownwerServices.findEmailNumber(request,response)
    return response.json(check)
}