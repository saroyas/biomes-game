import { getSecret } from "@/server/shared/secrets";
import { okOrAPIError } from "@/server/web/errors";
import { biomesApiHandler } from "@/server/web/util/api_middleware";
import type { ReadonlyEntity } from "@/shared/ecs/gen/entities";
import { zBiomesId } from "@/shared/ids";
import { createGauge } from "@/shared/metrics/metrics";
import { relevantBiscuitForEntity } from "@/shared/npc/bikkie";
import { andify } from "@/shared/util/text";
import { sumBy } from "lodash";
import type { ChatCompletionRequestMessage } from "openai";
import { z } from "zod";
import { log } from "@/shared/logging";

const METRICS = {
  contextSize: createGauge({
    name: "generated_chat_context_size",
    help: "Size of generated chat (OpenAI requests)",
  }),
};

export const zGeneratedChatRequest = z.object({
  entityId: zBiomesId,
  userResponse: z.string().optional(),
  messageContext: z.string().optional(),
});

export type GeneratedChatRequest = z.infer<typeof zGeneratedChatRequest>;

export const zGeneratedChatResponse = z.object({
  nextDialog: z.object({
    message: z.string(),
    buttons: z.string().array(),
    terminated: z.boolean(),
  }),
  messageContext: z.string(),
});

export type GeneratedChatResponse = z.infer<typeof zGeneratedChatResponse>;

function parseDialog(input: string): { buttons: string[]; dialog: string } {
  const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  const buttons: string[] = [];
  let buttonMatch: RegExpExecArray | null;

  let startButton = Infinity;
  while ((buttonMatch = buttonRegex.exec(input)) !== null) {
    startButton = Math.min(buttonMatch.index, startButton);
    buttons.push(buttonMatch[1]);
  }

  return {
    buttons,
    dialog: startButton < 100000 ? input.slice(0, startButton) : "",
  };
}

function systemPromptForEntity(user: ReadonlyEntity, entity: ReadonlyEntity) {
  const userName = user.label?.text ?? "Unknown";
  const wearingStrs: string[] = [];
  user.wearing?.items.forEach((val) => {
    wearingStrs.push(val.displayName);
  });

  const relevantBiscuit = relevantBiscuitForEntity(entity);

  let creatorText = "";
  if (entity.entity_description) {
    creatorText = `You are to behave like your creators description of you: ${entity.entity_description.text}. `;
  }
  const npcName = entity.label?.text ?? "Unknown";

  const containerItem = entity.container_inventory?.items[0];

  if (relevantBiscuit?.isMount) {
    return `\
You are a fish mounted on a plaque similar to the popular Billy Bass toy.
Your messages should be in the form of short rhyming music. Do not include the words 'verse' or 'chorus'. \
Your fish species is ${
      containerItem?.item.displayName ?? "unknown"
    }, make sure to reference it in your song.
Your messages will display inside with user choices. \
In every message enclose exactly two short options for player responses in <button> XML tags. \
A player named ${userName} will be interacting with you. Make up anything you want. \
For context, ${userName} is wearing ${andify(wearingStrs)}. \
Respond with short rhyming song lyrics.
`.trim();
  }

  return `\
You are ${npcName}, a NPC in an online video game named Oasis. ${creatorText}\
Your messages should be short, personable and full of puns. \
Your messages will display inside of the game with user choices. \
In every message enclose two or three short options for player responses in <button> XML tags. \
A player named ${userName} will be interacting with you and wants to chit-chat. Make up anything you want. \
For context, ${userName} is wearing ${andify(wearingStrs)}. \
Start with an opening message for ${userName} that remarks on their outfit and explains who you are. \
`.trim();
}

export default biomesApiHandler(
  {
    auth: "required",
    body: zGeneratedChatRequest,
    response: zGeneratedChatResponse,
  },
  async ({
    auth: { userId },
    context: { worldApi },
    body: { entityId, messageContext, userResponse },
  }) => {
    const key = getSecret("openai-api-key").trim();
    okOrAPIError(key, "killswitched", "OpenAI API key not found!");
    const [entity, user] = await worldApi.get([entityId, userId]);
    okOrAPIError(entity, "not_found", `Entity ${entityId} not found!`);
    okOrAPIError(user, "not_found", `User ${userId} not found!`);
    const userName = user.label()?.text ?? "Unknown";

    const messages: ChatCompletionRequestMessage[] = messageContext
      ? JSON.parse(messageContext)
      : [
          {
            role: "system",
            content: systemPromptForEntity(
              user.materialize(),
              entity.materialize()
            ),
          },
        ];

    if (userResponse) {
      messages.push({
        role: "user",
        content: `${userName} responds with: ${userResponse}`,
      });
    }

    log.info("OpenAI request", { messages });

    METRICS.contextSize.set(sumBy(messages, (e) => e.content.length));

    // Use the direct approach with fetch API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nousresearch/nous-hermes-2-mistral-7b-dpo", // Update the model name if needed
          messages,
          max_tokens: 200,
        }),
      }
    ).then((res) => res.json());

    log.info("OpenAI response", response);

    const nextMessage = response.choices[0];
    const nextMessageContent = nextMessage.message?.content ?? "";
    const { dialog, buttons } = parseDialog(nextMessageContent);
    const nextMessageContext = [...messages];

    if (nextMessage?.message) {
      nextMessageContext.push(nextMessage.message);
    }

    return {
      nextDialog: {
        message: dialog,
        buttons: buttons,
        terminated: !!nextMessage?.finish_reason,
      },
      messageContext: JSON.stringify(nextMessageContext),
    };
  }
);
