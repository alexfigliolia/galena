# Galena
Lightning fast platform agnostic state! Galena is a one-stop-shop for creating reactive state that supports your global application or individually isolated features. Galena operates on the premise of pub-sub and mutability allowing for significantly higher performance over more traditional state management utilities. 

In Galena, your state architecture is a composition of reactive units that can be declared at any point in your application lifecycle. Your units of state can exist in isolation (similar to React Contexts) or as part of one or more global application states (similar to Redux). Galena offers a global application state solution that supports lazy initialization of state, performant updates, and a rich development API.

# Getting Started

## Installation
```bash
npm install --save galena
# or
yarn add galena
```

## Composing Your Application State
### Global Application State Architecture
Creating a "global" application state begins with initializing a `Galena` instance. Your `Galena` instances act as a container from which units of state can be composed:

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

Now that we have our `AppState` instance, let's compose a unit of state for it!

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

Creating units of state using `AppState.composeState()` will automatically scope your new unit of state to your `Galena` instance. You can then access, subscribe, and update your state using using your `Galena` instance or unit of `State` returned from `AppState.composeState()`:

#### State Operations Using Your Galena Instance

```typescript
// BusinessLogic.ts 
import { AppState } from "./AppState.ts";

const subscription = AppState.subscribe("navigation", navigationState => {
  // React to changes to Navigation state
});

// Set Navigation State!
AppState.update("navigation", state => {
  state.currentRoute = "/contact-us";
});

// Clean up subscriptions
AppState.unsubscribe("navigation", subscription);
```

#### State Operations Using Your Unit of State

```typescript
// BusinessLogic.ts
import { NavigationState } from "./NavigationState";

const subscription = NavigationState.subscribe(state => {
  // React to changes to Navigation state
});

// Set Navigation State!
NavigationState.update(state => {
  state.currentRoute = "/contact-us";
});

// Clean up subscriptions
NavigationState.unsubscribe(subscription);
```

Running mutations on individual units of state will automatically update your `Galena` instance's state! Your `Galena` instance will internally track changes to each unit of state that it composes. 

### Isolated State Architecture

You may also create units of state that are *not* connected to a "global" `Galena` instance. To promote flexibility for developers to organize their state however they wish, `Galena` exports its `State` object for usage directly:

```typescript
import { State } from "galena";

// Create Your Isolated Unit of State
const FeatureState = new State("myFeature", {
  // initial state
  list: [1, 2, 3];
});

const subscription = FeatureState.subscribe((state) => {
  // React to FeatureState changes!
});

FeatureState.update((state) => {
  // Update feature state!
  state.list.push(state.list.length);
});

// Clean up subscriptions
FeatureState.unsubscribe(subscription);
```

The API for isolated units of State is the same as the API for units connected to a `Galena` instance. When using `Galena` it's totally normal to have one or more "global" states along side any number of island states for isolate-able features. The composition patterns that can be used for your application state are virtually limitless! 

## API Reference
### Galena
Instances of `Galena` behave as a container for one or more units of `State`. Your `Galena` instance is designed to replicate the "global" application state pattern, but without the overhead of
1. Declaring all of your units of state early in your application lifecycle
2. Making complex mutations to large state objects.

In `Galena`, your "global" application state exists in the form of operable sub-structures that can be individually subscribed to and mutated. This means, mutating one piece of your `State` does not effect other units of your `State`. This allows for the relief of several performance bottlenecks that are common in state management libraries that offer "global" application states. In `Galena`, you get the performance of island architecture with the option to also have a predictable global application state.

#### Galena Public Methods

