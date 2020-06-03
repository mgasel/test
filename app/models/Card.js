let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const AppConstraints=require('../../config/appConstraints.js');

let card=Schema({
    userId:                             {   type:Schema.Types.ObjectId,ref:'User' },
    token:{type:String,default:""},
    brand:{type:String,default:""},
    bin:{type:String,default:""},
    last4Digits:{type:String,default:""},
    holder:{type:String,default:""},
    expiryMonth:{type:String,default:""},
    expiryYear:{type:String,default:""},
    merchantTransactionId: {type: String, default: ""}
});


module.exports=mongoose.model('card',card);
