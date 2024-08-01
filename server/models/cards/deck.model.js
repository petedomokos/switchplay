import mongoose from 'mongoose'

//const DeckSchema = new mongoose.Schema({
export default new mongoose.Schema({
  baseId:String,
  shouldInheritBaseUpdates:Boolean,
  title:String,
  startDate:{ type: Date, default: Date.now },
  owner:{type:mongoose.Schema.ObjectId, ref:'User'},
  admin:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  editors:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  viewers:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  player:{type:mongoose.Schema.ObjectId, ref:'User'},
  group:{type:mongoose.Schema.ObjectId, ref:'Group'},
  purpose:[String],
  cards:String,
  sections:String,
  frontCardId:String,
  isArchived:{ type: Boolean, default: false },
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date, default: Date.now}
})

//export default mongoose.model('Deck', DeckSchema)

