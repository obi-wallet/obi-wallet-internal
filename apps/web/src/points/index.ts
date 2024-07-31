import { serialize } from "@obi-wallet/sdk-json";

export interface PointEvent {
  type: string;
  payload: unknown;
}

export async function triggerEvent({
  userEntryAddress,
  event,
}: {
  userEntryAddress: string;
  event: PointEvent;
}) {
  if (typeof window === "undefined") {
    // We are on the server, directly call the worker
    // TODO: @inyono: authorize requests (e.g., by signing events)

    console.log("triggered! event's payload", event.payload);
    const getEventId = () => {
      switch (event.type) {
        case "create-wallet":
          return 1;
        case "add-key":
          return 2;
        case "remove-key":
          return 3;
        case "app-connect":
          return 4;
        default:
          // Fake event ID
          return 999;
      }
    };

    return await fetch(
      `https://points.obiwallet.workers.dev/debug/trigger/${userEntryAddress}`,
      {
        method: "POST",
        body: serialize({
          type: getEventId(),
          payload: event.payload,
        }),
      },
    );
  } else {
    console.log("this is client event", serialize({ userEntryAddress, event }));
    // We are on the client, use our API route that validates the event
    return await fetch("/api/trigger-event", {
      method: "POST",
      body: serialize({ userEntryAddress, event }),
    });
  }
}
