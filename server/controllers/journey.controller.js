import User from '../models/user.model'
import Journey from '../models/journey/journey.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import { addRefToUserArray, setRefInUser } from './../helpers/dbQueries'

/**
 * Load journey and append to req.
 */
const journeyByID = async (req, res, next, id) => {
  console.log('readJourneyById......', id)
  try {
    let journey = await Journey.findById(id)

      /*
      .populate('admin', '_id username firstname surname created')
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
      */

    console.log('journey in journeyById', journey)
    if (!journey)
      return res.status('400').json({
        error: "Journey not found"
      })
    req.journey = journey;
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve user"
    })
  }
}

/*
attempts to create a new user in in db. 
*/
const create = async (req, res) => {
    console.log('create journey...user', req.user._id)
    //create new
    //const id = "new-journey" //todo - use uuid() or date etc to make unique
    const journey = new Journey({ 
      //id,
      ...req.body,
      userId:req.user._id,
      admin:[req.user._id]
    });
    //console.log('created journey', journey)
    //todo - add admin as the signed in user

    try {
      // @todo- later - also need to add to journeyId to each admin user, and late to each readOnlyUser
      // and if its the home journey, make it homeJourney to for the user

      //ERROR
      //UnhandledPromiseRejectionWarning: ReferenceError: Cannot access 'journey' before initialization
      //at create (webpack:///./server/controllers/journey.controller.js?:76:19)
      console.log('saving new journey')
      await journey.save()
      console.log('success')
      addRefToUserArray(req.user._id, 'journeys', journey._id)
      //temp - auto update homeJourney to the latest new journey
      setRefInUser(req.user._id, 'homeJourney', journey._id)
      return res.status(200).json({
        mesg: "Successfully signed up!",
        journey
      })

    } catch (err) {
      console.log('failure', err)
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  const update = async (req, res) => {
    console.log('updating journey....................', req.user)
    let journey = req.journey;
    //console.log("req journey", journey)
    //console.log("body", req.body)
    journey = extend(journey, req.body);
    //console.log("extended journey", journey)
    try {
      const result = await journey.save()
      res.json(result)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }
  
  const read = (req, res) => {
    console.log('read journey......')
    return res.json(req.journey)
  }



/*
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

*/

const remove = async (req, res) => {
    console.log('remove journey..............')
    try {
     //@todo - must also remove from users that use this journey
      let journey = req.journey
      let deletedJourney = await journey.remove()
      res.json(deletedJourney)
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
    }
  }

/*
const removeAll = async (req, res) => {
  console.log('create journey...user')

  try {
    let journeys = await Journey.find()
    journeys.forEach((j,i) => {
        console.log('journey '+i, j)
        //may need to remove this await
        await j.remove()
    })
  } catch (err) {
    console.log('failure', err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}
*/

export default {
  create,
  journeyByID,
  read,
  //list,
  remove,
  update,
}
