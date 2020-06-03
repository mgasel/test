var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var appVersion=Schema({
    version:{
        type:Number,
        default:1,
    },
    created_at:{
        type:Date,
        default:Date.now
    },
    app_type:{
        type:String,enum:["DRIVER","USER"]
    },
    platform:{
        type:String,enum:["IOS","ANDROID"]
    }
});
module.exports=mongoose.model('appVersion',appVersion);