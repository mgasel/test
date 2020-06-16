const laundryModel = require('../models/Laundry')
// const ownwerModel = require('../models/owner')
const AppConstraints = require('../../config/appConstraints')
const otpModel = require('../models/otp')
const bcrypt = require('bcrypt')
const salt = 10
const authToken = require('../../config/authenticate')
const otp = require('../models/otp')
const universal = require('../../app/UnivershalFunctions/Univershalfunctions')
module.exports = {
    registerOwner: async (request, response) => {
        try {
            if (request.body.password != request.body.confirmPassword) return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD });
            const findEmail = await laundryModel.findOne({ email: request.body.email })
            if(await laundryModel.findOne({$and:[{phoneNumber:request.body.phoneNumber},{isDeleted:false}]})!=null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            if (await laundryModel.findOne({ email: request.body.email }) != null) return ({ statusCode: 400, success: 0, msg: AppConstraints.EMAIL_ALREADY });
            request.body.password = bcrypt.hashSync(request.body.password, salt)
            if(request.files){ 
                for(let index in request.files){     
                    // console.log(demo[index]);
                           
                    request.files[index].map((currentValue,index,array)=>{
                        console.log('inn',currentValue.fieldname);                    
                        if(currentValue.fieldname == 'Document1'){
                            
                            request.body.Document1 =  '/'+currentValue.filename
                        }
                        if(currentValue.fieldname == 'Document2'){
                            request.body.Document2 =  '/'+currentValue.filename  
                        }
                        if(currentValue.fieldname == 'Document3'){
                          
                            request.body.Document3 =  '/'+currentValue.filename  
                        }
                    })
                }
            }
            request.body.owner = true
            console.log('req,,',request.body);
            
            const laundry = await laundryModel(request.body).save()
            let token = await authToken.generateOwnwerToken(laundry)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.REGISTRATIONS_SUCESSFULL, ownwer: laundry, token: token })
        } catch (error) {
            console.log('eer',error);
            
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    loginOwner: async (request, response) => {
        const ownwer = await laundryModel.findOne({ phoneNumber: request.body.phoneNumber })
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
            let otp = Math.floor(1000 + Math.random() * 9000)

            const genrateOtp = await otpModel({ otp: otp, phoneNumber: request.body.phoneNumber }).save()
            console.log('dgee',genrateOtp);
            
            let findOtp = await otpModel.findOne({phoneNumber:request.body.phoneNumber})
            // if(findOtp){
            //     await otpModel.deleteOne({_id:findOtp._id})
            // }
            let data ={
                phoneNumber:request.body.countryCode+request.body.phoneNumber,
                message: `OTP is ${otp}`
            }
          await universal.unifonicMessage(data)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.OTP_SEND_SUCCESSFULLY, otp: genrateOtp })

        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    verifyOtp:async(request,response)=>{
        try {
            let otp = await otpModel.findOne({otp:request.body.otp})
            if(otp==null) return ({ statusCode: 400, success: 0, msg: AppConstraints.VALID_OTP })
            await otpModel.deleteOne({otp:request.body.otp})
            return ({ statusCode: 200, success: 1, msg: AppConstraints.OTP_VERIFIED_SUCCESSFULLY })

        } catch (error) {
            return ({ statusCode: 400, success: 0, msg: error });
        }

    },
    addBranches:async(request,response)=>{
        try {
            console.log('oor',request.body.ownerId,"fa",request.ownerId);
          
            if(request.body.ownerId!=request.ownerId.toString()) return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_OWNER_ID })
            if(await laundryModel.findOne({$and:[{phoneNumber:request.body.phoneNumber},{isDeleted:false}]})!=null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            //  if(await laundryModel.findOne({$and:[{$or:[{phoneNumber:request.body.phoneNumber},{isDeleted:false}]},{$or:[{email:request.body.email},{isDeleted:false}]}]})!=null)  return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
          
             if(await laundryModel.findOne({$and:[{email:request.body.email},{isDeleted:false}]})!=null) return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_ALREADY_EXIST })
            
            let  password = Math.random().toString(36).slice(-8);
            request.body.password = bcrypt.hashSync(password, salt)
            const laundry = await laundryModel(request.body).save()
            let token = await authToken.generateOwnwerToken(laundry)
            let data ={
                phoneNumber:request.body.countryCode+request.body.phoneNumber,
                message: `Laundry Password is ${password}`
            }
          await universal.unifonicMessage(data)
            return ({ statusCode: 200, success: 1, msg: AppConstraints.REGISTRATIONS_SUCESSFULL, ownwer: laundry, token: token })

        } catch (error) {
            console.log('error',error);
            
            return ({ statusCode: 400, success: 0, msg: error });
        }
    },
    forgotPassword:async(request,response)=>{
     try {
        let findData = await laundryModel.findOne({$and:[{phoneNumber:request.body.phoneNumber},{isDeleted:false},{countryCode:request.body.countryCode}]})
        if(findData==null)return ({ statusCode: 400, success: 0, msg: AppConstraints.NUMBER_INVALID }) 
        // const verifyOtp = await otpModel.findOne({$and:[{otp:request.body.otp},{phoneNumber:request.body.phoneNumber}]})
        // if(verifyOtp == null)return ({ statusCode: 400, success: 0, msg: AppConstraints. }) 
        if(request.body.password!=request.body.confirmPassword)return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD });
        request.body.password = bcrypt.hashSync(request.body.password,salt)
        await laundryModel.update({phoneNumber:request.body.phoneNumber},{password:request.body.password})
        return ({ statusCode: 200, success: 1, msg: AppConstraints.PASSWORD_SUCCESSFULLY_UPDATED })
     } catch (error) {
         console.log('erro',error);
         
        return ({ statusCode: 400, success: 0, msg: error });
     }   
    },
    update:async(request,response)=>{
        let find = await laundryModel.find({$and:[{_id:request.body.id},{isDeleted:false}]})
        let findEmailPassword = await laundryModel.find(
            {$or:[{$and:[{email:request.body.email,isDeleted:false}]},
            {$and:[{phoneNumber:request.body.phoneNumber,isDeleted:false}]}
        ]})
        console.log('ifnnf',findEmailPassword)
        if(findEmailPassword.length!=0){
        if( findEmailPassword[0]._id.toString() != request.body.id)return  ({ statusCode: 200, success: 1, msg: AppConstraints.EMAIL_NUMBER_USED })
        }
        if(find == null) return ({ statusCode: 400, success: 0, msg: AppConstraints.INVALID_ID })
        if(request.files){ 
            for(let index in request.files){     
                // console.log(demo[index]);
                       
                request.files[index].map((currentValue,index,array)=>{
                    console.log('inn',currentValue.fieldname);                    
                    if(currentValue.fieldname == 'Document1'){
                        
                        request.body.Document1 =  '/'+currentValue.filename
                    }
                    if(currentValue.fieldname == 'Document2'){
                        request.body.Document2 =  '/'+currentValue.filename  
                    }
                    if(currentValue.fieldname == 'Document3'){
                      
                        request.body.Document3 =  '/'+currentValue.filename  
                    }
                })
            }
        }
        if(request.body.password){
            if(!request.body.newPassword)return ({ statusCode: 400, success: 0, msg: AppConstraints.ENTER_NEW_PASSWORD })
            const comparePassword =await bcrypt.compare(request.body.password,find.password)
            console.log('jdss',comparePassword);
            
            if(comparePassword==false)return ({ statusCode: 400, success: 0, msg: AppConstraints.PASSWORD_AND_CONFIRM_PASSWORD })
            request.body.password = bcrypt.hashSync(request.body.newPassword,salt)
        }
        console.log('rew',request.body);
        
        let upadate = await laundryModel.update({_id:request.body.id},request.body)  
        return ({ statusCode: 200, success: 1, msg: AppConstraints.PROFILE_SUCCESSFULLY })
    },
    // getBranchList :async(request,response)=>{
    //     let list = await laundryModel.findOne({_id:releaseEvents.body.id}).populate('ownerId')
    //     console.log('list',list);
        
    // }
}