let Mongoose = require('mongoose');

let Schema = ({
    jsonRes:{},
    createdAt:{type:Date,default:Date.now()}
});

module.exports = Mongoose.model('transections',Schema);