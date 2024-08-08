import type { State } from "Galena/State";

/**
 * # Middleware
 *
 * A root interface for all `Galena` Middleware. When creating
 * a middleware for your `Galena` state, simply extend this
 * class any override any of its public lifecycle methods.
 *
 * ### Creating a Profiling Middleware
 *
 * ```typescript
 * export class ProfilerMiddleware extends Middleware {
 *   updateState: number | null = null;
 *
 *   override onBeforeUpdate(state: State) {
 *     this.updateStart = performance.now();
 *   }
 *
 *   override onUpdate(state: State) {
 *     if(this.updateStart) {
 *       const timeToUpdate = performance.now() - this.updateStart;
 *       if(timeToUpdate > 16) {
 *         console.warn("A state transition took more than 16 milliseconds!", State);
 *       }
 *     }
 *   }
 * }
 * ```
 */
export class Middleware<T extends any = any> {
  /**
   * On Before Update
   *
   * An event emitted each time a `State` mutation is enqueued
   */
  public onBeforeUpdate(_state: State<T>) {}

  /**
   * On Update
   *
   * An event emitted each time a `State` instance is mutated
   */
  public onUpdate(_state: State<T>) {}
}
