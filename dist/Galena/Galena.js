"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Galena = void 0;
const event_emitter_1 = require("@figliolia/event-emitter");
const State_1 = require("./State");
/**
 * ### Galena
 *
 * Lightning fast global state with lazy slices.
 *
 * #### Creating State
 * ```typescript
 * const State = new Galena([...middleware]);
 *
 * const NavigationState = State.createSlice("navigation", {
 *   currentRoute: "/",
 *   userID: "12345",
 *   permittedRoutes: ["/*"]
 * });
 * ```
 *
 * #### Subscribing to State Changes
 * ##### Using the Galena Instance
 * ```typescript
 * State.subscribe(globalState => {
 *  const currentRoute = globalState.navigation.get("currentRoute");
 *  // do something on state changes!
 * });
 * ```
 * ##### Using the Slice Instance
 * ```typescript
 * NavigationState.subscribe(navigation => {
 *  const currentRoute = navigation.get("currentRoute");
 *  // do something on state changes!
 * });
 * ```
 *
 * #### Mutating State
 * ```typescript
 * NavigationState.update(currentState => {
 *  currentState.currentRoute = "/profile";
 *  // You can mutate state without creating new objects!
 *  // Mutations such as this one will propagate to subscriptions!
 * });
 * ```
 */
class Galena {
    constructor(...middleware) {
        this.state = {};
        this.middleware = [];
        this.IDs = new event_emitter_1.AutoIncrementingID();
        this.subscriptions = new Map();
        this.middleware = middleware;
    }
    /**
     * Create Slice
     *
     * Creates a new `State` instance and returns it. Your new state
     * becomes immediately available on your `Galena` instance and
     * is wired into your middleware. All existing subscriptions to
     * state will automatically receive updates when your new slice's
     * state updates
     */
    createSlice(name, initialState) {
        const state = new State_1.State(name, initialState);
        state.registerMiddleware(...this.middleware);
        this.mutable[name] = state;
        this.reIndexSubscriptions(name);
        return state;
    }
    /**
     * Get Slice
     *
     * Returns a `State` instance by key
     */
    getSlice(key) {
        return this.state[key];
    }
    /**
     * Mutable
     *
     * Returns a mutable state instance
     */
    get mutable() {
        return this.state;
    }
    /**
     * Subscribe
     *
     * Registers a callback on each `State` instance and is invoked
     * each time your state changes. Using `Galena`'s `subscribe`
     * method, although highly performant, can be less performant
     * than subscribing directly to the `State` instance.
     *
     * Returns a subscription ID
     */
    subscribe(callback) {
        const subscriptionID = this.IDs.get();
        const stateSubscriptions = [];
        for (const key in this.state) {
            stateSubscriptions.push([
                key,
                this.state[key].subscribe(() => {
                    callback(this);
                }),
            ]);
        }
        this.subscriptions.set(subscriptionID, stateSubscriptions);
        return subscriptionID;
    }
    /**
     * Unsubscribe
     *
     * Given a subscription ID returned from the `subscribe` method,
     * this method removes and cleans up the corresponding subscription
     */
    unsubscribe(ID) {
        const IDs = this.subscriptions.get(ID);
        if (IDs) {
            for (const [state, ID] of IDs) {
                this.state[state].unsubscribe(ID);
            }
        }
    }
    /**
     * ReIndex Subscriptions
     *
     * When slices of state are created lazily, this method updates
     * each existing subscription to receive mutations occurring on
     * recently created `State` instances that post-date prior
     * subscriptions
     */
    reIndexSubscriptions(name) {
        var _a;
        for (const [ID, sliceSubscriptions] of this.subscriptions) {
            for (const [state, subscriptionID] of sliceSubscriptions) {
                const callback = (_a = this.state[state]["emitter"]
                    .get(state)) === null || _a === void 0 ? void 0 : _a.get(subscriptionID);
                if (callback) {
                    sliceSubscriptions.push([
                        name,
                        this.state[name].subscribe(() => {
                            void callback(this.state);
                        }),
                    ]);
                    this.subscriptions.set(ID, sliceSubscriptions);
                    break;
                }
            }
        }
    }
}
exports.Galena = Galena;
