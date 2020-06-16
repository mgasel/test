let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let User = Schema({
    name: { type: String, required: true },

    email: { type: String, index: true },

    password: { type: String, required: true, index: true },

    phoneNumber: { type: String, default: "", index: true },

    // subscriptionPlanMsgForRepurchase:{type:Number,default:1},// 1 means send one time and default value for new user as he has no plans active


    callingCode: { type: String, default: "" },




    accessToken: { type: String, default: "", index: true },

    createDate: { type: Date, default: Date.now },

    emailVerificationcode: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    isBlocked: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },

    isEmailVerified: { type: Boolean, default: false },

    deviceType: { type: String, default: "" },

    Profilepic: { original: { type: String, default: "" }, thumbnail: { type: String, default: "" } },




    isOnline: { type: Boolean, default: true },

    deviceToken: { type: String, default: "" },

    licencePic: {
        licencePicOriginal: { type: String, default: "" },
        licencePicThumbnail: { type: String, default: "" }
    },

    currentLocation: { type: [Number], index: '2dsphere' },


    lat: { type: Number, default: 0.0, required: true, index: true },

    long: { type: Number, default: 0.0, required: true, index: true },

    isTCAccepted: { type: Boolean, default: true },

    userType: { type: String, default: "" },



    subscryptinPlans: { type: Schema.Types.ObjectId, ref: 'subscriptionPlan' },


    hasSubscribed: { type: Boolean, default: false },

    isActualPurchaser: { type: Boolean, default: false },

    isSubscriptiveUser: { type: Boolean, default: false },


    isAvailable: { type: Boolean, default: true },

    load: { type: Number, default: 0 },

    gender: { type: String, default: "" },


    countryName: { type: String, default: "" },


    dateOfBirth: { type: Number, default: 0 },


    house_flat: { type: String, default: "" },


    landmark: { type: String, default: "" },



    location: { type: String, default: "" },

    completePhoneNumber: { type: String, default: "", index: true },

    incentive: { type: Number, default: 0 },

    isRated: { type: Boolean, default: false },

    nationality: { type: String, default: 'Saudi' },
    cityName: { type: String, default: 'Saudi' },

    laundryId: { type: Schema.Types.ObjectId, ref: 'Laundry' },

    couponId: { type: Schema.Types.ObjectId, ref: 'coupon' },

    couponApplied: { type: Boolean, default: false },

    packChoosen: { type: Boolean, default: false },
    langaugeType: { type: String, default: "AR", enum: ["EN", "AR"] },
    weekendFlag: { type: Boolean, default: false },
    districtId: [{ type: Schema.Types.ObjectId, ref: 'district' }],
    cardRegistationId: [{
        cardNumber: { type: String, default: "" },
        registrationId: { type: String, default: "" }
    }],

});

module.exports = mongoose.model('User', User);