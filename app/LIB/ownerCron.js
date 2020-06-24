const cron = require('node-cron')
const bookingModel = require('../models/Bookings')
const userModel = require('../models/User')
const FCM = require('fcm-node')
const serverKey = 'AIzaSyCqXl2CnsIZSKmxOlfAhXzRuW8qsZLWLa0'
const fcm = new FCM(serverKey)
exports.assignDriver = async()=>{
    cron.schedule(' * * * * *', async ()=> {

      // console.log('hello how are you');
      const findDriver = await bookingModel.find({driverId:null})

    await  findDriver.map(async(bookings,index)=>{
        
          let nearDriver = await userModel.findOne({$and:[{    currentLocation:
        { $near :
           {
             $geometry: { type: "Point",  coordinates: [bookings.pickUpLat, 
              bookings.pickUpLong] },
             $minDistance: 0,
             $maxDistance: 10000
           }
        }},{ userType : "DRIVER"},{isOnline : true},{isAvailable: false}]})
        // console.log('near Driver===>>>>',nearDriver.deviceToken);
        
      
        if(nearDriver!=null){
          // console.log('near Driver===>>>>',nearDriver.deviceToken);
          let message = {
            to : nearDriver
          }
        //   await bookingModel.update({_id:bookings._id},{driverId:nearDriver._id})
        //   await userModel.update({_id:nearDriver._id},{isAvailable: false})
        }
      })
    })

} 
