import mongoose from 'mongoose'

export default new mongoose.Schema({
  measure:{type:mongoose.Schema.ObjectId, ref:'Measure'},
  key:String,
  value:{
    type:String,
    required:'Value is required'
  }
})

