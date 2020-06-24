let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const AppConstraints=require('../../config/appConstraints.js');

let Bookings=Schema({

userId:                             {   type:Schema.Types.ObjectId,ref:'User' },

driverId:                           {   type:Schema.Types.ObjectId,ref:'User',default:null },

laundryId:                          {   type:Schema.Types.ObjectId,ref:'Laundry' },

pickUpAddress:                      {   type:String,default:"" },

bookingData:                        {   type:Object,default:null },

deliveryAddress:                    {   type:String,default:"" },

pickUpDate:                         {   type:Number,default:0.0 },

deliveryDate:                       {   type:Number,default:0.0 },

serviceCharge:                      {   type:Number,default:0.0 },

deliveryCharge:                     {   type:Number,default:0.0 },

quickCharge:                        {   type:Number,default:0.0 },

isQuickService:                     {   type:Boolean,default:false },

transactionId:                      {   type:String,default:"" },

////////////////for tracking///////////////////////////////////////////

isPickedUpfromCustomer:             {   type:Boolean,default:false },

isDeliveredDeliveredToLaundry:      {   type:Boolean,default:false },

isPickedUpfromLaundry:              {   type:Boolean,default:false },

isDeliveredDeliveredToLaundry:      {   type:Boolean,default:false },

//////////////////////////for tracking////////////////////////////////

isCompleted:                        {   type:Boolean,default:false },

isDeleted:                          {   type:Boolean,default:false },

createDate:                         {   type:Number,default:0.0 },

notificationDate:                   {   type:Number,default:0.0 },

discount:                           {   type:Number,default:0.0 },

totalAmount:                        {   type:Number,default:0.0 },

pickUpLat:                          {   type:Number,default:0.0 },

pickUpLong:                         {   type:Number,default:0.0 },

pickUpLocation:                     {   type:[Number],index: '2dsphere' },

deliveryLat:                        {   type:Number,default:0.0 },

deliveryLat:                        {   type:Number,default:0.0 },

deliveryLong :                      {   type:Number,default:0.0 },

deliveryLocation:                   {   type:[Number],index: '2dsphere' },

orderId:                            {   type:String,default:"" },

updated_at:                         {   type:Number,default:0 },

emailNotified:                      {   type:Boolean,default:false },

smsNotified:                        {   type:Boolean,default:false },

emailNotifiedTime:                  {   type:Date,default:null },

smsNotifiedTime:                    {   type:Date,default:null },

smsNotifiedTime:                    {   type:Date,default:null },

isUserNotified:                      {   type:Boolean,default:false },

paymentOption:                      {   type:String,default:AppConstraints.APP_CONST_VALUE.CASH_ON_DELIVERY,enum:[
                                                                        AppConstraints.APP_CONST_VALUE.NET_BANKING,
                                                                        AppConstraints.APP_CONST_VALUE.CREDIT_DEBIT_CARD,
                                                                        AppConstraints.APP_CONST_VALUE.CASH_ON_DELIVERY
                                                                  ]
                                    },
status:                             {    type:String,
                                         default:AppConstraints.APP_CONST_VALUE.PENDING,
                                         enum:[
                                          AppConstraints.APP_CONST_VALUE.PENDING,
                                          AppConstraints.APP_CONST_VALUE.ASSIGNED,
                                          AppConstraints.APP_CONST_VALUE.PICKEDUP,
                                          AppConstraints.APP_CONST_VALUE.INLAUNDRY,
                                          AppConstraints.APP_CONST_VALUE.REASSIGNED,
                                          AppConstraints.APP_CONST_VALUE.DELEVERED,
                                          AppConstraints.APP_CONST_VALUE.COMPLETED,
                                          AppConstraints.APP_CONST_VALUE.REJECTED,
                                          AppConstraints.APP_CONST_VALUE.CANCELLED,
                                          AppConstraints.APP_CONST_VALUE.SCHEDULED,
                                          AppConstraints.APP_CONST_VALUE.CONFIRMED,
                                          AppConstraints.APP_CONST_VALUE.ACCEPTED,
                                          AppConstraints.APP_CONST_VALUE.DRIVE_ARRIVING
                                          ]
                                    },
assignedTime:                       {
                                          type:Number,
                                          default:0
                                    },
assignedStatusCount:                {
                                          type:Number,
                                          default:0
                                    }, 
                                    
reAssignedCount:                    {
                                          type:Number,
                                          default:0
                                    },                                    
                                    
isCompletedByDriver:                { type:Boolean,default:false },

isPickedUp:                         { type:Boolean,default:false },

isDelevered:                        { type:Boolean,default:false },

approved:                           { type:Boolean,default:false },

timeSlote:                          { type:Number,default:0 },

isRejected:                         { type:Boolean,default:false },

isRescheduledBookingByDriver:       { type:Boolean,default:false },


isRescheduledBookingByUser:         { type:Boolean,default:false },


newDateToHandelDriverReschedule:    { type:Number },

pickupTimeNotAvailable:             { type:Boolean,default:false },           

deliveryTimeNotAvailable:           { type:Boolean,default:false },

slotId:                             { type:Schema.Types.ObjectId,ref:"slots"},

isRescheduledBookingByUserDate:     { type:Number,default:0 },
bagNo:{type:String},
orderType:{type:String},
deliveryChoice:{type:String},

subplanid:{ type:Schema.Types.ObjectId,ref:'subscriptionPlan' },

    isReviewd: {type:Boolean, required:true, default:false}
});


module.exports=mongoose.model('Bookings',Bookings);
