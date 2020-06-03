
const async = require('async');
const md5 = require('md5');
var Service = require('../Services/AdminService.js');
const AppService = require('../Services/AppVersionService.js');

exports.bootstrapAdmin = function (callback) {

    var adminData1 = {
        email: 'admin@codebrew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData2 = {
        email: 'rajendra@codebrew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData3 = {
        email: 'admin2@codebrew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData4 = {
        email: 'admin3@codebrew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData5 = {
        email: 'luvdeep@code-brew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData6 = {
        email: 'garimasharma@code-brew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData7 = {
        email: 'shubhamsood@code-brew.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData8 = {
        email: 'test@yopmail.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin'
    };
    var adminData9 = {
        email: 'omer@3ndk.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        operationsAdmin: true
    };
    var adminData10 = {
        email: 'abdullah@3ndk.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        operationsAdmin: true
    };
    var adminData11 = {
        email: 'yasir@3ndk.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        superAdmin: true
    };
    var adminData12 = {
        email: 'contact-us@3ndk.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        customerAdmin: true
    };
    var adminData13 = {
        email: 'osama@3ndk.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        superAdmin: true
    };
    var adminData14 = {
        email: 'nora@nasher.co',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        marketingAdmin: true
    };
    var adminData15 = {
        email: 'bookings@3ndk.com',
        password: '25f9e794323b453885f5181f1b624d0b',
        name: 'admin',
        orderAdmin: true
    };

    async.parallel([
        function (cb) {
            insertData(adminData1.email, adminData1, cb)
        },
        function (cb) {
            insertData(adminData2.email, adminData2, cb)
        },
        function (cb) {
            insertData(adminData3.email, adminData3, cb)
        },
        function (cb) {
            insertData(adminData4.email, adminData4, cb)
        },
        function (cb) {
            insertData(adminData5.email, adminData5, cb)
        },
        function (cb) {
            insertData(adminData6.email, adminData6, cb)
        },
        function (cb) {
            insertData(adminData7.email, adminData7, cb)
        },
        function (cb) {
            insertData(adminData8.email, adminData8, cb)
        },
        function (cb) {
            insertData(adminData9.email, adminData9, cb)
        },
        function (cb) {
            insertData(adminData10.email, adminData10, cb)
        },
        function (cb) {
            insertData(adminData11.email, adminData11, cb)
        },
        function (cb) {
            insertData(adminData12.email, adminData12, cb)
        },
        function (cb) {
            insertData(adminData13.email, adminData13, cb)
        },
        function (cb) {
            insertData(adminData14.email, adminData14, cb)
        },
        function (cb) {
            insertData(adminData15.email, adminData15, cb)
        }
    ], function (err, done) {
        callback(err, 'Bootstrapping finished');
    })
};

function insertData(email, adminData, callback) {
    var needToCreate = true;
    async.series([function (cb) {
        var criteria = {
            email: email
        };
        Service.getAdmin(criteria, {}, {}, function (err, data) {
           
            if (data && data.length > 0) {
                
                needToCreate = false;
            }
            cb()
        })
    }, function (cb) {
        if (needToCreate) {
            Service.createAdmin(adminData, function (err, data) {
                cb(err, data)
            })
        } else {
            cb();
        }
    }], function (err, data) {
        
        console.log('Bootstrapping finished for ' + email);
        callback(err, 'Bootstrapping finished')
    })
}

exports.bootStrapAppVersion = function(callback){
    try{
        let appData = {
            version:'1.0'
        };

        async.parallel([
            function (cb) {
                inserAppData(appData.version, appData, cb)
            }
        ], function (err, done) {
            callback(err, 'Bootstrapping finished');
        })

    }catch(err){
        console.log(err,'error data');
    }
}

function inserAppData (version,appData,callback){
    var needToCreate = true;
    async.series([function (cb) {
        var criteria = {
            version: version
        };
        AppService.getAppVersion(criteria, {}, {}, function (err, data) {
           
            if (data && data.length > 0) {
                
                needToCreate = false;
            }
            cb()
        })
    }, function (cb) {
        if (needToCreate) {
            AppService.createAppVersion(appData,function (err, data) {
                cb(err, data)
            })
        } else {
            cb();
        }
    }], function (err, data) {
        
        console.log('Bootstrapping finished for ' + version);
        callback(err, 'Bootstrapping finished')
    })
}