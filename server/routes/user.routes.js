import express from 'express'
import userCtrl from '../controllers/user.controller'
import authCtrl from '../controllers/auth.controller'

const router = express.Router()


router.route('/api/users/photo/:userId/:photoId')
  .get(userCtrl.photo, userCtrl.defaultPhoto)

router.route('/api/users/photo/:userId')
  .get(userCtrl.photo, userCtrl.defaultPhoto)

//need to work out why not accessing other photos except default
router.route('/api/users/defaultphoto')
  .get(userCtrl.defaultPhoto)

router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

router.route('/api/users/:userId/tables')
  .post(userCtrl.createTable)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.updateTable)

router.route('/api/users/:userId/decks/update')
  .put(userCtrl.updateDecks)

router.route('/api/users/:userId/decks')
  .post(userCtrl.createDeck)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.updateDeck)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.removeDeck)

router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)


router.param('userId', userCtrl.userByID)
router.param('photoId', userCtrl.photoByID)

export default router
