// @flow
import Rx from 'rxjs';
import * as React from 'react';

type Model<A> = A;
type Cmd<Type, Payload = undefined> = { type: Type, payload: Payload };

type RRXConfig<S, T> = $Exact<{
  init: () => [Model<S>, ?Cmd<T>],
  update: (x: Model<S>, y: Cmd<T>) => Model<T>,
  subscriptions?: (x: Model<S>) => Msg<T>
}>

Rx.Observable.prototype.tap = function tap(msg) {
  return this.map(s => {
    console.log(msg, s);
    return s;
  });
};

Rx.Observable.prototype.state = function state(selector) {
  return this.map(s => selector(s()));
};

export function rrx<P: {}, S: {}, T>({
  // P = Props
  // S = State
  // T = Messages Type Enum
  init,
  update,
  effects,
}: RRXConfig<S, T>) {
  return function rrxcurry(
    Wrapped: React.StatelessFunctionalComponent<{ state: S } & P>
  ): React.ComponentType<P> {

    class Container extends React.Component<P, S> {
      state = { s: init() };
      subjects = {};

      cmd = (type: T) => {
        const cached = this.subjects[type]

        if (cached) {
          return cached;
        }

        const sub = new Rx.Subject();
        this.subjects[type] = sub;
        return sub;
      }

      getState = () => this.state.s;

      dispatch = (type: T) => () =>
        this.cmd(type).next(this.getState);

      componentWillMount() {
        const eff = effects(this.cmd);
        const upd = update(this.cmd);
        eff.subscribe(subject => subject.next(this.getState));
        upd.subscribe(s => this.setState({ s }));
      }

      render() {
        return (
          <Wrapped
            {...this.props}
            state={this.state.s}
            cmd={this.dispatch}
          />
        )
      }
    }

    return Container;
  }
}
