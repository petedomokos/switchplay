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
            { _id:uuid(), date:"2024/06/28", /*sessionId:"",*/ player:"harrisonMurray-Campbell", values:[{ measureKey:"successfulDribbles", value:"5" }] },
            { _id:uuid(), date:"2024/07/03", /*sessionId:"",*/ player:"harrisonMurray-Campbell", values:[{ measureKey:"successfulDribbles", value:"7" }] },
            { _id:uuid(), date:"2024/07/11", /*sessionId:"",*/ player:"harrisonMurray-Campbell", values:[{ measureKey:"successfulDribbles", value:"6" }] },
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
            //{ date:"", sessionId:"", player:"", values:[] }
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
        datapoints:[]
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
                key:"successPC",
                name:"Completion(%)",
                nr:"", side:"", custom:"", unit:"",
            },
            {
                _id:uuid(),
                key:"total",
                name:"Total",
                nr:"", side:"", custom:"", unit:"",
            }
        ],
        datapoints:[
            //{ date:"", sessionId:"", player:"", values:[] }
        ]
    },
]