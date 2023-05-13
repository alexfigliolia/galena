import type { State } from "Galena/State";

export enum SupportedEvents {
  "onUpdate" = "onUpdate",
  "onBeforeUpdate" = "onBeforeUpdate",
}

export type MiddlewareEvent<T extends any = any> = Record<
  SupportedEvents,
  State<T>
>;
