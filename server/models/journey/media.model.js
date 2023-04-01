import mongoose from 'mongoose'

export default new mongoose.Schema({
  locationKey: String, //for a simple description of location
  locationKeys:[String], //for a more specific description of location
  mediaType:{type:String, default:"photo"},
  fileType:String,
  filename:String,
  mediaId:String,
  url:String,
  //transform:String
  x:String,
  y:String,
  k:String
})
