let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let owner=Schema({

    // laundryName:                            {    type:String,default:"",index:true  },

    address:                         {    type:String,default:"" },

    laundryLat:                             {    type:Number,default:0.0,required:true,index:true },

    laundryLong:                            {    type:Number,default:0.0,require:true,index:true },

    // currentLocation:                        {    type: [Number],index: '2dsphere' },

    
    isDeleted:                              {    type:Boolean,default:false },

    // services:                               [{   type:Schema.Types.ObjectId,ref:'Service' }],

    // cityName:                               {    type:String,default:""  }

    // serviceCategory:                        [{   type:Schema.Types.ObjectId, ref:'serviceCategory'}],
    // laundryId :[{type:Schema}],
    email : {type:String},
    password : {type:String},
    owner:{type:Boolean},
    phoneNumber:{type:Number},
    documents:{type:String}
},{timestamp:true});


module.exports=mongoose.model('owner',owner);
