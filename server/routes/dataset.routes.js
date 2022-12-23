import express from 'express'
import datasetCtrl from '../controllers/dataset.controller'
import authCtrl from '../controllers/auth.controller'
import userCtrl from '../controllers/user.controller'

const router = express.Router()

router.route('/api/datasets')
  .get(datasetCtrl.list)
  .post(datasetCtrl.create)

router.route('/api/datasets/multiple')
  .put(datasetCtrl.readMultiple)

router.route('/api/users/:userId/datasets/:datasetId/datapoints/create')
  //.get(authCtrl.requireSignin, datasetCtrl.read)
  //changed to plural below
  .put(/*authCtrl.requireSignin, authCtrl.hasAuthorization,*/ datasetCtrl.createDatapoints)
  //.delete(authCtrl.requireSignin, authCtrl.hasAuthorization, datasetCtrl.remove)

router.route('/api/datasets/:datasetId')
  .get(authCtrl.requireSignin, datasetCtrl.read)
  .put(authCtrl.requireSignin, /*authCtrl.hasAuthorization,*/ datasetCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, datasetCtrl.remove)

router.param('userId', userCtrl.userByID)
router.param('datasetId', datasetCtrl.datasetByID)

export default router
