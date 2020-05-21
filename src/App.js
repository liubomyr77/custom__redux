import React, { createContext } from "react";
import "./styles.css";

function createStore(reducer, initialState) {
  return {
    _state: initialState,
    _reducer: reducer,
    _listeners: [],

    dispatch(action) {
      console.log(action);
      const nextState = this._reducer(this._state, action);
      this._state = nextState;

      this._trigerListeners();
    },

    getState() {
      return this._state;
    },

    subscribe(cb) {
      const listener = {
        id: new Date().getTime(),
        cb
      };

      this._listeners.push(listener);

      return () => {
        this._listeners = this._listeners.filter(i => i.id !== listener.id);
      };
    },

    _trigerListeners() {
      console.log(this._listeners.length);
      this._listeners.forEach(listener => {});
      this._listeners.forEach(listener => {
        listener.cb();
      });
    }
  };
}

const store = createStore(reducer, "PING");

function reducer(state, action) {
  console.log("action", action);
  if (action.type === "PING") {
    return "PONG";
  }
  return state;
}

const ReduxContext = createContext(null);
const { Provider: ContextProvider } = ReduxContext;

class Provider extends React.Component {
  render() {
    return (
      <ContextProvider value={this.props.store}>
        {this.props.children}
      </ContextProvider>
    );
  }
}

function connect(mapStateToProps, mapDispatchToProps) {
  console.log(mapStateToProps());
  return Component => {
    class Connect extends React.Component {
      constructor(props) {
        super(props);
        this.state = {};
      }
      componentDidMount() {
        console.log(mapStateToProps());
        this.disposer = this.context.subscribe(() => {
          const nextState = mapStateToProps(
            this.context.getState(),
            this.props
          );
          this.setState(nextState);
        });
      }
      componentWillUnmount() {
        // this.disposer();
      }
      render() {
        console.log(this.state);
        return <Component {...this.props} {...this.state} />;
      }
    }
    Connect.contextType = ReduxContext;
    return Connect;
  };
}
function App({ state }) {
  console.log("state" + state);
  return (
    <div className="App">
      <h3>{state}</h3>
      <button onClick={() => store.dispatch({ type: "PING" })}>Add</button>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    state
  };
}
const ConnectedApp = connect(mapStateToProps)(App);

export function Root() {
  return (
    <Provider store={store}>
      <ConnectedApp />
    </Provider>
  );
}
