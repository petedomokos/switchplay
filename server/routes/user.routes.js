import express from 'express'
import userCtrl from '../controllers/user.controller'
import journeyCtrl from '../controllers/journey.controller'
import authCtrl from '../controllers/auth.controller'

const router = express.Router()

router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)


//@todo - put or post - why is it post for createUser and put for update?
//we use :journeyId as an optional param - if it exists, it is update
//router.route('/api/users/:userId/journey/:journeyId')
  //.get(authCtrl.requireSignin, journeyCtrl.read)
  //.post(authCtrl.requireSignin, authCtrl.hasAuthorization, journeyCtrl.update)

router.route('/api/users/:userId/journey')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, journeyCtrl.create)

router.param('userId', userCtrl.userByID)

export default router
