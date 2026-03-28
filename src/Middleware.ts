import type { State } from "./State";

/**
 * Middleware
 *
 * Galena's middleware API is designed to provide hooks
 * for state changes that you can tap into to run your
 * own logic.
 *
 * Middleware is great for logging, analytics, and profiling:
 *
 * ```typescript
 * export class Profiler<T = any> extends Middleware<T> {
 *   private previousState: T | null = null;
 *   private startTime: null | number = null;
 *   constructor(public readonly threshold: number = 16) {
 *     super();
 *   }
 *
 *   public override onBeforeUpdate(state: State<T>) {
 *     this.startTime = performance.now();
 *     this.previousState = state.getState();
 *   }
 *
 *   public override onUpdate(state: T) {
 *     const diff = performance.now() - this.startTime;
 *     if(diff >= this.threshold) {
 *       console.warn(`A slow state transition was detected when transitioning the following piece of state`);
 *       console.log('Previous state', this.previousState);
 *       console.log('Current state', state.getState());
 *     }
 *   }
 * }
 * ```
 *
 * To register your middleware, simply add it when constructing
 * a `State` or `Galena` instance.
 *
 * ```typescript
 * import { State } from "@figliolia/galena";
 * import { Profiler } from './myProfiler';
 *
 * const myState = new State(5, new Profiler());
 * ```
 */
export class Middleware<T = any> {
  /**
   * On Before Update
   *
   * Executes prior to a `State` instance being updated.
   * Receives the state prior to its update as a parameter
   */
  public onBeforeUpdate(_state: State<T>) {}

  /**
   * On Update
   *
   * Executes after a `State` instance has been update.
   * Receives the most recent state as a parameter
   */
  public onUpdate(_state: State<T>) {}
}
