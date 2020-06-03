let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let slots=Schema({
    slotTime:{type:String,default:""},
    millis  :{type:Number},
    timing:{type:String,default:"",enum:["MORNING","EVENING","EARLY_MORNING","LATE_EVENING"]}
});


module.exports=mongoose.model('slots',slots);