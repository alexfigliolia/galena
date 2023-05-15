# Galena
Lightning fast platform agnostic state! Galena is a one-stop-shop for creating reactive state that supports your global application or singular isolated features. Galena operates on the premise of pub-sub and mutability allowing for significantly higher performance over more traditional state management utilities. 

In Galena, instances of State can be declared up-front or on-demand and will automatically register on your global application state. This creates a true single-source-of-true style of state without implicating performance or the complexity of maintenance!

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

### Let's Talk Architecture
The `Galena` library is designed to promote extension of its features. In doing so, it's possible to achieve a very strong Model + Controller layer for your applications. I'm going to demonstrate a few techniques for not only utilizing `Galena`, but building proprietary Models and Controllers for your applications.

#### Extending State
`State`'s are designed to be an out-of-the-box solution for housing any portion of your applications global state. There are benefits however, to extending is functionality to compose proprietary states for your features:

```typescript
// AppState.ts
import { Galena, State } from "galena";

// First Create an Instance of Galena
export const AppState = new Galena();

// Next Create an extension of State. In this case we'll create one for the current user of our application
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

// Let's add the `UserModel` state to our AppState!
export const CurrentUser = AppState.createSlice("currentUser", { 
	userID: 1, 
	username: "currentUser", 
	connectedUsers: ["2", "3", "4", "5"]
}, UserModel);
```

Now that we have our current user in our Galena State, we can create subscriptions and updates!

```tsx
import { AppState } from "./AppState";

const subscriptionID = AppState.getSlice("currentUser").subscribe(state => {
  // React to changes to the current user!
});

// Mutate the current user
AppState.getSlice("currentUser").updateUsername("awesomeUser");

AppState.getSlice("currentUser").addConnection("6");
```
Using this extension pattern, each `State` instance can exist as it's own data model with an abstraction layer for proprietary mutations and business logic. Although slightly more complex on the surface, this pattern in very large applications will reduce the complexity of state management significantly. It'll also replicate what one might find at the persistent layer of an application - where persisted data structures are often modeled along side their mutation logic when interacting with a database or GQL Resolver. Because of this, the extension pattern may be beneficial for teams that lean fullstack instead of frontend/backend!

#### Using Middleware
Now that we've gone over extending `State` to create Models for your application's schemas, let's talk about creating developer tools and enhancements for your application!

Similar to a lot of stateful tools, `Galena` supports the Middleware architecture. With it, you can do a lot of cool things like adding logging, performance profiling, and error handling. Let's look at how to use middleware in `Galena`, then we'll walk through creating our own!

When applying middleware in `Galena`, you may choose to apply your middleware to *all* of your application state or just some of it! To apply middleware to each of your slices of `State`, you can simply initialize `Galena` with the middleware that you enjoy using:
```typescript
import { Galena, Profiler, Logger } from "galena";

export const AppState = new Galena([new Profiler(), new Logger()]);
```
Using this method, whenever you create a new slice of state using `AppState.createSlice()`, your `Profiler` and `Logger` will automatically register themselves on your new `State` instance.

You may also choose to register a middleware on only some of your state!

```typescript
import { Galena, Profiler, Logger } from "galena";

// Let's add logging to all of our State Slices
export const AppState = new Galena([new Logger()]);

export const FrequentlyUpdatedState = AppState.createSlice("complexState", { 
	bigData: new Array(10000).fill("")
});

// Let's apply profiling to just one complex slice of state
FrequentlyUpdatedState.registerMiddleware(new Profiler());
```
Next, let's create our own middleware for our `UserModel` from the previous examples. 

#### Creating Middleware for a Real Use Case
Let's say the current application does not use typescript and we want to ensure that only strings are allowed to be added to the `connectedUsers` array:

```typescript
import { Middleware } from "galena";

// Let's extend the Middleware class from the Galena library
export class UserModelMiddleware extends Middleware {
	// A cache for the length of the current users connections
	private totalConnectedUsers: number | null = null;

	// On each update to the UserModel, let's cache the total number
	// of user connections
	override onBeforeUpdate(state: State) {
		this.totalConnectedUsers = state.get("connectedUsers").length;
	}

  // When an update occurs let's see if the length of the
	// connectedUsers array has changed
  override onUpdate(state: State) {
		const connectedUsers = state.get("connectedUsers");
		if(
			this.totalConnectedUsers === null ||
			connectedUsers.length === this.totalConnectedUsers
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
import { UserModel } from "./UserModel";
import { UserModelMiddleware } from "./UserModelMiddleware";

const IS_NOT_PRODUCTION = process.env.NODE_ENV !== "production";

const middleware: Middleware[] = [];
if(IS_NOT_PRODUCTION) {
	// Let's enjoy some profiling and logging in development mode
	middleware.push(new Profiler(), new Logger());
}

export const AppState = new Galena(middleware);

// Let's add the `UserModel` state to our AppState!
export const CurrentUser = AppState.createSlice("currentUser", { 
	userID: 1, 
	username: "currentUser", 
	connectedUsers: ["2", "3", "4", "5"]
}, UserModel);

if(IS_NOT_PRODUCTION) {
	// Let's prevent developers from adding non-string values
	// to the `connectedUsers` array!
	CurrentUser.registerMiddleware(new UserModelMiddleware());
}
```

### Let's talk Performance!
Galena can out-perform just about every state management library out there. This is primarily because of its mutable nature. In Galena, you'll never have to create new objects or immutable instances to ensure that your state mutations are delivered to consumers. All state transitions can safely occur in O(1) space and allow for significantly faster updates on large data structures.

Because in Galena, we divide state into independent models called "Slices", you are free to make frequent and complex updates to any Slice of State while the rest of your application state remains completely idle to its consumers and subscriptions. There is no internal state reconciliations occurring at a joint level when you mutate a single Slice of your application state.
 
In `Galena`, subscriptions are optimized for performance as well. In more typical state management libraries, any changes to state will trigger a call to all open subscriptions. Not in `Galena`! When state changes, the only subscriptions that will re-compute are the ones that are directly tied to the Slice of state that changed. All other subscriptions will remain dormant!

### Let's talk support for Frontend Frameworks!
`Galena` provides bindings for React through the `react-galena` package. This package provides factories for generating `connect` HOC's and `useState/useMutation` hooks from your state instances.


