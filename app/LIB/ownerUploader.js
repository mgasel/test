/*
const multer = require('multer')
var sftpStorage = require('multer-sftp')
let  { v4: uuidv4 }  = require('uuid')
var storage = sftpStorage({
      sftp: {
        host: '185.28.21.204',
        port: 22,
        username: 'u354128297',
        password: 'Tss@2020'

      },

    destination: function (req, file, cb) {

      cb(null,'/mgasel/')
console.log("in cb");

    },
    filename: function (req, file, cb) {
      cb(null,uuidv4()+'-'+file.originalname)
console.log("in cb1")
    }
  })
  const ownerDocuments = multer({ storage: storage })
  module.exports ={
    ownerDocuments:ownerDocuments
  }
*/
const multer = require('multer')
let  { v4: uuidv4 }  = require('uuid')
var owner = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,`./app/uploader`)
    },
    filename: function (req, file, cb) {
      cb(null,uuidv4()+'-'+file.originalname)
    }
  })
  const ownerDocuments = multer({ storage: owner });
  module.exports ={
    ownerDocuments:ownerDocuments
  }
