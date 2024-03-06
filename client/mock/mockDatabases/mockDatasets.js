import uuid from 'react-uuid';

export const englandDatasets = [
    {
        _id:uuid(),
        admin:[],
        key:"dribbles",
        name:"Dribbles",
        initials:"Drib",
        measures:[{
            _id:uuid(),
            key:"successfulDribbles",
            name:"Successful",
            nr:"", side:"", custom:"", unit:"",
        }],
        datapoints:[
            //player Z
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"harrisonMurray-Campbell", values:[{ measureKey:"successfulDribbles", value:"5" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"harrisonMurray-Campbell", values:[{ measureKey:"successfulDribbles", value:"7" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"harrisonMurray-Campbell", values:[{ measureKey:"successfulDribbles", value:"6" }] },
            //player A
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"samAmo-Ameyaw", values:[{ measureKey:"successfulDribbles", value:"2" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"samAmo-Ameyaw", values:[{ measureKey:"successfulDribbles", value:"2" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"samAmo-Ameyaw", values:[{ measureKey:"successfulDribbles", value:"3" }] },
            //player B
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"michaelGolding", values:[{ measureKey:"successfulDribbles", value:"5" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"michaelGolding", values:[{ measureKey:"successfulDribbles", value:"7" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"michaelGolding", values:[{ measureKey:"successfulDribbles", value:"9" }] },
            //player C
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"finleyMcAllister", values:[{ measureKey:"successfulDribbles", value:"2" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"finleyMcAllister", values:[{ measureKey:"successfulDribbles", value:"7" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"finleyMcAllister", values:[{ measureKey:"successfulDribbles", value:"10" }] },
            //player D
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"chrisRigg", values:[{ measureKey:"successfulDribbles", value:"8" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"chrisRigg", values:[{ measureKey:"successfulDribbles", value:"10" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"chrisRigg", values:[{ measureKey:"successfulDribbles", value:"7" }] },
            //player E
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jaydenDanns", values:[{ measureKey:"successfulDribbles", value:"9" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jaydenDanns", values:[{ measureKey:"successfulDribbles", value:"11" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jaydenDanns", values:[{ measureKey:"successfulDribbles", value:"12" }] },
            //player F
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jimmy-JayMorgan", values:[{ measureKey:"successfulDribbles", value:"12" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jimmy-JayMorgan", values:[{ measureKey:"successfulDribbles", value:"14" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jimmy-JayMorgan", values:[{ measureKey:"successfulDribbles", value:"16" }] },
            //player G
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"default", values:[{ measureKey:"successfulDribbles", value:"6" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"default", values:[{ measureKey:"successfulDribbles", value:"7" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"default", values:[{ measureKey:"successfulDribbles", value:"8" }] },
        ]
    },
    {
        _id:uuid(),
        admin:[],
        key:"matchRuns",
        name:"Match Runs",
        initials:"Runs",
        measures:[
            {
                _id:uuid(),
                key:"sprints",
                name:"Sprints",
                nr:"", side:"", custom:"", unit:"",
            },
            {
                _id:uuid(),
                key:"highSpeedRuns",
                name:"High Speed Runs",
                nr:"", side:"", custom:"", unit:"",
            }
        ],
        datapoints:[
            //player A
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"sprints", value:"4" }, { measureKey:"highSpeedRuns", value:"6" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"sprints", value:"4" }, { measureKey:"highSpeedRuns", value:"7" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"sprints", value:"3" }, { measureKey:"highSpeedRuns", value:"6" }] 
            },
            //player B
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"sprints", value:"4" }, { measureKey:"highSpeedRuns", value:"8" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"sprints", value:"4" }, { measureKey:"highSpeedRuns", value:"8" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"sprints", value:"4" }, { measureKey:"highSpeedRuns", value:"9" }] 
            },
            //player C
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"sprints", value:"6" }, { measureKey:"highSpeedRuns", value:"8" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"sprints", value:"10" }, { measureKey:"highSpeedRuns", value:"10" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"sprints", value:"11" }, { measureKey:"highSpeedRuns", value:"14" }] 
            },
            //player D
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"sprints", value:"9" }, { measureKey:"highSpeedRuns", value:"15" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"sprints", value:"11" }, { measureKey:"highSpeedRuns", value:"16" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"sprints", value:"9" }, { measureKey:"highSpeedRuns", value:"15" }] 
            },
            //player E
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"sprints", value:"9" }, { measureKey:"highSpeedRuns", value:"12" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"sprints", value:"10" }, { measureKey:"highSpeedRuns", value:"14" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"sprints", value:"11" }, { measureKey:"highSpeedRuns", value:"15" }]
            },
            //player F
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"sprints", value:"11" }, { measureKey:"highSpeedRuns", value:"14" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"sprints", value:"12" }, { measureKey:"highSpeedRuns", value:"15" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"sprints", value:"14" }, { measureKey:"highSpeedRuns", value:"16" }]
            },
            //player G
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"sprints", value:"7" }, { measureKey:"highSpeedRuns", value:"9" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"sprints", value:"8" }, { measureKey:"highSpeedRuns", value:"10" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"sprints", value:"9" }, { measureKey:"highSpeedRuns", value:"11" }]
            },
        ]
    },
    {
        _id:uuid(),
        admin:[],
        key:"passes",
        name:"Passes",
        initials:"Pass",
        measures:[
            {
                _id:uuid(),
                key:"total",
                name:"Total",
                nr:"", side:"", custom:"", unit:"",
            },
            {
                _id:uuid(),
                key:"successPC",
                name:"Completion(%)",
                nr:"", side:"", custom:"", unit:"",
            }
        ],
        datapoints:[
            //player A
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"total", value:"8" }, { measureKey:"successPC", value:"55" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"total", value:"10" }, { measureKey:"successPC", value:"57" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"total", value:"6" }, { measureKey:"successPC", value:"60" }]
            },
            //player B
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"total", value:"10" }, { measureKey:"successPC", value:"55" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"total", value:"14" }, { measureKey:"successPC", value:"62" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"total", value:"16" }, { measureKey:"successPC", value:"75" }]
            },
            //player C
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"total", value:"8" }, { measureKey:"successPC", value:"65" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"total", value:"14" }, { measureKey:"successPC", value:"68" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"total", value:"18" }, { measureKey:"successPC", value:"78" }]
            },
            //player D
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"total", value:"14" }, { measureKey:"successPC", value:"70" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"total", value:"15" }, { measureKey:"successPC", value:"82" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"total", value:"13" }, { measureKey:"successPC", value:"65" }]
            },
            //player E
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"total", value:"10" }, { measureKey:"successPC", value:"55" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"total", value:"11" }, { measureKey:"successPC", value:"59" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"total", value:"14" }, { measureKey:"successPC", value:"62" }]
            },
            //player F
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"total", value:"16" }, { measureKey:"successPC", value:"85" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"total", value:"17" }, { measureKey:"successPC", value:"87" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"total", value:"20" }, { measureKey:"successPC", value:"89" }]
            },
            //player G
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"total", value:"15" }, { measureKey:"successPC", value:"70" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"total", value:"17" }, { measureKey:"successPC", value:"75" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"total", value:"19" }, { measureKey:"successPC", value:"80" }]
            },
        ]
    },
    {
        _id:uuid(),
        admin:[],
        key:"",
        name:"Attacks",
        initials:"att",
        measures:[
            {
                _id:uuid(),
                key:"nrAttacks",
                name:"Nr of Attacks",
                nr:"", side:"", custom:"", unit:"",
            },
            {
                _id:uuid(),
                key:"nrAttacksInSpaceToReceive",
                name:"Nr of Attacks In Space To Receive",
                nr:"", side:"", custom:"", unit:"",
            }
        ],
        datapoints:[
            //player Z
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"harrisonMurray-Campbell", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"harrisonMurray-Campbell", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"harrisonMurray-Campbell", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            //player A
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"samAmo-Ameyaw", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            //player B
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"michaelGolding", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            //player C
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"finleyMcAllister", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            //player D
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"chrisRigg", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            //player E
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jaydenDanns", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            //player F
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }] 
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"jimmy-JayMorgan", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            //player G
            { 
                _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
            { 
                _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"default", 
                values:[{ measureKey:"sprints", value:"" }, { measureKey:"highSpeedRuns", value:"" }]
            },
        ]
    },
]