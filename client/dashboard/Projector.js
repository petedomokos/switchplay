import regression from 'regression'
import { addWeeks } from '../util/TimeHelpers'


//create to prototype so it can create multiple charts without creating copies

//bounds is a Array[2] with lower and upper numbers, in either order


//todo - to make regression work with neg values: if any actual values are negative, 
//find the smallest neg number, add its abs value
//onto every point, then calc the regression, then subtract it back off
//Projector.prototype.create = function(actualDatapoints, bounds){
export function createProjectedDatapoints(actualDatapoints, options={}){
	//console.log("actual", actualDatapoints)
	const { bounds, nrValues } = options;
	const defaultNrValues = 52;
	//sort by date
	const sortedData = actualDatapoints.sort((d1,d2) => (d1.date - d2.date))
	//console.log("sortedData", sortedData)

	let lowestPossY, highestPossY
	if(bounds && bounds.length == 2){
		lowestPossY = Math.min(...bounds)
		highestPossY = Math.max(...bounds)
	}else{
		const minY = Math.min(...actualDatapoints.map(d =>d .value))
		const maxY = Math.max(...actualDatapoints.map(d =>d .value))
		lowestPossY = minY - 0.5 * Math.abs(minY)
		highestPossY = maxY +0.5 * Math.abs(maxY)
	}
	//console.log("lowestPossY", lowestPossY)
	//console.log("highestPossY", highestPossY)
	if(actualDatapoints.length < 2)
		return []
	else{

		//get up to the last 4 entries (ie assume weeks for now)
		const latestEntries = actualDatapoints.slice(-4)
		const lastEntry = latestEntries[latestEntries.length -1]
		//format for regression func (assume weeks)
		const datapairs = latestEntries.map((d,i) => {
			return [i, d.value]
		})
		//console.log("datapairs", datapairs)
		//adjust first value if 0 as it doesnt work
		const ds = datapairs.map(d =>{
			if(d[1] == 0)
				return [d[0], 0.001]
			else
				return d
		})
		//console.log("ds", ds)
		//notes - for now, max is 100 but this will depend on zone thresholds
		const regressionFunc = regression.exponential(ds);
		const projectionArray = Array.from(new Array(nrValues || defaultNrValues), (val, n) => n+1)
		//console.log("projection array", projectionArray)
		//cushions avoid projections touch the edge of chart
		const lowestWithCushion = lowestPossY + 0.01 * Math.abs(lowestPossY)
		const highestWithCushion = highestPossY - 0.01 * Math.abs(highestPossY)
		//console.log("lowestwithcuhion", lowestWithCushion)
		//console.log("highestwithcushion", highestWithCushion)
		return projectionArray
			.map(n => regressionFunc.predict(n))
			.map(pair => {
				if(pair[1] > highestPossY){

					return [pair[0], highestWithCushion]
				}
				else if(pair[1] < lowestPossY)
					return [pair[0], lowestWithCushion]
				return pair
			})
			.map((pair,i) => {
				//console.log("pair", pair)
				//console.log("lastEntry x", lastEntry.date)
				return {
					date:addWeeks(pair[0], lastEntry.date),
					value:pair[1],
					key:actualDatapoints[0].key,
					isProjection:true,
					players: lastEntry.players || undefined,
					//use lastEntry to ensure id doesnt clash with other dataset
					_id:'proj-'+i +'-'+lastEntry._id
				}
			})
	}
}
