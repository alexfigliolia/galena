import { EventEmitter } from "@figliolia/event-emitter";
import type { Middleware } from "./Middleware";
import type { State } from "./State";
import type {
  AppSubscriber,
  GalenaSnapshot,
  Setter,
  StateType,
  StateTypes,
} from "./types";

/**
 * ### Galena
 *
 * Galena instances are designed to house one or more units of `State`
 * and exist as a pseudo global application state.
 *
 * By design, each of its `State` units have isolated reactivity
 * that prevents entire state trees from updating when a single
 * unit changes.
 *
 * ```typescript
 * import { Galena } from "@figliolia/galena";
 *
 * const AppState = new Galena({
 *   user: new State("<user-stuff>"),
 *   business: new State("<business-logic-stuff>")
 *   // your reactive instances
 * }, ...middleware);
 *
 * // to retreive and work with an individual unit
 * const myUnit = AppState.get("<key>"); // Returns State<T>
 *
 * // to run a callback anytime a unit of state changes
 * const listener = AppState.subscribe(({ state, updated }) => {
 *   // do something with the `State` instance that updated
 *   // the entirety of your state
 * });
 * ```
 */
export class Galena<T extends Record<string, State<any>>> {
  private Emitter = new EventEmitter<{ change: GalenaSnapshot<T> }>();
  constructor(
    public readonly state: T,
    ...middleware: Middleware<StateTypes<T>>[]
  ) {
    this.registerMiddleware(...middleware);
  }

  /**
   * Get
   *
   * Returns a connected State instance by key
   */
  public get<K extends Extract<keyof T, string>>(key: K) {
    return this.state[key];
  }

  /**
   * Set
   *
   * Sets a connected State instance's state by key
   */
  public set<K extends Extract<keyof T, string>>(
    key: K,
    value: StateType<T[K]>,
  ) {
    return this.get(key).set(value);
  }

  /**
   * Update
   *
   * Invokes a connected State instance's update method key
   */
  public update<K extends Extract<keyof T, string>>(
    key: K,
    updater: Setter<StateType<T[K]>>,
  ) {
    return this.get(key).update(updater);
  }

  /**
   * Subscribe
   *
   * Listen for changes on your Galena instnace. Your provided
   * callback will be invoked each time an attached state instance
   * changes. To your callback will be provided the `updated` state
   * instance, along with the entire `state` tree
   */
  public subscribe = (subscriber: AppSubscriber<T>) => {
    const ID = this.Emitter.on("change", subscriber);
    const unsubscribers: (() => void)[] = [];
    for (const key in this.state) {
      const instance = this.state[key];
      if (!instance) {
        continue;
      }
      unsubscribers.push(
        instance.subscribe(() =>
          this.emit({ state: this.state, updated: instance }),
        ),
      );
    }
    return () => {
      this.Emitter.off("change", ID);
      while (unsubscribers.length) {
        unsubscribers.pop?.()?.();
      }
    };
  };

  /**
   * Register Middleware
   *
   * Adds middleware instances to each of the connected
   * `State` instances
   */
  public registerMiddleware(...middlewares: Middleware<StateTypes<T>>[]) {
    for (const key in this.state) {
      this.state[key]?.registerMiddleware?.(...middlewares);
    }
  }

  private emit<K extends Extract<keyof T, string>>(
    event: GalenaSnapshot<T, K>,
  ) {
    this.Emitter.emit("change", event);
  }
}

/**
 * ### createGalena
 *
 * Galena instances are designed to house one or more units of `State`
 * and exist as a pseudo global application state.
 *
 * By design, each of its `State` units have isolated reactivity
 * that prevents entire state trees from updating when a single
 * unit changes.
 *
 * ```typescript
 * import { Galena } from "@figliolia/galena";
 *
 * const AppState = new Galena({
 *   user: new State("<user-stuff>"),
 *   business: new State("<business-logic-stuff>")
 *   // your reactive instances
 * }, ...middleware);
 *
 * // to retreive and work with an individual unit
 * const myUnit = AppState.get("<key>"); // Returns State<T>
 *
 * // to run a callback anytime a unit of state changes
 * const listener = AppState.subscribe(({ state, updated }) => {
 *   // do something with the `State` instance that updated
 *   // the entirety of your state
 * });
 * ```
 */
export const createGalena = <T extends Record<string, State<any>>>(
  ...args: ConstructorParameters<typeof Galena<T>>
) => {
  return new Galena(...args);
};
