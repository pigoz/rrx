// @flow
import * as React from 'react';
import { Map } from 'immutable';

type Model<A> = A;
type Msg<Type, Payload> = { type: Type, payload: Payload };
type Cmd<Type, Payload> = { type: Type, payload: Payload };

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
      // Innutable.js object can't be a top level object of state
      state = { s: Map(init()[0]) };

      reduce = cmd =>
        this.setState(state => ({ s: update(state.s, cmd) }))

      componentDidMount() {
        if (!subscriptions) {
          return;
        }

        const source = subscriptions()
        source.subscribe(this.reduce)
      }

      render() {
        return <Wrapped {...this.props} state={this.state.s} />
      }
    }

    return Container;
  }
}
