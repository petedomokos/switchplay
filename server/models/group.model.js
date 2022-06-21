import mongoose from 'mongoose'

const GroupSchema = new mongoose.Schema({ 
  name:{
    type: String,
    trim: true,
    required: 'Group name is required'
  },
  initials:{
    type: String,
    trim: true,
    required: 'Group initials are required'
  },
  desc:String,
  groupType:String,
  photo:{data:Buffer,contentType:String},
  //users who have admin rights over this group
  admin:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  coaches:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  players:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  datasets:[{type:mongoose.Schema.ObjectId, ref:'Dataset'}],
  updated: Date,
  created: {type: Date,default: Date.now},
})

//module.exports = {
export default mongoose.model('Group', GroupSchema)
