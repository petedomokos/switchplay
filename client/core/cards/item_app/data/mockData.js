export const mockItem = {
  key: 'mock-item',
  steps: [
    { id: 1, title: 'First step to achieve my goal', status: 'done' },
    { id: 2, title: 'Second step', status: 'pending' },
    { id: 3, title: 'Third step', status: 'pending' },
  ],
  stats: [
    { 
      id: "1", 
      statInfo: 73,
      bands:[],
      barData:{
        dataEnd:undefined,
        dataStart:undefined,
        end:6,
        sectionsData:[
          {
            key:"target", label:"Target", startValue:0, endValue: 6, shouldDisplay:() => true, 
            opacity:0.7, fill:"none", stroke:"grey", rx:3.5, ry:3.5
          },
          {
            key:"expected", label:"Expected", startValue:0, endValue: 5, shouldDisplay:() => true, 
            opacity:0.7, fill:"red", stroke:"none", rx:3.5, ry:3.5
          },
          { 
            key:"current", label:"Achieved", startValue:0, endValue: 4, shouldDisplay:() => true, 
            opacity:1, fill:"grey", stroke:"none", rx:3.5, ry:3.5
          },
        ],
        standardsData:[],
        start:0,
        stepsData:[
        ]
      },
      datasetKey:"dribbles",
      datasetName:"Dribbles",
      deckRawValues:{
        bestPossible:30,
        start:0,
        target:6,
        worstPossible: 0
      },
      getValue:() => 0,
      groupTarget:8,
      key:"dribbles-successfulDribbles",
      max:30,
      measureKey:"successfulDribbles",
      min:0,
      nr:1,
      numbersData:[
        {
          key:"current", label:"Achieved", fill:"grey", value:4, shouldDisplay:() => true
        },
        {
          key:"Expected", label:"Expected", fill:"red", value:5, shouldDisplay:() => true
        }
      ],
      order:"highest is best",
      standards:[],
      statName:"Successful",
      stepsBarData:[],
      stepsNumberData:[],
      stepsTooltipsData:[],
      tooltipsData:[],
      values:{
        achieved:{ raw:2, completion:33 },
        expected:{ raw:3, completion:50 },
        start:{ raw:0, completion:0 },
        target:{ raw: 6, completion: 100 }

      }
      

    },
    //{ id: "2", statInfo: 88 },
  ],
  attachments: [
    {
      key:"1",
      type: 'video',
      url: 'https://www.youtube.com/embed/vMhk-Tt1tXU?si=_iiscXHozYlxnDki',
      comments: ['message one', 'message two'],
    },
    {
      key:"2",
      type: 'video',
      url: 'https://www.youtube.com/embed/YyUskgVVB2c?si=-Rxs_ef4f1Axtzag',
      comments: ['message one', 'message two'],
    },
    {
      key:"3",
      type: 'video',
      url: 'https://www.youtube-nocookie.com/embed/FiJ1R5f3frc?si=OCSTPCQa8EyB8HoS',
      comments: ['message one', 'message two'],
    },
    {
      key:"4",
      type: 'chart',
      url: '../../utils/charts/bar-chart.png',
      comments: ['message one', 'message two'],
    },
    {
      key:"5",
      type: 'image',
      url: '../utils/images/drawing.png',
      comments: ['one message'],
    },
    {
      key:"6",
      type: 'file',
      extension: 'pdf',
      name: 'Off-Ball-Runs',
      url: '',
      
    },
  ],
};
