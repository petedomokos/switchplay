import * as d3 from 'd3';
import { filterPathD, groupByPathD, trianglePolygonPoints, arrowPathD, equalsPathD } from "./icons";

export const planetsData = [
    {
        name:"Sites", 
        id:"sites",
        properties:[
            {
                name:"Region", id:"region", valueType:"enum", options:["UK", "EU", "USA"]
            },
            {
                name:"Type", id:"type", valueType:"enum", options:["Primary", "Secondary", "Tertiary"]
            }
        ]
    },
    {
        name:"Devices", 
        id:"devices",
        properties:[
            {
                name:"Creation Date", id:"creationDate", valueType:"date", range:[] //2d array
            },
            {
                name:"LDOS", id:"ldos", valueType:"date", range:[] //2d array
            },
            {
                name:"Risk Score", id:"risk", valueType:"number", options:[1, 2, 3, 4, 5]
            }
        ]
    }
]

export function getPropValueType(planetId, propertyId){
    if(!propertyId || !planetId) { return undefined;}
    const planet = planetsData.find(p => p.id ===planetId);
    return planet.properties.find(p => p.id === propertyId)?.valueType
}

export const returnOptions = [
    {id:"total", name:"Total"},
    {id:"min", name:"Min"},
    {id:"max", name:"Max"},
    {id:"mean", name:"Mean"},
    {id:"median", name:"Median"},
    {id:"stdDev", name:"Std Dev"},
    {id:"if", name:"if..."},
    {id:"?1", name:"?"},
    {id:"?2", name:"?"}
]

export const funcs = [
    { id:"homeSel", name:"Select", icon:{ nodeType:"path", d:arrowPathD } },
    { id:"sel", name:"Select", icon:{ nodeType:"path", d:arrowPathD } },
    { id:"filter", name:"Filter", icon:{ nodeType:"path", d:filterPathD } },
    //{ id:"groupBy", name:"Group", icon:{ nodeType:"path", d:groupByPathD } },
    { id:"agg", name:"Agg", icon:{ nodeType:"polygon", points:trianglePolygonPoints },
        subFuncs:[
            {id:"count", name:"Count", f:data => data.length, applicableTo:["all"]},
            {id:"sum", name:"Sum", f:d3.sum, applicableTo:["Number"]},
            {id:"min", name:"Min", f:d3.min, applicableTo:["Number", "Date"]},
            {id:"max", name:"Max", f:d3.max, applicableTo:["Number", "Date"]},
            {id:"mean", name:"Mean", f:(data, g) => d3.mean(data, g).toFixed(2), applicableTo:["Number"]},
            {id:"sd", name:"Std Dev", f:(data, g) => d3.deviation(data, g).toFixed(2), applicableTo:["Number"]}
        ] 
    },
    //{ id:"map", name:"Map", icon:{ nodeType:"path", d:arrowPathD } },
]

export function availableFuncs(funcs, blockData){
    if(!blockData.prev){
        return [];
    }
    //remove homeSel
    return funcs.filter(f => f.id !== "homeSel" && f.id !== "sel"); //dont need a select icon
}

export function areRelated(inst1, inst2){
    //if same planet, then are related automatically
    if(inst1.planetId === inst2.planetId){ return true };
    //helper
    const isAProperty = (keyToTest, instance) =>
        Object.keys(instance.propertyValues).includes(keyToTest)
    
    if(isAProperty(inst1.planetId, inst2)){
        const values = inst2.propertyValues[inst1.planetId]//.includes(inst1.id))
        //display name is the uId for each instance
        if(values.includes(inst1.displayName)){
            //inst2 has an array property that stores refs to instances of the inst1 planet
            //AND inst1 is in that array
            //console.log("true 1")
            return true;
        }
    }
    if(isAProperty(inst2.planetId, inst1)){
        const values = inst1.propertyValues[inst2.planetId];
        if(values.includes(inst2.displayName)){
            //inst1 has an array property that stores refs to instances of the inst2 planet
            //AND inst2 is in that array
            //console.log("true 2")
            return true;
        }
    }
    //console.log("false")
    return false;
}

export function getInstances(planetId){
    switch(planetId){
        case "sites": return siteInstances;
        case "devices": return deviceInstances;
        default:return undefined;
    }

}

const siteInstances = [
    {
        planetId:"sites",
        displayName:"site1", 
        propertyValues:{
            "region":"UK",
            "type":"Primary",
            "devices":["dev1", "dev3", "dev4"] //q how is this in the actual app?
        }
    },
    {
        planetId:"sites",
        displayName:"site2", 
        propertyValues:{
            "region":"USA",
            "type":"Primary",
            "devices":["dev1", "dev2", "dev4", "dev5"]
        }
    },
    {
        planetId:"sites",
        displayName:"site3", 
        propertyValues:{
            "region":"UK",
            "type":"Secondary",
            "devices":["dev1", "dev3", "dev4", "dev5"]
        }
    },
    {
        planetId:"sites",
        displayName:"site4", 
        propertyValues:{
            "region":"UK",
            "type":"Secondary",
            "devices":["dev1", "dev1", "dev2", "dev1", "dev1", "dev1", "dev2", "dev1"]
        }
    },
    {
        planetId:"sites",
        displayName:"site5", 
        propertyValues:{
            "region":"UK",
            "type":"Secondary",
            "devices":["dev5", "dev3", "dev4", "dev5", "dev4", "dev5", "dev5", "dev5", "dev4", "dev5"]
        }
    },
    {
        planetId:"sites",
        displayName:"site6", 
        propertyValues:{
            "region":"USA",
            "type":"Primary",
            "devices":["dev1", "dev3"]
        }
    },
    {
        planetId:"sites",
        displayName:"site7", 
        propertyValues:{
            "region":"UK",
            "type":"Primary",
            "devices":["dev4", "dev5"]
        }
    },
    {
        planetId:"sites",
        displayName:"site8", 
        propertyValues:{
            "region":"UK",
            "type":"Primary",
            "devices":["dev3", "dev3", "dev3", "dev3", "dev3", "dev3", "dev3",]
        }
    },


]

const deviceInstances = [
    {
        planetId:"devices",
        displayName:"dev1", 
        propertyValues:{
            "creationDate":"12/02/2018",
            "ldos":"27/05/2021",
            "risk":"1"
        }
    },
    {
        planetId:"devices",
        displayName:"dev2", 
        propertyValues:{
            "creationDate":"09/21/2018",
            "ldos":"27/09/2021",
            "risk":"4"
        }
    },
    {
        planetId:"devices",
        displayName:"dev3", 
        propertyValues:{
            "creationDate":"01/16/2018",
            "ldos":"10/05/2021",
            "risk":"5"
        }
    },
    {
        planetId:"devices",
        displayName:"dev4", 
        propertyValues:{
            "creationDate":"05/01/2019",
            "ldos":"16/09/2022",
            "risk":"5"
        }
    },
    {
        planetId:"devices",
        displayName:"dev5", 
        propertyValues:{
            "creationDate":"11/14/2019",
            "ldos":"20/12/2022",
            "risk":"3"
        }
    },
    
]