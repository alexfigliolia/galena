import { State } from "Galena/State";
import { Middleware } from "Middleware/Middleware";

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
export class Logger extends Middleware {
  private previousState: Record<string, any> | null = null;
  scopedMutation: ((...args: any[]) => any) | null = null;

  override onBeforeUpdate(state: State) {
    this.previousState = State.clone(state.state);
  }

  override onUpdate(state: State) {
    console.log(
      "%cMutation:",
      "color: rgb(187, 186, 186); font-weight: bold",
      state.name,
      "@",
      this.time
    );
    console.log(
      "   %cPrevious State",
      "color: #26ad65; font-weight: bold",
      this.previousState
    );
    console.log(
      "   %cNext State    ",
      "color: rgb(17, 118, 249); font-weight: bold",
      state.getState()
    );
    this.previousState = null;
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
