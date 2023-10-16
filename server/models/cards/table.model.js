import mongoose from 'mongoose'

//const TableSchema = new mongoose.Schema({
export default new mongoose.Schema({
  title:String,
  owner:{type:mongoose.Schema.ObjectId, ref:'User'},
  admin:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  decks:[String], //list
  archivedDecks:[String],
  layoutFormat:{type: String, default: "list"}, //list or grid
  //gridFormat:...need a new Schema for this. Also, this can still exist even if format is set to list
  isArchived:{type: Boolean, default: false},
  colour:String,
  tags:[String],
  updated: Date,
  created: {type: Date, default: Date.now}
})

//export default mongoose.model('Table', TableSchema)

