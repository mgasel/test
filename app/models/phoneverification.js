let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let phoneverification=Schema({
    callingCode:{
        type:String,
        default:''
    },

    phoneNumber:{
        type:String,
        default:''
    },

    otp:{
        type:Number,
        default:0
    },


    isActive:{
        type:Boolean,
        default:true
    },

    createDate:{
        type:Date,
        default:Date.now
    },
    
    expiryDate:{
        type:Number
    }
});
module.exports=mongoose.model('phoneverification',phoneverification);