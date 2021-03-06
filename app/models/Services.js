let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Service=Schema({

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
    }
});


module.exports=mongoose.model('Service',Service);
