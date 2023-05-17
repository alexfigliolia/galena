# Galena
Lightning fast platform agnostic state! Galena is a one-stop-shop for creating reactive state that supports your global application or individually isolated features. Galena operates on the premise of pub-sub and mutability allowing for significantly higher performance over more traditional state management utilities. 

In Galena, your state architecture is a composition of reactive units that can be declared at any point in your application lifecycle. Your units of state can exist in isolation (similar to React Contexts) or as part of one or more global application states (similar to Redux). Galena offers a global application state solution that supports on-demand initialization, performant updates, and rich development API - without tons of boilerplate!

## Getting Started

### Installation
```bash
npm install --save galena
# or
yarn add galena
```

### Creating Your Global Application State
#### Instantiating Galena

```typescript
// AppState.ts
import { Galena, Logger, Profiler } from "galena";
import type { Middleware } from "galena";

const middleware: Middleware[] = [];

if(process.env.NODE_ENV === "development") {
  middleware.push(new Logger(), new Profiler())
}

// Initialize Galena State!
export const AppState = new Galena(middleware);
```

### Creating a Unit of State
```typescript
// NavigationState.ts
import { AppState } from "./AppState.ts";

// Compose a unit of state attached to your Galena Instance
export const NavigationState = AppState.composeState("navigation", {
  // initial state
  currentRoute: "/",
  userID: "123",
  permittedRoutes: ["**/*"]
});
```

Creating units of state using `AppState.composeState()` will automatically scope your new unit of state to your `Galena` instance. You may then access, subscribe, and update your state using using either `AppState` or the returned `State` object from `AppState.composeState()`

```typescript
// BusinessLogic.ts 
import { AppState } from "./AppState.ts";

AppState.subscribe("navigation", appState => {
  const navigationState = appState.get("navigation");
  // React to changes to Navigation state
});

// Set Navigation State!
AppState.update("navigation", state => {
  state.currentRoute = "/contact-us";
});
```

You may also create units of state that are *not* connected to your "global" `Galena` instance. To promote flexibility for developers to organize their state however they wish, `Galena`'s `State` interface is available to be imported directly. Spawning units of `State` using `new State(...args)` creates an isolate unit of state - unknown to your `Galena` instance. This technique can be convenient for applying `Galena`'s `State` API's to an isolated feature.

```typescript
import { State } from "galena";

// Create Your Isolated State instance
const FeatureState = new State("myFeature", {
  // initial state
  list: [1, 2, 3];
});

FeatureState.subscribe((state) => {
  // React to FeatureState changes!
});

FeatureState.update((state) => {
  // Update feature state!
  state.list.push(state.list.length);
});
```

## Mutation and Subscriptions

### Mutating State Values
You can update your state using `Galena` or `State` instances

#### Mutating State Using Your Galena Instance
```typescript
// business-logic.ts
import { AppState } from "./AppState.ts";

AppState.update("navigation", (state, initialState) => {
  state.currentRoute = "/user-profile";
});
```

#### Mutating State Using Your Navigation Instance
```typescript
// business-logic.ts
import { NavigationState } from "./NavigationState.ts";

NavigationState.update((state, initialState) => {
  state.currentRoute = "/user-profile";
});
```

Running mutations using individual units of state will automatically update your `Galena` instance's state!

### Subscribing to State Changes

#### Subscribing to Your Global Application State
```typescript
// business-logic.ts
import { AppState } from "./AppState.ts";

const subscriptionID = AppState.subscribeAll(state => {
  const navState = state.get("navigation");
  // React to changes to "navigation" state (or any other registered
  // unit of state)
});

// When the subscription is no longer needed
AppState.unsubscribeAll(subscriptionID);
```

#### Subscribing to a Unit of State using your Galena Instance
```typescript
// business-logic.ts
import { AppState } from "./AppState.ts";

const subscriptionID = AppState.subscribe("navigation", state => {
  // React to changes to "navigation" state (or any other registered
  // unit of state)
});

// When the subscription is no longer needed
AppState.unsubscribe(subscriptionID);
```

#### Subscribing to a Unit of State using your State Instance
```typescript
// business-logic.ts
import { NavigationState } from "./NavigationState.ts";

const subscriptionID = NavigationState.subscribe(state => {
  const { userID, currentRoute, permittedRoutes } = state.getState();
  // do something with your "navigation" state updates!
});

// When the subscription is no longer needed
NavigationState.unsubscribe(subscriptionID);
```

### API Reference

#### Galena
Instances of `Galena` behave as a container for `State` instances. Your `Galena` instance can contain any number of `State`'s and is designed to replicate the "global" application state pattern, without the performance hit incurred when making complex mutations to large state objects.

Because your "global" application state using `Galena` is simply the composition of multiple `State` instances, your state exists in the form of operable sub-structures that can be individually subscribed to and mutated. This means, mutating one piece of your `State` does not effect other pieces of your `State`. All changes are isolated and safe from side-effects.

