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
    // console.log('.................');
    
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