import User from '../models/user.model'
import Journey from '../models/journey/journey.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import fs from 'fs'
import defaultImage from './../../assets/manOnMountain.png';
//import defaultImage from './../../assets/defaultPhoto.png';


/*
add this below
  populate: {
    path:'owner', //used for identifying spreadsheets by owner username
    select:'_id username' 
  } 
*/
const administeredDatasetsPopulationObj = {
  path:"administeredDatasets",
  select:"_id name desc created admin measures", //note - replace admin with owner here
  populate: {
    path:'admin', //replace with owner - used for identifying spreadhseets by owner username
    select:'_id username' 
  } 
}

const datasetsMemberOfPopulationObj = {
  path:"datasetsMemberOf",
  select:"_id name desc notes photo admin created", //note - replace admin with owner here
  populate: {
    path:'admin', //replace with owner - used for identifying spreadhseets by owner username
    select:'_id username' 
  },
}

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
  //console.log('readuserById......', id)
  try {
    let user = await User.findById(id)
      .populate('admin', '_id username firstname surname created')
      .populate('journeys', '_id name media contracts profiles aims goals links measures settings created')
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
      .populate(administeredDatasetsPopulationObj)
      .populate(datasetsMemberOfPopulationObj)
      //.populate('administeredDatasets', '_id name desc notes photo admin created')
      //.populate('datasetsMemberOf', '_id name desc notes photo admin created')

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


const photoByID = async (req, res, next, id) => {
  //console.log('readPhotoById......', id);
  req.photoId = id;
  next();
}

const read = (req, res) => {
  //console.log('read......')
  req.user.hashed_password = undefined
  req.user.salt = undefined
  req.user.photos = req.user.photos.map(p => ({ _id:p._id, name:p.name, added:p.added }))
  return res.json(req.user)
}

const list = async (req, res) => {
  //const fakeUsers = [{_id:"1", name:"a user", email:"a@b.com"}]
  //res.json(fakeUsers)
  try {
    //only send the main photo for each user (not the users own photos gallery)
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

const createStack = async (req, res) => {
  console.log('creating stack for.....', req.user._id)
  return res.status(400)
  /*let journey = req.journey;
  //console.log("req journey", journey)
  //console.log("body", req.body)
  journey = extend(journey, req.body);
  journey.updated = Date.now()
  ///console.log("extended journey", journey.profiles.map(p => p.date))
  try {
    const result = await journey.save()
    //console.log("res", result)
    res.json(result)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
  */
}
const updateStack = async (req, res) => {
  console.log('updating stack for.....', req.user._id)
  return res.status(400)
  /*let journey = req.journey;
  //console.log("req journey", journey)
  //console.log("body", req.body)
  journey = extend(journey, req.body);
  journey.updated = Date.now()
  ///console.log("extended journey", journey.profiles.map(p => p.date))
  try {
    const result = await journey.save()
    //console.log("res", result)
    res.json(result)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
  */
}

const update = async (req, res) => {
  console.log('updating user....................')
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    //console.log("fields", fields)
    //console.log("files", files)
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      })
    }

    //parse array fields which have been stringified
    if(fields.admin){
      fields.admin = JSON.parse(fields.admin);
    }
    let user = req.user
    user = extend(user, fields)
    user.updated = Date.now()
    //console.log('user now', user)
    let newPhoto;
    if(files.photo){
      newPhoto = {
        data: fs.readFileSync(files.photo.path),
        contentType: files.photo.type,
        name:files.photo.name,
        added:Date.now()
      }
      //console.log("pushing new photo-------------------", newPhoto)
      //user.photos.push(newPhoto);
      if(files.photo.isMain){
        user.photo = newPhoto; //todo - chck this works instead of the lines below
      }
      //user.photo.data = fs.readFileSync(files.photo.path)
      //user.photo.contentType = files.photo.type
    }
    try {
      await user.save()
      user.hashed_password = undefined
      user.salt = undefined
      //only return properties that have been updated
      let userToReturn = {
        //...fields,
        photos:user.photos.map(p => ({ _id:p._id, name:p.name, added:p.added })), //this will be merged on client with existing
        _id:user._id
      };
      res.json(userToReturn)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  })
}

const removePhotos = async (req, res) => {
  console.log('remove user..............')
  const photoIdsToDelete = req.body.photos;
  const shouldDelete = photo => photoIdsToDelete.find(id => id.equals(photo.id));
  try {
    let user = req.user;
    //if no photosToDelete specified, then delete all
    const updatedPhotos = photoIdsToDelete ? req.user.photos.filter(p => shouldDelete(p)) : [];
    user.photos = updatedPhotos;
    user.updated = Date.now()
    await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    //only return photo Ids that have been deleted
    res.json(photoIdsToDelete)
  } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
  }
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

const photo = (req, res, next) => {
  console.log("photo....", req.photoId);
  if(req.photoId){
      const photo = req.user.photos.find(photo => photo._id.equals(req.photoId));
      if(!photo){ return res.status(400);}
      res.set("Content-Type", photo.contentType);
      return res.send(photo.data)
  }
  if(req.user.photo?.data){
    res.set("Content-Type", req.user.photo.contentType);
    return res.send(req.user.photo.data)
  }
  //next is defaultPhoto if no photo
  next();
}

const photos = (req, res, next) => {
  //console.log("photos", req.photoId)
  return res.status(400);
  /*const photos = req.user.photos.map(photo => {
    return {

    }
  })
    res.set("Content-Type", req.user.photo.contentType);
    return res.send(req.user.photo.data)
  }*/
}


const defaultPhoto = (req, res) => {
  //console.log("defaultphoto")
  return res.sendFile(process.cwd() + defaultImage)
}



export default {
  create,
  userByID,
  photoByID,
  read,
  list,
  remove,
  update,
  createStack,
  updateStack,
  photos,
  photo,
  defaultPhoto
}
