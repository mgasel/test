let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let ltax=Schema({
 _id:                             {type:String,default:""},
	ownerid:                            {   type:String,ref:'Owner' },
    
    istaxenabled:                         {    type:String,default:"No" },

    taxperc:                             {    type:Number,default:0.0},

    notes:                              {    type:String,default:"" },

},{timestamp:true});


module.exports=mongoose.model('ltax',ltax);

