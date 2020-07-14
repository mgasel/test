let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let laundryService=Schema({

    serviceName: {
        type:String,
        default:"",
        index:true
    },
    serviceNameAr: {
        type:String,
        default:"",
        index:true
    },
    servicePic:{
        
        servicePicOriginal:{
            type:String,
            default:""
        },

        servicePicThumbnail:{
            type:String,
            default:""
        }
       
    },


    hexString:{
        type:String,
        default:""
    },
    laundryId : {
        type:Schema.Types.ObjectId,
        ref:'Laundry'
    },
    serviceCategory:[{
        type:Schema.Types.ObjectId,
        ref:'serviceCategory'
    }],

    isDeleted:{
        type:Boolean,
        default:false
    },

    isActive:{
        type:Boolean,
        default:true
    },
   
    createDate:{
        type:Date,
        default:Date.now
    },
    vendorServiceId:{
        type:Schema.Types.ObjectId,
        ref:'Service'
    },
    vendorlaundryDate : {
        type:Number,
        default:0
    }
});


module.exports=mongoose.model('laundryService',laundryService);