```typescript
import { Galena, Logger, Profiler } from "galena";
import type { State } from "galena";

const AppState = new Galena(/* middleware */ [new Logger(), new Profiler()]);

/**
 * Compose State 
 * 
 * Creates unit of `State` connected to your `Galena` instance.
 * Returns the unit of `State`
*/
AppState.composeState("nameOfState" /* unique name */, /* initial state */, /* Optional Model */);

/**
 * Get 
 * 
 * Returns a connected unit of `State` by name
*/
AppState.get("nameOfState");

/**
 * Update
 * 
 * Mutates a unit of state by name
*/
AppState.update("nameOfState", (state) => {});

/**
 * Subscribe
 * 
 * Registers a subscription on a unit of state
*/
const subscription = AppState.update("nameOfState", (state) => {});

/**
 * Unsubscribe
 * 
 * Closes an open subscription given a subscription ID
 * returned by `new Galena().subscribe`
*/
AppState.unsubscribe(subscription);

/**
 * Subscribe All
 * 
 * Registers a global subscription on each State registered to
 * your Galena instance
*/
const subscription = AppState.subscribeAll(appState => {});

/**
 * Unsubscribe All
 * 
 * Closes an open global subscription by subscription ID
*/
AppState.unsubscribeAll(subscription);
```

#### State
While instances of `Galena` behave as a global container for your State, the instances of `State` are the units from which your state is constructed. `State` objects have a predictable API designed to make composing your states simple and effective.

```typescript
import { State, Logger, Profiler } from "galena";

const MyState = new State("myState" /* a unique name */, /* initial state */);

/**
 * Get State
 * 
 * Returns the current state
*/
MyState.getState();

/**
 * Update
 * 
 * Invokes the specified callback with the current and initial
 * state. This method will allow you to mutate the current state
 * and trigger updates to all open subscriptions on the `State`
 * instance
*/
MyState.update((currentState, initialState) => {
  currentState.someValue = "new value!"
});

/**
 * Reset
 * 
 * Resets the current state back to its initial state
*/
MyState.reset();

/**
 * Register Middleware
 * 
 * Applies any number of Middleware instances to your State
*/
MyState.registerMiddleware(/* Middleware */ new Logger(), new Profiler());

/**
 * Subscribe
 * 
 * Given a callback, invokes the callback each time `MyState`
 * changes. Returns a subscription ID
*/
const subscription = MyState.subscribe(state => {});

/**
 * Unsubscribe
 * 
 * Closes an open subscription given a subscription ID
 * returned by `new State().subscribe`
*/
MyState.unsubscribe(subscription);
```

### Using Middleware
Galena supports developers creating enhancements for their usage of `Galena`. Out of the box `Galena` comes with a Logging and Profiling middleware that can be used for making development with `Galena` more intuitive. To opt into `Galena`'s built-in middleware, simply pass them to your `Galena` instance when calling `new Galena()`.

#### Logging Middleware 
A state transition logger that prints to the console each time state updates. The Logger will log the previous state, the current state, and tell you which `State` instance has changed.

```typescript
import { Galena, Logger } from "galena";

const AppState = new Galena([new Logger()]);
```

#### Profiling Middleware
A warning for slow state transitions exceeding a certain number of milliseconds. By default the Profiler will log each time a state transition exceeds one full frame (16ms). This threshold can be adjusted by calling `new Logger(/* any number of milliseconds */)`

```typescript
import { Galena, Profiler } from "galena";

const AppState = new Galena([new Profiler()]);
```

### Middleware Advanced Usage

Similar to a lot of stateful tools, `Galena` also exposes an API for creating your own Middleware. With it, you can do a lot of cool things for both development and productions environments. Let's first look at how to use middleware in `Galena`, then we'll walk through creating our own!

#### Applying Middleware
When applying middleware in `Galena`, you may choose to apply your middleware to *all* of your application state or just some of it. To apply middleware to each of your units of `State`, you can simply initialize `Galena` with the middleware that you enjoy using:
```typescript
import { Galena, Profiler, Logger } from "galena";

export const AppState = new Galena([new Profiler(), new Logger()]);
```
Using this method, whenever you create a new unit of state using `AppState.composeState()`, your `Profiler` and `Logger` will automatically register themselves on your new unit of State.

You may also choose to register a middleware on only some of your state!

```typescript
import { Galena, Profiler, Logger } from "galena";

// Let's add logging to all of our units of State
export const AppState = new Galena([new Logger()]);

// Lets create an arbitrary unit of state!
export const FrequentlyUpdatedState = AppState.composeState("complexState", { 
  bigData: new Array(10000).fill("")
});

// Let's apply profiling to just this unit of state
FrequentlyUpdatedState.registerMiddleware(new Profiler());
```

#### Creating Middleware for a Real Use Case
Let's say we have an application that does not use typescript and we want to achieve type-safety for a unit of our application state. To achieve this, we'll create a middleware that validates state changes to our hypothetical state in real time. In the example below, we have a unit of state holding unique identifiers for users that are friends of the current user:

