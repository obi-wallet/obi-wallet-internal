import { z } from "zod";

export type Message = unknown;

export const MessageJson = z.unknown().brand<"MessageJson">();
export type MessageJson = z.infer<typeof MessageJson>;
