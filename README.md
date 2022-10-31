# Galena

Galena is a lightning fast framework-agnostic state manager that comes in at less than 5kb minified. Galena gets its speed from two primary design decisions:

1. Mutable state updates - Galena will never require you to create shallow or deep copies of your state before your update it. With Galena your state updates occur in O(1) space.
2. An event emitter - Galena uses an event emitter to handle internal reconciliations of state. No more deep object comparisons required to figure out what changed.

Galena supports the notion of a global application state through `Empire's`. Each time you create a fragment of application state, your `Empire` gains access to it. This means you can interface with your application state either through your `Empire` (your combined `State` fragments) or by using the individual fragments themselves. It also promotes the idea of lazy global state by default. As you may know, in many global application state managers, you are required to declare the vast majority of your state tree upfront, or incur a somewhat severe complexity increase caused by lazy injection. In Galena, no such complexity exist.

### Getting Started

```bash
npm i -S galena
# or
yarn add galena
```

#### Creating A State Fragment

First, initialize an `Empire`. `Empires` hold your application state. You can have any number of `Empires`, but in most cases, a single `Empire` is enough

```Typescript
import { Empire } from 'galena';

export const AppEmpire = new Empire();
```

Once your `Empire` is initialized, add a `State` instance to it

```TypeScript
import { State } from 'galena';
import { AppEmpire } from './AppEmpire';

export class MyState extends State<IMyState> {
  constructor() {
    // Pass your app empire, a state alias, and the state structure
    // to the super call
    super(AppEmpire, "my-state", {
      toggle: true,
      authenticated: false,
      username: ""
      // ... any state keys you require
    });
  }

  setUsername(username: string) {
    this.update((state: IMyState) => {
      state.username = username;
    });
  }

  async getUserName() {
    const response = await fetch("api/username");
    this.setUsername(await response.text());
  }
}
```

#### Accessing and Updating State

Accessing and updating `MyState` can be done by leveraging your `MyState` class instance or your `Empires`.

Using `MyState`:

```TypeScript
import { MyState } from './MyState';

// Get the latest updates to MyState
MyState.subscribe(state => {
  // called any time MyState is updated
});

// Return the current value of MyState
MyState.state

// Update MyState
MyState.update(state => {
  // state.toggle = true
});
```

Using `Empires`:

```TypeScript
// Using Empire
import { AppEmpire } from './AppEmpire';

AppEmpire.getState("my-state").subscribe(state => {
  // get the latest updates to MyState
});

AppEmpire.getState("my-state").state // returns the current value of MyState

// Mutate MyState
Empire.getState("my-state").update(state => {
  // state.toggle = true
});
```

Note: for usage with `React`, please checkout our `galena-react` library!

#### More on Speed:

Galena is also smart enough to emit state updates based on internal subscription patterns. Because Galena creates living fragments from your global state object, your subscriptions can be differentiated from one another based upon the state it consumes. This is what allows Galena to be lightning fast compared to other state libraries!

Your State consumers never recompute unless you explicitly update the state they consume. This means your components and subscribers will never require complex memoization in order to prevent wasteful rerenders or dead computations (cough _redux_ cough).
