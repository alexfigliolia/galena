import { Middleware } from "./Middleware";
import type { State } from "./State";

/**
 * Profiler
 *
 * A logger for state transitions exceeding a given
 * millisecond threshold
 *
 * ```typescript
 * const AppState = new Galena({}, new Profiler());
 * // or
 * AppState.registerMiddlerware(new Profiler());
 * // or
 * const MyState = new State(4, new Profiler());
 * // or
 * MyState.registerMiddleware(new Profiler());
 * ```
 */
export class Profiler<T = any> extends Middleware<T> {
  private previousState: T | null = null;
  private startTime: null | number = null;
  constructor(public readonly threshold = 16) {
    super();
  }

  public override onBeforeUpdate(state: State<T>) {
    this.startTime = performance.now();
    this.previousState = state.getSnapshot();
  }

  public override onUpdate(state: State<T>) {
    if (this.startTime === null) {
      return;
    }
    const diff = performance.now() - this.startTime;
    if (diff >= this.threshold) {
      console.warn(
        `A slow state transition of ${diff.toFixed(1)}ms was detected when transitioning the following piece of state`,
      );
      console.log(
        "   %cPrevious State",
        "color: #26ad65; font-weight: bold",
        this.previousState,
      );
      console.log(
        "   %cCurrent State    ",
        "color: rgb(17, 118, 249); font-weight: bold",
        state.getSnapshot(),
      );
    }
  }
}
