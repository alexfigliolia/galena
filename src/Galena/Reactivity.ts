import { EventEmitter } from "@figliolia/event-emitter";

import type { Middleware } from "Middleware/Middleware";

import type { State } from "Galena/State";

/**
 * Reactivity
 *
 * All `State` instances have a `Reactivity` instance at the
 * root of their prototype. The `Reactivity` class provides
 * storage for registered middleware, an event emitter for
 * triggering lifecycle hooks, and utility methods for invoking
 * a state transition's lifecycle
 */
export class Reactivity<T extends any = any> {
  protected readonly emitter = new EventEmitter<{
    [key: State<T>["name"]]: State<T>;
  }>();
  protected readonly middleware: Middleware[] = [];

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
   * On Before Update
   *
   * Triggers each registered middleware's `onBeforeUpdate`
   * lifecycle event
   */
  protected onBeforeUpdate(state: State<T>) {
    const maxIndex = this.middleware.length - 1;
    for (let i = maxIndex; i > -1; i--) {
      this.middleware[i].onBeforeUpdate(state);
    }
  }

  /**
   * On Update
   *
   * Triggers each registered middleware's `onUpdate`
   * lifecycle event
   */
  protected onUpdate(state: State<T>) {
    const maxIndex = this.middleware.length - 1;
    for (let i = maxIndex; i > -1; i--) {
      this.middleware[i].onUpdate(state);
    }
  }
}
