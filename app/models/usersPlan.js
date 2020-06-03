let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let usersPlan=Schema({

    planId:{
        type:Schema.Types.ObjectId,
        ref:'subscriptionPlan'
    },

    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },

    isActive:{
        type:Boolean,
        default:true
    },
   
    created_at:{
        type:Date,
        default:Date.now
    },

    
    isDeleted:{
        type:Boolean,
        default:false
    },
});


module.exports=mongoose.model('usersPlan',usersPlan);