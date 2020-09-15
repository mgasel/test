
////////////////created by cbl ///////////////////////////
///////////////////  Rajendra  //////////////////////////
//////////////24 MAY 05:29///////////////////////////////
const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const swaggerUi = require('swagger-ui-express');
const swaggerDocumentUser=require('./config/swaggerUser.json');
const swaggerDocumentDriver=require('./config/swaggerDriver.json');
const swaggerDocumentAdmin=require('./config/swaggerAdmin.json');
const expressValidator = require('express-validator');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost', port : 6379});
const Bootstrap=require('./app/Utils/Bootstrap.js');
const Socket=require('./app/LIB/SocketManager.js');
const Scheduler=require('./app/LIB/scheduler.js');
const ScheduleBooking = require('./app/LIB/ownerCron.js')
const json2xls = require('json2xls');
app.use(json2xls.middleware);
app.use('/api-docs-User', swaggerUi.serve, swaggerUi.setup(swaggerDocumentUser));
app.use('/api-docs-Driver',swaggerUi.serve,swaggerUi.setup(swaggerDocumentDriver));
app.use('/api-docs-Admin',swaggerUi.serve, swaggerUi.setup(swaggerDocumentAdmin));
mongoose.Promise = global.Promise;
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));
app.use(bodyParser.json({limit:'200mb'}));
app.use(expressValidator());
app.set('port', process.env.PORT);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname+'/app/uploader'));
app.set('view engine', 'ejs');
mongoose.connect(process.env.URL,{useMongoClient:true});
mongoose.connection.on('error',function(err){
  console.log(err);
  console.log('error in connecting, process is exiting ...');
  process.exit();
})
mongoose.connection.once('open',function(){
  console.log('Successfully connected to database');
});

app.get('/', function(request, response) {
  response.status(200).json({"msg":"success"});
});
redisClient.on('ready',function() {
  console.log("Redis is ready");
});
 
redisClient.on('error',function() {
console.log("Error in Redis");
});

require('./app/routes/userroutes.js')(app);
require('./app/routes/adminroutes.js')(app);
require('./app/routes/driverroutes.js')(app);
require('./app/LIB/imageUploader.js')(app);
require('./app/routes/owneroutes.js')(app)

Bootstrap.bootstrapAdmin(function (err, message) {
  if (err) {
      console.log('Error while bootstrapping admin : ' + err)
  } else {
      console.log(message);
  }
});
Bootstrap.bootStrapAppVersion(function (err, message) {
  if (err) {
      console.log('Error while bootstrapping admin : ' + err)
  } else {
      console.log(message);
  }
});

Socket.connectSocket(server,redisClient);

// Scheduler.notifyToUserThoughEmail();
// Scheduler.notifyUserThroughMessage();

Scheduler.changeStatusShedulerDriver();
Scheduler.changeStatusSheduler();
Scheduler.inAppNotificationToUser();
Scheduler.changeStatusShedulerUser()
Scheduler.autoRenewFunction()

ScheduleBooking.removeCoupon()
// Scheduler.backupScheduler();

server.listen(app.get('port'),function() {
    console.log('Node app is running on port', app.get('port'));
});




