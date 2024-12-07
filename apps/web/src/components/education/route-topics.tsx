"use client";

import { useStore } from "@/contexts/store";
import { observer } from "mobx-react-lite";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const RouteTopics = observer(function RouteTopics() {
  const { educationStore } = useStore();
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // If the path has changed, we should update the topic
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      const route = pathname.split("/")[2] || ""; // Get the main route segment

      switch (route) {
        case "":
          educationStore.setTopicById("dashboard_home", "router");
          break;
        case "buy-crypto":
          educationStore.setTopicById("buy_crypto", "router");
          break;
        case "settings":
          educationStore.setTopicById("security_settings", "router");
          break;
        case "app-connect":
          educationStore.setTopicById("app_connect", "router");
          break;
        case "tokens": {
          const subRoute = pathname.split("/")[3] || "";
          if (subRoute === "add") {
            educationStore.setTopicById("import_asset_info", "router");
          }
          break;
        }
      }
    }
  }, [pathname, educationStore]);

  return null;
});
