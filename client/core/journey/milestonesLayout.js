import * as d3 from 'd3';
import kpisLayout from "./kpisLayout";

export default function milestonesLayout(){
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;
    let datasets = [];
    let kpis = [];
    let info = {};

    let aligned = false;
    let format = "progress";

    const myKpisLayout = kpisLayout();

    //helper
    const statValue = (date, statId, datapoints, method="latest") => {
        const relevantDatapoints = datapoints
            .filter(d => d.date <= date)
            .map(d => ({ ...d, value:d.values.find(v => v.measure === statId)?.value }))
            .map(d => ({ ...d, value:d.value ? +d.value : undefined }))
            .filter(d => d);

        //if(method === "latest"){
        //for now, assume latest only
        return d3.greatest(relevantDatapoints, d => d.date);
        //}
    }

    const ctrlsData = [
        { key: "progress", label:"Progress", isSelected:format === "progress" },
        { key: "compare", label:"Compare", isSelected:format === "compare" }
    ]

    function update(data){
        //console.log("update milestones data")
        
        return data.map((milestone,i) => {
            const { date, dataType } = milestone;
            if(dataType === "profile"){
                myKpisLayout
                    .date(date)
                    .prevCardDate(i === 0 ? undefined : data[i - 1])
                    .format(format)
                    .datasets(datasets);

                return {
                    nr:i,
                    ...milestone,
                    ctrlsData,
                    info,
                    kpis:myKpisLayout(kpis),
                }
            }else{
                //must be a contract
                return {
                    nr:i,
                    ...milestone
                }

            }
        });
    }

    update.aligned = function (value) {
        if (!arguments.length) { return aligned; }
        aligned = value;
        return update;
    };
    update.format = function (value) {
        if (!arguments.length) { return format; }
        //new value may be undefined in which case dont update it
        if(value){ format = value; }
        return update;
    };
    update.datasets = function (value) {
        if (!arguments.length) { return datasets; }
        datasets = value;
        return update;
    };
    update.kpis = function (value) {
        if (!arguments.length) { return kpis; }
        kpis = value;
        return update;
    };
    update.info = function (value) {
        if (!arguments.length) { return info; }
        info = value;
        return update;
    };

    return update;
}