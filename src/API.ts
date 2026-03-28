import type { Middleware } from "./Middleware";

export abstract class API<T, E, M = T> {
  public readonly middleware: Middleware<M>[] = [];
  constructor(...middleware: Middleware<M>[]) {
    this.registerMiddleware(...middleware);
  }

  public abstract getState(): T;
  public abstract subscribe(subscriber: (payload: E) => void): () => void;
  public abstract registerMiddleware(...middlewares: Middleware<M>[]): void;
}
