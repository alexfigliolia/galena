import type { State } from "./State";

export type MutationEvent<T extends any> = {
  [key: State<T>["name"]]: T;
};

export enum Priority {
  "IMMEDIATE" = 1,
  "MICROTASK" = 2,
  "BATCHED" = 3,
}

export type Task = () => void;
