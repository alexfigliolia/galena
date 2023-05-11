import { State } from "../Galena/State";
import { Middleware } from "../Middleware/Middleware";
/**
 * Logger
 *
 * A middleware for Redux-style logging! Each state transition
 * will log to the console the `State` instance that changed
 * along with a before and after snapshot of the current state:
 *
 * ```typescript
 * const State = new Galena([new Logger()]);
 * // if using isolated state instances:
 * const MyState = new State(...args);
 * MyState.registerMiddleware(new Logger())
 * ```
 */
export declare class Logger extends Middleware {
    private previousState;
    scopedMutation: ((...args: any[]) => any) | null;
    onBeforeUpdate(state: State): void;
    onUpdate(state: State): void;
    /**
     * Time
     *
     * Returns the time in which a given state transition completed
     */
    private get time();
}
