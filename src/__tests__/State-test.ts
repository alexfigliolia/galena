import { MockInterfaces } from "../MockInterfaces";
import { DevTool } from "../DevTool";
import { Empire } from "../Empire";
import { State } from "../State";

const empire = new Empire();

describe("State", () => {
  afterEach(() => {
    MockInterfaces.restoreAllMocks();
    empire.destroy();
  });

  describe("The Empire State object", () => {
    it("Adds states to the global state", () => {
      const toggle = new State<boolean>(empire, "toggle", false);
      const someState = new State<{ someState: boolean }>(empire, "some-state", { someState: false });
      expect(empire.getState("toggle")).toEqual(toggle);
      expect(empire.getState("some-state")).toEqual(someState);
    });

    it("Updates state on the global state", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const someState = new State<{ someState: boolean }>(empire, "some-state", { someState: false });
      toggle.update((state) => {
        state[0] = true;
      });
      someState.update((state) => {
        state.someState = true;
      });
      expect(empire.getState("some-state")?.state.someState).toEqual(true);
      expect(empire.getState("toggle")?.state).toEqual([true]);
    });
  });

  describe("Dev Tools", () => {
    describe("Logger", () => {
      beforeEach(() => {
        DevTool.enableLogging();
        MockInterfaces.mockObject(console, "log");
        const toggle = new State<boolean[]>(empire, "toggle", [false]);
        toggle.update((state) => {
          state[0] = true;
        });
      });

      afterEach(() => {
        DevTool.disableLogging();
      });

      it("Devtool logs when updating state", () => {
        const someState = new State<{ someState: boolean }>(empire, "some-state", { someState: false });
        someState.update((state) => {
          state.someState = true;
        });
        expect(console.log).toHaveBeenCalledTimes(6);
      });

      it("Devtool logs the transitioning state object", () => {
        const toggle = new State<boolean[]>(empire, "toggle", [false]);
        toggle.update((state) => {
          state[0] = true;
        });
        const [state, prevState, nextState] = (console.log as jest.Mock).mock.calls;
        expect(state).toContain("%ctoggle");
        expect(prevState).toContain("%cprevState:");
        expect(nextState).toContain("%cnextState:");
      });
    });

    describe("Performance Profiling", () => {
      beforeEach(() => {
        DevTool.enablePerformance();
        MockInterfaces.mockObject(console, "log");
        const toggle = new State<boolean[]>(empire, "toggle", [false]);
        toggle.update((state) => {
          state[0] = true;
        });
      });

      afterEach(() => {
        DevTool.disablePerformance();
      });

      it("Devtool logs performance profiling when updating state", () => {
        const someState = new State<{ someState: boolean }>(empire, "some-state", { someState: false });
        someState.update((state) => {
          state.someState = true;
        });
        expect(console.log).toHaveBeenCalledTimes(2);
      });

      it("Devtool logs the state's transition duration", () => {
        const toggle = new State<boolean[]>(empire, "toggle", [false]);
        toggle.update((state) => {
          state[0] = true;
        });
        const [state, _, duration] = (console.log as jest.Mock).mock.calls[0];
        expect(state).toEqual("%ctoggle - Transition Duration:");
        expect(duration).toContain("milliseconds");
      });
    });
  });

  describe("Subscriptions", () => {
    it("State updates trigger subscriptions from State instances", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const subscription = jest.fn().mockImplementation((state) => state);
      toggle.subscribe(subscription);
      toggle.update((state) => {
        state[0] = true;
      });
      expect(subscription).toHaveBeenCalledWith([true]);
    });

    it("State updates do not trigger removed subscriptions", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const subscription = jest.fn().mockImplementation((state) => state);
      const ID = toggle.subscribe(subscription);
      toggle.unsubscribe(ID);
      toggle.update((state) => {
        state[0] = true;
      });
      expect(subscription).toHaveBeenCalledTimes(0);
    });

    it("State updates trigger subscriptions from the Empire", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const subscription = jest.fn().mockImplementation((state) => state);
      empire.getState<boolean[]>("toggle")?.subscribe(subscription);
      toggle.update((state) => {
        state[0] = true;
      });
      expect(subscription).toHaveBeenCalledWith([true]);
    });

    it("State updates do not trigger removed subscriptions from the Empire", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const subscription = jest.fn().mockImplementation((state) => state);
      const ID = empire.getState<boolean[]>("toggle")?.subscribe(subscription);
      empire.getState<boolean[]>("toggle")?.unsubscribe(ID);
      toggle.update((state) => {
        state[0] = true;
      });
      expect(subscription).toHaveBeenCalledTimes(0);
    });

    it("Empire subscriptions update as the result of a State update", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const subscription = jest.fn().mockImplementation((state) => state);
      empire.subscribe(subscription);
      toggle.update((state) => {
        state[0] = true;
      });
      expect(subscription).toHaveBeenCalledWith(new Map([["toggle", toggle]]));
    });

    it("Empire subscriptions do not update after they are removed", () => {
      const toggle = new State<boolean[]>(empire, "toggle", [false]);
      const subscription = jest.fn().mockImplementation((state) => state);
      const ID = empire.subscribe(subscription);
      empire.unsubscribe(ID);
      toggle.update((state) => {
        state[0] = true;
      });
      expect(subscription).toHaveBeenCalledTimes(0);
    });
  });
});
