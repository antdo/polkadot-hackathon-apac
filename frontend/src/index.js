import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { SubstrateContextProvider } from './substrate-lib';
import ClipboardJS from 'clipboard';

import App from './App';

new ClipboardJS('#clipboard-button');

ReactDOM.render(
  <Router>
    <SubstrateContextProvider>
      <App />
    </SubstrateContextProvider>
  </Router>,
  document.getElementById('root')
);
