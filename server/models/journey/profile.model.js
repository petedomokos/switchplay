import mongoose from 'mongoose'
import StatValueSchema from './stat-value.model'

export default new mongoose.Schema({
  //id is created on client and is unique to the journey profiles
  id:{
    type: String,
    required: 'Profile id is required'
  },
  date:String,
  yPC:String,
  customTargets:[StatValueSchema],
  customExpected:[StatValueSchema],
  updated: Date,
  created: {type: Date, default: Date.now},
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'}
})
