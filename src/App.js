// @flow
import Rx from 'rxjs';
import React from 'react';
import logo from './logo.svg';
import { rrx } from './rrx';
import './App.css';

const App = ({ state }) =>
  <div className="App">
    {console.log('render', state.toJS())}
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>elapsed: {state.get('counter')} seconds</h2>
    </div>
  </div>

type T = 'tick';

const init = () =>
  [{ counter: 0 }, undefined]

const update = (state, cmd) => {
  switch (cmd.type) {
    case 'tick': 
      return state.update('counter', v => v + 1);
    default:
      return state;
  }
}

const subscriptions = () =>
  Rx.Observable
    .interval(500)
    .mapTo({ type: 'tick' })

export default rrx({ init, update, subscriptions })(App);
