import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { SubstrateContextProvider } from './substrate-lib';

import App from './App';

ReactDOM.render(
  <Router>
    <SubstrateContextProvider>
      <App />
    </SubstrateContextProvider>
  </Router>,
  document.getElementById('root')
);
