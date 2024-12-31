import { sortAscending, sortDescending } from '../../util/ArrayHelpers';

//note i starts at 0, as does rowNr and colNr
const calcRowNr = (i, nrCols) => Math.floor(i / nrCols);
const calcColNr = (i, nrCols) => i % nrCols;

//console.log("10 items in grid of 2 cols", colNr(9, 2), colNr(2,2))
//@todo rewrite as a proper d3 layout function instead of using settings as a parameter
export const quadrantBarChartLayout = (chartsData, settings={}) => {
    //console.log("data....", data)
    const { nrCols } = settings;
    return chartsData.map((chartData,i) => ({
        ...chartData,
        quadrantsData:chartData.quadrantsData.map((quadrantData, j) => ({
            key:`quad-${j+1}`,
            i:j,
            ...quadrantData,
            values: j == 0 || j == 2 ? sortAscending(quadrantData.values, v => v.value) : sortDescending(quadrantData.values, v => v.value)
        })),
        i,
        rowNr:calcRowNr(i, nrCols),
        colNr:calcColNr(i, nrCols)
    }))
}