const cron = require('node-cron')
const bookingModel = require('../models/Bookings')
const userModel = require('../models/User')
exports.assignDriver = async()=>{
    cron.schedule('*/10 * * * * *', async ()=> {

      // console.log('hello how are you');
      const findDriver = await bookingModel.find({driverId:null})
      // console.log('findDriver',findDriver);
    await  findDriver.map(async(bookings,index)=>{
        
          let nearDriver = await userModel.findOne({$and:[{    currentLocation:
        { $near :
           {
             $geometry: { type: "Point",  coordinates: [bookings.pickUpLat, 
              bookings.pickUpLong] },
             $minDistance: 0,
             $maxDistance: 10000
           }
        }},{ userType : "DRIVER"},{isOnline : true},{isAvailable: true}]})
      
        if(nearDriver!=null){
          await bookingModel.update({_id:bookings._id},{driverId:nearDriver._id})
          await userModel.update({_id:nearDriver._id},{isAvailable: false})
        }
        
      })
 
      


    })

} 
