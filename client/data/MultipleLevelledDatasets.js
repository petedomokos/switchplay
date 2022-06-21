import React, { useState, version } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
//children
import { withLoader } from '../util/HOCs';
import PlayerDashboardSection from "./PlayerDashboardSection";
import PlayerDashboardChartWrapper from "./PlayerDashboardChartWrapper";
//helpers
import scatterData from "../charts/chartdata/timeSeriesData";
import { addWeeks } from "../util/TimeHelpers";
import { createProjectedDatapoints } from './Projector';
import { datasetTags } from "../data/datasetOptions"
import superDataset from '../data/superDataset';
import timeSeriesData from "../charts/chartdata/timeSeriesData"
import { max, min } from "../data/summaryHelpers";
import { calcTargetCompletion } from "../data/DataManipulation"

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2) +"px " +theme.spacing(2) +"px",
    //border:'solid',
    //borderColor:'green'
  },
  overallProgress:{
    [theme.breakpoints.down('md')]: {
        height:"350px",
        width:"90vw"
    },
    [theme.breakpoints.up('lg')]: {
        height:"500px",
        width:"300px"
    },
    //border:'solid',
    //borderColor:"yellow"
  }
}))

const PlayerDashboard = ({player, datasets}) => {
  const styleProps = { };
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  console.log("player---------------------", player)
  console.log("datasets-------------------", datasets)

  //create data for a dashboard chart
  const createChartData = (dset, measureKey, i) =>{
      const allMeasures = [...dset.rawMeasures, ...dset.derivedMeasures];
      //get the specified measure, or if not specified, get the ismain measure, or else get the first derived measure, or else the first raw measure
      const measure = allMeasures.find(m => m.key === measureKey) || allMeasures.find(m => m.isMain) || dset.derivedMeasures[0] || allMeasures[0];
      const ds = dset.datapoints.map(d => ({
          ...d,
          date:new Date(d.date),
          value:Number(d.values.find(v => v.measure === measure._id).value)
      }))

      const projectedDs = createProjectedDatapoints(ds.filter(d => !d.isTarget))
      //console.log("projected ds", projectedDs)
      //@TODO - dont return anything we dont need in chart

      //note - as we are grouping by goal, not dataset, each chart name must include dataset too
      return {
          key:"measure"+i,
          name:dset.name +" (" + measure.name + ")",
          yLabel:measure.units || measure.name,
          dataset:dset,
          measure:measure,
          ds:[...ds, ...projectedDs]
      }
  }

   //for now, its const time domain but will provide option to change as state
   const timeDomain = [addWeeks(-2, new Date()), addWeeks(9, new Date())]

   const settings = {
     timeDomain
   }


  //create data for a dashboard section - each measure and calc gets a chart
  const createGoalSectionData = (goal, i) => ({
      key:goal.key,
      name:goal.name,
      desc:goal.desc,
      chartsData:goal.datasetMeasures.map((datasetMeasure, i) => {
          const { datasetId, measureKey } = datasetMeasure;
          const dataset = datasets.find(dset => dset._id === datasetId);
          return createChartData(dataset, measureKey, i);
      })
  })

  //1 section per dashboard (later, we will group by goals)
  const goalsData = player.goals.map((goal,i) => createGoalSectionData(goal,i))
  console.log("goalSectionData", goalsData)

  //we start to develop an api, an expected data object for a beeswarm - key, label, value, tags
  //not time though - animatoin is run at higher level, which appliess filters or changes to the data
  //the beeswarm animates those changes as part of the eue re-binding cycle

  //note measure here is a calculation
  const overallMeasure = {name:"Target Completion", order:"highest is best", unit:"%", min:0, max:100}
  const beeSwarmDataMock = {
    name:"Summary",
    chartType:"beeSwarm",
    measure:overallMeasure,
    //need to pass in start and end date, so it can calculate the ontrack line based on current date
    //strats on 0, ie current score on start date, and aim is to end on 100, but could go above 100 or even below 
    //(regression od performance)
    settings:{
      bounds:[overallMeasure.min, overallMeasure.max]
    },
    ds:[
      {key:"pressups", label:"Press up", value:45, tags:["strength", "goal2", "LME", "UB"]},
      {key:"situps", label:"Sit-up", value:34, tags:["strength", "goal2", "LME", "core"]},
      {key:"sprint", label:"Sprint", value:11, tags:["speed", "LB"]}
    ]

  };
  const beeSwarmSettings = {};

  const valueAccessor = (dset) =>{
    const allMeasures = [...dset.derivedMeasures, ...dset.measures];
    //use main measure for each dataset, or first one if no main
    const measure = allMeasures.find(m => m.isMain) || dset.measures[0];
    if(measure){
      return d => Number(d.values.find(v => v.measure === measure._id).value);
    }
    return d => Number(d.value);
  }

  //we provide a datapointValue accessor, which says how to get the value from each d for each dset
  //and a sumnary function, which tells it how to summarise those ds into one value
  
  /*

  THIS IS FOR A SUPERDATASET TO SHOW DIFFERENT LEVELS OF A DRILL PROGRESSION ON SAME CHART
  ie if a drill progresses in difficulty over time, then we recalibrate the scoring system so that it shows these progressions
  on the same chart as previous drill, but shows that it is a harder drill so chart scores still increase
  hence we need to recalibrate the scores of the ds eg maybve the level can be a multiplier eg newValue = value * level
  To achieve this, we pass in a datapointValue accessor, which is a HOF which first recieves the dataset

  datasets can optionally have a level attached to them. Therefore, they can b combined with other datasets to make a series

  typically, the series datasets will have teh same key, other than the level, whihc is part of the key
  But key may also include a custom descriptor tag

  eg name='Pressups' level=1 custom=""  => key = toCamelCase(name) +(level ? "-" +level : "")+(custom ? "-" +toCamelCase(custom) : "") => pressups-1

  or a custom may be eg "With 10KG" and a level="2" then => then key = 'pressups-2-with10Kg'

  for these kind of super datasets, we have 1 yaxis that calculates the positions, but we hide it and instead show a series of yaxes for each level, or each dataset
  
  OR simpler, just use diffrent yaxis but shift them up by there level and across too. so maybe dont even use the superdataset structure

  on phone, just show them as a series of small multiples in the horizontal direction, user swipes left or right to move between them
  so they tell a story together of the journey

  BEST IS MAKE IT SAME DATASET, BUT EACH DATASET CAN ALSO HAVE A LEVELS OBJECT WHICH PROVIDES LEVEL NUMBERS, DESCRIPTORS, ETC
  THEN EACH DATAPOINT ALSO HAS A LEVEL
  then when calculating projections, the range of dates can be for a specifc level, and we will probably wnat to hide projectionjs 
  by default for each level and user can turn them on, or just ds can be filtered by levele before applying projections 


  const valueAccessor = dataset => datapoint => {
    const datasetLevel = dataset.level || 1;
    return datapoint.value * datasetLevel
  }
  const overallDatasetGenerator = superDataset()
      .datapointValue(valueAccessor)
      .summary(max) //need the target on track value - based on next targ and start date
      .datasetName("Overall");

  const overallDataset = overallDatasetGenerator(datasets);
  console.log("overallDataset", overallDataset)
  */

  const datasetsWithTargetCompletion = datasets.map(dset =>{
      const allMeasures = [...dset.derivedMeasures, ...dset.measures];
      //use main measure for each dataset, or first one if no main
      const measure = allMeasures.find(m => m.isMain) || dset.measures[0];

      //set and format d.date and d.value
      const timeSeriesDataGenerator = timeSeriesData().measure(measure)//.start(new Date(START_DATE))

      //add target completion object
      return timeSeriesDataGenerator(dset)
      })
      .map(dset => ({
          ...dset,
          //will return undefined if no actual ds before startdate
          targetCompletion:calcTargetCompletion(dset)
      }))
      console.log("datasetsWithTargetCompletion", datasetsWithTargetCompletion)

  //accessor function that tells superDataset how to get the value for each dataset (which becomes a d in superDataset)
  //forr now, we just show the projected targetCompletion, so 100 means on track to meet target by due date
  const targetCompletionValue = (dset) =>{
      if(!dset.targetCompletion){ return; }
      return dset.targetCompletion.projected.completion;
  }
  //create super dataset with 1 d per dataset
  const overallCompletionDatasetGen = superDataset()
        .datasetValue(targetCompletionValue)
        .datasetName("Overall Target Completion")
  
  //pass in the datasets - note 
  const overallCompletionDataset = overallCompletionDatasetGen(datasetsWithTargetCompletion)
  console.log("overallCompletionDataset", overallCompletionDataset)
  


  return (
    <div className={classes.root}>
      <div className={classes.overallProgress}>
         <PlayerDashboardChartWrapper
              chartType="beeSwarm"
              data={overallCompletionDataset} 
         />
  </div>
      {goalsData.map(goalData=>
        <PlayerDashboardSection 
            data={goalData} 
            key={goalData.key} 
            settings={settings} 
            />
      )}
    </div>
  )
}

PlayerDashboard.defaultProps = {
}

export default withLoader(PlayerDashboard, ["allDatasetsFullyLoaded"] )


