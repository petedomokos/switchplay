import { DECK_SETTINGS } from "../../core/cards/constants"

export const groups = {
    england:{
        u18Men:{
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
                { 
                    datasetKey:"matchRuns", measureKey:"sprints",
                    order:"highest is best",
                    min:0,
                    max:20,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:8,
                },
                { 
                    datasetKey:"matchRuns", measureKey:"highSpeedRuns",
                    order:"highest is best",
                    min:0,
                    max:30,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:12,
                },
                { 
                    datasetKey:"passes", measureKey:"successPC",
                    order:"highest is best",
                    min:0,
                    max:100,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:75,
                },
                { 
                    datasetKey:"passes", measureKey:"total",
                    order:"highest is best",
                    min:0,
                    max:40,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:20,
                }
            ],
            deckSettings:DECK_SETTINGS,
            players:[
                //{ id:"tedCurd", firstName:"Ted", surname:"Curd", pos:"GK" },
                //{ id:"zachAbbot", firstName:"Zach", surname:"Abbot", pos:"DEF" },
                { 
                    _id:"harrisonMurray-Campbell", firstName:"Harrison", surname:"Murray-Campbell", position:"DEF",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                /*
                { 
                    _id:"tristanRowe", firstName:"Tristan", surname:"Rowe", position:"DEF",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"joshAcheampong", firstName:"Josh", surname:"Acheampong", pos:"DEF" ,
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                //{ id:"joeJohnson", firstName:"Joe", surname:"Johnson", pos:"DEF" },
                { 
                    _id:"jaydenMeghoma", firstName:"Jayden", surname:"Meghoma", pos:"DEF",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"samAmo-Ameyaw", firstName:"Samuel", surname:"Amo-Ameyaw", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"michaelGolding", firstName:"Michael", surname:"Golding", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"finleyMcAllister", firstName:"Finley", surname:"McAllister", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                }, 
                { 
                    _id:"chrisRigg", firstName:"Chris", surname:"Rigg", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"jaydenDanns", firstName:"Jayden", surname:"Danns", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"jimmy-JayMorgan", firstName:"Jimmy-Jay", surname:"Morgan", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"zakLovelace", firstName:"Zak", surname:"Lovelace", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"joelNDala", firstName:"Joel", surname:"NDala", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"tomWatson", firstName:"Tom", surname:"Watson", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                { 
                    _id:"justinOboavwoduo", firstName:"Justin", surname:"Oboavwoduo", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ]  
                },
                { 
                    _id:"archieStevens", firstName:"Archie", surname:"Stevens", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                    ] 
                },
                */
            ]
        },
    },
    teamReneeRegis:{
        main:{
            kpis:[],
            deckSettings:DECK_SETTINGS,
            players:[
                { 
                    _id:"reneeRegis", firstName:"Renee", surname:"Regis"
                }
            ]
        }
    }
}