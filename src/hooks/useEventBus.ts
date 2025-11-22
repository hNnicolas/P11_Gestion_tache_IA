"use client";

import { useEffect, useRef } from "react";
import { eventBus, EventKey, Handler } from "@/lib/eventBus";

export function useEventBus() {
  const handlersRef = useRef<{ event: EventKey; handler: Handler<any> }[]>([]);

  const on = <K extends EventKey>(event: K, handler: Handler<K>) => {
    const off = eventBus.on(event, handler);
    handlersRef.current.push({ event, handler });
    return off;
  };

  const off = <K extends EventKey>(event: K, handler: Handler<K>) => {
    eventBus.off(event, handler);
    handlersRef.current = handlersRef.current.filter(
      (h) => h.event !== event || h.handler !== handler
    );
  };

  const emit = <K extends EventKey>(
    event: K,
    payload?: Parameters<Handler<K>>[0]
  ) => {
    eventBus.emit(event, payload);
  };

  // Nettoyage automatique
  useEffect(() => {
    return () => {
      handlersRef.current.forEach(({ event, handler }) =>
        eventBus.off(event, handler)
      );
      handlersRef.current = [];
    };
  }, []);

  return { on, off, emit };
}
