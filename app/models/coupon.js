let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let coupon=Schema({
    couponCode:                          {  type:String,default:"",index:true },

    expiryDate:                         {  type:Number,default:0 },

    created_at:                         {  type:Date,default:Date.now },

    startDate:                          { type:Number,default:0}

});
module.exports=mongoose.model('coupon',coupon);