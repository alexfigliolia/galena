import { EventEmitter } from "@figliolia/event-emitter";
import type { Middleware } from "./Middleware";
import type { State } from "./State";
import type { AppSubscriber, GalenaSnapshot, StateTypes } from "./types";

/**
 * Galena
 *
 * Galena is designed to house one or more units of `State`
 * and exist as a pseudo global application state.
 *
 * By design, each of its `State` units have isolated reactivity
 * that prevents entire state trees from updating when a single
 * unit changes.
 *
 * This is dissimilar to redux-like models where downstream reconciliations
 * will propagate everwhere a given store is read from. In galena, downstream
 * reconciliations occur only for consumers of the slice of state that
 * changed - making it safer to use with more frequent state changes.
 *
 * ```typescript
 * import { Galena } from "@figliolia/galena";
 *
 * const AppState = new Galena({
 *   // your reactive instances
 * }, ...middleware);
 *
 * // to retreive and work with an individual unit
 * const myUnit = AppState.get("<key>"); // Returns State<T>
 *
 * // to run a callback anytime a unit of state changes
 * const unsubscribe = AppState.subscribe(({ updated }) => {
 *   // do something with the `State` instance that updated
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

  public get<K extends Extract<keyof T, string>>(key: K) {
    return this.state[key];
  }

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
 * Create Galena
 *
 * Galena is designed to house one or more units of `State`
 * and exist as a pseudo global application state.
 *
 * By design, each of its `State` units have isolated reactivity
 * that prevents entire state trees from updating when a single
 * unit changes.
 *
 * This is dissimilar to redux-like models where downstream reconciliations
 * will propagate everwhere a given store is read from. In galena, downstream
 * reconciliations occur only for consumers of the slice of state that
 * changed - making it safer to use with more frequent state changes.
 *
 * ```typescript
 * import { createGalena } from "@figliolia/galena";
 *
 * const AppState = createGalena({
 *   // your reactive instances
 * }, ...middleware);
 *
 * // to retreive and work with an individual unit
 * const myUnit = AppState.get("<key>"); // Returns State<T>
 *
 * // to run a callback anytime a unit of state changes
 * const unsubscribe = AppState.subscribe(({ updated }) => {
 *   // do something with the `State` instance that updated
 * });
 * ```
 */
export const createGalena = <T extends Record<string, State<any>>>(
  ...args: ConstructorParameters<typeof Galena<T>>
) => {
  return new Galena(...args);
};
