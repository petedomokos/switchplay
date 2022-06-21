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
import { calcTargetCompletion, findMostRecentD } from "../data/DataManipulation"
import { difference } from 'lodash';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1) +"px " +theme.spacing(2) +"px",
    //border:'solid',
    //borderColor:'green'
  },
  overallProgress:{
    [theme.breakpoints.down('md')]: {
        width:"90vw",
        height:"350px"
    },
    [theme.breakpoints.up('lg')]: {
        width:"300px",
        height:"500px",
    },
    //border:'solid',
    //borderColor:"yellow"
  }
}))

const PlayerDashboard = ({player, datasets}) => {
  const styleProps = { };
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  //console.log("player dashboard---------------------", player)
  //console.log("datasets-------------------", datasets)

  //create data for a dashboard chart
  //todo - remove dataset
  /*
  @param dset -  a dataset
  @param measureKey - the required meaasureKey for the value

  @return object - containing all the data required for the chart for this dataset and measureKey, including:
                     key -  a combination of the dataset id and the measure key, used to uniquely identify the chart
                     name - a combination of the dataset name and the measure name (displayed above the chart)
                     yLabel - the measure units, or else the measure name
                     dataset - REMOVED - for reference purposes, eg may contain other info (MAY NOT NEED THIS!!!)
                     datasetId - for reference (do we need?)
                     measure - for reference
                     ds - the 

  */

                     /*
  A general accessor which returns a function which takes a datapoint and returns the main value 
  for that dataset for that datapoint

  /*
  const valueAccessor = (dset) =>{
    const allMeasures = [...dset.derivedMeasures, ...dset.measures];
    //use main measure for each dataset, or first one if no main
    const measure = allMeasures.find(m => m.isMain) || dset.measures[0];
    if(measure){
      return d => Number(d.values.find(v => v.measure === measure._id).value);
    }
    return d => Number(d.value);
  }
  */

  const getMeasure = (dset, measureKey) =>{
     //prioritise derivedmeasures if none set as main and no measureKey passed in
     const allMeasures = [...dset.derivedMeasures, ...dset.rawMeasures];
     if(measureKey){
       //selected measure
       return allMeasures.find(m => m.key === measureKey)
     }
     else{
       //use main or first measure
       return allMeasures.find(m => m.isMain) || allMeasures[0];
     }

  }

  const datapointValueAccessorForMeasure = (measure) => {
    //console.log("measure", measure)
      if(measure){
        return d => {
          //console.log("d", d)
          //note - valueWrapper should always be defined
          const valueWrapper = d.values.find(v => v.measure === measure._id)
          return /*valueWrapper ?*/ valueWrapper.value/* : undefined;*/
        };
      }
      return d => d.value;
  }

  const createChartDs = (dset, measure) =>{
    //console.log("createChartData for dset", dset)
    //console.log("measure", measure)
    //accessor function to get each d value
    const datapointValue = datapointValueAccessorForMeasure(measure);
  
    //format ds so d.date is Date and d.value is Number
    const ds = dset.datapoints
    //remove future targets that arent at current difficlty level
      .map(d => ({
        ...d,
        date:new Date(d.date),
        value:Number(datapointValue(d))
    }))
    .filter(d => typeof d.value === 'number') //some ds may not have a value for the specified measure

    ///console.log("ds", ds)
    //DIFFICULTY MEASURE
     //for now, difficulty index is always a rawMeasure not derived
     const difficultyMeasure = dset.rawMeasures.find(m => m.key.includes("difficulty"));
     //d difficulty value, defaults to 1 if dataset has no difficulty measure
     const difficultyValue = d => {
        if(!d){ return undefined; }
        if(!difficultyMeasure){ return 1; }

        const valueWrapper = d.values.find(v => v.measure === difficultyMeasure._id);
        //a d may not have been given a difficulty score
        return valueWrapper ? valueWrapper.value : undefined;
     }
    const actualDs = ds.filter(d => !d.isTarget)
    const mostRecentD = findMostRecentD(actualDs);
    const currentDifficultyValue = difficultyValue(mostRecentD);
    //helper
    const isPassedTarget = d => d.date.getTime() <= new Date().getTime()
    const dsForChart = ds
      .filter(d => difficultyValue(d))
      .map(d => ({
        ...d,
        isCurrentDifficulty:difficultyValue(d) === currentDifficultyValue
      })) //this defaults to 1 if no diff measure on dataset
      //remove any future targets that are not at current difficulty level (past ones can stay)
      //@TODO causing error - fix later - for now just only set targets fro current diff level as that is more helpful anyway
      //.filter(d => !d.isTarget || isPassedTarget(d) || difficultyValue(d) === currentDifficultyValue)
  
    //PROJECTIONS
    //1. current difficulty value
    //remove ds with no difficulty value (which will be 1 if dset has no diff measure)
    const dsForProjection = actualDs.filter(d => difficultyValue(d) === currentDifficultyValue)
    //console.log("dsforproj", dsForProjection)
    const projectedDs = createProjectedDatapoints(dsForProjection.filter(d => !d.isTarget))
    //console.log("projected ds", projectedDs)
    //@TODO - dont return anything we dont need in chart

    //note - as we are grouping by goal, not dataset, each chart name must include dataset too
    return [...dsForChart, ...projectedDs];
}

   //for now, its const time domain but will provide option to change as state
   const startDate = new Date(2021, 2, 30);
   const endDate = new Date(2021, 5, 30)
   const timeDomain = [startDate, addWeeks(9, new Date())]

   const settings = {
     timeDomain
   }

  //1. GOAL DATA
  //create data for a dashboard section - each measure and calc gets a chart
  const createGoalSectionData = goal => ({
      key:goal.key,
      name:goal.name,
      desc:goal.desc,
      chartsData:goal.datasetMeasures
        .map(datasetMeasure => {
            const { datasetId, measureKey } = datasetMeasure;
            const dataset = datasets.find(dset => dset._id === datasetId);
            const measure = getMeasure(dataset, measureKey)
            if(!dataset || !measure){ return undefined; }
            return {
                key:goal.key +"-" +dataset._id + "-" +measure.key,
                name: dataset.name +" (" + measure.name + ")",
                yLabel:measure.units || measure.name,
                //dataset:dset,
                measure:measure,
                ds: createChartDs(dataset, measure)
            }
       })
       .filter(chartData => chartData)
  })

  //const goalsData = player.goals.map(goal => createGoalSectionData(goal))
  //console.log("goalsSectionData", goalsData)

  //2. DATASET DATA
  const createDatasetSectionData = (dataset, i) => {
    return{
      key:dataset._id,
      name:dataset.name,
      desc:dataset.desc,
      chartsData:[...dataset.rawMeasures, ...dataset.derivedMeasures]
        .filter(m => !m.hidden)
        .map(measure => ({
            key:dataset._id + "-" +measure.key,
            name: measure.name, //todo - make measure name fullname in data when we do key - make it a hydrateMeasure function
            yLabel:measure.units || measure.name,
            //dataset:dset,
            measure:measure,
            ds:createChartDs(dataset, measure)
         
        }))
        //.filter(chartData => chartData)
    }
  }

  //one section per dataset
  const datasetsData = datasets.map(dataset => createDatasetSectionData(dataset))
  console.log("datasetsSectionData", datasetsData)

  //3. OVERALL SUMMARY DATA
  
  const overallMeasure = {name:"Target Completion", order:"highest is best", unit:"%", min:0, max:100}
  const beeSwarmSettings = {};
  /*

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
          //if scores have got worse, completion will be negative. Capped at -50 so yDomain is not stretched too much
          targetCompletion:calcTargetCompletion(dset, {minCompletion:-50})
      }))
      //console.log("datasetsWithTargetCompletion", datasetsWithTargetCompletion)

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
  //console.log("overallCompletionDataset", overallCompletionDataset)
  
  */


  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.title}>SUMMARY</Typography>
      {/**<div className={classes.overallProgress}>
         <PlayerDashboardChartWrapper
              chartType="beeSwarm"
              data={overallCompletionDataset} 
         />
  </div>*/}
   <Typography variant="h6" className={classes.title}>GOALS</Typography>
      {/**goalsData.map(goalData=>
        <PlayerDashboardSection
            sectionType="GOAL"
            data={goalData} 
            key={goalData.key} 
            settings={settings} 
            />
      )*/}
      <Typography variant="h6" className={classes.title}>DATASETS</Typography>
      {datasetsData.map(datasetData=>
        <PlayerDashboardSection
            sectionType="DATASET"
            data={datasetData} 
            key={datasetData.key} 
            settings={settings} 
            />
      )}
    </div>
  )
}

PlayerDashboard.defaultProps = {
}

export default withLoader(PlayerDashboard, ["allDatasetsFullyLoaded"] )


