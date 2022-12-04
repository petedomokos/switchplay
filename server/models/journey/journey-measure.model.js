import mongoose from 'mongoose'

export default new mongoose.Schema({
  id:{
    type:String,
    required:'Measure id is required'
  },
  name:String,
  desc:String,
})

