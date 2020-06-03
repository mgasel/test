let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let laundryserviceitem=Schema({
    
    serviceId:{type:Schema.Types.ObjectId,ref:'Service'},
    categoryId:{type:Schema.Types.ObjectId, ref:'serviceCategory' },
    serviceItemId:{type:Schema.Types.ObjectId, ref:'serviceItems'},
    laundryId:{type:Schema.Types.ObjectId, ref:'Laundry'},
    amountPerItem:{type:String, default:Number },
    isDeleted:{type:Boolean, default:false},
    isActive:{ type:Boolean, default:true},
    createDate:{type:Date, default:Date.now},
    itemInitialCount:{type:Number, default:0},
    series:{type:Number}

});


module.exports=mongoose.model('laundryserviceitem',laundryserviceitem);