import * as d3 from 'd3';
/*
  export const findMostRecentD = (ds, dateToCheck) => {
    const date = dateToCheck || new Date();
    const dateOfMostRecentD = d3.max(ds.filter(d => d.date.getTime() <= date.getTime()), d => d.date)
    return ds.find(d => d.date === dateOfMostRecentD);
  }
  */

  export const findMostRecentD = (ds, dateToCheck) => {
    const date = dateToCheck || new Date();
    const dateOfMostRecentD = d3.max(ds.filter(d => d.date.getTime() <= date.getTime()), d => d.date)
    return ds.find(d => d.date === dateOfMostRecentD);
  }

  const findMostRecentValue = (ds, dateToCheck) => {
    const d = findMostRecentD(ds, dateToCheck);
    return d ? d.value : undefined;
  }

  const findNextD = (ds, dateToCheck) => {
    const date = dateToCheck || new Date();
    const dateOfNextTarget = d3.min(ds.filter(d => d.date > date), d => d.date)
    return ds.find(d => d.date === dateOfNextTarget)
  }

  const findNextTarget = (ds, dateToCheck) => {
    return findNextD(ds.filter(d => d.isTarget), dateToCheck);
  }

  const dateMilli = d => d.date.getTime();

  //if from == to, result is 0.  if both neg or both pos, result is pos. else result is neg.
  const percentageDifference = (from, to) =>{
    if(from === 0){
      return 100;
    }else{
      return (to / from) * 100;
    }
  }

  const percentageCompletion = (startValue, targetValue, valueToCheck) =>{
    const totalDifference = targetValue - startValue;
    if(totalDifference === 0){
      return 100;
    }
    const achieved = valueToCheck - startValue;
    return (achieved / totalDifference) * 100;
  }
  export const calcTargetCompletion = (dataset, options={}) =>{
      const { datapoints } = dataset;
      const target = findNextTarget(datapoints);
      if(!target){
        return undefined;
      }

      const { dateToTest, minCompletion, maxCompletion } = options;
      //console.log("dataset", dataset)
      //console.log("dateToTest", dateToTest)
      const date = dateToTest || new Date();
      const startDate = new Date(dataset.startDate);
      //use the most recent d to the start date as the start value
      //@TODO - we could use closest actual D, even if its after the start date
      const startValue = findMostRecentValue(datapoints, startDate);
      if(!startValue) { return undefined }
      const startDateMilli = startDate.getTime();
      const targetDateMilli = dateMilli(target);
      const mostRecent = findMostRecentD(datapoints, dateToTest);
      const mostRecentDateMilli = dateMilli(mostRecent);
      const totalTime = targetDateMilli - startDateMilli;
      const timeElapsed = mostRecentDateMilli - startDateMilli;

      let expectedCompletionPC = percentageCompletion(startDateMilli, targetDateMilli, mostRecentDateMilli);
      let actualCompletionPC = percentageCompletion(startValue, target.value, mostRecent.value);
      //This is change as a percentage of expected change (100 = on track, > 100 = better than expected, < 100 = worse)
      //not as accurate as the regression, as it only uses the start and current value, not the trend
      //However, benefit is it doesnt care about anything except what hapopoend in the most recent entry,
      //so it acts as a report of teh most recent session or week, esp if filtered to only include datasetMeasures that are from that day or week etc
      let projectedCompletionPC = percentageDifference(expectedCompletionPC, actualCompletionPC);
      //apply any caps passed in
      if(minCompletion){
        //lower bound
        expectedCompletionPC = Math.max(expectedCompletionPC, minCompletion);
        actualCompletionPC = Math.max(actualCompletionPC, minCompletion);
        projectedCompletionPC = Math.max(projectedCompletionPC, minCompletion);
      }
      if(maxCompletion){
        //upper bound
        expectedCompletionPC = Math.min(expectedCompletionPC, maxCompletion);
        actualCompletionPC = Math.min(actualCompletionPC, maxCompletion);
        projectedCompletionPC = Math.max(projectedCompletionPC, minCompletion);
      }
      //for completeness, we get the values too (available on hover)
      //expected  -by the current date (or dateTotest) - if the target is to be met
      const expectedValue = startValue + (expectedCompletionPC / 100) * (target.value - startValue);
      //based on current rate, what % of target will be met
      const projectedValue = startValue + (projectedCompletionPC / 100) * (target.value - startValue);
      return {
          target,
          start:{
              date:startDate, 
              value:startValue, 
              completion:0
          },
          current:{
              date:date, 
              expectedValue:expectedValue, 
              expectedCompletion: Math.round(expectedCompletionPC),
              actualValue:mostRecent.value,
              actualCompletion:Math.round(actualCompletionPC)
          },
          projected:{
              date:target.date, 
              value:projectedValue,
              targetValue:target.value,
              completion:Math.round(projectedCompletionPC)
          }
      }
}