```typescript
import { Galena, Logger, Profiler } from "galena";
import type { State } from "galena";

const AppState = new Galena(/* middleware */ [new Logger(), new Profiler()]);

/**
 * Compose State 
 * 
 * Creates a unit of `State` connected to your `Galena` instance.
 * Returns a unit of `State`
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
 * Mutates a unit of state by name. This method by default
 * uses internal batching in order to optimize the dispatching
 * of state changes to consumers. This method is the most 
 * performant way to mutate state in Galena!
*/
AppState.update("nameOfState", (state) => {});

/**
 * Background Update
 * 
 * Runs a higher-priority mutation on a unit of state. This method 
 * will bypass batching in favor of a scheduled propagation of 
 * changes to subscribers of your state. This method is great for
 * prioritizing state updates driven by frequent user-input such
 * as typing into a form or game logic.
*/
AppState.backgroundUpdate("nameOfState", (state) => {});

/**
 * Priority Update
 * 
 * Runs a highest-priority mutation on a unit of state. This method
 * bypasses all batching and scheduling optimizations in Galena.
 * When using `priorityUpdate()` your state changes are immediately
 * propagated to your state subscribers ahead of all scheduled and
 * batched updates. This method is great for usage with external
 * scheduling mechanisms such as `requestAnimationFrame`, `intervals`,
 * and/or `timeouts`
*/
AppState.priorityUpdate("nameOfState", (state) => {});

/**
 * Subscribe
 * 
 * Registers a subscription on a unit of state
*/
const subscription = AppState.subscribe("nameOfState", (state) => {});

/**
 * Unsubscribe
 * 
 * Closes an open subscription given a subscription ID
 * returned by `new Galena().subscribe()`
*/
AppState.unsubscribe(subscription);

/**
 * Subscribe All
 * 
 * Registers a global subscription on each State registered to
 * your Galena instance. Your callback will be invoked any 
 * time a unit of state is updated
*/
const subscription = AppState.subscribeAll(appState => {});

/**
 * Unsubscribe All
 * 
 * Closes an open global subscription by subscription ID
*/
AppState.unsubscribeAll(subscription);
```

### State
While instances of `Galena` behave as a container for units of state, the `State` interface serves as the unit itself. The `State` interface has a predictable API designed to make composing your states simple and effective. Whether you compose your state using a "global" state or island architecture, the underlying API for your units of state look like the following:

```typescript
import { State, Logger, Profiler } from "galena";

const MyState = new State(/* a unique name */ "myState", /* initial state */);

/**
 * Get State
 * 
 * Returns the current state
*/
MyState.getState();

/**
 * Update
 * 
 * Mutates the unit of state using the callback provided. This method
 * by default uses internal task batching in order to optimize
 * dispatching state changes to consumers. This method is the most 
 * performant way to mutate state in Galena!
*/
MyState.update((currentState, initialState) => {
  currentState.someValue = "new value!"
});

/**
 * Background Update
 * 
 * Runs a higher-priority mutation on your state. This method 
 * will bypass batching in favor of a scheduled propagation of 
 * changes to subscribers of your state. This method is great for
 * prioritizing state updates driven by frequent user-input such
 * as typing into a form or game logic.
*/
MyState.backgroundUpdate((currentState, initialState) => {
  currentState.someValue = "new value!"
});

/**
 * Priority Update
 * 
 * Runs a highest-priority mutation on your state. This method
 * bypasses all batching and scheduling optimizations in Galena.
 * When using `priorityUpdate()` your state changes are immediately
 * propagated to your state subscribers ahead of all scheduled and
 * batched updates. This method is great for usage with external
 * scheduling mechanisms such as `requestAnimationFrame`, `intervals`,
 * and/or `timeouts`
*/
MyState.priorityUpdate((currentState, initialState) => {
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
 * Given a callback, invokes the callback each time your state
 * changes. Returns a subscription ID
*/
const subscription = MyState.subscribe(state => {});

/**
 * Unsubscribe
 * 
 * Closes an open subscription given a subscription ID
 * returned by `new State().subscribe()`
*/
MyState.unsubscribe(subscription);

/**
 * Mutation (protected)
 *
 * This method can be used to wrap arbitrary functions that 
 * when invoked will:
 * 1. Notify your subscriptions with the latest state
 * 2. Execute any registered middleware (such as loggers or 
 * profiling tools)
 *
 * Using this method, developers can compose and extend `Galena`'s 
 * internal infrastructure for mutating state to create proprietary
 * processes for individual units of state. 
 * 
 * In order to access this method, you'll need to extend `State`
 * using:
 * 
 * ```typescript
 * class MyState extends State {
 *   proprietaryMutation = this.mutation((...anyArgs) => {
 *     // any logic
 *   });
 * }
 * ```
*/
MyState.mutation(/* callback */);
```

