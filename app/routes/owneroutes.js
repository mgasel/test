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
    app.post('/owner/branches',authenticattion.verifyOwnwer,ownerController.branches)
    app.post('/owner/forgotPassword',ownerController.forgotPassword)
    app.put('/owner/update',authenticattion.verifyOwnerBranch,upload.ownerDocuments.fields([{name:'Document1',maxCount:1},
    {name:'Document2',maxCount:1},
    {name:'Document3',maxCount:3}
]),ownerController.update)
    app.get('/owner/branchList',authenticattion.verifyOwnwer,ownerController.getList)

}