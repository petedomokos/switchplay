import { greatest } from 'd3';
import { linearProjValue } from "./helpers";
import { addWeeks } from "../../util/TimeHelpers"

export default function barChartLayout(planet){
    const { startDate, targetDate } = planet;
    return planet.goals.map(g => {
        //ofr now, assue 1 datasetmeasure per goal
        const measure = g.datasetMeasures[0];
        //for now projValue is hardcoded
        const { startValue, targetValue } = measure;
        const { date, value } = greatest(measure.datapoints, d => d.date);
        //for now, ignore data points dates, just pretend they are 1 week after start for each planet
        const latestDate = addWeeks(1, startDate) //new Date(date);
        const actualchange = value - startValue;
        const targetChange = targetValue - startValue;
        const pcValue = targetChange === 0 ? 100 : +((actualchange / targetChange) * 100).toFixed(2);
        const projValue = linearProjValue(startDate.getTime(), startValue, latestDate.getTime(), value, targetDate.getTime(), 2)
        /*
        console.log("startValue", startValue)
        console.log("value", value)
        console.log("targetValue", targetValue)
        console.log("projValue", projValue)
        */
        const projPCChange = projValue - startValue;
        const projPCValue = targetChange === 0 ? 100 : +((projPCChange / targetChange) * 100).toFixed(2);
        //console.log("projPC", projPCValue)
        return {
            ...g,
            date,
            value,
            pcValue,
            //a linear projection for targetDate value, using a line from start to current
            projValue,
            projPCValue
        }
    })
}