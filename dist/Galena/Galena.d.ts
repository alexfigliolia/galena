import type { Middleware } from "../Middleware/Middleware";
import { State } from "../Galena/State";
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
export declare class Galena<T extends Record<string, State<any>>> {
    readonly state: T;
    private middleware;
    private readonly IDs;
    private subscriptions;
    constructor(middleware?: Middleware[]);
    /**
     * Create Slice
     *
     * Creates a new `State` instance and returns it. Your new state
     * becomes immediately available on your `Galena` instance and
     * is wired into your middleware. All existing subscriptions to
     * state will automatically receive updates when your new slice's
     * state updates
     */
    createSlice<S extends any>(name: string, initialState: S): State<S>;
    /**
     * Get Slice
     *
     * Returns a `State` instance by key
     */
    getSlice<K extends keyof T>(key: K): T[K];
    /**
     * Mutable
     *
     * Returns a mutable state instance
     */
    private get mutable();
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
    subscribe(callback: (state: Galena<T>) => void): string;
    /**
     * Unsubscribe
     *
     * Given a subscription ID returned from the `subscribe` method,
     * this method removes and cleans up the corresponding subscription
     */
    unsubscribe(ID: string): void;
    /**
     * ReIndex Subscriptions
     *
     * When slices of state are created lazily, this method updates
     * each existing subscription to receive mutations occurring on
     * recently created `State` instances that post-date prior
     * subscriptions
     */
    private reIndexSubscriptions;
}
