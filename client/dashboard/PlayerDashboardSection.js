import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
//children
import PlayerDashboardChartWrapper from "./PlayerDashboardChartWrapper"
//helpers

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2) + "px 0px",
    //border:'solid',
    //borderColor:"blue"
  },
  title:{
    fontSize:"14px"
  },
  charts:{
    display:"flex",
    flexWrap:"wrap",
    width:"92vw",
  },
  chart:{
    [theme.breakpoints.down('sm')]: {
      height:"65vw",
      flex:"90vw 0 0"
  },
  [theme.breakpoints.up('md')]: {
      height:"300px",
      flex:"400px 0 0"
  },
  }
}))

const PlayerDashboardSection = ({sectionType, data, settings}) => {
  //console.log("section---------------------", data)
  const classes = useStyles() 

  //todo - add section specifc settings to settings object
  //could also add chart specific settings to each chartdata

  return (
    <div className={classes.root}>
       <Typography variant="h6" className={classes.title}>
          {sectionType}: {data.name}
        </Typography>
      <div className={classes.charts}>
        {data.chartsData.map((chartData,i)=>
          <div className={classes.chart} key={chartData.key}>
              <PlayerDashboardChartWrapper
                  chartType="timeSeries"
                  data={chartData}
                  settings={settings}
                  />
          </div>
        )}
      </div>
    </div>
  )
}

PlayerDashboardSection.defaultProps = {
  settings:{}
}

export default PlayerDashboardSection;


