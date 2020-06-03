let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let log=Schema({

    userId:                                 { type:Schema.Types.ObjectId, ref:'User'},

    fromDate:                               { type:Number,default:0 },

    tillDate:                               { type:Number,default:0},

    monthfree:                              { type:Boolean,default:false  },

    orderfree:                              { type:Boolean,default:false  },

    freeOrderCount:                         { type:Number},

    isActive:                               { type:Boolean,default:true},

    discount:                               { type:Number},

    planId:                                 { type:Schema.Types.ObjectId, ref:'subscriptionPlan'},

});
module.exports=mongoose.model('log',log);