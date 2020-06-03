let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Forgot=Schema({
  email:                        {   type:String,default:"",index:true },
  forgotCode:                   {   type:Number,default:0,index:true },
  isActive:                     {   type:Boolean,default:true },
  userType:                     {   type:String,default:"" },
  isExpired:                    {   type:Boolean,default:false }
});

module.exports=mongoose.model('Forgot',Forgot);