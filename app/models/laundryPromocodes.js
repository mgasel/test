let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let laundryPromos = Schema({
  promoCode: { type: String, default: "", index: true },

  expiryDate: { type: Number },

  message: { type: String, default: "" },

  created_at: { type: Date, default: Date.now },

  usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

  isDeleted: { type: Boolean, default: false },

  discount: { type: Number, default: 0.0 },

  startDate: { type: Number },

  laundryId: { type: Schema.Types.ObjectId, ref: "laundries" },

  branchesId: [{ type: Schema.Types.ObjectId, ref: "laundries" }],

  serviceId: [{ type: Schema.Types.ObjectId, ref: "laundryService" }],

  categoryId: [{ type: Schema.Types.ObjectId, ref: "serviceCategory" }],

  minimumAmount: { type: Number },

  isDeleted: { type: String, default: false },

  deliveryOption : {type: String,default : ""},

  paymentMethod : {type : String , default: ""},

  orderChannel : {type: String , default: ""},
   
  serviceType : {type : String , default : ""},

  discount : {type : Number},
  

  
});
module.exports = mongoose.model("laundryPromos", laundryPromos);
