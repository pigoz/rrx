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

export function rrx<P: {}, S: {}, T>({
  // P = Props
  // S = State
  // T = Messages Type Enum
  init,
  update,
  subscriptions,
}: RRXConfig<S, T>) {
  return function rrxcurry(
    Wrapped: React.StatelessFunctionalComponent<{ state: S } & P>
  ): React.ComponentType<P> {

    class Container extends React.Component<P, S> {
      state = { s: init() };
      subjects = {};

      reduce = cmd => this.setState(state => ({ s: update(state.s, cmd) }))

      cmd = (type: T) => {
        const cached = this.subjects[type]

        if (cached) {
          return cached;
        }

        const sub = new Rx.Subject();
        this.subjects[type] = sub;
        return sub;
      }

      dispatch = (type: T) => () => this.cmd(type).next();

      componentWillMount() {
        const subs = subscriptions(this.cmd);
        const events = update(this.cmd).startWith(init());

        subs.subscribe(subject => subject.next(this.state.s));
        events.subscribe(s => this.setState({ s }));
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
