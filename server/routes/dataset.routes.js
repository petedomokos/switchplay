import express from 'express'
import datasetCtrl from '../controllers/dataset.controller'
import authCtrl from '../controllers/auth.controller'

const router = express.Router()

router.route('/api/datasets')
  .get(datasetCtrl.list)
  .post(datasetCtrl.create)

router.route('/api/datasets/multiple')
  .put(datasetCtrl.readMultiple)

router.route('/api/datasets/:datasetId/datapoints/create')
  //.get(authCtrl.requireSignin, datasetCtrl.read)
  .put(/*authCtrl.requireSignin, authCtrl.hasAuthorization,*/ datasetCtrl.createDatapoint)
  //.delete(authCtrl.requireSignin, authCtrl.hasAuthorization, datasetCtrl.remove)

router.route('/api/datasets/:datasetId')
  .get(authCtrl.requireSignin, datasetCtrl.read)
  .put(authCtrl.requireSignin, /*authCtrl.hasAuthorization,*/ datasetCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, datasetCtrl.remove)

router.param('datasetId', datasetCtrl.datasetByID)

export default router
