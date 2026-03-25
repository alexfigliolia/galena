import type { State } from "./State";

export type NonFunction<T> = T extends (...args: any[]) => any ? never : T;

export type PartialSupport<T> = T extends Record<string, any> ? Partial<T> : T;

export type Setter<T> =
  | NonFunction<T>
  | ((prevState: NonFunction<T>) => NonFunction<T> | Promise<NonFunction<T>>);

export type Subscriber<T> = ((state: NonFunction<T>) => void) | (() => void);

export interface GalenaSnapshot<
  T extends Record<string, State<any>>,
  K extends Extract<keyof T, string> = Extract<keyof T, string>,
> {
  updated: T[K];
  state: T;
}

export type AppSubscriber<
  T extends Record<string, State<any>>,
  K extends Extract<keyof T, string> = Extract<keyof T, string>,
> = ((payload: GalenaSnapshot<T, K>) => void) | (() => void);

export type StateTypes<T extends Record<string, State<any>>> = ReturnType<
  T[keyof T]["getSnapshot"]
>;
