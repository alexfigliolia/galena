import { EventEmitter } from "@figliolia/event-emitter";
import type { State } from "../Galena/State";
import type { MiddlewareEvent } from "./types";
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
export declare class Middleware {
    static Emitter: EventEmitter<MiddlewareEvent>;
    constructor();
    /**
     * Validate Event
     *
     * Asserts that a given method on an extending class prototype
     * is one of the supported `Galena` lifecycle events
     */
    private static validateEvent;
    /**
     * On Before Update
     *
     * An event emitted each time a `State` mutation is enqueued
     */
    onBeforeUpdate(state: State): void;
    /**
     * On Update
     *
     * An event emitted each time a `State` instance is mutated
     */
    onUpdate(state: State): void;
}
