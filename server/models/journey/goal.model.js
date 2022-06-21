import mongoose from 'mongoose'
import GoalMeasureInfoSchema from './goal-measure-info.model'

export default new mongoose.Schema({ 
  id:{
    type: String,
    trim: true,
    required: 'goal id is required'
  },
  name:String,
  aimId:String,
  desc:String,
  targetDate:String,
  yPC:String,
  measures:[GoalMeasureInfoSchema],
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date,default: Date.now}
})
