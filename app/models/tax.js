let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let tax=Schema({
/*	_id:				{type:String},*/
	ownerid:                            {   type:String },
        istaxenabled:                         {    type:String,default:"No" },
	taxperc:                             {    type:Number,default:0.0},
	notes:                              {    type:String,default:"" },
	vatid:				{ type:String, default:""},

},{timestamp:true});


module.exports=mongoose.model('tax',tax);

