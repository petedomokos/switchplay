import mongoose from 'mongoose'

//const DeckSchema = new mongoose.Schema({
export default new mongoose.Schema({
  title:String,
  owner:{type:mongoose.Schema.ObjectId, ref:'User'},
  admin:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  player:{type:mongoose.Schema.ObjectId, ref:'User'},
  purpose:[String],
  cards:String,
  frontCardNr:{ type: Number, default: 0 },
  isArchived:{ type: Boolean, default: false },
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date, default: Date.now}
})

//export default mongoose.model('Deck', DeckSchema)

