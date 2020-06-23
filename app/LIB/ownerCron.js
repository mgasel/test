const cron = require('node-cron')
const bookingModel = require('../models/Bookings')
exports.assignDriver = async()=>{
    cron.schedule(' * * * * *', async ()=> {

    //   console.log('hello how are you');
      // const findDriver = await bookingModel.find({driverId:null})
    //   console.log('findDriver',findDriver);
    // let nearDriver = await userModel.findOne({$and:[{    currentLocation:
    //     { $near :
    //        {
    //          $geometry: { type: "Point",  coordinates: [30.712905, 
    //             76.709302 ] },
    //          $minDistance: 0,
    //          $maxDistance: 10000
    //        }
    //     }},{ userType : "DRIVER"},{isOnline : true},{isAvailable: true}]})
      
      



    })

} 
