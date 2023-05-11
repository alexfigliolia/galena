"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reactivity = void 0;
const event_emitter_1 = require("@figliolia/event-emitter");
/**
 * Reactivity
 *
 * All `State` instances have a `Reactivity` instance at the
 * root of their prototype. The `Reactivity` class provides
 * storage for registered middleware, an event emitter for
 * triggering lifecycle hooks, and utility methods for invoking
 * a state transition's lifecycle
 */
class Reactivity {
    constructor() {
        this.emitter = new event_emitter_1.EventEmitter();
        this.middleware = [];
    }
    /**
     * Register Middleware
     *
     * Caches a `Middleware` instance and invokes its
     * lifecycle subscriptions on all state transitions
     */
    registerMiddleware(...middleware) {
        this.middleware.push(...middleware);
    }
    /**
     * On Before Update
     *
     * Triggers each registered middleware's `onBeforeUpdate`
     * lifecycle event
     */
    onBeforeUpdate(state) {
        this.middleware.forEach((middleware) => {
            middleware.onBeforeUpdate(state);
        });
    }
    /**
     * On Update
     *
     * Triggers each registered middleware's `onUpdate`
     * lifecycle event
     */
    onUpdate(state) {
        this.middleware.forEach((middleware) => {
            middleware.onUpdate(state);
        });
    }
}
exports.Reactivity = Reactivity;
