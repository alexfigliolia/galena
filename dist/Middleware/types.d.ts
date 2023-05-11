import type { State } from "../Galena/State";
export declare enum SupportedEvents {
    "onUpdate" = "onUpdate",
    "onBeforeUpdate" = "onBeforeUpdate"
}
export type MiddlewareEvent = Record<SupportedEvents, State>;
