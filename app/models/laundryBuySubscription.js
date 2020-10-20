let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let laundryBuySubscription=Schema({

    // purchaserId:                    {   type:Schema.Types.ObjectId,ref:"User" },

    laundryId:                         {   type:Schema.Types.ObjectId,ref:"Laundry" },

    subscriptionPlanId:             {   type:Schema.Types.ObjectId,ref:"subscriptionPlan" },

    subscriptionBanches:             [{   type:Schema.Types.ObjectId,ref:'Laundry' }],

    reciept:                        {   type:String },
 
    perchageDate:                   {   type:Date, default:Date.now },

    startDate:                       {type:Number,default : 0.0},

    endDate:                       {type:Number,default : 0.0},

    expiryDate:                     {   type:Date  },

    isDelete:                       {   type:Boolean,default:false },

    isActive:                       {   type:Boolean,default:false },

    isExpired:                      {   type:Boolean,default:false },

    registrationId:                 {   type:String }
    
});


module.exports=mongoose.model('laundryBuySubscription',laundryBuySubscription);