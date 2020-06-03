let Mongoose = require('mongoose');

let Schema = Mongoose.Schema({
    name:{type:String},
    nameAr:{type:String},
    isDeleted:{type:Boolean,required:true,default:false},
    isBlocked:{type:Boolean,required:true,default:false},
    type:{type:String,enum:["SUBSCRIPTION_PLANS"],required:true}
});

module.exports = Mongoose.model('masterData',Schema);