import mongoose from 'mongoose'

export default new mongoose.Schema({
  key: String,
  value:String,
  date:Date,
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'},
  creationDate: {type: Date, default: Date.now},
  approvedBy:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  isTarget:Boolean
})
