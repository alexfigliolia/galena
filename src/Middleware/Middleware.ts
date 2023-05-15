import { EventEmitter } from "@figliolia/event-emitter";

import type { State } from "Galena/State";
import type { MiddlewareEvent } from "Middleware/types";
import { MiddlewareEvents } from "Middleware/types";

/**
 * Middleware
 *
 * A root interface for all `Galena` Middleware. When creating
 * a middleware for your `Galena` state, simply extend this
 * class any override any of its public lifecycle methods:
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
  public static Emitter = new EventEmitter<MiddlewareEvent<any>>();
  constructor() {
    const extension = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(extension);
    methods.forEach((event) => {
      if (Middleware.validateEvent(event)) {
        Middleware.Emitter.on(MiddlewareEvents[event], this[event]);
      }
    });
  }

  /**
   * Validate Event
   *
   * Asserts that a given method on an extending class prototype
   * is one of the supported `Galena` lifecycle events
   */
  private static validateEvent(event: string): event is MiddlewareEvents {
    return event in MiddlewareEvents;
  }

  /* Life Cycle Events */

  /**
   * On Before Update
   *
   * An event emitted each time a `State` mutation is enqueued
   */
  public onBeforeUpdate(state: State<T>) {}

  /**
   * On Update
   *
   * An event emitted each time a `State` instance is mutated
   */
  public onUpdate(state: State<T>) {}
}
