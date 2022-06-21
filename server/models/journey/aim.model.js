import mongoose from 'mongoose'

export default new mongoose.Schema({
  id:{
    type: String,
    required: 'Aim id is required'
  },
  name: String,
  desc:String,
  startDate:String,
  endDate:String,
  startYPC:String,
  endYPC:String,
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date, default: Date.now}
})
