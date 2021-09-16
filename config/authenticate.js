const jwt = require('jsonwebtoken')
const AppConstraints = require('../config/appConstraints')
const ownwerLaundry = require('../app/models/Laundry')
const userLaundry = require('../app/models/User')
module.exports = {
    generateOwnwerToken : async(req,res)=>{
        const token = jwt.sign({id:req.id,email:req.email},'ownwerSecret')
        
        return token
    },
    verifyOwnwer : async(request,response,next)=>{
        try {

            const verify = jwt.verify(request.headers.token,'ownwerSecret')
            console.log('verify',verify);

	    const user=await userLaundry.findOne({email:verify.email})
	    if(user.accessToken!=request.headers.token){
	    return response.status(401).json({statusCode:401,success:0 , msg: AppConstraints.INVALID_TOKEN_KEY})
            console.log('error',error);
	   }
		
	   console.log('verify user',user);
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

 const user=await userLaundry.findOne({email:verify.email})
console.log('user det',user)
console.log('tokens user',user.accessToken)
console.log('token header',request.headers.token)
            if(user.accessToken!=request.headers.token){
            return response.status(401).json({statusCode:401,success:0 , msg: AppConstraints.INVALID_TOKEN_KEY})
            console.log('error',error);
           }
 console.log('verify user',user);



            request.ownerId = verify.id
            request.laundryId = verify.id
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
