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

export const GalenaState = new Galena(middleware);
```

#### Creating a Slice of State
```typescript
// NavigationState.ts
import { GalenaState } from "./Galena.ts";

export const NavigationState = GalenaState.createSlice("navigation", {
	currentRoute: "/",
	userID: "123",
	permittedRoutes: ["**/*"]
});
```

Creating state slices using `Galena.createSlice()` will automatically scope your new slice of state to your `Galena` instance. You may then access, subscribe, and update your state using `Galena.getSlice("navigation")` or by accessing the `NavigationState` object directly.

#### Updating State Values
#### Using Your Galena Instance
```typescript
// business-logic.ts
import { GalenaState } from "./Galena.ts";

GalenaState.getSlice("navigation").update(currentState => {
	currentState.currentRoute = "/user-profile";
});
```

#### Using Your Navigation Instance
```typescript
// business-logic.ts
import { NavigationState } from "./NavigationState.ts";

NavigationState.update(currentState => {
	currentState.currentRoute = "/user-profile";
});
```

### Subscribing to State Changes

#### Using Your Global Application State
```typescript
// business-logic.ts
import { GalenaState } from "./Galena.ts";

const subscriptionID = GalenaState.subscribe(currentState => {
	const navState = currentState.getSlice("navigation");
	// React to changes to "navigation" state (or any other registered
	// slices of state)
});

// When the subscription is no longer needed
GalenaState.unsubscribe(subscriptionID);
```

#### Using Your State Slices Directly
```typescript
// business-logic.ts
import { NavigationState } from "./NavigationState.ts";

const subscriptionID = NavigationState.subscribe(currentState => {
	const { userID, currentRoute, permittedRoutes } = currentState;
	// do something with your "navigation" state updates!
});

// When the subscription is no longer needed
NavigationState.unsubscribe(subscriptionID);
```

### Let's talk Performance!
Galena can out-perform just about every state management library out there. This is because it doesn't require immutable updates to successfully deliver changes to state subscribers. In Galena, there is never any deep-object reconciliation or internal calls to `Object.assign` when your state updates. 

Any time a slice of state changes, the rest of your application state remains completely in-tact. Galena operates in *true* constant space - meaning even the most basic state updates occur about 4x as fast as libraries like Redux - and improves even further the larger your state gets.

In `Galena`, subscriptions are optimized for performance as well. In more typical state management libraries, any changes to state will trigger a call to open subscription. Not in `Galena`! When state changes in `Galena`, the only subscriptions that will re-compute are the ones that are directly subscribed to the Slice of state that changed.

### Let's talk support for Frontend Frameworks!
`Galena` provides bindings for React through the `react-galena` package. This package provides factories for generating `connect` functions and state hooks from your `Galena` and `State` instances.


