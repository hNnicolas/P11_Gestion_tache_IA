// eventBus.ts
import { ITask } from "@/lib/prisma";

type EventMap = {
  taskCreated: ITask;
  taskUpdated: ITask;
  taskDeleted: { id: string };
  projectUpdated: any;
};

export type EventKey = keyof EventMap;
export type Handler<K extends EventKey> = (payload: EventMap[K]) => void;

class EventBus {
  private listeners: Partial<Record<EventKey, Handler<any>[]>> = {};

  on<K extends EventKey>(event: K, handler: Handler<K>) {
    if (!this.listeners[event]) this.listeners[event] = [];
    (this.listeners[event] as Handler<K>[]).push(handler);
    return () => this.off(event, handler);
  }

  off<K extends EventKey>(event: K, handler: Handler<K>) {
    this.listeners[event] = (this.listeners[event] || []).filter(
      (h) => h !== handler
    );
  }

  emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    (this.listeners[event] || []).forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();
