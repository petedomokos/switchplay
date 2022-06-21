import mongoose from 'mongoose'

export default new mongoose.Schema({
  measure:{type:mongoose.Schema.ObjectId, ref:'Measure'},
  value:{
    type:String,
    required:'Value is required'
  }
})

