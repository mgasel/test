'use strict';

var Models = require('../models/Version.js');


var getAppVersion = function (criteria, projection, options, callback) {
    Models.find(criteria,projection,options).exec(callback)
};

var createAppVersion= function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

var updateAppVersion= function (criteria, dataToSet, options, callback) {
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

module.exports = {
    getAppVersion: getAppVersion,
    updateAppVersion: updateAppVersion,
    createAppVersion: createAppVersion
};

