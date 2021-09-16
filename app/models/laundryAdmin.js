let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let laundryAdmin=Schema({
    email:                              {  type:String,default:"",index:true },
    countryCode:                              {  type:String,default:"" },

    password:                           {  type:String,default:"" },

    accessToken:                        {  type:String,default:"",index:true},
    
    created_at:                         {  type:Date,default:Date.now },

    passwordResetToken:                  {  type: String , index: true, trim: true    },
    phoneNumber:                         {type: String},
  
    customerLaundries:                 [{   type:Schema.Types.ObjectId,ref:'Laundry' }],
    customerPhnumbers:                  {type:Array,default:[]}
    
});

module.exports=mongoose.model('laundryAdmin',laundryAdmin);
