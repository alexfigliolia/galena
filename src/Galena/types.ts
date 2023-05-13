import type { State } from "./State";

export type MutationEvent<T extends any> = {
  [key: State<T>["name"]]: State<T>;
};
