import mongoose from 'mongoose'
import KpiStepSchema from './kpi-step.model'

export default new mongoose.Schema({
  desc:String,
  completed:Boolean
})
