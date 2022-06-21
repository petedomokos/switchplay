import formidable from 'formidable'
import fs from 'fs'
import _ from 'lodash'
import errorHandler from './../helpers/dbErrorHandler'
import Group from '../models/group.model'
import User from '../models/user.model'
//import Player from '../models/player.model'

//todo - only add refs if not already in it
export const addRefToUserArray = (userId, key, value) =>{
  User.findByIdAndUpdate(userId, {$push: {[key]: value}}, (err,val) =>{
    if(err)
      console.log("ERROR: add " +key + " ref to user error:", 
          errorHandler.getErrorMessage(err))
    else
      console.log("SUCCESS: added " +key +" ref to user")
  })
}
export const addRefToGroupArray = (groupId, key, value) =>{
  Group.findByIdAndUpdate(groupId, {$push: {[key]: value}}, (err,val) =>{
    if(err)
      console.log("ERROR: add " +key + " ref to group error:",
          errorHandler.getErrorMessage(err))
    else
      console.log("SUCCESS: added " +key +" ref to group")
  })
}
export const setRefInUser = (userId, key, value) =>{
  User.findByIdAndUpdate(userId, {$set: {[key]: value}}, (err,val) =>{
    if(err)
      console.log("ERROR: set " +key + " ref in user error:",
          errorHandler.getErrorMessage(err))
    else
      console.log("SUCCESS: set " +key +" ref in user")
  })
}

export const setRefInGroup = (groupId, key, value) =>{
  Group.findByIdAndUpdate(groupId, {$set: {[key]: value}}, (err,val) =>{
    if(err)
      console.log("ERROR: set " +key + " ref in group error:",
        errorHandler.getErrorMessage(err))
    else
      console.log("SUCCESS: set " +key +" ref in group")
  })
}
export const removeRefFromUserArray = (userId, key, value) =>{
  User.findByIdAndUpdate(userId, {$pull: {[key]: value}}, (err,val) =>{
    if(err)
      console.log("ERROR: remove " +key + " ref from user error:", 
          errorHandler.getErrorMessage(err))
    else
      console.log("SUCCESS: removed " +key +" ref from user")
  })
}
export const removeRefFromGroupArray = (groupId, key, value) =>{

  Group.findByIdAndUpdate(groupId, {$pull: {[key]: value}}, (err,val) =>{
    if(err)
      console.log("ERROR: remove " +key + " ref from group error:",
          errorHandler.getErrorMessage(err))
    else
      console.log("SUCCESS: removed " +key +" ref from group")
  })

}
