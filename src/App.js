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
      <h2>counter: {state.get('counter')}</h2>
      <h2>resets: {state.get('resets')}</h2>
      <h2>ticks: {state.get('ticks')}</h2>
      <button className="App-button" onClick={cmd('increase')}>increase</button>
      <button className="App-button" onClick={cmd('reset')}>reset</button>
    </div>
  </div>

const init = (props) => Map({ counter: 0, resets: 0, ticks: 0 });

const incr = v => v + 1;
const tap = (msg) => (x) => { console.log(msg, x); return x; }

const update = cmd =>
  Rx.Observable.merge(
    cmd('tac').state(s => s.update('ticks', incr)),
    cmd('tick').state(s => s.update('counter', incr)),
    cmd('reset').state(s => s.set('counter', 0).update('resets', incr)),
    cmd('increase')
      .debounceTime(1000)
      .takeUntil(cmd('reset'))
      .state(s => s.update('counter', v => v + 1000)),
  );

const effects = (cmd) =>
  Rx.Observable.merge(
    Rx.Observable.interval(500).mapTo(cmd('tick')),
    cmd('tick').mapTo(cmd('tac')),
  );

export default rrx({ init, update, effects })(App);
