import { Event } from "@api/shared/events/events";

export interface IEventHandler<T extends Event = Event> {
  handle(event: T): void | Promise<void>;
}
