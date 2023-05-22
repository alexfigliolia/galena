import { AutoIncrementingID } from "@figliolia/event-emitter";

import type { Middleware } from "Middleware/Middleware";

import { State } from "Galena/State";

/**
 * ## Galena
 *
 * A performant global state solution that scales
 *
 * ### Creating State
 *
 * ```typescript
 * // AppState.ts
 * import { Galena } from "@figliolia/galena";
 *
 * const AppState = new Galena([...middleware]);
 *
 * const NavigationState = AppState.composeState("navigation", {
 *   currentRoute: "/",
 *   userID: "12345",
 *   permittedRoutes: ["/*"]
 * });
 * ```
 *
 * ### Subscribing to State Changes
 * #### Using the Galena Instance
 * ```typescript
 * import { AppState } from "./AppState";
 *
 * AppState.subscribe(appState => {
 *   const navState = appState.get("navigation");
 *   const { currentRoute } = navState.state;
 *   // do something with state changes!
 * });
 * ```
 * #### Using the State Instance
 * ```typescript
 * NavigationState.subscribe(navigation => {
 *   const { currentRoute } = navigation
 *   // do something with state changes!
 * });
 * ```
 *
 * #### Using Global Subscriptions
 * ```typescript
 * NavigationState.subscribeAll(nextState => {
 *   const { currentRoute } = nextState.navigation
 *   // do something with state changes!
 * });
 * ```
 *
 * ### Mutating State
 * ```typescript
 * NavigationState.update(state => {
 *   state.currentRoute = "/profile";
 *   // You can mutate state without creating new objects!
 * });
 * ```
 */
export class Galena<
  T extends Record<string, State<any>> = Record<string, State<any>>
> {
  public readonly state = {} as T;
  private readonly middleware: Middleware[] = [];
  private readonly IDs = new AutoIncrementingID();
  private readonly subscriptions = new Map<
    string,
    [state: string, ID: string][]
  >();
  constructor(middleware: Middleware[] = []) {
    this.middleware = middleware;
  }

  /**
   * Compose State
   *
   * Creates a new `State` instance and returns it. Your new state
   * becomes immediately available on your `Galena` instance and
   * is wired into your middleware. All existing subscriptions to
   * state will automatically receive updates when your new unit of
   * state updates
   */
  public composeState<
    S extends any,
    M extends typeof State<S> = typeof State<S>
  >(
    name: string,
    initialState: S,
    // @ts-ignore
    Model: M = State<S>
  ) {
    const state = new Model(name, initialState);
    state.registerMiddleware(...this.middleware);
    this.mutable[name] = state;
    this.reIndexSubscriptions(name);
    return state as InstanceType<M>;
  }

  /**
   * Get
   *
   * Returns a unit of `State` by name
   */
  public get<K extends keyof T>(name: K): T[K] {
    return this.state[name];
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
   * Update
   *
   * Runs a mutation on the specified unit of state
   */
  public update<K extends keyof T>(
    name: K,
    mutation: Parameters<T[K]["update"]>["0"]
  ) {
    return this.get(name).update(mutation);
  }

  /**
   * Background Update
   *
   * Runs a higher priority mutation on the specified unit of
   * state
   */
  public backgroundUpdate<K extends keyof T>(
    name: K,
    mutation: Parameters<T[K]["backgroundUpdate"]>["0"]
  ) {
    return this.get(name).backgroundUpdate(mutation);
  }

  /**
   * Priority Update
   *
   * Runs an immediate priority mutation on the specified unit
   * of state
   */
  public priorityUpdate<K extends keyof T>(
    name: K,
    mutation: Parameters<T[K]["priorityUpdate"]>["0"]
  ) {
    return this.get(name).priorityUpdate(mutation);
  }

  /**
   * Subscribe
   *
   * Given the name of a unit of state, this method registers
   * a subscription on the target state instance. The callback
   * you provide will execute each time state changes. Returns
   * a unique identifier for your subscription. To clean up your
   * subscription, call `Galena.unsubscribe()` with the ID returned
   * by this method
   */
  public subscribe<K extends keyof T>(
    name: K,
    callback: Parameters<T[K]["subscribe"]>["0"]
  ) {
    return this.get(name).subscribe(callback);
  }

  /**
   * Unsubscribe
   *
   * Given a subscription ID returned from the `subscribe` method,
   * this method removes and cleans up the corresponding subscription
   */
  public unsubscribe<K extends keyof T>(name: K, ID: string) {
    return this.get(name).unsubscribe(ID);
  }

  /**
   * Subscribe All
   *
   * Registers a callback on each registered `State` instance and
   * is invoked each time your state changes. Using `Galena`'s
   * `subscribeAll` method, although performant, can be less
   * performant than subscribing directly to a target `State`
   * instance using `Galena.subscribe()`. To clean up your
   * subscription, call `Galena.unsubscribeAll()` with the ID
   * returned
   */
  public subscribeAll(callback: (nextState: T) => void) {
    const subscriptionID = this.IDs.get();
    const stateSubscriptions: [state: string, ID: string][] = [];
    for (const key in this.state) {
      stateSubscriptions.push([
        key,
        this.state[key].subscribe(() => {
          callback(this.state);
        }),
      ]);
    }
    this.subscriptions.set(subscriptionID, stateSubscriptions);
    return subscriptionID;
  }

  /**
   * Unsubscribe
   *
   * Given a subscription ID returned from the `subscribeAll()` method,
   * this method removes and cleans up the corresponding subscription
   */
  public unsubscribeAll(ID: string) {
    const IDs = this.subscriptions.get(ID);
    if (IDs) {
      for (const [state, ID] of IDs) {
        this.state[state].unsubscribe(ID);
        this.subscriptions.delete(ID);
      }
    }
  }

  /**
   * ReIndex Subscriptions
   *
   * When units of state are created lazily, this method updates
   * each existing subscription to receive mutations occurring on
   * recently created `State` instances that post-date prior
   * subscriptions
   */
  private reIndexSubscriptions(name: string) {
    for (const [ID, unitSubscriptions] of this.subscriptions) {
      for (const [state, subscriptionID] of unitSubscriptions) {
        const callback = this.state[state]["emitter"]
          .get(state)
          ?.get(subscriptionID);
        if (callback) {
          unitSubscriptions.push([
            name,
            this.state[name].subscribe(() => {
              void callback(this.state);
            }),
          ]);
          this.subscriptions.set(ID, unitSubscriptions);
          break;
        }
      }
    }
  }
}
