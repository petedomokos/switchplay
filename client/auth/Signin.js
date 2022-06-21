import React, {useState} from 'react'
import { withRouter } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  card: {
    [theme.breakpoints.down('md')]: {
      width:"90%"
    },
    [theme.breakpoints.up('lg')]: {
      width:"500px"
    },
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle,
    [theme.breakpoints.down('md')]: {
      //fontSize:"50px"
    }
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      width:"80%",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"400px"
    },
  },
  resize:{
    [theme.breakpoints.down('md')]: {
      //fontSize:"34px"
    },
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default withRouter(function Signin(props) {
  const classes = useStyles()
  const [values, setValues] = useState({
      email: '',
      password: '',
      error: ''
  })

  const clickSubmit = () => {
    const user = {
      email: values.email || undefined,
      password: values.password || undefined
    }
    //console.log('loc state', props.location)
    //get referrer for redirect
    const from  = '/'
    /*const {from} = props.location.state || {
      from: { pathname: '/' }
    }*/
    props.onSignin(user, props.history, from)

  }
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value })
  }

  return (
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6" className={classes.title}>
            Sign In
          </Typography>
          <TextField 
              id="email" type="email" label="Email" 
              className={classes.textField} 
              value={values.email} 
              onChange={handleChange('email')} 
              margin="normal"
              InputProps={{
                classes: {
                  input: classes.resize,
                },
              }}
          /><br/>
          <TextField 
              id="password" type="password" label="Password" 
              className={classes.textField} value={values.password} 
              onChange={handleChange('password')} margin="normal"
              InputProps={{
                classes: {
                  input: classes.resize,
                },
              }}
          />
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
})
