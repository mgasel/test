'use strict';

var Models = require('../models/Admin.js');

//Get Users from DB
var getAdmin = function (criteria, projection, options, callback) {
    Models.find(criteria, projection, options, callback);
};

//Insert User in DB
var createAdmin = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Update price in DB
var updateAdmin = function (criteria, dataToSet, options, callback) {
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};


module.exports = {
    getAdmin: getAdmin,
    createAdmin: createAdmin,
    updateAdmin: updateAdmin,
};
