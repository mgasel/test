let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Admin=Schema({
    email:                              {  type:String,default:"",index:true },

    password:                           {  type:String,default:"" },

    accessToken:                        {  type:String,default:"",index:true},
    
    created_at:                         {  type:Date,default:Date.now },

    passwordResetToken:                  {  type: String , index: true, trim: true    },
    operationsAdmin:                    {type:Boolean},
    customerAdmin:                      {type:Boolean},
    marketingAdmin:                      {type:Boolean},
    orderAdmin:                      {type:Boolean},
    superAdmin:                         {type:Boolean}
});

module.exports=mongoose.model('AdminDetails',Admin);