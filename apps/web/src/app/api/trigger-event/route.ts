import { triggerEvent } from "@/points";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  userEntryAddress: z.string(),
  event: z.object({
    type: z.string(),
    payload: z.object({}),
  }),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { userEntryAddress, event } = result.data;
  // TODO: Here we need to validate client-side events depending on the event type.
  // E.g., for app-connect, make sure that the txHash points to a tx that was actually sent by the wallet address and is
  // not older than 5 minutes.

  // app connect validation
  

  await triggerEvent({ userEntryAddress, event });

  return new Response("Event triggered", {
    status: 200,
  });
}
