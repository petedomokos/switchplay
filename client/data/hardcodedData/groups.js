import { DECK_SETTINGS } from "../../core/cards/constants"

const defaultStartValues = [
    { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
]

export const groups = {
    switchplay:[
        {
            key:"fitness",
            title:"Fitness",
            kpis:[
                { 
                    datasetKey:"dribbles", measureKey:"successfulDribbles",
                    order:"highest is best",
                    min:0,
                    max:30,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:8,
                    //playerStartValues:??? in mockDatabases, these are stored under each payer in group
                },
            ],
            deckSettings:DECK_SETTINGS,
            players:["606b2f1f3eecde47d8864798"]
        },
        {
            key:"basketball",
            title:"Basketball",
            kpis:[
                { 
                    datasetKey:"dribbles", measureKey:"successfulDribbles",
                    order:"highest is best",
                    min:0,
                    max:30,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:8,
                },
            ],
            deckSettings:DECK_SETTINGS,
            players:["606b2f1f3eecde47d8864798"]
        }
    ]  
}