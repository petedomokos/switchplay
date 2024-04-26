import React from 'react';

import { hydrate } from 'react-dom';
import './index.css';
import ItemApp from './ItemApp';
import reportWebVitals from './reportWebVitals';

hydrate(<ItemApp />, document.getElementById('root'));

reportWebVitals();
