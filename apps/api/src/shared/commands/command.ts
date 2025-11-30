// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Command<TResponse = void, TPayload = unknown> {
  readonly type: string;
  readonly payload: TPayload;
}
