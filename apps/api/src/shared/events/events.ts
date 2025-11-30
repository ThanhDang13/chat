export interface Event<TType extends string = string, TPayload = unknown> {
  readonly type: TType;
  readonly payload: TPayload;
}
