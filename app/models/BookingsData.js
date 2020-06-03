let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let BookingsData=Schema({
    bookingId:{
        type:Schema.Types.ObjectId,
        ref:'Bookings'
    },

    bookingData:[{
        type:Schema.Types.ObjectId,
        ref:'Service'
    }],

    


});


module.exports=mongoose.model('BookingsData',BookingsData);
