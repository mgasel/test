
let mongoose = require('mongoose');

let Schema = mongoose.Schema;


var Chatroom = new Schema({
    conversationId:                 {  type : String,default:"",index:true },

    deleteByList:                   [{ type:Schema.Types.ObjectId,  ref:"User",index:true }],

    senderId :                      {  type: Schema.Types.ObjectId, ref: 'User',index:true },

    receiverId :                    {  type: Schema.Types.ObjectId, ref: 'User',index:true },

    message :                       {  type : String,default : "" },

    sentAt :                        {  type : Number,default : 0 },

    deliveredAt :                   {  type : Date, default:Date.now},

    audioUrl:                       {  type: String, default: "" },

    imageUrl:                       {  original: {type: String, default: ""},thumbnail: {type: String, default: ""}},

    videoUrl :                      {  original: {type: String, default: ""},thumbnail: {type: String, default: ""}},

    messageType :                   {  type: String,default:"" },

    isDelivered :                   {  type : Boolean, default : false},

    isRead :                        {  type : Boolean, default : false},

    chatCreateTime:                 {  type:Date, default:Date.now },
    
    isActive:                       { type:Boolean,default:true }
});

module.exports= mongoose.model('Chatroom', Chatroom);
