import type { State } from "Galena/State";

export enum MiddlewareEvents {
  "onUpdate" = "onUpdate",
  "onBeforeUpdate" = "onBeforeUpdate",
}

export type MiddlewareEvent<T extends any = any> = Record<
  MiddlewareEvents,
  State<T>
>;
