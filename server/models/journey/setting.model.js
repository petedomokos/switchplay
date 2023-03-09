import mongoose from 'mongoose'

export default new mongoose.Schema({ 
  key:{
    //just a simple string, as goal is not stored only as part of journey
    type: String,
    required: 'key is required'
  },
  value:{
    type: String,
    required: 'value is required'
  }
})
