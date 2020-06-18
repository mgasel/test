let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let laundaryItems=Schema({
    
    serviceId:{ type:Schema.Types.ObjectId, ref:'laundryService'},

    categoryId:{ type:Schema.Types.ObjectId, ref:'serviceCategory' },

    series:{type:Number},

    itemName:{type:String, default:""},

    itemNameAr:{ type:String, default:""},


    itemPic:{        
        itemPicOriginal:{ type:String, default:""},

        itemPicThumbnail:{ type:String, default:""}
       
    },


    amountPerItem:{type:String,default:Number},


    itemInitialCount:{type:Number, default:0},


    isDeleted:{type:Boolean, default:false},

    isActive:{type:Boolean, default:true},
   
    createDate:{ type:Date,default:Date.now},


});


module.exports=mongoose.model('laundaryItems',laundaryItems);