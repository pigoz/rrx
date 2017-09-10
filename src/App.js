// @flow
import Rx from 'rxjs';
import { Map } from 'immutable';
import React from 'react';
import logo from './logo.svg';
import { rrx } from './rrx';
import './App.css';

const App = ({ state, cmd }) =>
  <div className="App">
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>elapsed: {state.get('counter')} seconds</h2>
      <button className="App-button" onClick={cmd('increase')}>increase</button>
      <button className="App-button" onClick={cmd('reset')}>reset</button>
    </div>
  </div>

type T = 'tick' | 'increase' | 'reset';

const init = (props) => Map({ counter: 0 });

const update = cmd =>
  Rx.Observable.merge(
    cmd('tick').map(s => s.update('counter', v => v + 1)),
    cmd('reset').map(s => s.set('counter', 0)),
    cmd('increase')
      .delay(1000)
      .switchMap(s => Rx.Observable.of(s.update('counter', v => v + 1000)))
  )

const subscriptions = cmd =>
  Rx.Observable.interval(500).mapTo(cmd('tick'));

export default rrx({ init, update, subscriptions })(App);
