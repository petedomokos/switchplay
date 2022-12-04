import express from 'express'
import authCtrl from '../controllers/auth.controller'
import userCtrl from '../controllers/user.controller'
import journeyCtrl from '../controllers/journey.controller'

const router = express.Router()

//@todo - put or post - why is it post for createUser and put for update?
//we use :journeyId as an optional param - if it exists, it is update
router.route('/api/users/:userId/journey/:journeyId')
  //.get(authCtrl.requireSignin, journeyCtrl.read)
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, journeyCtrl.update)

//@todo - consider whether or not we need to pass signed in user as a param
// - cant we just get the signed in user from server and check they are in journey admin?
router.route('/api/users/:userId/journey')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, journeyCtrl.create)

router.param('userId', userCtrl.userByID)
router.param('journeyId', journeyCtrl.journeyByID)

export default router
