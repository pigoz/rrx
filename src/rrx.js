// @flow
import * as React from 'react';
import { Map } from 'immutable';

type Model<A> = A;
type Cmd<Type, Payload = undefined> = { type: Type, payload: Payload };

type RRXConfig<S, T> = $Exact<{
  init: () => [Model<S>, ?Cmd<T>],
  update: (x: Model<S>, y: Cmd<T>) => Model<T>,
  subscriptions?: (x: Model<S>) => Msg<T>
}>

export function rrx<P: {}, S: {}, T>({
  // P = Props
  // S = State
  // T = Messages Type Enum
  init,
  update,
  subscriptions
}: RRXConfig<S, T>) {
  return function rrxcurry(
    Wrapped: React.StatelessFunctionalComponent<{ state: S } & P>
  ): React.ComponentType<P> {

    class Container extends React.Component<P, S> {
      // Immutable.js object can't be a top level object of state
      state = { s: Map(init()[0]) };

      reduce = cmd => this.setState(state => ({ s: update(state.s, cmd) }))
      cmd = (type: T) => () => this.reduce({ type });

      componentDidMount() {
        if (!subscriptions) {
          return;
        }

        const source = subscriptions()
        // XXX add cleanup in willunmount
        source.subscribe(this.reduce)
      }

      render() {
        return (
          <Wrapped
            {...this.props}
            state={this.state.s}
            cmd={this.cmd}
          />
        )
      }
    }

    return Container;
  }
}
