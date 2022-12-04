import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from './../../config/config'

const signin = async (req, res) => {
  console.log('signin...', req.body)
  //@todo - find a cleaner way to replicate the code below where we split based on email or username
  //but still populate it the same
  const adminPopulationStr = '_id username firstname surname created';
  const administeredUsersPopulationStr = '_id username firstname surname photo created';
  const administeredGroupsPopulationObj = { 
    path: 'administeredGroups', 
    select: '_id name desc photo groupType created datasets',
    populate: {
      path:'datasets',
      select:'_id name desc'
    } 
  };

  const groupsMemberOfPopulationObj = { 
    path: 'groupsMemberOf', 
    select: '_id name desc photo groupType created datasets',
    populate: {
      path:'datasets',
      select:'_id name desc'
    } 
  };
  const administeredDatasetsPopulationStr = '_id name desc created measures';
  const datasetsMemberOfPopulationStr = '_id name desc created';

  try {
    let user;
    if(req.body.emailOrUsername.includes("@")){
      console.log("signing in by email")
      user = await User.findOne({ "email" : req.body.emailOrUsername })
        .populate('admin', adminPopulationStr)
        .populate('administeredUsers', administeredUsersPopulationStr)
        .populate(administeredGroupsPopulationObj)
        .populate(groupsMemberOfPopulationObj)
        .populate('administeredDatasets', administeredDatasetsPopulationStr)
        .populate('datasetsMemberOf', datasetsMemberOfPopulationStr);

    }else{
      console.log("signing in by username")
      user = await User.findOne({ "username" : req.body.emailOrUsername })
        .populate('admin', adminPopulationStr)
        .populate('administeredUsers', administeredUsersPopulationStr)
        .populate(administeredGroupsPopulationObj)
        .populate(groupsMemberOfPopulationObj)
        .populate('administeredDatasets', administeredDatasetsPopulationStr)
        .populate('datasetsMemberOf', datasetsMemberOfPopulationStr)
    }

    if (!user){
      return res.status('401').json({
        error: "User not found"
      })
    }

    if (!user.authenticate(req.body.password)) {
      return res.status('401').send({
        error: "Email and password don't match."
      })
    }

    const token = jwt.sign({
      _id: user._id
    }, config.jwtSecret)

    res.cookie("t", token, {
      expire: new Date() + 9999
    })

    return res.json({
      token,
      user:user
      /*user: {
        _id: user._id,
        name: user.name,
        email: user.email,

      }*/
    })

  } catch (err) {

    return res.status('401').json({
      error: "Could not sign in"
    })

  }
}

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})

//req.user is the user that is being updated or deleted
//they have an admin array, which may be a list of userIds or may be a list of user objects

//todo - not sure how to allow systemAdmin todo anything - I think we just need to always send signedInUserId
//body, because we cant seem to be able to attach it to the jwt sign object on server
const hasAuthorization = (req, res, next) => {
  const authorized = req.user && req.auth && (
      req.user._id == req.auth._id ||
      req.user.admin.includes(req.auth._id) || 
      req.user.admin.map(user => user._id).includes(req.auth._id) ||
      req.auth.isSystemAdmin
  )
  console.log('authorized???????? ', authorized)
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}
