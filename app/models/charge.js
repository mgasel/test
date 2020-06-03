let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const AppConstraints=require('../../config/appConstraints.js');

let Charge=Schema({
    quickCharge:{
        type:Number,
        default:0.0
    },
    deliveryCharge:{
        type:Number,
        default:0.0
    }
});


module.exports=mongoose.model('Charge',Charge);
