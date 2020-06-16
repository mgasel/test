const mongoose = require('mongoose')
let Schema=mongoose.Schema;
let otp =Schema({
otp:{type:String,default:''},
phoneNumber : {type:Number,default:''},
countryCode:{type:String}
},{timestamps:true})
module.exports = mongoose.model('otp',otp)