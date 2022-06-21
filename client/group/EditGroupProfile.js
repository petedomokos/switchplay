import React, {useState, useEffect} from 'react'
import { Redirect } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import { withLoader } from '../util/HOCs';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default function EditGroupProfile({ signedInUserId, group, onUpdate, updating, updatingError, history }) {
  const classes = useStyles()
  const [values, setValues] = useState({
    parent: group.parent || '',
    name:group.name || '',
    desc:group.desc || '',
    groupType: group.groupType || '',
    //photo: group.photo || '',
    admin:[signedInUserId]
  })


  const clickSubmit = () => {
    let formData = new FormData();
    values.groupname && formData.append('groupname', values.groupname)
    values.firstname && formData.append('firstname', values.firstname)
    values.surname && formData.append('surname', values.surname)
    values.email && formData.append('email', values.email)
    values.password && formData.append('password', values.password)
    const adminUsers = values.admin.length != 0 ? values.admin : [signedInUserId];
    formData.append('admin', adminUsers)
    //values.photo && formData.append('photo', values.photo)
    onUpdate(group._id, formData, history)
  }

  const handleChange = name => event => {
    setValues({...values, [name]: event.target.value})
  }

  if(!group.admin.includes(signedInGroupId)){
    alert('You do not have permission to edit this group.')
    //todo - redirect to 'from'
    return <Redirect to='/'/>
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Edit Profile
        </Typography>
        <TextField id="groupname" label="Groupname" className={classes.textField} value={values.groupname} onChange={handleChange('groupname')} margin="normal"/><br/>
        <TextField id="firstname" label="First name" className={classes.textField} value={values.firstname} onChange={handleChange('firstname')} margin="normal"/><br/>
        <TextField id="surname" label="Surname" className={classes.textField} value={values.surname} onChange={handleChange('surname')} margin="normal"/><br/>
        <TextField id="email" type="email" label="Email" className={classes.textField} value={values.email} onChange={handleChange('email')} margin="normal"/><br/>
        <TextField id="password" type="password" label="Password" className={classes.textField} value={values.password} onChange={handleChange('password')} margin="normal"/>
        <br/> {
          values.error && (<Typography component="p" color="error">
            <Icon color="error" className={classes.error}>error</Icon>
            {values.error}
          </Typography>)
        }
      </CardContent>
      <CardActions>
        <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
      </CardActions>
    </Card>
  )
}

EditGroupProfile.defaultProps = {
  group:{
    _id:'',
    groupname:'',
    firstname:'',
    surname:'',
    email:''
  },
  onUpdate:() =>{}
}


