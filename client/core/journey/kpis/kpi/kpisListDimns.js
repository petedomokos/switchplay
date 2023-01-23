export const kpisListDimns = (width, height, kpis, options={}) => {
    const {
        margin= { left:0, right: 0, top:0, bottom:0 },
        fixedSelectedKpiHeight
    } = options;

    //kpis list
    const kpiHeight = fixedKpiHeight || height/5;
    const openKpiHeight = fixedSelectedKpiHeight || height;
    const gapBetweenKpis = kpiHeight * 0.15;
    const kpiMargin = { top: gapBetweenKpis/2, bottom: gapBetweenKpis/2, left:0, right:0 }

    //kpi
    


    

    
}