let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Vehicle=Schema({

    VehicleName:                        {  type:String,default:'' },


   
    VehicleNumber:                      {  type:String,default:'' },
   
    
    
    isDeleted:                          {   type:Boolean,default:false},
});


module.exports=mongoose.model('Vehicle',Vehicle);