### Middleware
Galena supports developers creating enhancements for their usage of `Galena`. Out of the box `Galena` comes with middleware for Logging and Profiling that can be used for making development with `Galena` more intuitive. To opt into `Galena`'s built-in middleware, simply pass them to your `Galena` instance when calling `new Galena()`

#### Logging Middleware 
Galena comes with a redux-style state transition logger that prints to the console each time state updates. The Logger will log the previous state, the current state, and tell you which unit of `State` has changed.

```typescript
import { Galena, Logger } from "galena";

// Enable logging!
const AppState = new Galena([new Logger()]);
```

#### Profiling Middleware
Galena also comes with a Profiler that can track the duration of all state transitions. When a state transition exceeds 16ms, a warning is printed to the console notifying the developer of a potential bottleneck in his or her application. By default the Profiler will log each time a state transition exceeds one full frame (16ms). This threshold can be adjusted by calling `new Profiler(/* any number of milliseconds */)`

```typescript
import { Galena, Profiler } from "galena";

const AppState = new Galena([new Profiler()]);
```

### Middleware - Advanced Usage
Similar to a lot of stateful tools, `Galena` also exposes an API for creating your own Middleware. With it, you can do a lot of cool things for both development and productions environments. Let's first look at how to use middleware in `Galena`, then we'll walk through creating our own!

#### Applying Middleware
When applying middleware in `Galena`, you may choose to apply your middleware to *all* of your application state or just some of it. To apply middleware to each of your units of `State`, you can simply initialize `Galena` with the middleware that you enjoy using:
```typescript
import { Galena, Profiler, Logger } from "galena";

export const AppState = new Galena([new Profiler(), new Logger()]);
```
Using this method, whenever you create a new unit of state using `AppState.composeState()`, your `Profiler` and `Logger` will automatically register themselves on your new unit of State.

Alternatively, you may also choose to register a middleware on only some of your state:

```typescript
import { Galena, Profiler, Logger } from "galena";

// Let's add logging to all of our units of State
export const AppState = new Galena([new Logger()]);

// Lets create an arbitrary unit of state and add profiling to it
export const FrequentlyUpdatedState = AppState.composeState("complexState", { 
  bigData: new Array(10000).fill("")
});

// Profiling is applied only to this unit of state
FrequentlyUpdatedState.registerMiddleware(new Profiler());
```

#### Creating Middleware
Galena's middleware architecture operates on fixed set of events that are triggered each time a state mutation takes place. When state is mutated in your application, the `Middleware`'s `onBeforeUpdate()` and `onUpdate()` methods are called. Using these events, you can compose logic for auditing and enhancing your state updates! Let's take a look at a real world example.

Let's say we have an application that does not use typescript and we want to achieve type-safety for a unit of our application state. To achieve this, we'll create a middleware that validates changes to our state in real time. 

In the example below, we'll create a unit of state holding unique identifiers for users that are connections of the current user:

```typescript
export const CurrentUserState = AppState.composeState("currentUser", { 
  userID: 1, 
  username: "currentUser", 
  connectedUsers: ["2", "3", "4", "5"]
});
```

