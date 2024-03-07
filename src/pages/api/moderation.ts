import type { NextApiRequest, NextApiResponse } from "next";
import { log } from "@/shared/logging";
import { getSecret } from "@/server/shared/secrets";

// Define a type for the expected response structure from OpenAI's moderation API
interface ModerationResponse {
  results: [
    {
      flagged: boolean;
    }
  ];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { text } = req.body;
    const key = getSecret("openai-api-key").trim();

    try {
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use an environment variable for the API key
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ input: text }),
      });

      // Cast the response to the ModerationResponse interface
      const data: ModerationResponse = await response.json();

      // Check if the text was flagged and return the boolean result
      const flagged = data.results[0].flagged;
      res.status(200).json({ flagged });
    } catch (error: any) {
      log.error("Moderation API error:", error);
      res.status(500).json({ error: "Failed to fetch moderation results" });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
