let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const AppConstraints=require('../../config/appConstraints.js');

let hypertoken=Schema({
    userId:{   type:Schema.Types.ObjectId,ref:'User' },
    token:{type:String,default:""},
});


module.exports=mongoose.model('hypertoken',hypertoken);
