import { DECK_SETTINGS } from "../../core/cards/constants"

const defaultStartValues = [
    { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
    { datasetKey:"matchRuns", measureKey:"sprints", value:6 },
    { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:8 },
    { datasetKey:"passes", measureKey:"total", value:14 },
    { datasetKey:"passes", measureKey:"successPC", value:65 },
]
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
                    datasetKey:"passes", measureKey:"total",
                    order:"highest is best",
                    min:0,
                    max:40,
                    bands:[],
                    standards:[],
                    accuracyPowerOfTen:0,
                    groupTarget:20,
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
                }
            ],
            deckSettings:DECK_SETTINGS,
            players:[
                //{ id:"tedCurd", firstName:"Ted", surname:"Curd", pos:"GK" },
                //{ id:"zachAbbot", firstName:"Zach", surname:"Abbot", pos:"DEF" },
                //player Z
                { 
                    _id:"harrisonMurray-Campbell", firstName:"Harrison", surname:"Murray-Campbell", position:"DEF",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:5 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                        { datasetKey:"passes", measureKey:"successPC", value:50 },
                    ] 
                },
                { 
                    _id:"tristanRowe", firstName:"Tristan", surname:"Rowe", position:"DEF",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"joshAcheampong", firstName:"Josh", surname:"Acheampong", pos:"DEF" ,
                    kpiStartValues:defaultStartValues
                },
                //{ id:"joeJohnson", firstName:"Joe", surname:"Johnson", pos:"DEF" },
                { 
                    _id:"jaydenMeghoma", firstName:"Jayden", surname:"Meghoma", pos:"DEF",
                    kpiStartValues:defaultStartValues
                },
                //player A
                { 
                    _id:"samAmo-Ameyaw", firstName:"Samuel", surname:"Amo-Ameyaw", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:2 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:4 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:6 },
                        { datasetKey:"passes", measureKey:"total", value:7 },
                        { datasetKey:"passes", measureKey:"successPC", value:54 },
                    ] 
                },
                //player B
                { 
                    _id:"michaelGolding", firstName:"Michael", surname:"Golding", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:3 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:4 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:8 },
                        { datasetKey:"passes", measureKey:"total", value:6 },
                        { datasetKey:"passes", measureKey:"successPC", value:45 },
                    ] 
                },
                //player C
                { 
                    _id:"finleyMcAllister", firstName:"Finley", surname:"McAllister", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:5 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:8 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                        { datasetKey:"passes", measureKey:"successPC", value:60 },
                    ] 
                }, 
                //player D
                { 
                    _id:"chrisRigg", firstName:"Chris", surname:"Rigg", pos:"MID",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:6 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:8 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:12 },
                        { datasetKey:"passes", measureKey:"total", value:12 },
                        { datasetKey:"passes", measureKey:"successPC", value:60 },
                    ] 
                },
                //player E
                { 
                    _id:"jaydenDanns", firstName:"Jayden", surname:"Danns", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:7 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:7 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:10 },
                        { datasetKey:"passes", measureKey:"total", value:8 },
                        { datasetKey:"passes", measureKey:"successPC", value:51 },
                    ] 
                },
                //player F
                { 
                    _id:"jimmy-JayMorgan", firstName:"Jimmy-Jay", surname:"Morgan", pos:"FOR",
                    kpiStartValues:[
                        { datasetKey:"dribbles", measureKey:"successfulDribbles", value:11 },
                        { datasetKey:"matchRuns", measureKey:"sprints", value:9 },
                        { datasetKey:"matchRuns", measureKey:"highSpeedRuns", value:12 },
                        { datasetKey:"passes", measureKey:"total", value:14 },
                        { datasetKey:"passes", measureKey:"successPC", value:75 },
                    ] 
                },
                { 
                    _id:"zakLovelace", firstName:"Zak", surname:"Lovelace", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"joelNDala", firstName:"Joel", surname:"NDala", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"tomWatson", firstName:"Tom", surname:"Watson", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"justinOboavwoduo", firstName:"Justin", surname:"Oboavwoduo", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"archieStevens", firstName:"Archie", surname:"Stevens", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"zakLovelace2", firstName:"Zak", surname:"Lovelace", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"joelNDala2", firstName:"Joel", surname:"NDala", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"tomWatson2", firstName:"Tom", surname:"Watson", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"justinOboavwoduo2", firstName:"Justin", surname:"Oboavwoduo", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"archieStevens2", firstName:"Archie", surname:"Stevens", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"zakLovelace3", firstName:"Zak", surname:"Lovelace", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"joelNDala3", firstName:"Joel", surname:"NDala", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"tomWatson3", firstName:"Tom", surname:"Watson", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"justinOboavwoduo3", firstName:"Justin", surname:"Oboavwoduo", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"archieStevens3", firstName:"Archie", surname:"Stevens", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"zakLovelace4", firstName:"Zak", surname:"Lovelace", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"joelNDala4", firstName:"Joel", surname:"NDala", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"tomWatson4", firstName:"Tom", surname:"Watson", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                /*
                { 
                    _id:"justinOboavwoduo4", firstName:"Justin", surname:"Oboavwoduo", pos:"FOR",
                    kpiStartValues:defaultStartValues
                },
                { 
                    _id:"archieStevens4", firstName:"Archie", surname:"Stevens", pos:"FOR",
                    kpiStartValues:defaultStartValues
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