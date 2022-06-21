import mongoose from 'mongoose'
import DatapointSchema from './datapoint.model'
import DatasetMeasureSchema from './dataset-measure.model'
import CalculationSchema from './calculation.model'

const DatasetSchema = new mongoose.Schema({ 
  name:{
    type: String,
    trim: true,
    required: 'Dataset name is required'
  },
  initials:{
    type: String,
    trim: true,
    required: 'Dataset initials is required'
  },
  desc:String,
  notes:String,
  //datasetType:String,
  photo:{data:Buffer,contentType:String},
  //users who have admin rights over this dataset
  admin:[{type:mongoose.Schema.ObjectId, ref:'User'}],
  measures:[{type:DatasetMeasureSchema}],
  //todo - addDerivedmeasures here and remove calculations and change measures to rawmeasures
  calculations:[{type:CalculationSchema}],
  //main value can be a measure key or a calculation key
  mainValueToDisplay:String,
  /*
  NOTE - datapoint is an object that fits a schema. So it is not a model, so we do not create it with New Datapoint.
  Also we do not populate it -> they all just get sent with the datapoint.
  If we wish to restict datapoints, we can turn them into refs, or we can trim it down in the DatasetCtrl.read
  We dont have to worry about dataset.list so much, because we dont send the full datapoints there anyway, just id,
  whihc may be useful so we can show number of datapoints beside each dataset in a list
  */
  datapoints:[{type:DatapointSchema}],
  notes:{type: String, default:""},
  tags:[String],
  updated: Date,
  created: {type: Date,default: Date.now}
})

//module.exports = {
export default mongoose.model('Dataset', DatasetSchema)
