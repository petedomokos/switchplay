import mongoose from 'mongoose'

const NonuserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
  },
  name: {
    type: String,
    trim: true,
  },
  phone:{
    type: String,
    trim: true,
  },
  club:{
    type: String,
    trim: true,
  },
  //roles are player, coach, player-coach
  subscribed:{type:Boolean, default:false},
  requestedDemo: {type:Boolean, default:false},
  updated: Date,
  created: {type: Date,default: Date.now}
})

export default mongoose.model('Nonuser', NonuserSchema)