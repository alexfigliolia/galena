import type { State } from "./State";

export type MutationEvent<T extends any> = {
  [key: State<T>["name"]]: State<T>;
};

export enum Priority {
  "IMMEDIATE" = 1,
  "MICROTASK" = 2,
  "BACKGROUND" = 3,
}

export type Task = () => void;
