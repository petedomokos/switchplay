import mongoose from 'mongoose'
import CardSchema from './card.model'

//soln - stringify cards into one string, not even an array, 
//and for all stacks, make it a react comp

//issue is we shouldnt be instatiating stacks with new unless we are storing them in theier own 
//doc - do we want to do this - rethink? if not, then dont instantiate, 
//just make sure the shaoe fits the scheme, and undo the changes to stackschema
export default new mongoose.Schema({ 
  title:String,
  owner:{type:mongoose.Schema.ObjectId, ref:'User'},
  cards:String,
  frontCardNr:{ type: Number, default: 0 },
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date,default: Date.now}
})

//export default mongoose.model('Stack', StackSchema)

