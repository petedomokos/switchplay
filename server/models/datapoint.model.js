import mongoose from 'mongoose';
import ValueSchema from './value.model';

export default new mongoose.Schema({ 
  //could be one player, or an array of players
  player:{type:mongoose.Schema.ObjectId, ref:'User'},
  players:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  createdBy:{type:mongoose.Schema.ObjectId, ref:'User'},
  date:{type: Date, default: Date.now},
  created: {type: Date, default: Date.now},
  values:[ValueSchema],
  notes:{type:String, default:""},
  surface:String,
  fatigueLevel:String,
  isTarget:Boolean,
  updated: Date
})

