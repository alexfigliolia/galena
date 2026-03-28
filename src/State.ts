import { EventEmitter } from "@figliolia/event-emitter";
import { API } from "./API";
import type { Middleware } from "./Middleware";
import type { NonFunction, Setter, Subscriber } from "./types";

/**
 * ### State
 *
 * The unit of reactivity for Galena. `State`'s can act
 * as isolated instances or be part of your global app
 * state (via `Galena` instances).
 *
 * There are two ways to create state instances
 *
 * ```typescript
 * import { State, createState, Profiler } from "@figliolia/galena";
 
 * const myState = new State("<any value>", ...middleware);
 * // or
 * const myState = createState("<any value>", ...middleware);
 *
 * myState.set("<new-value>");
 * myState.update(previousValue => "<new-value>");
 * myState.subscribe(nextValue => {});
 * myState.registerMiddleware(new Profiler());
 * myState.reset(); // reset back to it's original value
 * // to get the current value at any point in time
 * const currentValue = myState.getState();
 * ```
 */
export class State<T> extends API<T, NonFunction<T>> {
  private state: NonFunction<T>;
  private readonly Emitter = new EventEmitter<{ change: NonFunction<T> }>();
  constructor(
    public readonly initialState: NonFunction<T>,
    ...middleware: Middleware<T>[]
  ) {
    super(...middleware);
    this.state = initialState;
  }

  /**
   * Set
   *
   * Updates the current value of state notifying
   * all interested parties
   */
  public readonly set = this.withEmission((state: NonFunction<T>) => state);

  /**
   * Update
   *
   * Updates the current value of state using a setter function
   * receiving the previous state as a parameter. Notifies all
   * interested parties
   */
  public readonly update = this.withEmission((setter: Setter<T>) => {
    if (this.diffSetter(setter)) {
      return setter;
    }
    return setter(this.state);
  });

  /**
   * Reset
   *
   * Resets the current state back to the state which the instance
   * was initialized with. Notifies all interested parties
   */
  public readonly reset = this.withEmission(() => this.initialState);

  /**
   * Get Snapshot
   *
   * Returns the current state. Designed for compatibility with
   * `useSyncExternalStore`
   */
  public readonly getState = () => {
    return this.state;
  };

  /**
   * Subscribe
   *
   * Registers a callback to be executed each time state
   * changes. Returns an `unsubscribe` function
   */
  public readonly subscribe = (fn: Subscriber<T>) => {
    const ID = this.Emitter.on("change", fn);
    return () => {
      this.Emitter.off("change", ID);
    };
  };

  /**
   * Register Middleware
   *
   * Registers any number of `Middleware` instances on the
   * current instance of `State`. Your middleware will begin
   * executing at the next state transition
   */
  public registerMiddleware(...middleware: Middleware<T>[]) {
    this.middleware.push(...middleware);
  }

  private withEmission<
    F extends (...args: any[]) => NonFunction<T> | Promise<NonFunction<T>>,
  >(fn: F) {
    return (...args: Parameters<F>) => {
      const result = fn(...args);
      if (result instanceof Promise) {
        void result.then(resolved => this.emit(resolved));
        return;
      }
      return this.emit(result);
    };
  }

  private emit(nextState: NonFunction<T>) {
    this.invokeMiddleware("onBeforeUpdate");
    this.state = nextState;
    this.Emitter.emit("change", this.state);
    this.invokeMiddleware("onUpdate");
  }

  protected diffSetter(setter: Setter<T>): setter is NonFunction<T> {
    return typeof setter !== "function";
  }

  private invokeMiddleware<K extends keyof Middleware<T>>(fn: K) {
    for (const middleware of this.middleware) {
      middleware[fn](this);
    }
  }
}

/**
 * ### createState
 *
 * The unit of reactivity for Galena. `State`'s can act
 * as isolated instances or be part of your global app
 * state (via `Galena` instances).
 *
 * There are two ways to create state instances
 *
 * ```typescript
 * import { State, createState, Profiler } from "@figliolia/galena";
 
 * const myState = new State("<any value>", ...middleware);
 * // or
 * const myState = createState("<any value>", ...middleware);
 *
 * myState.set("<new-value>");
 * myState.update(previousValue => "<new-value>");
 * myState.subscribe(nextValue => {});
 * myState.registerMiddleware(new Profiler());
 * myState.reset(); // reset back to it's original value
 * // to get the current value at any point in time
 * const currentValue = myState.getState();
 * ```
 */
export function createState<T>(
  ...args: ConstructorParameters<typeof State<T>>
) {
  return new State<T>(...args);
}
