let Mongoose = require('mongoose');

let Schema = Mongoose.Schema({
    bookingId:{type:Mongoose.Schema.Types.ObjectId,ref:'Bookings',required:true},
    driverId:{type:Mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    userId:{type:Mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    rating:{type:Number,required:true},
    createdAt:{type:Date,default:Date.now()}
});

module.exports = Mongoose.model('userRating',Schema);