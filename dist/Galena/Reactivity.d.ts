import { EventEmitter } from "@figliolia/event-emitter";
import type { Middleware } from "../Middleware/Middleware";
import type { State } from "../Galena/State";
/**
 * Reactivity
 *
 * All `State` instances have a `Reactivity` instance at the
 * root of their prototype. The `Reactivity` class provides
 * storage for registered middleware, an event emitter for
 * triggering lifecycle hooks, and utility methods for invoking
 * a state transition's lifecycle
 */
export declare class Reactivity<T extends any = any> {
    protected readonly emitter: EventEmitter<{
        [key: string]: State<T>;
    }>;
    protected readonly middleware: Middleware[];
    /**
     * Register Middleware
     *
     * Caches a `Middleware` instance and invokes its
     * lifecycle subscriptions on all state transitions
     */
    registerMiddleware(...middleware: Middleware[]): void;
    /**
     * On Before Update
     *
     * Triggers each registered middleware's `onBeforeUpdate`
     * lifecycle event
     */
    protected onBeforeUpdate(state: State<T>): void;
    /**
     * On Update
     *
     * Triggers each registered middleware's `onUpdate`
     * lifecycle event
     */
    protected onUpdate(state: State<T>): void;
}
