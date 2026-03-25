# Galena

Lightning fast, framework agnostic state, that doesn't glue your state operations to your UI components!

Galena was originally designed to manage game state in TypeScript application with over 1000 stateful values. Existing state management utilities such as Zustand and Redux became cumbersome when modeling a huge amount of state and operations.

With Redux, the action-driven model became a juggling act of action names and tracing changes between them. With Zustand, the `create()` function felt limiting in the usage of JavaScript language constructs. It also lacked a construct for global application state.

## Installation

```
npm i @figliolia/galena
# with react
npm i @figliolia/react-galena
```

## Basic Usage

### The State Model

The instancable `State` object in Galena is easy to get started with and setup. It's effectively reactive wrapper around any value passed into it.

```typescript
import { State } from "@figliolia/galena";

const MyState = new State(/* any value */, /* middleware */);

const subscription = MyState.subscribe(value => {
  // do something with changed values
});

// to unsubscribe
subscription();

MyState.set(/* new value */);
MyState.update(previousValue => /* new value */);
MyState.reset(); // reset state back to the initial value
```

Instances of `State` are ultimately what compose all reactivity in Galena. They can exist as islands compose larger stateful model.

### The Galena Model

Creating Global application state(s) in Galena is simple. They are effectively just connected instances of your `State`'s.

```typescript
import { Galena, State } from "@figliolia/galena";

const AppState = new Galena(
  {
    navigation: new State({
      currentRoute: "/",
      navigationMenuOpen: false,
    }),
    user: new State({
      userID: "<id>",
      membershipTier: "free",
      friends: ["<id1>", "<id2>"],
    }),
    // ...and so on
  } /* middleware */,
);
```

From here, operations on any slice of state are type-aware and operable via a single construct:

```typescript
const subscriber = AppState.subscribe(
  ({
    state, // The entire state object at the time of change
    updated, // This individual State instance that was updated
  }) => {
    // react to state changes
  },
);

// to unsubscribe
subscription();

// to operate
AppState.get("user").update(state => ({
  ...state,
  friends: [...state.friends, "<new-friend-id>"],
}));

AppState.get("navigation").update(state => ({
  ...state,
  navigationMenuOpen: true,
}));
```

### Beyond the Basics

#### Models

`State` in Galena is designed for extension and instancing - a need that ultimately motivated the library's development.

Let's take a look at a working example

```typescript
import { State } from "@figliolia/galena";

export class MyGameState extends State<IMyGameState> {
  constructor(
    public readonly playerID: string,
    initialState?: Partial<IMyGameState>,
  ) {
    super({
      // ...default values for state
      score: 0,
      level: 1,
      // overrides for the current instance
      ...initialState,
    });
  }

  public incrementScore(byAmount: number) {
    this.mutate(state => {
      state.score + byAmount,
    });
  }

  public goToNextLevel() {
    this.mutate(state => {
      state.level + 1,
    });
  }

  private mutate(fn: (state: IMyGameState) => void) {
    state.update(previous => {
      const clone = {...previous};
      fn(clone);
      return clone;
    })
  }
}
```

This extension of state, can now be used any number of times throughout your application simply by calling

```typescript
import { MyGameState } from "./MyGameState";

const player1 = new MyGameState("<playerID>");
const player2 = new MyGameState("<playerID>");
```

Each instance has a shared API and defined set of state operations that make for predictable operability

This instances or robust models can also be used on your `Galena` instances

```typescript
import { Galena, State } from "@figliolia/galena";
import { MyGameState } from "./MyGameState";

const MyAppState = new Galena({
  navigation: new State({
    currentScreen: "/",
    navigationMenuOpen: false,
  }),
  player1: new MyGameState(),
  player2: new MyGameState(),
});

// Operate
MyAppState.get("player1").incrementScore(100);
MyAppState.get("player1").raiseLevel();
```

### Middleware

Middleware provides a developer API for building out robust tooling for your state.

Building an registering middleware is simple. Let's build a redux-style logger:

```typescript
import { Middleware, type State } from "@figliolia/galena";

export class Logger<T = any> extends Middleware<T> {
  private previousState: T | null = null;

  override onBeforeUpdate(state: State<T>) {
    // capture the previous state before an update takes place
    this.previousState = state.getSnapshot();
  }

  override onUpdate(state: State<T>) {
    // Log the time of mutation
    console.log(
      "%cMutation:",
      "color: rgb(187, 186, 186); font-weight: bold",
      "@",
      this.time,
    );
    // Log the previous state
    console.log(
      "   %cPrevious State",
      "color: #26ad65; font-weight: bold",
      this.previousState,
    );
    // Log the new state
    console.log(
      "   %cNext State    ",
      "color: rgb(17, 118, 249); font-weight: bold",
      state.getSnapshot(),
    );
  }

  private get time() {
    const date = new Date();
    const mHours = date.getHours();
    const hours = mHours > 12 ? mHours - 12 : mHours;
    const mins = date.getMinutes();
    const minutes = mins.toString().length === 1 ? `0${mins}` : mins;
    const secs = date.getSeconds();
    const seconds = secs.toString().length === 1 ? `0${secs}` : secs;
    const milliseconds = date.getMilliseconds();
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  }
}
```

Registering middleware is simple:

```typescript
import { Logger, Profiler } from "@figliolia/galena";

// To apply middleware to all instances of `State`
// attached to a `Galena` instance

const MyAppState = new Galena({
  // state
}, new Logger(), new Profiler());

// To apply middleware to a single of `State`
const MyState = new State(
  /* reactive value */,
  new Logger(),
  new Profiler()
);
```

In your console you'll now see logs like the following:
<img src="media/Logging.png" />
And Profiler warnings such as thing one
<img src="media/Profiling.png" />

### Frameworks

With State management tools, naturally comes frontend frameworks. Galena provides bindings for `React` through
the [react-galena](https://github.com/alexfigliolia/react-galena) library
