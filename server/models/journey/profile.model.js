import mongoose from 'mongoose'

export default new mongoose.Schema({
  id:{
    type: String,
    required: 'Profile id is required'
  },
  name: String,
  desc:String,
  date:String,
  yPC:String,
  colour:String,
  kpiStats:[String],
  updated: Date,
  created: {type: Date, default: Date.now}
})
