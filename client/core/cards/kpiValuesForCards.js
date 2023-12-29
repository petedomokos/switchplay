import * as d3 from 'd3';
import { addDays, addYears, addMonths, addWeeks, calcDateCount, calcAge } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { convertToPC, round, roundDown, roundUp, getRangeFormat, dateIsInRange, getValueForStat, getGreatestValueForStat } from "../../data/dataHelpers";
import { linearProjValue } from "../journey/helpers";
import { isNumber, calcPCIntervalsFromValue } from '../../data/dataHelpers';
import { calcExpected, getStatValue } from "./kpiValuesHelpers"
import { DECK_SETTINGS } from './constants';

//next - make these work for what we need so far, using the existing code in helpers file if poss
const calcBestPossibleValue = kpi => kpi.order === "highest is best" ? kpi.max : kpi.min;
const calcWorstPossibleValue = kpi => kpi.order === "highest is best" ? kpi.min : kpi.max;

//export function hydrateJourneyData(data, user, datasets){
export const addKpiValuesToCards = (deck, datasets=[], deckIndex) => {
    //console.log("addKpiValuesToCards...deck", deck.player?._id, deck)
    //console.log("dsets", datasets)
    const { player, kpis=[], cards=[], settings=[] } = deck
    const settingsWithDefaults = [...DECK_SETTINGS, ...settings]
    if(cards.length === 0){ return cards; }

    const orderedCards = sortAscending(cards, d => d.date);
    const deckStartDate = deck.startDate || orderedCards[0].date;
    const deckEndDate = deck.endDate || orderedCards[orderedCards.length -1].date;
    //console.log("startdate enddate", deckStartDate, deckEndDate)
    //console.log("cardDates", orderedCards.map(c => c.date))

    //helper
    const getValue = (kpi, dateRange, dataMethod="mean", options={}) => {
        //console.log("getValue", kpi)
        //next - check datasets and points here for harrison...the ones ive created should come up for teh 1st 3 cards, one each
        //console.log("dset", datasets.find(dset => dset.key === kpi.datasetKey))
        const playerDatapointsInRange = datasets.find(dset => dset.key === kpi.datasetKey)
            ?.datapoints
            .filter(d => d.player === deck.player?._id)
            .filter(d => !d.isTarget)
            .filter(d => dateIsInRange(d.date, dateRange));

        const getDefaultDatapoints = () => datasets.find(dset => dset.key === kpi.datasetKey)
            ?.datapoints
            .filter(d => d.player === "default")
            .filter(d => !d.isTarget)
            .filter(d => dateIsInRange(d.date, dateRange));

        //temp - note, for future weeks, getDefaultDatapoints will also be empty
        const validDatapoints = playerDatapointsInRange.length !== 0 ? playerDatapointsInRange : getDefaultDatapoints();

        const _options = {
            ...options,
            dateRange, 
            dataMethod,
            completionCalcInfo:{
                startValue:kpi.deckRawValues?.start, targetValue:kpi.deckRawValues?.target
            },
            //temp for mock values
            deckIndex,
            playerId:player._id,
        }
        return getStatValue(kpi, validDatapoints, _options);
    }
    //console.log("adding deck values to kpi.........")
    const kpisWithDeckValues = kpis.map(kpi => { 
        const { customDeckStartValue } = kpi;
        //console.log("kpi------------------", kpi)
        const bestPossibleRawValue = calcBestPossibleValue(kpi);
        const worstPossibleRawValue = calcWorstPossibleValue(kpi);
        const dataset = datasets.find(dset => dset.key === kpi.datasetKey);
        const measure = dataset?.measures.find(m => m.key === kpi.measureKey);

        const start = isNumber(customDeckStartValue) ? customDeckStartValue : getValue(kpi, [addWeeks(-52, deckStartDate), deckStartDate], "latest")?.raw;

        return {
            ...kpi, 
            deckRawValues:{
                start,
                //target: isNumber(kpi.customTarget) ? kpi.customTarget : (isNumber(kpi.groupTarget) ? kpi.groupTarget : bestPossibleRawValue),
                target:Math.round(start * 1.25),
                bestPossible:bestPossibleRawValue,
                worstPossible:worstPossibleRawValue,
            },
            datasetName:dataset?.name || "",
            statName:measure?.name || "",
            getValue
        }
    });

    const cardOptions = {
        now: new Date(),
        rangeFormat: getRangeFormat(settingsWithDefaults.cardDateGranularity),
        deckStartDate,
        deckEndDate,
        getValue,
    };

    //recursive function
    const addValuesToNextCard = (remaining, addedSoFar) => {
        const next = remaining[0];
        //base case
        if(!next){ return addedSoFar; }
        const prevCardDate = addedSoFar[addedSoFar.length - 1]?.date;
        const nextAdded = addValuesToCard(next, kpisWithDeckValues, settingsWithDefaults, { ...cardOptions, prevCardDate });
        //recursive call
        return addValuesToNextCard(remaining.slice(1, remaining.length), [ ...addedSoFar, nextAdded])
    }
    //init call
    return addValuesToNextCard(orderedCards, []);
}

function addValuesToCard(card, kpis, settings, options){
    //console.log("addValuesToCard------------", card)
    const { date } = card;
    const { deckStartDate, deckEndDate, prevCardDate, getValue } = options;
    const cardStartDate = prevCardDate || deckStartDate;
    const dataMethod = settings.find(s => s.key === "achievedValueDataMethod").value;
    return { 
        ...card, 
        kpis:kpis.map(kpi => {
            const { deckRawValues, datasetName, statName, order } = kpi;
            //console.log("kpi...",kpi.key, kpi.order)
            const expectedOptions = { mustChange:true, order }
            const cardExpected = calcExpected(deckStartDate, deckRawValues.start, deckEndDate, deckRawValues.target, date, expectedOptions);
            const cardAchieved = getValue(kpi, [cardStartDate, date], dataMethod, { ...options, cardNr: card.cardNr });
            return {
                ...kpi,
                values:{
                    start:{ raw:deckRawValues.start, completion:0 },
                    target:{ raw:deckRawValues.target, completion:100 },
                    expected:cardExpected,
                    achieved:cardAchieved
                },
                datasetName,
                statName
            }

        })
    };
   
}

