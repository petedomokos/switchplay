import React, {useState} from 'react'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { withRouter } from 'react-router-dom'

function DeleteUser({ userId, openDialog, closeDialog, deleteAccount, deleting, open, error, history }) {
    return (<span>
      <IconButton aria-label="Delete" onClick={openDialog} color="secondary">
       <DeleteIcon/>
      </IconButton>

      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>{"Delete Account"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleting ? 'Deleting...' : error ? 'Server error' : 'Confirm to delete your account.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => deleteAccount(userId, history)} color="secondary" autoFocus="autoFocus">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </span>)
}

DeleteUser.defaultProps = {
  open:false
}

export default withRouter(DeleteUser);

