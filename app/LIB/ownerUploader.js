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