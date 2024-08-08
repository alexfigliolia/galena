import type { State } from "Galena/State";
import { Middleware } from "Middleware/Middleware";

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
export class Profiler extends Middleware {
  private threshold: number;
  private startTime: number | null = null;
  constructor(threshold = 16) {
    super();
    this.threshold = threshold;
  }
  onBeforeUpdate(_: State) {
    this.startTime = performance.now();
  }

  onUpdate(nextState: State) {
    if (this.startTime) {
      const endTime = performance.now();
      const diff = endTime - this.startTime;
      if (diff > this.threshold) {
        console.warn(
          `A slow state transition was detected on ${nextState.name}`,
          nextState.getState(),
        );
        console.warn(`The last transition took ${diff}ms`);
      }
    }
  }
}
