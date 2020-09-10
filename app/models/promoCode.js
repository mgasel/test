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

    startDate:                          { type:Number,default:0},

    laundryId: { type: Schema.Types.ObjectId, ref: "Laundry" },

    branchesId: [{ type: Schema.Types.ObjectId, ref: "Laundry" }],
  
    serviceId: [{ type: Schema.Types.ObjectId, ref: "laundryService" }],
  
    categoryId: [{ type: Schema.Types.ObjectId, ref: "serviceCategory" }],

    serviceItems : [{ type: Schema.Types.ObjectId, ref: "laundaryItems" }],
  
    minimumOrderAmount: { type: Number },

    customerType : {type : String},
  
    isDeleted: { type: String, default: false },
  
    deliveryOption : {type: String,default : ""},
  
    paymentMethod : {type : String , default: ""},
  
    orderChannel : {type: String , default: ""},
     
    serviceType : {type : String , default : ""},

    type: {type : String,default:"Percentage"}

});
module.exports=mongoose.model('PromoCode',PromoCode);