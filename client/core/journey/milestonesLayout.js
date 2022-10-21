import * as d3 from 'd3';
import kpisLayout from "./kpisLayout";

export default function milestonesLayout(){
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;
    let datasets = [];
    let info = {};

    let aligned = false;
    let format = "target-completion";

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

    function update(data){
        const now = new Date();
        const activeProfileId = data
            .filter(m => m.dataType === "profile")
            .find(p => p.date > now)
            ?.id;
        const activeContractId = data
            .filter(m => m.dataType === "contract")
            .find(c => c.date > now)
            ?.id;
        
        const isActive = m => m.dataType === "profile" ? m.id === activeProfileId : m.id === activeContractId; 
        
        return data.map((milestone,i) => {
            const { date, dataType, kpis } = milestone;

            const generalProps = {
                nr:i,
                isActive:isActive(milestone)
            }

            if(dataType === "profile"){
                //the key will determine if selected - we want this the same across all profile cards
                const keyedKpis = kpis.map(kpi => ({ ...kpi, key:kpi.kpiSetId }));
                myKpisLayout
                    .date(date)
                    .prevCardDate(i === 0 ? undefined : data[i - 1])
                    .format(format)
                    .datasets(datasets)
                    .allKpisActive(generalProps.isActive);

                return {
                    ...milestone,
                    ...generalProps,
                    info,
                    kpis:myKpisLayout(keyedKpis),
                }
            }else{
                //must be a contract
                return {
                    ...milestone,
                    ...generalProps,
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
    update.info = function (value) {
        if (!arguments.length) { return info; }
        info = value;
        return update;
    };

    return update;
}