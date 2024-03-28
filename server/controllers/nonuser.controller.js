import nonuser from '../models/nonuser.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import fs from 'fs'

const create = async (req, res) => {
  console.log('create nonuser...body', req.body)
  //const nonuser = new Nonuser(req.body)
  //console.log('created', nonuser)
  return res.status(200).json({
    mesg: "Successfully signed up!"
  })
  try {
    console.log('trying')
    await nonuser.save()
    console.log('success')
    return res.status(200).json({
      mesg: "Successfully signed up!",
      nonuser
    })
  } catch (err) {
    console.log('failure', err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


export default {
  create
}
