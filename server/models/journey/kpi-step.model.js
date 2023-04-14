import mongoose from 'mongoose'
import KpiStepSchema from './kpi-step.model'

export default new mongoose.Schema({
  id:String,
  desc:{type: String, default: ""},
  completed:Boolean
})
