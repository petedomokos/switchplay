import mongoose from 'mongoose'
import StatValueSchema from './stat-value.model'
import MediaSchema from './media.model'
import ProfileKpiSchema from "./profile-kpi.model";

export default new mongoose.Schema({
  //id is created on client and is unique to the journey profiles
  id:{
    type: String,
    required: 'Profile id is required'
  },
  title:String,
  desc:String,
  date:String,
  profileKpis:[ProfileKpiSchema],
  yPC:String,
  photoLabel:String,
  media:[MediaSchema],
  customTargets:[StatValueSchema],
  customExpected:[StatValueSchema],
  updated: Date,
  created: {type: Date, default: Date.now},
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'}
})
