"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const bc = new BroadcastChannel("tasks");

    bc.onmessage = (event) => {
      if (event.data === "task-updated") {
        router.refresh();
      }
    };

    return () => bc.close();
  }, []);

  return null;
}
