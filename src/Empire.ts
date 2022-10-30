import type { State } from "./State";
import type { EmpireSubscription } from "./types";
import { AutoIncrementingID } from "./AutoIncrementingID";
import { Emitter } from "./Emitter";

/**
 * Empire
 *
 * Your on-the-fly global state. With each extension of the `State`
 * interface, your empire is built. To access the global state for
 * values or subscriptions, leverage this interface's `getState`,
 * `subscribe`, and `unsubscribe` methods
 */
export class Empire {
  private static _state = new Map<string, State<any>>();
  public static stateUpdateID = new AutoIncrementingID();
  private static subscriptionID = new AutoIncrementingID();
  private static subscriptions = new Map<string, EmpireSubscription[]>();

  /**
   * State
   *
   * Returns the current value for the Empire state
   */
  public static get state() {
    return this._state;
  }

  /**
   * All State
   *
   * Returns an iterable of the currently available states
   */
  public static get allStates() {
    return this._state.values();
  }

  /**
   * Get State
   *
   * Returns a `State` instance by name
   */
  public static getState<T = any>(name: string) {
    if (!this._state.get(name)) {
      throw new Error(`No state exists for the name ${name}`);
    }
    return this._state.get(name) as State<T>;
  }

  /**
   * Add
   *
   * Adds a `State` interface to the `Empire`
   *
   * Note: This is primarily for internal usage
   */
  public static add<T>(key: string, state: State<T>) {
    this._state.set(key, state);
  }

  /**
   * Subscribe
   *
   * Adds a subscription to each of the `Empire's` `States` and
   * invokes your callback anytime a change is made. Returns an
   * ID with which to `unsubscribe`
   *
   * Note: This is slower than subscribing to individual `States`
   * within the `Empire`
   */
  public static subscribe(func: (state: Map<string, State<any>>) => void) {
    const ID = this.subscriptionID.nextID;
    const IDs: { name: string; ID: string }[] = [];
    for (const [name, State] of this._state) {
      IDs.push({
        name,
        ID: State.subscribe(() => {
          func(this._state);
        }),
      });
    }
    this.subscriptions.set(ID, IDs);
    return ID;
  }

  /**
   * Unsubscribe
   *
   * Removes your `Empire State` subscription by ID
   */
  public static unsubscribe(ID: string) {
    const IDs = this.subscriptions.get(ID) || [];
    IDs.forEach(({ name, ID }) => {
      const state = this.getState(name);
      if (state) {
        state.unsubscribe(ID);
      }
    });
  }

  /**
   * Destroy
   *
   * 1. Destroys all `State` instances and subscriptions,
   * 2. Resets the autoIncrementingId's and the Emitter
   */
  public static destroy() {
    this._state = new Map<string, State<any>>();
    this.stateUpdateID.destroy();
    this.subscriptionID.destroy();
    this.subscriptions = new Map<string, EmpireSubscription[]>();
    Emitter.destroy();
  }
}
