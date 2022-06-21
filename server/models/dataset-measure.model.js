import mongoose from 'mongoose'

export default new mongoose.Schema({
  name:{
    type:String,
    required:'Name is required'
  },
  initials:{
    type:String,
    required:'initials are required'
  },
  key:{
    type:String,
    required:'Key is required'
  },
  nr:String,
  side:String,
  custom:String,
  order: {
    type:String,
    default:'highest is best'
  },
  unit:String,
  dataType:{
    type:String,
    default:'number'
  },
  formula:String, //for derived
  notes:String,
  hidden:{
    type:Boolean,
    default:false
  },
  isMain:{
    type:Boolean,
    default:false
  },
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'}
})

