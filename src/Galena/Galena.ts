import { AutoIncrementingID } from "@figliolia/event-emitter";

import type { Middleware } from "Middleware/Middleware";

import { State } from "Galena/State";

/**
 * ### Galena
 *
 * Lightning fast global state with lazy slices.
 *
 * #### Creating State
 * ```typescript
 * const State = new Galena([...middleware]);
 *
 * const NavigationState = State.createSlice("navigation", {
 *   currentRoute: "/",
 *   userID: "12345",
 *   permittedRoutes: ["/*"]
 * });
 * ```
 *
 * #### Subscribing to State Changes
 * ##### Using the Galena Instance
 * ```typescript
 * State.subscribe(globalState => {
 *  const currentRoute = globalState.navigation.get("currentRoute");
 *  // do something on state changes!
 * });
 * ```
 * ##### Using the Slice Instance
 * ```typescript
 * NavigationState.subscribe(navigation => {
 *  const currentRoute = navigation.get("currentRoute");
 *  // do something on state changes!
 * });
 * ```
 *
 * #### Mutating State
 * ```typescript
 * NavigationState.update(currentState => {
 *  currentState.currentRoute = "/profile";
 *  // You can mutate state without creating new objects!
 *  // Mutations such as this one will propagate to subscriptions!
 * });
 * ```
 */
export class Galena<T extends Record<string, State<any>>> {
  public readonly state = {} as T;
  private middleware: Middleware[] = [];
  private readonly IDs = new AutoIncrementingID();
  private subscriptions = new Map<string, [state: string, ID: string][]>();
  constructor(middleware: Middleware[]) {
    this.middleware = middleware;
  }

  /**
   * Create Slice
   *
   * Creates a new `State` instance and returns it. Your new state
   * becomes immediately available on your `Galena` instance and
   * is wired into your middleware. All existing subscriptions to
   * state will automatically receive updates when your new slice's
   * state updates
   */
  public createSlice<S extends any>(name: string, initialState: S): State<S> {
    const state = new State(name, initialState);
    state.registerMiddleware(...this.middleware);
    this.mutable[name] = state;
    this.reIndexSubscriptions(name);
    return state;
  }

  /**
   * Get Slice
   *
   * Returns a `State` instance by key
   */
  public getSlice<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  /**
   * Mutable
   *
   * Returns a mutable state instance
   */
  private get mutable() {
    return this.state as Record<string, State>;
  }

  /**
   * Subscribe
   *
   * Registers a callback on each `State` instance and is invoked
   * each time your state changes. Using `Galena`'s `subscribe`
   * method, although highly performant, can be less performant
   * than subscribing directly to the `State` instance.
   *
   * Returns a subscription ID
   */
  public subscribe(callback: (state: Galena<T>) => void) {
    const subscriptionID = this.IDs.get();
    const stateSubscriptions: [state: string, ID: string][] = [];
    for (const key in this.state) {
      stateSubscriptions.push([
        key,
        this.state[key].subscribe(() => {
          callback(this);
        }),
      ]);
    }
    this.subscriptions.set(subscriptionID, stateSubscriptions);
    return subscriptionID;
  }

  /**
   * Unsubscribe
   *
   * Given a subscription ID returned from the `subscribe` method,
   * this method removes and cleans up the corresponding subscription
   */
  public unsubscribe(ID: string) {
    const IDs = this.subscriptions.get(ID);
    if (IDs) {
      for (const [state, ID] of IDs) {
        this.state[state].unsubscribe(ID);
      }
    }
  }

  /**
   * ReIndex Subscriptions
   *
   * When slices of state are created lazily, this method updates
   * each existing subscription to receive mutations occurring on
   * recently created `State` instances that post-date prior
   * subscriptions
   */
  private reIndexSubscriptions(name: string) {
    for (const [ID, sliceSubscriptions] of this.subscriptions) {
      for (const [state, subscriptionID] of sliceSubscriptions) {
        const callback = this.state[state]["emitter"]
          .get(state)
          ?.get(subscriptionID);
        if (callback) {
          sliceSubscriptions.push([
            name,
            this.state[name].subscribe(() => {
              void callback(this.state);
            }),
          ]);
          this.subscriptions.set(ID, sliceSubscriptions);
          break;
        }
      }
    }
  }
}
