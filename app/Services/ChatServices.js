/**
 * Created by cbluser
 */

'use strict';

var Models = require('../models/Chatroom.js');

//Get Users from DB
var getChatData = function (criteria, projection, options, callback) {
    Models.find(criteria, projection, options, callback);
};

//Insert User in DB
var create = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Update price in DB
var update = function (criteria, dataToSet, options, callback) {
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};


var updateMultiple = function (criteria, dataToSet, options, callback) {
    Models.update(criteria, dataToSet, options, callback);
};



var getPopulate = function (criteria, project, options,populateArray, callback) {
    Models.find(criteria, project, options).populate(populateArray).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};


module.exports = {
    getChatData: getChatData,
    create: create,
    update:update,
    getPopulate:getPopulate,
    updateMultiple:updateMultiple
};