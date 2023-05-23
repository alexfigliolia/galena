import type { State } from "./State";

/**
 * Guards
 *
 * Development-only warnings and runtime errors designed to
 * guard developers against possible pitfalls when using
 * Galena. This interface provides composable error and
 * warning methods that can be used to prevent invalid usage
 * of the library
 */
export class Guards<
  T extends Record<string, State<any>> = Record<string, State<any>>
> {
  /**
   * Warn For Undefined States
   *
   * In Galena, it's normal to lazy initialize a unit of state
   * in attached to a `Galena` instance. This warning lets
   * developers know that they are attempting to manipulate a
   * unit of state that has not yet been initialized
   */
  protected warnForUndefinedStates = this.developmentGuard(
    (name: string, state: T) => {
      if (!process.env.IGNORE_LAZY_STATE_WARNINGS && !(name in state)) {
        console.warn(
          `A unit of state with the name "${name}" does not yet exist on this Galena instance. If this is expected, you can ignore this warning. To make these warnings go away, you can enable this process argument - "IGNORE_WARNINGS_FOR_LAZY_STATES=1"`
        );
      }
    }
  );

  /**
   * Guard Duplicate States
   *
   * Throws an error if a developer attempts to create
   * more than one state with the same name on a single
   * `Galena` instance
   */
  protected guardDuplicateStates = this.developmentGuard(
    (name: string, state: T) => {
      if (name in state) {
        throw new Error(
          `A unit of state with the name "${name}" already exists on this Galena instance. Please re-name this new unit of state to something unique`
        );
      }
    }
  );

  /**
   * Development Guard
   *
   * Wraps a provided function in a check for `process.env.NODE_ENV`
   * equaling "development". Returns the callback
   */
  private developmentGuard<F extends (...args: any[]) => void>(guard: F) {
    return (...args: Parameters<F>) => {
      if (process.env.NODE_ENV === "development") {
        guard(...args);
      }
    };
  }
}
