import express from 'express'
import groupCtrl from '../controllers/group.controller'
import authCtrl from '../controllers/auth.controller'

const router = express.Router()

router.route('/api/groups')
  .get(groupCtrl.list)
  .post(groupCtrl.create)

router.route('/api/groups/:groupId')
  .get(authCtrl.requireSignin, groupCtrl.read)
  .put(authCtrl.requireSignin, /*authCtrl.hasAuthorization,*/ groupCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, groupCtrl.remove)

router.param('groupId', groupCtrl.groupByID)

export default router
