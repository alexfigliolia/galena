# Galena
Lightning fast platform agnostic state! Galena is a one-stop-shop for creating reactive state that supports your global application or singular isolated features. Galena operates on the premise of pub-sub and mutability allowing for significantly higher performance over more traditional state management utilities. Galena offers feature parity with libraries such as Redux, while delivering state updates almost 10x faster!

## Getting Started

### Installation
```bash
npm install --save galena
# or
yarn add galena
```

### Creating Global Application State
#### Instantiating Galena

```typescript
// Galena.ts
import { Galena, Logger, Profiler } from "galena";
import type { Middleware } from "galena";

const middleware: Middleware[] = [];
if(process.env.NODE_ENV === "development") {
  middleware.push(new Logger(), new Profiler())
}

export const AppState = new Galena(middleware);
```

### Creating a Slice of State
```typescript
// NavigationState.ts
import { AppState } from "./Galena.ts";

export const NavigationState = AppState.createSlice("navigation", {
  currentRoute: "/",
  userID: "123",
  permittedRoutes: ["**/*"]
});
```

Creating state slices using `Galena.createSlice()` will automatically scope your new slice of state to your `Galena` instance. You may then access, subscribe, and update your state using `Galena.getSlice("navigation")` or by accessing the `NavigationState` object directly.

### Updating State Values
#### Using Your Galena Instance
```typescript
// business-logic.ts
import { AppState } from "./Galena.ts";

AppState.getSlice("navigation").update((state, initialState) => {
  state.currentRoute = "/user-profile";
});
```

#### Using Your Navigation Instance
```typescript
// business-logic.ts
import { NavigationState } from "./NavigationState.ts";

NavigationState.update((state, initialState) => {
  state.currentRoute = "/user-profile";
});
```

### Subscribing to State Changes

#### Using Your Global Application State
```typescript
// business-logic.ts
import { AppState } from "./Galena.ts";

const subscriptionID = AppState.subscribe(state => {
  const navState = state.getSlice("navigation");
  // React to changes to "navigation" state (or any other registered
  // slices of state)
});

// When the subscription is no longer needed
AppState.unsubscribe(subscriptionID);
```

#### Using Your State Slices Directly
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

### Let's talk Performance!
Galena can out-perform just about every state management library out there. This is primarily because of its mutable nature. In Galena, you'll never have to create new objects or immutable instances to ensure that your state mutations are delivered to consumers. All state transitions can safely occur in O(1) space and allow for significantly faster updates on large data structures.

Because in Galena, we divide state into independent models called "Slices", you are free to make frequent and complex updates to any Slice of State while the rest of your application state remains completely idle to its consumers and subscriptions. There is no internal state reconciliations occurring at a joint level when you mutate a single Slice of your application state.
 
In `Galena`, subscriptions are optimized for performance as well. In more typical state management libraries, any changes to state will trigger a call to all open subscriptions. Not in `Galena`! When state changes, the only subscriptions that will re-compute are the ones that are directly tied to the Slice of state that changed. All other subscriptions will remain dormant!

### Let's talk support for Frontend Frameworks!
`Galena` provides bindings for React through the `react-galena` package. This package provides factories for generating `connect` HOC's and `useState/useMutation` hooks from your state instances.


