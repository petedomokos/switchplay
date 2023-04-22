import mongoose from 'mongoose'
import KpiStepSchema from './kpi-step.model'

export default new mongoose.Schema({
  key:String, //for now, kpis are on front-end file so id is string
  steps:[KpiStepSchema],
  customStartValue:String,
  customMinStandard:String
})
