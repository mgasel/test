let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let laundrySubscriptionPlan=Schema({

    planName:                       {   type:String,default:"",index:true  },

    planAmount:                     {   type:String, default:"" },

    planNameAr:                     {   type:String,default:"",index:true },

    planAmountAr:                   {   type:String, default:"" },

    perPeriod:                      {   type:String, default:"" },

    perPeriodAr:                    {   type:String, default:"" },

    addBranches :                    {type:Number,default:0.0},

    isActive:                       {   type:Boolean, default:true },

    created_at:                     {   type:Date,  default:Date.now },

    isDeleted:                      {   type:Boolean, default:false  },

    isBlocked:                      {   type:Boolean, default:false  },

    weekendService:                 {   type:Boolean, default:false  },

    isSelected:                     {   type:String,default:false },

    noOfUsers:                      {   type:Number },

    noOfWeeklyOrders:               {   type:Number },


    // subscriptionItems:              [{
    //     masterId:{type:mongoose.Schema.ObjectId,ref:'masterData'},
    //     value:{type:String},
    // }],
    
});


module.exports=mongoose.model('laundrySubscriptionPlan',laundrySubscriptionPlan);