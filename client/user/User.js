import React, { } from 'react'
import { Route, Switch, Link } from 'react-router-dom'
//styles
import { makeStyles } from '@material-ui/core/styles'
import UserProfile from './UserProfile'
import ArrowForward from '@material-ui/icons/ArrowForward'
import Button from '@material-ui/core/Button'
//children
import { withLoader } from '../util/HOCs';
import SimpleList from '../util/SimpleList'
import PlayerDashboardContainer from "../dashboard/containers/PlayerDashboardContainer"
//helper
import { userProfile } from '../util/ReduxHelpers'
import { filterUniqueById } from '../util/ArrayHelpers';
import { matches } from 'lodash'

const useStyles = makeStyles(theme => ({
  root:{
    display:'flex',
    alignItems:'flex-start', //note - when removing this, it makes item stretch more
    flexDirection:'column'
  },
  dashboard:{
    margin:'50px'
  },
  lists:{
    marginTop:`${theme.spacing(4)}px`,
    alignSelf:'stretch',
    display:'flex',
    justifyContent:'space-around',
    flexWrap:'wrap'
  },
  list:{
    [theme.breakpoints.down('md')]: {
      flex:'90vw 0 0',
    },
    [theme.breakpoints.up('lg')]: {
      flex:'400px 0 0',
    },
    height:'100%',
  },
  quickLinks:{
    margin:`${theme.spacing(2)}px`,
    height:"50px"
  },
  quickLinkBtn:{
    margin:`${theme.spacing(1)}px`
  }
}))

function User(props) {
  //console.log('User props..............', props)
  const { user, match, location } = props;
  const { groupsMemberOf, datasetsMemberOf } = user;
  const classes = useStyles()
  //note may need useEffect for window.scrollTo(0, 0)

  const groupItemActions = {
    main:{
      itemLinkPath:grp => '/group/'+grp._id,
      //onItemClick:(item, i) => { alert('item '+i)},
      ItemIcon:({}) => <ArrowForward/>
    },
    other:[]
  }

  const datasetItemActions = {
    main:{
      itemLinkPath:dset => '/dataset/'+dset._id,
      //onItemClick:(item, i) => { alert('item '+i)},
      ItemIcon:({}) => <ArrowForward/>
    },
    other:[]
  }

  //as this is a user profile, we dont show administered Groups and datasets,
  //only ones where user is a participant.
  const allDatasets = filterUniqueById([
    ...groupsMemberOf.map(g => g.datasets).reduce((a,b) => [...a, ...b], [] ),
    ...datasetsMemberOf
  ])

  const quickLinks = [
    {
      label:"Profile", 
      to:"/user/"+user._id, 
      isActive: () => match.isExact
    },
    {
      label:"Dashboard",
      to:"/user/"+user._id +"/dashboard",
      isActive:() => location.pathname.includes("dashboard")
    }
  ]

  return (
    <div className={classes.root} >
      <UserProfile profile={user} />
      <QuickLinks links={quickLinks} url={location.pathname} />
      <Switch>
          <Route path="/user/:userId/dashboard" component={PlayerDashboardContainer}/>
          <Route component={PlayerProfile}/>
      </Switch>
      <div className={classes.lists}>
          <div className={classes.list}>
            <SimpleList 
                    title='Groups' 
                    emptyMesg='Not a member of any groups.' 
                    items={groupsMemberOf}
                    itemActions={groupItemActions}
                    primaryText={grp => grp.name}
                    secondaryText={grp => grp.desc} />
          </div>

          <div className={classes.list} >
            <SimpleList 
                  title='Datasets' 
                  emptyMesg='No datasets yet' 
                  items={allDatasets}
                  itemActions={datasetItemActions}
                  primaryText={dset => dset.name}
                  secondaryText={dset => dset.desc} />
          </div>
      </div>
    </div>
  )
}


const QuickLinks = ({links}) =>{
  const classes = useStyles()
  return(
    <div className={classes.quickLinks}>
        {links.map(link =>
          <Link to={link.to} key={"quicklink-"+link.to}>
              <Button color="primary" variant="contained" 
                  className={classes.quickLinkBtn}
                  style={{opacity:(link.isActive() ? 1 : 0.5)}}
                  >
                    {link.label}
              </Button>
          </Link>
        )}
    </div>
  )
}

QuickLinks.defaultProps = {
  links:[]
}

const PlayerProfile = () =><div style={{margin:50}}>Player Profile</div>

const Loading = <div>User is loading</div>
//must load user if we dont have the deep version eg has groupsMemberof property
export default withLoader(User, ['user.groupsMemberOf'], {alwaysRender:false, LoadingPlaceholder:Loading});
