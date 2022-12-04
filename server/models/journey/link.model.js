import mongoose from 'mongoose'

export default new mongoose.Schema({ 
  src:{
    //just a simple string, as goal is not stored only as part of journey
    type: String,
    required: 'source is required'
  },
  targ:{
    type: String,
    required: 'target is required'
  }
})
