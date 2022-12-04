import mongoose from 'mongoose'

export default new mongoose.Schema({ 
  //measure:{type:mongoose.Schema.ObjectId, ref:'JourneyMeasure'},
  //note: we are not using schema here because JourneyMeasures are not stored in that way,
  //the JourneyMeasure schema is just used to describe part of Journey.
  measureId:String,
  targ:String,
})
