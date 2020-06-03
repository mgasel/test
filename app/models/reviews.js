let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let reviews=Schema({


    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    driverId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:'Bookings'
    },
    laundryId:{
        type:Schema.Types.ObjectId,
        ref:'Laundry'
    },
    ratings:{
        type:Number,
        default:0
    },

    overAllExperienceRating:{
        type:Number,
        default:0.0
    },

    laundryServiceRating:{
        type:Number,
        default:0.0
    },

    driverRating:{
        type:Number,
        default:0.0
    },
  

    description:{
        type:String,
        default:""
    },

    isDeleted:{
        type:Boolean,
        default:false
    },

 
   
    createDate:{
        type:Date,
        default:Date.now
    }




});


module.exports=mongoose.model('reviews',reviews);
