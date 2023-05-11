import type { State } from "../Galena/State";
import { Middleware } from "../Middleware/Middleware";
/**
 * Profiler
 *
 * A logger for state transitions exceeding a given threshold
 * for duration:
 *
 * ```typescript
 * const State = new Galena([new Profiler()]);
 * // if using isolated state instances:
 * const MyState = new State(...args);
 * MyState.registerMiddleware(new Profiler())
 * ```
 */
export declare class Profiler extends Middleware {
    private threshold;
    private startTime;
    constructor(threshold?: number);
    onBeforeUpdate(_: State): void;
    onUpdate(nextState: State): void;
}
