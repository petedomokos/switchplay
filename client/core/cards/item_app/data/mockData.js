export const mockItem = {
  key: 'mock-item',
  steps: [
    { id: 1, title: 'This is the first step to accomplish your goal', status: 'done' },
    { id: 2, title: 'Second step', status: 'pending' },
    { id: 3, title: 'Third step', status: 'pending' },
  ],
  stats: [
    { id: "1", statInfo: 73 },
    { id: "2", statInfo: 88 },
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
