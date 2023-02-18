import { now } from "mongoose";

function dateIsValid(date) {
    return date instanceof Date && !isNaN(date);
}

const parseDateStr = dateStr => {
    const now = new Date();
    if(!dateStr){ return now; }
    const date = new Date(dateStr);
    //@todo - if date is invalid, should flag it to user instead of defaulting to now
    //this is a diff case to having no date, which can bee assumed to be deliberate
    if(!dateIsValid(date)){ return now; }
    const hrs = date.getHours();
    //djust hours at edges so timezones dont change the day
    if(hrs <= 1){ 
        date.setHours(2)
    }else if(hrs >= 23){
        date.setHours(22)
    }
    return date;
}

export function createDatapointsFromData(data, dataset){
    //console.log("createDsFromData", data, dataset)
    const nonValueCols = [
        "player",
        "players", 
        "date", 
        "notes", 
        "surface",
        "fatigueLevel",
        "isTarget"
    ];

    return data.map(d => {
        console.log("d", d)
        let datapoint = {};
        // need the non value properties to remain at top-level
        nonValueCols.forEach(col => {
            console.log("col", col)
            //if not defined, we must emit them so db will assign the default
            if(d[col]){
                if(col === "date"){
                    console.log("d[date]", d["date"], d[col])
                    datapoint[col] = parseDateStr(d[col]);
                }else{
                    datapoint[col] = d[col];
                }
            }
        })
        datapoint.values = data.columns
            .filter(col => col && !nonValueCols.includes(col))
            .filter(col => dataset.measures.find(m => m.key === col))
            .map(col => ({ 
                //legacy - uses measureid
                //warning - measure key may not be unique in legacy datasets
                measure: dataset.measures.find(m => m.key === col)._id,
                value:d[col] 
            }))

        return datapoint;
    })
}