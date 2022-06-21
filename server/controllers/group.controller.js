import Group from '../models/group.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import { addRefToGroupArray, addRefToUserArray,
  removeRefFromGroupArray, removeRefFromUserArray } from './../helpers/dbQueries'

/*
attempts to create a new group in in db. 
*/
//creategroup

//must also add id to user.administeredgroups

  //note - it is possible that group may have been fully loaded, in which case
  //arrays like admin will not just be id but will be an object. But if user or group was just created,
  //then only ids are returned. Therefore, we handle both cases.
  //todo - better soln is to send the admin as objects in create methiods in controllers
  //but to do that we need to go into teh database to get them, so need to chain promises
const create = async (req, res) => {
  console.log('createGroup')
  const group = new Group(req.body)
  console.log('creating group', group)
  try {
    await group.save()
    console.log('success')

    //add reference to this group in all admin users
    group.admin.forEach(userId =>{
      addRefToUserArray(userId, 'administeredGroups', group._id)
    })
    return res.status(200).json({
      message: "Successfully created group!",
      group:group
    })
  } catch (err) {
    console.log('failure', err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Load group and append to req.
 */
const groupByID = async (req, res, next, id) => {
  console.log('readgroupById......', id)
  try {
    let group = await Group.findById(id)
        .populate('admin', '_id username firstname surname photo')
        .populate('players', '_id username firstname surname photo')
        .populate('datasets', '_id name desc photo')
         //example from old playergains of how to populate deeper paths
      //.populate({ path: 'player.groups', select: 'name _id desc groupType players parent admin coaches subgroups' })
    console.log('group', group)
    if (!group)
      return res.status('400').json({
        error: "Group not found"
      })
    req.group = group
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve group"
    })
  }
}

const read = (req, res) => {
  console.log('read group......')
  return res.json(req.group)
}

const list = async (req, res) => {
  //const fakeGroups = [{_id:"1", name:"a group", email:"a@b.com"}]
  //res.json(fakeGroups)
  try {
    let groups = await Group.find()
      .select('_id name desc photo groupType admin created') //not players as shallow
      .populate('admin', '_id username firstname surname created')
      //.populate('players', '_id firstname surname photo')

    console.log('returning groups now.......................')
    //console.log('returning groups.......................', groups)
    res.json(groups)
  } catch (err) {
    console.log('error listing groups.......................')
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  console.log('updating group....................')
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    console.log('fields', fields)
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      })
    }

    //convert some fields to arrays
    if(typeof fields.players === 'string'){
      fields.players = fields.players === '' ? [] : fields.players.split(',');
    }
    if(typeof fields.datasets === 'string'){
      fields.datasets = fields.datasets === '' ? [] : fields.datasets.split(',')
    }
    //todo - same as above for fields.admin
    console.log('fields players', fields.players)
    let group = req.group
    console.log('group.players', group.players)
    //add/remove group refs in users

    if(fields.players){
        const addedPlayers = fields.players.filter(userId => !group.players.find(uId => uId.equals(userId)));
        //d => !d._id.equals(datasetId)
        console.log('nr of added players', addedPlayers.length)
        addedPlayers.forEach(userId =>{
          addRefToUserArray(userId, 'groupsMemberOf', group._id)
        })
        const removedPlayers = group.players.filter(userId => !fields.players.find(uId => uId.equals(userId)));
        console.log('nr of removed players', removedPlayers.length)
        removedPlayers.forEach(userId =>{
          removeRefFromUserArray(userId, 'groupsMemberOf', group._id)
        })
    }

    group = extend(group, fields)
    group.updated = Date.now()
    console.log('group now.................', group)
    if(files.photo){
      group.photo.data = fs.readFileSync(files.photo.path)
      group.photo.contentType = files.photo.type
    }
    try {
      await group.save()
      res.json(group)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const remove = async (req, res) => {
  console.log('remove group..............')
  try {
    let group = req.group
    let deletedGroup = await group.remove()
    res.json(deletedGroup)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  groupByID,
  read,
  list,
  remove,
  update
}
