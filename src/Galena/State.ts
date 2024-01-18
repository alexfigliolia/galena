import { MiddlewareEvents } from "Middleware/types";
import type { Middleware } from "Middleware/Middleware";
import { EventEmitter } from "@figliolia/event-emitter";
import { Scheduler } from "./Scheduler";
import { Priority, type MutationEvent } from "./types";

/**
 * ### State
 *
 * The root of all reactivity in Galena. State instances can
 * operate in isolation by calling `new State(...args)` or as
 * part of your application's larger global state by using
 * `new Galena().composeState()`.
 *
 * `State` instances operate on the premise of pub-sub and mutability.
 * This provides significant performance improvement over more traditional
 * state management tools because
 *
 * 1. Mutations can occur in O(1) space
 * 2. Mutations can be batched when dispatching updates to subscribers
 *
 * When deciding how many `State` instances are required for your
 * applications needs, we suggest creating and organizing state in
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
 * MyState.subscribe((state) => {
 *   const { listItems } = state
 *   // Do something with your list items!
 * });
 * ```
 */
export class State<T extends any = any> extends Scheduler {
  public state: T;
  public readonly name: string;
  public readonly initialState: T;
  private readonly middleware: Middleware[] = [];
  private readonly emitter = new EventEmitter<MutationEvent<T>>();
  constructor(name: string, initialState: T) {
    super();
    this.name = name;
    this.state = initialState;
    this.initialState = State.clone(initialState);
  }

  /**
   * Get State
   *
   * Returns a readonly snapshot of the current state
   */
  public getState() {
    return this.state as Readonly<T>;
  }

  /**
   * Update
   *
   * Mutates state and notifies any open subscriptions. This method
   * by default uses task batching for optimized performance. In almost
   * every use-case, this method is the correct way to mutate state. If
   * you need to bypass batching for higher-priority state updates, you
   * can use `State.priorityUpdate()` or `State.backgroundUpdate()`
   *
   * ##### Synchronous updates
   * ```typescript
   * MyState.update((state, initialState) => {
   *   state.listItems.push(5);
   * });
   * ```
   * ##### Asynchronous updates
   * ```typescript
   * MyState.update(async (state, initialState) => {
   *   const listItems = await fetch("/list-items");
   *   state.listItems = listItems;
   * });
   * ```
   */
  public update = this.mutation(
    (func: (state: T, initialState: T) => void | Promise<void>) => {
      return func(this.state, this.initialState);
    },
    Priority.BATCHED
  );

  /**
   * Background Update
   *
   * Mutates state and notifies any open subscriptions. This method
   * bypasses Galena's internal task batching for a more immediate
   * state update and propagation of state to consumers. It utilizes
   * a micro-task that allows for the current call stack to clear
   * ahead of propagating state updates to consumers
   *
   * ##### Synchronous updates
   * ```typescript
   * MyState.backgroundUpdate((state, initialState) => {
   *   state.listItems.push(5);
   * });
   * ```
   * ##### Asynchronous updates
   * ```typescript
   * MyState.backgroundUpdate(async (state, initialState) => {
   *   const listItems = await fetch("/list-items");
   *   state.listItems = listItems;
   * });
   * ```
   */
  public backgroundUpdate = this.mutation(
    (func: (state: T, initialState: T) => void | Promise<void>) => {
      return func(this.state, this.initialState);
    },
    Priority.MICROTASK
  );

  /**
   * Priority Update
   *
   * Mutates state and notifies any open subscriptions. This method
   * bypasses optimizations for task batching and scheduling. This means
   * that state updates made with this method propagate to subscriptions
   * as immediately as possible. Overusing this method can cause your
   * state updates to perform slower in certain cases. The usage of this
   * method should be conserved for state mutations that need to occur
   * at a certain frame rate
   *
   * ##### Synchronous updates
   * ```typescript
   * MyState.priorityUpdate((state, initialState) => {
   *   state.listItems.push(5);
   * });
   * ```
   * ##### Asynchronous updates
   * ```typescript
   * MyState.priorityUpdate(async (state, initialState) => {
   *   const listItems = await fetch("/list-items");
   *   state.listItems = listItems;
   * });
   * ```
   */
  public priorityUpdate = this.mutation(
    (func: (state: T, initialState: T) => void | Promise<void>) => {
      return func(this.state, this.initialState);
    },
    Priority.IMMEDIATE
  );

  /**
   * Reset
   *
   * Resets the current state to its initial state
   */
  public reset = this.mutation(() => {
    this.state = State.clone(this.initialState);
  });

  /**
   * Mutation
   *
   * This method can be used to wrap arbitrary functions that when invoked
   * will:
   * 1. Notify your subscriptions with the latest state
   * 2. Execute any registered middleware (such as loggers or profiling tools)
   *
   * Using this method, developers can compose and extend `Galena`'s internal
   * infrastructure for state mutations to create proprietary models for your
   * state
   *
   * ```typescript
   * import { State } from "@figliolia/galena";
   *
   * // Extend of Galena State
   * class MyState extends State {
   *   addListItem = mutation((newListItem) => {
   *     this.state.list.push(newListItem);
   *   });
   * }
   *
   * // Create an instance
   * const myState = new MyState("myState", { list: [] });
   *
   * // Invoke your custom mutation method
   * myState.addListItem("new-item");
   * ```
   */
  protected mutation<F extends (...args: any[]) => any>(
    func: F,
    priority: Priority = Priority.BATCHED
  ) {
    return (...args: Parameters<F>) => {
      this.lifeCycleEvent(MiddlewareEvents.onBeforeUpdate);
      const returnValue = func(...args);
      if (returnValue instanceof Promise) {
        return returnValue.then((v) => {
          this.scheduleUpdate(priority);
          return v;
        });
      }
      this.scheduleUpdate(priority);
      return returnValue;
    };
  }

  /**
   * Schedule Update
   *
   * Schedules an update to State subscribers and emits the
   * `onUpdate` lifecycle hook
   */
  private scheduleUpdate(priority: Priority) {
    this.lifeCycleEvent(MiddlewareEvents.onUpdate);
    void this.scheduleTask(
      () => this.emitter.emit(this.name, this.state),
      priority
    );
  }

  /**
   * Register Middleware
   *
   * Caches a `Middleware` instance and invokes its
   * lifecycle subscriptions on all state transitions
   */
  public registerMiddleware(...middleware: Middleware[]) {
    this.middleware.push(...middleware);
  }

  /**
   * Subscribe
   *
   * Registers a subscription on the state instance. The
   * callback you provide will execute each time state changes.
   * Returns a unique identifier for your subscription
   */
  public subscribe(callback: (nextState: T) => void) {
    return this.emitter.on(this.name, callback);
  }

  /**
   * Unsubscribe
   *
   * Given a subscription ID, removes a registered subscription
   * from the `State` instance
   */
  public unsubscribe(ID: string) {
    return this.emitter.off(this.name, ID);
  }

  /**
   * Life Cycle Event
   *
   * Triggers a life cycle event for each registered middleware
   */
  private lifeCycleEvent<E extends MiddlewareEvents>(event: E) {
    const maxIndex = this.middleware.length - 1;
    for (let i = maxIndex; i > -1; i--) {
      this.middleware[i][event](this);
    }
  }

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
  public static clone<T>(state: T): T {
    if (Array.isArray(state)) {
      return [...state] as T;
    }
    if (state instanceof Set) {
      return new Set(state) as T;
    }
    if (state instanceof Map) {
      return new Map(state) as T;
    }
    if (state && typeof state === "object") {
      return { ...state } as T;
    }
    return state;
  }
}
