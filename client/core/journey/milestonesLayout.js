import * as d3 from 'd3';
import kpisLayout from "./kpis/kpisLayout";
import { getTargets } from "../../data/targets";
import { addDays, addWeeks } from "../../util/TimeHelpers"
import { getURLForUser, GOAL_CTRLS } from './constants';



export default function milestonesLayout(){
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;
    let datasets = [];
    let info = {};
    let getURL = () => "";

    let aligned = false;
    let format = "actual";

    const myKpisLayout = kpisLayout();

    function update(data){
        //console.log("update milestonesLayout data----------------------------", data)
        return data.map((m,i) => {
            //console.log("milestone------", i, m.id)
            const { id, date, media, dateCount, playerAge, dataType, isPast, isCurrent, isFuture, settings, specificDate, onTrackStatus, goalPhotoLabel, profilePhotoLabel } = m;
            //add any profile properties onto kpis if required
            const kpis = m.kpis.map(kpi => ({ 
                ...kpi, /* what do we need? */ }));

            if(dataType === "profile"){
                myKpisLayout
                    .format(format)
                    .datasets(datasets)
                    .allKpisActive(m.isActive);

                const goalMedia = media.find(med => med.locationKey === "goal") || {};
                const profileMedia = media.find(med => med.locationKey === "profile") || {};
                return {
                    ...m,
                    i,
                    info:{ 
                        id, 
                        ...info, 
                        photos:{
                            goal:isCurrent ? null : [{ key:"goal", url:getURL(goalMedia.mediaId, "goal"), ...goalMedia }],
                            profile:[{ key:"profile", url:getURL(profileMedia.mediaId, "profile"), ...profileMedia }]
                        },
                        age:playerAge, 
                        isCurrent, isPast, isFuture, 
                        date, dateCount, 
                        settings, 
                        specificDate 
                    },
                    goal:{ ...m.goal, onTrackStatus, ctrlsData:GOAL_CTRLS() },
                    kpis:myKpisLayout(kpis),
                }
            }else{
                //must be a contract
                return m;
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
    update.getURL = function (f) {
        if (!arguments.length) { return getURL; }
        getURL = f;
        return update;
    };

    return update;
}