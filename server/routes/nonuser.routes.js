import express from 'express'
import nonuserCtrl from '../controllers/nonuser.controller'

const router = express.Router()

router.route('/api/requestdemo')
  .post(nonuserCtrl.create)

export default router
