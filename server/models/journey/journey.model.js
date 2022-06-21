import mongoose from 'mongoose'
import AimSchema from './aim.model';
import GoalSchema from './goal.model';
import LinkSchema from './link.model';
import JourneyMeasureSchema from './journey-measure.model';

const JourneySchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.ObjectId, ref:'User'},
  //users who have admin rights over this journey
  admin:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  //users who have read-only access
  readOnlyAccess:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  /*id:{
    type: String,
    required: 'Journey id is required'
  },*/
  name: String,
  desc:String,
  //photo:{data:Buffer,contentType:String},
  //users who have admin rights over this journey
  aims:[AimSchema],
  goals:[GoalSchema],
  links:[LinkSchema],
  measures:[JourneyMeasureSchema],
  tags:[String],
  visibility:{type: String, default: "private"},
  updated: Date,
  created: {type: Date,default: Date.now}
})

//module.exports = {
export default mongoose.model('Journey', JourneySchema)
