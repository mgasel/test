let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Issue=Schema({
    issue:                      {  type:String,default:""   },
    userId:                     {  type:Schema.Types.ObjectId,ref:'User' },
    issueType:                  {  type:String,default:""   },
    userType:                   {  type:String,default:""   },
    issuesCreateDate:           {  type:Date,default:Date.now   },
    imageUrl:                   {  original:{type:String,default:""}, thumbnail:{type:String,default:""} },
});
module.exports=mongoose.model('Issue',Issue);