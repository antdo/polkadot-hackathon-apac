import React, { useState, createRef } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import ChainState from './pages/ChainState'

export default function App() {
  return (
    <Router>
      foo
      <Switch>
        <Route path="/">
          <ChainState/>
        </Route>
      </Switch>
    </Router>
  )
}