```typescript
import { Middleware } from "galena";

// Let's extend the Middleware class from the Galena library
export class ConnectedUsersMiddleware extends Middleware {
  // A cache for the length of the array we want to audit
  private totalArrayElements: number | null = null;

  // On each update, let's cache the length of the array
  override onBeforeUpdate({ state }: State) {
    this.totalArrayElements = state.connectedUsers.length;
  }

  // When an update occurs let's see if the length of the
  // connectedUsers array has changed
  override onUpdate({ state }: State) {
    const connectedUsers = state.connectedUsers
    if(
      this.totalArrayElements === null ||
      connectedUsers.length === this.totalArrayElements
    ) {
      return;
    }
    // If the length of user connections has changed, let's validate that
    // the new connection is in fact a string.
    const newConnection = connectedUsers[connectedUsers.length - 1];
    if(typeof newConnection !== "string") {
      // If we find anything other than a string, let's log or throw an error
      console.error(`A ${typeof newConnection} was added to the current user's connection array! This can create a bug in production!`)
    }
  }
}
```

Next let's bring this middleware into our application!
```typescript
import { Galena, State, Profiler, Logger } from "galena";
import type { Middleware } from "galena";
import { ConnectedUsersMiddleware } from "./ConnectedUsersMiddleware";

const IS_NOT_PRODUCTION = process.env.NODE_ENV !== "production";

const middleware: Middleware[] = [];

if(IS_NOT_PRODUCTION) {
  // Let's enjoy some profiling and logging in development mode
  middleware.push(new Profiler(), new Logger());
}

export const AppState = new Galena(middleware);

export const CurrentUserState = AppState.composeState("currentUser", { 
  userID: 1, 
  username: "currentUser", 
  connectedUsers: ["2", "3", "4", "5"]
});

if(IS_NOT_PRODUCTION) {
  // Let's prevent developers from adding non-string values
  // to the `connectedUsers` array of our user state
  CurrentUserState.registerMiddleware(new ConnectedUsersMiddleware());
}
```

### Let's Talk Architecture
The `Galena` library is designed to promote extension of its features. In doing so, it's possible to achieve a very strong Model + Controller layer for your applications. I'm going to demonstrate a few techniques for not only utilizing `Galena` as is, but building proprietary Models and Controllers for your applications.

#### Extending State
Galena's `State` interface is designed to be an out-of-the-box solution for housing any portion of your application's state. There are benefits however, to extending is functionality to compose proprietary models for your features:

##### Creating Models
```typescript
// UserModel.ts
import { State } from "galena";

// Let's extend the `State` class for an explicit schema
// and add some methods for mutating our schema
export class UserModel extends State<{
  userID: string;
  username: string;
  connectedUsers: string[];
}> {
  public addConnection = this.mutation((userID: string) => {
    this.state.connectedUsers.push(userID);
  });

  public updateUsername = this.mutation((username: string) => {
    this.state.username = username;
  });
}
```

Next, let's use our Model!

```typescript
// AppState.ts
import { Galena, State } from "galena";
import { UserModel } from "./UserModel";

export const AppState = new Galena(/* middleware */);

// Let's apply our UserModel to AppState
export const UserState = AppState.composeState("currentUser", { 
  userID: 1, 
  username: "currentUser", 
  connectedUsers: ["2", "3", "4", "5"]
}, UserModel); // Specify the UserModel here so that our new unit is created using the `UserModel` instead of `State`
```

Now that we have our current user in our Galena State, we can create subscriptions and updates!

```tsx
import { AppState } from "./AppState";

const subscriptionID = AppState.subscribe("currentUser", state => {
  // React to changes to the current user!
});

// Invoke proprietary mutations for the UserModel
AppState.get("currentUser").updateUsername("awesomeUser");

AppState.get("currentUser").addConnection("6");
```

Using this extension pattern, each unit of `State` can exist as it's own data model with abstractions for proprietary mutations and business logic. Although slightly more complex on the surface, this pattern in very large applications will reduce the complexity of state management significantly. It'll also replicate what one might find at the persistence layer of server-side code - where persisted data structures are often modeled along side their mutation logic when interacting with a database or GQL Resolver. Because of this, the extension pattern may be beneficial for teams that lean fullstack instead of frontend/backend!

### Let's talk Performance!
Galena's allowance for in-place state mutations allows it to be extremely fast at scale. In Galena, you'll never have to create new or immutable objects to ensure that your state mutations are delivered to consumers. All state transitions can safely occur in O(1) space and allow for significantly faster updates on large data structures.

In addition to in-place mutations, Galena's composition architecture allows for safely making *extremely* frequent updates to your state. Because all mutations are isolated to a single unit of State at a given time, the rest of your application state remains completely idle - even when making complex mutations to a given unit.
 
In `Galena`, state-subscriptions are optimized for performance as well. In more typical state management libraries, any changes to state will trigger a call to all open subscriptions on a given data store. This is not the case in `Galena`! When state changes, the only subscriptions that will re-compute are the ones that are directly tied to the unit of state that changed. All other subscriptions will remain dormant!

### Let's talk support for Frontend Frameworks!
`Galena` provides bindings for React through [react-galena](https://github.com/alexfigliolia/react-galena). This package provides factories for generating HOC's and hooks from your Galena instances and units of State!


