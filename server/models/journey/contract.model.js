import mongoose from 'mongoose'

export default new mongoose.Schema({
  id:{
    type: String,
    required: 'Contract id is required'
  },
  name: String,
  desc:String,
  date:String,
  yPC:String,
  club:String,
  league:String,
  weeklyWage:String,
  updated: Date,
  created: {type: Date, default: Date.now}
})
