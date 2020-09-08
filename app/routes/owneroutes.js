let ownerController = require('../controllers/ownerController')
let upload = require('../LIB/ownerUploader')
let authenticattion = require('../../config/authenticate')
module.exports= function(app){
   
    app.post('/owner/registerLaundry',upload.ownerDocuments.fields([{name:'Document1',maxCount:1},
                                                                    {name:'Document2',maxCount:1},
                                                                    {name:'Document3',maxCount:3}
                                                                ]),ownerController.register)
    app.post('/owner/login',ownerController.login)
    app.post('/owner/sendOtp',ownerController.sendOtp)
    app.post('/owner/verifyOtp',ownerController.verifyOtp)
    app.post('/owner/verifyLaundry',ownerController.verifyLaundry)
    app.post('/owner/branches',authenticattion.verifyOwnwer,ownerController.branches)
    app.post('/owner/forgotPassword',ownerController.forgotPassword)
    app.put('/owner/update',authenticattion.verifyOwnerBranch,upload.ownerDocuments.fields([{name:'Document1',maxCount:1},
    {name:'Document2',maxCount:1},
    {name:'Document3',maxCount:3}
]),ownerController.update)
    app.post('/owner/updatePassword',authenticattion.verifyOwnerBranch,ownerController.updatePassword)
    app.post('/owner/branchList',authenticattion.verifyOwnwer,ownerController.getList)
    app.post('/owner/addCategory',ownerController.addCategories)
    app.post('/owner/services',ownerController.addServices)
    app.post('/owner/serviceItem',ownerController.addServiceItem)
    app.post('/owner/getServicesList',ownerController.ownwerServicesList)
    app.post('/owner/addService',authenticattion.verifyOwnerBranch,ownerController.updateServices)
    app.post('/owner/find',ownerController.findEmailPhone)
    app.post('/owner/delete',ownerController.delete)
    app.put('/owner/updatePrice',authenticattion.verifyOwnerBranch,ownerController.updaetPrice)
    // app.post('/owner/getServices')
    app.post('/owner/service',authenticattion.verifyOwnerBranch,ownerController.getLists)
    app.post('/owner/createBookings',authenticattion.verifyOwnerBranch,ownerController.createBooking)
    app.post('/owner/laundryItemPrice',authenticattion.verifyOwnerBranch,ownerController.itemPrice) // listing item price
    app.post('/owner/laundryData',authenticattion.verifyOwnerBranch,ownerController.laundryDetails)
    app.post('/owner/laundryDetails',authenticattion.verifyOwnerBranch,ownerController.laundryServices)
    app.post('/owner/getBookings',authenticattion.verifyOwnerBranch,ownerController.getBooking)
    app.get('/owner/booking/:orderId',authenticattion.verifyOwnerBranch,ownerController.ordersById)
    app.post('/owner/deleteService',authenticattion.verifyOwnerBranch,ownerController.deleteService)

    app.post('/owner/serviceDetails',authenticattion.verifyOwnerBranch,ownerController.servciceDetails)
    // app.post('/owner/orderPdf')
    /** add promo code  */
    app.post('/owner/createPromo',authenticattion.verifyOwnerBranch,ownerController.createPromo)
    app.post('/owner/applyPromo',ownerController.applyPromo)
    app.get('/owner/laundriesCoupon',authenticattion.verifyOwnerBranch,ownerController.laundriesCoupons)

    app.get('/owner/orderPdf',ownerController.pdf)
    app.get('/owner/orderExcel',ownerController.excel)

    app.post('/owner/bookingStatus',authenticattion.verifyOwnerBranch,ownerController.changeStatus)
    app.get('/owner/bagId/:bagNo',authenticattion.verifyOwnerBranch,ownerController.getBookingByBag)
    
    app.post('/owner/deleteItems',authenticattion.verifyOwnerBranch,ownerController.deleteItems)


}