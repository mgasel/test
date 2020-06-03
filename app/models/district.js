let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let district=Schema({

    districtName:                           {type:String,default:""},
    districtLat:                             {    type:Number,default:0.0,required:true,index:true },
    districtLong:                            {    type:Number,default:0.0,require:true,index:true },
    Location:                                {type: [Number],index: '2dsphere' },
    Address:                                    {type:String,default:""},
    isDeleted:                                     {type:Boolean,default:false}
});
module.exports=mongoose.model('district',district);