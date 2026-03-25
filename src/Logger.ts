import { Middleware } from "./Middleware";
import type { State } from "./State";

/**
 * Logger
 *
 * A middleware for Redux-style logging! Each state transition
 * will log to the console the `State` instance that changed
 * along with a before and after snapshot of the current state:
 *
 * ```typescript
 * const AppState = new Galena({}, new Logger());
 * // or
 * AppState.registerMiddlerware(new Logger());
 * // or
 * const MyState = new State(4, new Logger());
 * // or
 * MyState.registerMiddleware(new Logger());
 * ```
 */
export class Logger<T = any> extends Middleware {
  private previousState: T | null = null;

  override onBeforeUpdate(state: State<T>) {
    this.previousState = state.getSnapshot();
  }

  override onUpdate(state: State<T>) {
    console.log(
      "%cMutation:",
      "color: rgb(187, 186, 186); font-weight: bold",
      "@",
      this.time,
    );
    console.log(
      "   %cPrevious State",
      "color: #26ad65; font-weight: bold",
      this.previousState,
    );
    console.log(
      "   %cNext State    ",
      "color: rgb(17, 118, 249); font-weight: bold",
      state.getSnapshot(),
    );
  }

  /**
   * Time
   *
   * Returns the time in which a given state transition completed
   */
  private get time() {
    const date = new Date();
    const mHours = date.getHours();
    const hours = mHours > 12 ? mHours - 12 : mHours;
    const mins = date.getMinutes();
    const minutes = mins.toString().length === 1 ? `0${mins}` : mins;
    const secs = date.getSeconds();
    const seconds = secs.toString().length === 1 ? `0${secs}` : secs;
    const milliseconds = date.getMilliseconds();
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  }
}
