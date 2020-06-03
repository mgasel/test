let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let notification=Schema({
    
    recieverId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },

    title:{
        type:String,
        default:""
    },

    msg:{
        type:String,
        default:""
    },
    msgAr:{type:String,
    default:""},

    messageType:{
        type:String,
        default:""
    },

    bookingId:{
        type:Schema.Types.ObjectId,
        ref:'Bookings'
    },

    isRead:{
        type:Boolean,
        default:false
    },

    isDeleted:{
        type:Boolean,
        default:false
    },

    isActive:{
        type:Boolean,
        default:true
    },
   
    createDate:{
        type:Number
    },
    reshuduled:{
        type:Number,
        default:+new Date()
    }
});


module.exports=mongoose.model('notification',notification);
