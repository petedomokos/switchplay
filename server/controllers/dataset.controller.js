import * as d3 from 'd3';
import Dataset from '../models/dataset.model'
import Datapoint from '../models/datapoint.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import { addRefToDatasetArray, addRefToUserArray,
  removeRefFromDatasetArray, removeRefFromUserArray } from './../helpers/dbQueries'

/*
attempts to create a new dataset in in db. 
*/
//createdataset

//must also add id to user.administereddatasets

  //note - it is possible that dataset may have been fully loaded, in which case
  //arrays like admin will not just be id but will be an object. But if user or dataset was just created,
  //then only ids are returned. Therefore, we handle both cases.
  //todo - better soln is to send the admin as objects in create methiods in controllers
  //but to do that we need to go into teh database to get them, so need to chain promises
  const create = async (req, res) => {
    const dataset = new Dataset(req.body)
    console.log('creating dset', dataset)
    try {
        await dataset.save()
        console.log('success')
        //add reference to this dataset in all admin users
        dataset.admin.forEach(userId =>{
            addRefToUserArray(userId, 'administeredDatasets', dataset._id)
        })
  
        return res.status(200).json({
            message: "Successfully created dataset!",
            dataset:dataset
        })
    } catch (err) {
        console.log('failure', err)
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
  }

/**
 * Load dataset and append to req.
 */
const datasetByID = async (req, res, next, id) => {
  console.log('readdatasetById......', id)
  try {
    let dataset = await Dataset.findById(id)
        .populate('admin', '_id username firstname surname photo')
        //.populate('players', '_id username firstname surname photo')
        .populate('datapoints.player', '_id firstname surname photo')
        /*.populate({ 
          path: 'datapoints', 
          select: '_id player date values notes surface fatigueLevel isTarget',
          populate: {
            path:'values',
            select:'_id measure value'
          }
          //todo - pop measure with name etc
        })*/
         //example from old playergains of how to populate deeper paths
      //.populate({ path: 'player.datasets', select: 'name _id desc datasetType players parent admin coaches subdatasets' })
    //console.log('dataset', dataset)
    if (!dataset)
      return res.status('400').json({
        error: "Dataset not found"
      })
    req.dataset = dataset
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve dataset"
    })
  }
}

const read = (req, res) => {
  console.log('read dataset......')
  return res.json(req.dataset)
}

//todo - dont send photo with every d
const readMultiple = async (req, res) => {
  console.log('read multiple full datasets......', req.body)
  // @TODO instead of getting all then filtering, just make request for the ones we need
  try{
      let datasets = await Dataset.find()
          .populate('datapoints.player', '_id firstname surname photo')
      
      const playerDatasets = datasets
        .filter(dset => req.body.datasetIds.find(id => dset._id.equals(id)))
      //cant use spread operator or functional style with mongoose
      playerDatasets.forEach(dset =>{
        dset.datapoints = dset.datapoints.filter(d => d.player._id.equals(req.body.playerId));
      })

      return res.json(playerDatasets)
  }
  catch (err) {
      console.log('error reading multiple datasets.......................')
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
  }
}
const list = async (req, res) => {
  try {
    let datasets = await Dataset.find()
      .select('_id name desc photo datasetType admin created') //not players as shallow
      .populate('admin', '_id username firstname surname created')
      //.populate('players', '_id firstname surname photo')
    
    //WARNING - THIS WILL ALSO SEND DATAPOINTS - WE MAY WANT TO CUT THOSE OUT WITH OBJECT DESTRUCTUIRNG

    console.log('returning datasets now.......................')
    //console.log('returning datasets.......................', datasets)
    res.json(datasets)
  } catch (err) {
    console.log('error listing datasets.......................')
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    console.log('fields', fields)
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      })
    }

  //parse array fields which have been stringified
  fields.measures = JSON.parse(fields.measures);
  fields.calculations = JSON.parse(fields.calculations);
  //@TODO - piut admin back - check if issue - its just an id but seems to be read as a populated object before its saved,
  //but only an id after
  //fields.admin= JSON.parse(fields.admin);
  fields.tags = JSON.parse(fields.tags);

    let dataset = req.dataset
    dataset = extend(dataset, fields)
    dataset.updated = Date.now()
    /*if(files.photo){
      dataset.photo.data = fs.readFileSync(files.photo.path)
      dataset.photo.contentType = files.photo.type
    }*/
    try {
      console.log("trying to save...............")
      const result = await dataset.save()
      console.log("returning...........................", result)
      res.json(result)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const remove = async (req, res) => {
  console.log('remove dataset..............')
  try {
    let dataset = req.dataset
    let deletedDataset = await dataset.remove()
    res.json(deletedDataset)

    //REMOVE DATASET FROM ALL PLAYERS WHO HAVE THIS DATASET IN THERE DATASETSMEMBEROF PROPERTIY
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const createDatapoint = async (req, res) => {
  let { dataset } = req;
  const datapoint = req.body;
  console.log("datapoint player", datapoint.player)
  //add ref to this dataset to player if not added before
  const playersSoFar = dataset.datapoints.map(d => d.player);
  console.log("playersSoFar", playersSoFar)
  console.log("already with equals ? ", playersSoFar.find(p => p.equals(datapoint.player)))
  console.log("already with === ? ", playersSoFar.find(p => p === datapoint.player))
   //ONLY ADD IF NOT ALREADY THERE----------------------
  if(!playersSoFar.find(p => p.equals(datapoint.player))){
    console.log("adding player to ref.................................................")
      addRefToUserArray(datapoint.player, "datasetsMemberOf", dataset._id)
  }
   /*
  NOTE - datapoint is an object that fits a schema. So it is not a model, so we do not create it with New Datapoint
  */
  dataset.datapoints.push(datapoint)
  dataset.updated = Date.now()
  try {
    console.log("trying to save")
    const savedDataset = await dataset.save()
   
    const sortedMostRecentFirst = savedDataset.datapoints.sort((d1, d2) => {
      const milli1 = new Date(d1.created).getTime()
      const milli2 = new Date(d2.created).getTime()
      return milli2 - milli1
    })
    const savedDatapoint = sortedMostRecentFirst[0];
    console.log("saved datapoint", savedDatapoint)
    //need to add these to datapoint that is returned
    
    res.json(savedDatapoint)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


export default {
  create,
  datasetByID,
  read,
  readMultiple,
  list,
  remove,
  update,
  createDatapoint
}
