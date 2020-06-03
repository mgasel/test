let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let subscriptionPlanItems=Schema({

    planId:{
        type:Schema.Types.ObjectId,
        ref:'subscriptionPlan'
    },



    itemQwery:{
        type:String,
        default:"",
        index:true
    },
    itemQueryAr:{
        type:String,
        default:"",
        index:true
    },

    itemStatus:{
        type:String,
        default:""
    },
itemStatusAr:{
    type:String,
    default:""
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


module.exports=mongoose.model('subscriptionPlanItems',subscriptionPlanItems);