"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = void 0;
const event_emitter_1 = require("@figliolia/event-emitter");
const types_1 = require("./types");
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
class Middleware {
    constructor() {
        const extension = Object.getPrototypeOf(this);
        const methods = Object.getOwnPropertyNames(extension);
        methods.forEach((event) => {
            if (Middleware.validateEvent(event)) {
                Middleware.Emitter.on(types_1.SupportedEvents[event], this[event]);
            }
        });
    }
    /**
     * Validate Event
     *
     * Asserts that a given method on an extending class prototype
     * is one of the supported `Galena` lifecycle events
     */
    static validateEvent(event) {
        return event in types_1.SupportedEvents;
    }
    /* Life Cycle Events */
    /**
     * On Before Update
     *
     * An event emitted each time a `State` mutation is enqueued
     */
    onBeforeUpdate(state) { }
    /**
     * On Update
     *
     * An event emitted each time a `State` instance is mutated
     */
    onUpdate(state) { }
}
exports.Middleware = Middleware;
Middleware.Emitter = new event_emitter_1.EventEmitter();
