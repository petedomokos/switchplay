export function createDatapointsFromData(data, dataset){
    console.log("createDsFromData", data, dataset)
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
        let datapoint = {};
        // need the non value properties to remain at top-level
        nonValueCols.forEach(col => {
            //if not defined, we must emit them so db will assign the default
            if(d[col]){
                datapoint[col] = d[col];
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