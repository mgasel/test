let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Laundry=Schema({

    laundryName:                            {    type:String,default:"",index:true  },

    laundryAddress:                         {    type:String,default:"" },

    laundryLat:                             {    type:Number,default:0.0,required:true,index:true },

    laundryLong:                            {    type:Number,default:0.0,require:true,index:true },

    currentLocation:                        {    type: [Number],index: '2dsphere' },

    isActive:                               {    type:Boolean,default:true },

    created_at:                             {    type:Date,default:Date.now },
    
    isDeleted:                              {    type:Boolean,default:false },

    services:                               [{   type:Schema.Types.ObjectId,ref:'Service' }],

    // cityName:                               {    type:String,default:""  }

    serviceCategory:                        [{   type:Schema.Types.ObjectId, ref:'serviceCategory'}],

    districtId:                              {type:Schema.Types.ObjectId, ref:'district'} ,
    ownerId:{type:Schema.Types.ObjectId,ref:'Laundry'},
    email : {type:String,default:''},
    userName :{type:String,default:''},
    password : {type:String},
    owner:{type:Boolean},
    phoneNumber:{type:Number},
    document1:{type:String},
    document2:{type:String},
    document3:{type:String},
    countryCode:{type:String},
    isVerified:{type:Boolean,default:true},
    subscriptionLimit : {type:Number,default:0.0},
    Document1:{type:String},
    Document2:{type:String},
    Document3:{type:String},
    laundryServices:[{type:Schema.Types.ObjectId,ref:'laundryService'}],
    cardRegistationId: [{
        cardNumber: { type: String, default: "" },
        registrationId: { type: String, default: "" }
    }]
});


module.exports=mongoose.model('Laundry',Laundry);
