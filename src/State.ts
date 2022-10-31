import { DevTool } from "./DevTool";
import { Emitter } from "./Emitter";
import type { Empire } from "./Empire";

/**
 * State
 *
 * Fragmented global state that is lazy, async-capable, and mutable
 * out of the box. Extending this interface creates state entries on
 * the `Empire` and provides means for accessing, subscribing, and
 * updating state. Updates and subscriptions that take place on
 * `State` interfaces are *highly* performant
 */
export class State<T> {
  private _state: T;
  public name: string;
  private Empire: Empire;
  constructor(Empire: Empire, name: string, state: T) {
    this.name = name;
    this._state = state;
    this.Empire = Empire;
    this.Empire.add(this.name, this);
  }

  /**
   * State
   *
   * Returns the current state
   */
  public get state() {
    return this._state;
  }

  /**
   * Update
   *
   * Executes a callback mutating the `State`. All subscribers
   * receive the result of the mutation
   */
  public update(func: (state: T) => void) {
    if (DevTool.isEnabled) {
      this.updateWithDevtool(func);
    } else {
      func(this._state);
    }
    Emitter.emit<T>(this.name, this._state);
  }

  /**
   * Update With DevTool
   *
   * Behaves the same as `State.update`, but enables logging
   * and profiling for state transitions
   */
  private updateWithDevtool(func: (state: T) => void) {
    const nextID = this.Empire.stateUpdateID.nextID;
    DevTool.onPrevState(this.name, this.Empire.state, nextID);
    func(this._state);
    DevTool.onNextState(this.name, this.Empire.state, nextID);
  }

  /**
   * Subscribe
   *
   * Opens a subscription to the extending `State` interface
   */
  public subscribe(func: (state: T) => void) {
    return Emitter.subscribe<T>(this.name, func);
  }

  /**
   * Unsubscribe
   *
   * Removes a subscription to the extending `State` interface
   */
  public unsubscribe(ID: string) {
    return Emitter.unsubscribe(this.name, ID);
  }
}
