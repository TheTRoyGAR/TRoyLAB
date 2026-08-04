export const dynamic = 'force-static'

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are TRoyGO AI, an expert AI travel planner for TRoy Travel Agency™. Help users plan amazing trips with personalized itineraries, local insights, hotel and flight recommendations, budget estimates, and travel tips. Be enthusiastic, knowledgeable, and helpful. When users provide trip details, create detailed day-by-day itineraries. Always suggest local hidden gems alongside popular attractions. Format responses with clear sections using markdown.

When creating itineraries, use this structure for each day:
## Day N: [Theme/Title]

### Morning
- Activity details

### Afternoon
- Activity details

### Evening
- Activity details

**Estimated Cost:** $X - $Y

Include practical tips, local restaurant recommendations, and transportation advice throughout.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      history = [],
      tripDetails,
    }: {
      message: string;
      history: Array<{ role: string; content: string }>;
      tripDetails?: object;
    } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build message history for Claude
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    for (const msg of history) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    // Add current message, prepend trip details if first message
    let currentMessage = message;
    if (tripDetails && history.length === 0) {
      currentMessage = `Trip Details:\n${JSON.stringify(tripDetails, null, 2)}\n\nUser Request: ${message}`;
    }

    messages.push({
      role: "user",
      content: currentMessage,
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages,
          });

          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          controller.close();
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Streaming error";
          controller.enqueue(
            encoder.encode(
              `\n\nI encountered an error: ${errorMsg}. Please try again.`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("AI Planner API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
