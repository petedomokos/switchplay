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
  dataType:{
    type:String,
    default:'number' //can be eg 'boolean'
  },
  formula:String, //must refer to keys for existing measures in this dataset eg "distance div time" or time-1 plus time2
  unit:String, // can be 'base-on-calc', or a diffrent name, or undefined
  isMain:Boolean,
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'}
})

