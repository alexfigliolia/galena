"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profiler = void 0;
const Middleware_1 = require("../Middleware/Middleware");
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
class Profiler extends Middleware_1.Middleware {
    constructor(threshold = 16) {
        super();
        this.startTime = null;
        this.threshold = threshold;
    }
    onBeforeUpdate(_) {
        this.startTime = performance.now();
    }
    onUpdate(nextState) {
        if (this.startTime) {
            const endTime = performance.now();
            const diff = endTime - this.startTime;
            if (diff > this.threshold) {
                console.warn("Slow state transition detected", nextState);
                console.warn(`The last transition took ${diff}ms`);
            }
        }
    }
}
exports.Profiler = Profiler;
