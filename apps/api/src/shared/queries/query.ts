// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Query<TResponse, TPayload = unknown> {
  readonly type: string;
  readonly payload: TPayload;
}
