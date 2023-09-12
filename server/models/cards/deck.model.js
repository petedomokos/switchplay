import mongoose from 'mongoose'
import CardSchema from './card.model'

export default new mongoose.Schema({ 
  title:String,
  owner:{type:mongoose.Schema.ObjectId, ref:'User'},
  cards:String,
  frontCardNr:{ type: Number, default: 0 },
  isArchived:{type: Boolean, default: false},
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date, default: Date.now}
})

//export default mongoose.model('Deck', DeckSchema)