Next, let's create our own custom middleware for ensuring that all entries in the `connectedUsers` array are strings:

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

  // When an update to state occurs let's check if the length 
  // of the connectedUsers array has changed
  override onUpdate({ state }: State) {
    const connectedUsers = state.connectedUsers
    if(
      this.totalArrayElements === null ||
      connectedUsers.length === this.totalArrayElements
    ) {
      return;
    }
    // If the length of user connections has changed, let's validate that
    // the new connection is, in fact, a string.
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
import { State } from "galena";
import { ConnectedUsersMiddleware } from "./ConnectedUsersMiddleware";

export const CurrentUserState = AppState.composeState("currentUser", { 
  userID: 1, 
  username: "currentUser", 
  connectedUsers: ["2", "3", "4", "5"]
});

if(process.env.NODE_ENV !== "production") {
  // Let's apply our custom middleware in development environments
  CurrentUserState.registerMiddleware(new ConnectedUsersMiddleware());
}
```

### Let's Talk Architecture
The `Galena` library is designed to promote extension of its features. In doing so, it's possible to achieve a very strong Model/Controller layer for your applications. I'm going to demonstrate a few techniques for not only utilizing `Galena` as is, but building proprietary Models and Controllers for your applications.

#### Extending State
Galena's `State` interface is designed to be an out-of-the-box solution for housing any portion of your application's state. There are benefits however, to extending its functionality to compose proprietary models for your units of state:

##### Creating State Models
```typescript
// UserModel.ts
import { State } from "galena";

// Let's extend the `State` class for a hypothetical
// user schema
export class UserModel extends State<{
  userID: string;
  username: string;
  connectedUsers: string[];
}> {
  public addConnection(userID: string) {
    this.update(state => {
      state.connectedUsers.push(userID);
    });
  }

  public updateUsername(username: string) {
    this.update(state => {
      state.username = username;
    });
  }
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

// The UserModel's custom methods are available on your Galena state!
AppState.get("currentUser").updateUsername("awesomeUser");

AppState.get("currentUser").addConnection("6");
```

Using this extension pattern, each unit of `State` can exist as it's own model with abstractions for proprietary mutations and business logic. Although slightly more complex on the surface, this pattern in very large applications will reduce the complexity of state management significantly. It'll also replicate what one might find at the persistence layer of server-side code - where persisted data structures are often modeled along side their mutation logic when interacting with a database or GQL Resolver. Because of this, the extension pattern's syntactical uniformity may be beneficial for teams that lean fullstack instead of frontend/backend!

### Let's talk Performance!
In several areas of the `Galena` readme, there are references to performance and the relief of bottlenecks. In this section I'd like to share some hard numbers relating to areas of `Galena`'s architecture.

#### In Place Mutations
In Galena, state mutations can occur in-place (`O(1)` space). While you can use immutable data structures if you like, it's not required when using this library - by design. This is because even the most basic immutable state updates are about 4-5x slower than mutable state updates. This `4-5x` balloons even larger the more your state grows. When building `Galena`, I wanted to remove the notion of immutability wherever possible.

#### Composition of State
To further promote efficient state mutations, `Galena`'s composition architecture allows units of state to be operable without effecting adjacent units of state. This means you can can safely make *extremely* frequent updates to your state and be sure that your updates are scoped to specific units - and not your *entire* application state. This optimization extends to subscriptions as well. The only subscriptions that will ever be triggered when state changes, are the ones directly applied to the unit changing.

#### Benchmarking
Using 2 identical applications, I've profiled the performance of Galena vs. Redux using 10,000 state updates and 10 connected React Components that'll rerender on each state change. The results looked like the following:

##### Galena vs. Redux with no middleware
1. Redux - `33.6ms` to complete 10,000 state updates
2. Galena - `5.5ms` to complete 10,000 state updates

As the application scales with more state updates and connected components, the spread between `Galena` and Redux grows even further. Although I don't believe most applications will ever require 10,000 immediate state updates (unless building a game-like experience), `Galena` does relieve the bottle-necks of popular state management utilities quite well.

### Support for Frontend Frameworks!
`Galena` provides bindings for React through [react-galena](https://github.com/alexfigliolia/react-galena). This package provides factories for generating HOC's and hooks from your Galena instances and units of State!


