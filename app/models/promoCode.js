let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let PromoCode=Schema({
    promoCode:                          {  type:String,default:"",index:true },

    expiryDate:                         {  type:Number,default:0 },

    message:                            {  type:String,default:"" },

    created_at:                         {  type:Date,default:Date.now },

    usedBy:                             [{type:Schema.Types.ObjectId,ref:'User'}],

    isDeleted:                          { type:Boolean,default:false },

    discount:                           { type:Number,default:0.0 },

    startDate:                          { type:Number,default:0}

});
module.exports=mongoose.model('PromoCode',PromoCode);