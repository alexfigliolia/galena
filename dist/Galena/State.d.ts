import { Reactivity } from "./Reactivity";
/**
 * ### State
 *
 * The root of all reactivity in Galena. State instances can
 * operate in isolation by calling `new State(...args)` or as
 * part of your application's larger global state by using
 * `Galena.createSlice()`.
 *
 * `State` instances operate on the premise of pub-sub and mutability.
 * This provides significant performance improvement over more traditional
 * state management tools because mutations can occur in O(1) space.
 *
 * The pub-sub pattern allows for mutations to be propagated directly to
 * consumers following successful mutation transactions. Mutations can
 * be either sync or async without effecting the how subscriptions
 * are updated - with no need for any async middleware that you may
 * find in libraries like redux.
 *
 * When deciding how many `State` instances are required for your
 * applications needs, we suggest creating an organizing state in
 * accordance with your application logic. Meaning, you might have a
 * `State` instance for navigation/routing, another `State` instance
 * for storing user information, and so on. Performance can improve
 * significantly when state is dispersed amongst multiple instances
 *
 * #### Creating State Instances
 *
 * ```typescript
 * const MyState = new State("MyState", {
 *   someData: true,
 *   listItems: [1, 2, 3, 4];
 *   // ...etc
 * });
 * ```
 *
 * #### Updating State
 * ##### Synchronous updates
 * ```typescript
 * MyState.update((state) => {
 *   state.listItems.push(5);
 * });
 * ```
 * ##### Asynchronous updates
 * ```typescript
 * MyState.update(async (state) => {
 *   const listItems = await fetch("/list-items");
 *   state.listItems = listItems;
 * });
 * ```
 *
 * #### Subscribing to State Changes
 * ```typescript
 * MyState.subscribe(state => {
 *   const listItems = state.get("listItems");
 *   // Do something with your list items!
 * });
 * ```
 */
export declare class State<T extends any = any> extends Reactivity<T> {
    readonly name: string;
    currentState: T;
    readonly initialState: T;
    constructor(name: string, initialState: T);
    /**
     * Get State
     *
     * Returns a readonly snapshot of the current state
     */
    getState(): Readonly<T>;
    /**
     * Get
     *
     * Returns a state value by key
     */
    get<K extends keyof T>(key: K): T[K];
    /**
     * Default
     *
     * Returns the initial state of a given value by key
     */
    default<K extends keyof T>(key: K): T[K];
    /**
     * Update
     *
     * Mutates state and notifies any open subscriptions
     *
     * ##### Synchronous updates
     * ```typescript
     * MyState.update((state) => {
     *   state.listItems.push(5);
     * });
     * ```
     * ##### Asynchronous updates
     * ```typescript
     * MyState.update(async (state) => {
     *   const listItems = await fetch("/list-items");
     *   state.listItems = listItems;
     * });
     * ```
     */
    update: (func: (state: T) => void | Promise<void>) => void;
    /**
     * Reset
     *
     * Resets the current state to its initial state
     */
    reset: () => void;
    /**
     * Mutation
     *
     * A utility method for use when extending the `State` class.
     * Extending the `State` class is highly encouraged. If you
     * wish to extend the `State` class and provide it with your
     * own methods for updating state. Simply wrap those methods
     * with `State.mutation`:
     * typescript
     * ```
     * class ExtensionOfState<T> extends State<T> {
     *    public updateListItems = this.mutation((listItems: string[]) => {
     *       this.currentState.listItems = listItems;
     *    });
     * }
     * ```
     *
     * This `State.mutation` wrapper ensures that
     * 1. Subscriptions are notified of your state changes
     * 2. Any registered middleware (such as loggers or profiling tools)
     * execute properly for during your state update
     */
    mutation<F extends (...args: any[]) => any>(func: F): (...args: Parameters<F>) => void;
    /**
     * Schedule Update
     *
     * Schedules an update to State subscribers and emits the
     * `onUpdate` lifecycle hook
     */
    private scheduleUpdate;
    /**
     * Subscribe
     *
     * Registers a subscription on the state instance. The
     * callback you provide will execute each time state changes.
     * Returns a unique identifier for your subscription
     */
    subscribe(callback: (nextState: State<T>) => void): string;
    /**
     * Unsubscribe
     *
     * Given a subscription ID, removes a registered subscription
     * from the `State` instance
     */
    unsubscribe(ID: string): boolean | undefined;
    /**
     * Clone
     *
     * `State` instances accept any value as a form of reactive
     * state. In order to maintain the initial state past any state
     * transitions, this method clones the initial values provided
     * to the `State` constructor and caches them to allow for
     * developers to easily reset their current state back to its
     * initial value
     */
    static clone<T>(state: T): T;
}
