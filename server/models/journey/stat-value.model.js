import mongoose from 'mongoose'

export default new mongoose.Schema({
  datasetKey: String,
  statKey:String,
  actual:String,
  completion:String,
  date:Date, //will not be defined if its on a profile
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'},
  created: {type: Date, default: Date.now},
  approvedBy:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  isTarget:Boolean, //will not be defined if its on a profile
  isExpected:Boolean, //will not be defined if its on a profile
})
