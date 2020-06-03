let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let userSubscription=Schema({

    purchaserId:                    {   type:Schema.Types.ObjectId,ref:"User" },

    userId:                         {   type:Schema.Types.ObjectId,ref:"User" },

    subscriptionPlanId:             {   type:Schema.Types.ObjectId,ref:"subscriptionPlan" },

    reciept:                        {   type:String },
 
    perchageDate:                   {   type:Date, default:Date.now },

    expiryDate:                     {   type:Date  },

    isDelete:                       {   type:Boolean,default:false },

    isActive:                       {   type:Boolean,default:false },

    isExpired:                      {   type:Boolean,default:false },

    registrationId:                 {   type:String }
    
});


module.exports=mongoose.model('userSubscription',userSubscription);