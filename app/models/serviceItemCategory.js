let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let serviceCategory=Schema({
    // serviceId:{type:Schema.Types.ObjectId, ref:'Service'},
    categoryName:{type:String, default:""},
    categoryNameAr:{type:String,default:""},
    categoryPic:{
        categoryPicOriginal:{type:String,default:""},
        categoryPicThumbnail:{type:String,default:""}
    },
    // amountPerItem:{type:String,default:Number},
    // itemInitialCount:{type:Number,default:0},
    series:{type:Number},
    isDeleted:{type:Boolean,default:false},
    isActive:{type:Boolean,default:true},
    createDate:{type:Date,default:Date.now},
});


module.exports=mongoose.model('serviceCategory',serviceCategory);