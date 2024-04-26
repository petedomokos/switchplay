export const mockItem = {
  item1: {
    key: '',
    steps: [
      { id: 1, title: 'This is the first step to accomplish your goal', status: 'done' },
      { id: 2, title: 'Second step', status: 'pending' },
      { id: 3, title: 'Third step', status: 'pending' },
    ],
    stats: [
      { id: 1, statInfo: 73 },
      { id: 1, statInfo: 88 },
    ],
    attachments: {
      video: [
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/vMhk-Tt1tXU?si=_iiscXHozYlxnDki',
          comments: ['message one', 'message two'],
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/YyUskgVVB2c?si=-Rxs_ef4f1Axtzag',
          comments: ['message one', 'message two'],
        },
        {
          type: 'video',
          url: 'https://www.youtube-nocookie.com/embed/FiJ1R5f3frc?si=OCSTPCQa8EyB8HoS',
          comments: ['message one', 'message two'],
        },
      ],
      chart: [
        {
          type: 'chart',
          url: '../utils/charts/bar-chart.png',
          comments: ['message one', 'message two'],
        },
      ],
      image: [
        {
          type: 'image',
          url: '../utils/images/drawing.jpg',
          comments: ['one message'],
        },
      ],
      file: [
        {
          type: 'file',
          extension: 'pdf',
          name: 'Running-techniques1',
          url: '',
          
        },
        {
          type: 'file',
          extension: 'pdf',
          name: 'Running-techniques2',
          url: '',
        },
        {
          type: 'file',
          extension: 'pdf',
          name: 'Running-techniques3',
          url: '',
        },
      ],
    },
  },
};
