

/**
* Desc ...
* @constructor
* @param {string} 
* @param {Object}
* @param {Object[]}  
* @param {number} 
**/

//date optional
export const addDays = (n, date) => {
	const clonedDate = date ? new Date(date.getTime()) : new Date()
	return new Date(clonedDate.setDate(clonedDate.getDate() + n) )
}
export const addWeeks = (n, date) => {
	const clonedDate = date ? new Date(date.getTime()) : new Date()
	return new Date(clonedDate.setDate(clonedDate.getDate() + (n * 7)))
}

export const startOfMonth = date => {
	const month = date.getMonth();
	const year = date.getFullYear();
	const startStr = year + "-" + (month + 1) + "-01";
	return new Date(startStr);
}

export const addMonths = (n, date) => {
	const clone = new Date(date.getTime());
	return new Date(clone.setMonth(clone.getMonth() + n));
}

export const addYear = (n, date) => addWeeks(n * 52, date);

export const diffInWeeks = (d1, d2) => {
    var t2 = d2.getTime()
    var t1 = d1.getTime()

    return parseInt((t2-t1)/(24*3600*1000*7))
}

export const sameDay = (date1, date2) => {
	return date1.getYear() === date2.getYear() &&
		   date1.getMonth() === date2.getMonth() &&
		   date1.getDate() === date2.getDate()
}

export const millisecondsToDays = ms =>{
	return ms / 86400000
}

export function idFromDates(dates){
	return dates
		.map(d => d.getTime() +"")
		.join("-")
}