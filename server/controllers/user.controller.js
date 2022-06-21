import User from '../models/user.model'
import Journey from '../models/journey/journey.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'

/*
attempts to create a new user in in db. 
*/
//createuser

  //note - it is possible that group may have been fully loaded, in which case
  //arrays like admin will not just be id but will be an object. But if user or group was just created,
  //then only ids are returned. Therefore, we handle both cases.
  //todo - better soln is to send the admin as objects in create methiods in controllers
  //but to do that we need to go into teh database to get them, so need to chain promises
const create = async (req, res) => {
  //console.log('create user...body', req.body)
  const user = new User(req.body)
  console.log('created', user)
  try {
    console.log('trying')
    await user.save()
    console.log('success')
    return res.status(200).json({
      mesg: "Successfully signed up!",
      user:user
    })
  } catch (err) {
    console.log('failure', err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
  console.log('readuserById......', id)
  try {
    let user = await User.findById(id)
      .populate('admin', '_id username firstname surname created')
      .populate('journeys', '_id name aims goals links measures created')
      .populate('administeredUsers', '_id username firstname surname photo created')
      .populate({ 
        path: 'administeredGroups', 
        select: '_id name desc photo groupType created datasets',
        populate: {
          path:'datasets',
          select:'_id name desc'
        } 
      })
      .populate({ 
        path: 'groupsMemberOf', 
        select: '_id name desc photo groupType created datasets',
        populate: {
          path:'datasets',
          select:'_id name desc'
        } 
      })
      .populate('administeredDatasets', '_id name desc notes photo admin created')
      .populate('datasetsMemberOf', '_id name desc notes photo admin created')

    // console.log('user in userById', user)
    if (!user)
      return res.status('400').json({
        error: "User not found"
      })
    req.user = user
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve user"
    })
  }
}

const read = (req, res) => {
  console.log('read......')
  req.user.hashed_password = undefined
  req.user.salt = undefined
  return res.json(req.user)
}

const list = async (req, res) => {
  //const fakeUsers = [{_id:"1", name:"a user", email:"a@b.com"}]
  //res.json(fakeUsers)
  try {
    let users = await User.find()
      .select('username firstname surname photo email updated created admin')
      .populate('admin', '_id username firstname surname created')
    //console.log('returning users.......................', users)
    res.json(users)
  } catch (err) {
    console.log('error listing users.......................')
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  console.log('updating user....................')
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      })
    }

    //parse array fields which have been stringified
    fields.admin = JSON.parse(fields.admin);
    let user = req.user
    user = extend(user, fields)
    user.updated = Date.now()
    console.log('user now', user)
    if(files.photo){
      user.photo.data = fs.readFileSync(files.photo.path)
      user.photo.contentType = files.photo.type
    }
    try {
      await user.save()
      user.hashed_password = undefined
      user.salt = undefined
      res.json(user)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const remove = async (req, res) => {
  console.log('remove user..............')
  try {
    let user = req.user
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
}
