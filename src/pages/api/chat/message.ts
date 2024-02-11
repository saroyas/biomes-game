import { okOrAPIError } from "@/server/web/errors";
import { biomesApiHandler } from "@/server/web/util/api_middleware";
import { zChatMessage } from "@/shared/chat/messages";
import {
  USER_INITIATED_MESSAGE_TYPES,
  zDelivery,
  zMessageVolume,
} from "@/shared/chat/types";
import { zBiomesId } from "@/shared/ids";
import { z } from "zod";
import { log } from "@/shared/logging"; // Import the log utility

export const zSendMessageRequest = z.object({
  localTime: z.number(),
  volume: zMessageVolume,
  message: zChatMessage,
  to: zBiomesId.optional(),
});

export type SendMessageRequest = z.infer<typeof zSendMessageRequest>;

export const zSendMessageResponse = z.object({
  delivery: zDelivery.optional(),
});

export type SendMessageResponse = z.infer<typeof zSendMessageResponse>;

export default biomesApiHandler(
  {
    auth: "required",
    body: zSendMessageRequest,
    response: zSendMessageResponse,
  },
  async ({
    context: { chatApi },
    auth: { userId },
    body: { localTime, volume, message, to },
  }) => {
    // Log the full incoming request details
    log.info("sendMessage request received", {
      userId,
      localTime,
      volume,
      to,
    });

    // Validate the message kind
    try {
      okOrAPIError(USER_INITIATED_MESSAGE_TYPES.has(message.kind), "bad_param");
      const result = await chatApi.sendMessage({
        localTime,
        from: userId,
        spatial: {
          volume,
        },
        message,
        to,
      });

      // Log the successful delivery including all details about the delivery
      log.info("Message sent successfully", {
        userId,
        localTime,
        volume,
        messageKind: message.kind,
        to,
        channelName: result.echo?.channelName,
      });

      return {
        delivery: result.echo,
      };
    } catch (error) {
      // Log the error with detailed info
      log.error("Error sending message", {
        userId,
        localTime,
        volume,
        messageKind: message.kind,
        to,
        error: error, // Log a descriptive error message
      });
      throw error; // Re-throw the error for further handling
    }
  }
);
