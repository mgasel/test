
const multer  = require('multer')
const randomstring=require('randomstring');
let imageName=randomstring.generate(25);
let thumbnail=randomstring.generate(25);
const async=require('async');
const fse=require('fs-extra');
let imgPath;
const AppConstraints=require('../../config/appConstraints.js');
const AWS = require('aws-sdk');
const gm = require('gm');
const Admin=require('../models/Admin.js');
const jwt=require('jsonwebtoken');

AWS.config.update({
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY
});




let path='app/uploader/';



const storage =  multer.diskStorage({
destination: './app/uploader',
filename(request, file, cb) {
    cb(null, imageName+'.jpg');
 },
});


const upload =  multer({ storage:storage }).single('file');






module.exports=function(app){

app.post('/imageUploader',upload,function(request,response){
    try{

        let d=new Date();
        console.log(request.file,'video file');
        let token=request.headers['authorization']
     
        let accessTokendata;

        let demail;


        async.auto({
           

          verifyFile:function(cb){
            if(!request.file){
                cb(AppConstraints.FILE)
            }
            else{
                cb(null);
            }
          },



           verifyToken:['verifyFile',function(err,cb){
                if(!token){
                    cb(AppConstraints.ACCESS_TOKEN);
                }
                else{
                    accessTokendata=token.split(" ");
                    console.log(accessTokendata[1],'accesstoken')
                    cb(null);
                }
           }], 


           decryptToken:['verifyToken',function(err,cb){
               jwt.verify(accessTokendata[1],process.env.JWT_SECRET,function(err,reply){
                   if(err){
                       console.log(err,'uploaded token erroo');
                       cb(err);
                   }
                   else{
                    demail=reply.email;
                    cb(null)
                   }
               })
           }],



           validateAdmin:['verifyToken',function(err,cb){
            Admin.findOne({email:demail},{},{},function(err,admin){
            if(err){
                    cb(err);
                  
                }
                else{
                    if(!admin){
                        
                        cb(AppConstraints.INVALID_OR_UNAUTHORIZE_TOKEN); 
                    }
                    else{
                        cb(null);
                       
                    }
                    
                }
            })
           }], 
           
           createThumbnail:['validateAdmin',function(err,cb){
            gm(path+imageName+'.jpg').resize(240, 240, '!')
            .write(path+thumbnail+'.jpg', function (err,result) {
              if (err){
                console.log(err,'error in generating thumbnail');
                cb(err);
              } 

              else{
                console.log(result,'thumbnail result')
                cb(null)
              }

            });
           }],


           uploadImageOnS3:['createThumbnail',function(err,cb){
            var s3 = new AWS.S3();
            fse.readFile(path+imageName+'.jpg',function(err,file_buffer){
            if(err){
                cb(err)
            }
            else{
                
            let params = {
                Bucket:process.env.BUCKET_NAME,
                Key:imageName+d.getTime()+'.jpg',
                Body: file_buffer
            };
            s3.putObject(params,function(err,result){
                if(err){
                   cb(err);
                }
                else{
                    console.log(result);
                    cb(null);
                }
            })
            }
            })

           }],


           deleteOriginalImage:['uploadImageOnS3',function(err,cb){
            fse.unlink(path+imageName+'.jpg',function(err,result){
                if(err){
                    console.log(err);
                    cb(err);
                }
                else{
                    console.log(result);
                    cb(null);
                }
            })
           }],


           uploadThumbnailOnS3:['deleteOriginalImage',function(err,cb){
            var s3 = new AWS.S3();
            fse.readFile(path+thumbnail+'.jpg',function(err,file_buffer){
            if(err){
                cb(err)
            }
            else{
                
            let params = {
                Bucket:process.env.BUCKET_NAME,
                Key:thumbnail+d.getTime()+'.jpg',
                Body: file_buffer
            };
            s3.putObject(params,function(err,result){
                if(err){
                   cb(err);
                }
                else{
                    console.log(result);
                    cb(null);
                }
            })
            }
            })
           }],

           deleteThumbnail:['uploadThumbnailOnS3',function(err,cb){
            fse.unlink(path+thumbnail+'.jpg',function(err,result){
                if(err){
                    console.log(err);
                    cb(err);
                }
                else{
                    console.log(result);
                    cb(null);
                }
            })
           }] 
        },function(err,result){
            if(err){
                return response.status(400).json({statusCode:400,success:0,msg:err});
            }
            else{
                return response.status(200).json({
                                                    statusCode:200,
                                                    success:1,
                                                    msg:AppConstraints.IMAGE_SUCESSFULLY_UPLOADED,
                                                    data:{
                                                            original:process.env.IMAGE_PATH+process.env.BUCKET_NAME+'/'+imageName+d.getTime()+'.jpg',
                                                            thumbnail:process.env.IMAGE_PATH+process.env.BUCKET_NAME+'/'+thumbnail+d.getTime()+'.jpg'
                                                        }
                                                    });
            }
           
        })
    }catch(err){
        console.log(err);
        return response.status(500).json({statusCode:500,success:0,msg:err,err:err})
    }
});
}