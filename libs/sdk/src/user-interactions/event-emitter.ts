import EventEmitter from "eventemitter3";

export const userInteractionEvent = Symbol("user-interaction-event");
export const eventEmitter = new EventEmitter<
  typeof userInteractionEvent,
  never
>();
