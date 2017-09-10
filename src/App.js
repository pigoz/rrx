// @flow
import Rx from 'rxjs';
import React from 'react';
import logo from './logo.svg';
import { rrx } from './rrx';
import './App.css';

const App = ({ state, cmd }) =>
  <div className="App">
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>elapsed: {state.get('counter')} seconds</h2>
      <button className="App-reset" onClick={cmd('reset')}>reset</button>
    </div>
  </div>

type T = 'tick' | 'reset';

const init = () =>
  [{ counter: 0 }, undefined]

const update = (state, cmd) => {
  switch (cmd.type) {
    case 'tick':
      return state.update('counter', v => v + 1);
    case 'reset':
      return state.set('counter', 0);
    default:
      return state;
  }
}

const subscriptions = () =>
  Rx.Observable
    .interval(500)
    .mapTo({ type: 'tick' })

export default rrx({ init, update, subscriptions })(App);
