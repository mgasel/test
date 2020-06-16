const jwt = require('jsonwebtoken')
const AppConstraints = require('../config/appConstraints')
const ownwerLaundry = require('../app/models/Laundry')
module.exports = {
    generateOwnwerToken : async(req,res)=>{
        const token = jwt.sign({id:req.id,email:req.email},'ownwerSecret')
        
        return token
    },
    verifyOwnwer : async(request,response,next)=>{
        try {
            const verify = jwt.verify(request.headers.token,'ownwerSecret')
            console.log('verify',verify);
            request.ownerId = verify.id
            const owner = await ownwerLaundry.findOne({$and:[{_id:verify.id},{owner:true},{isDeleted:false}]})
            // console.log('verifiiiy');
            
            if(owner==null)return response.status(400).json({statusCode:400,success:0 , msg: AppConstraints.INVALID_TOKEN_KEY})
            console.log('/.........');
            
            next()
            
        } catch (error) {
            return response.status(400).json({statusCode:400,success:0 , msg: AppConstraints.INVALID_TOKEN_KEY})
            console.log('error',error);
            
        }
    } ,
    verifyOwnerBranch : async(request,response,next)=>{
        try {
            const verify = jwt.verify(request.headers.token,'ownwerSecret')
            console.log('verify',verify);
            request.ownerId = verify.id
            const owner = await ownwerLaundry.findOne({$and:[{_id:verify.id},{isDeleted:false}]})
            // console.log('verifiiiy');
            
            if(owner==null)return response.status(400).json({statusCode:400,success:0 , msg: AppConstraints.INVALID_TOKEN_KEY})
          
            next()
            
        } catch (error) {
            return response.status(400).json({statusCode:400,success:0 , msg: AppConstraints.INVALID_TOKEN_KEY})
            console.log('error',error);
            
        }
    }
}