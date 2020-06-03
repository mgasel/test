let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let couponuser=Schema({
    couponId:                          {     type:Schema.Types.ObjectId, ref:'coupon'},

    userId:                             {   type:Schema.Types.ObjectId, ref:'User'},

    expiryDate:                         {  type:Number,default:0 },

    startDate:                          { type:Number,default:0}

});
module.exports=mongoose.model('couponuser',couponuser);