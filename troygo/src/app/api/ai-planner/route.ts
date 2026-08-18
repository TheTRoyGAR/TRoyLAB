export const dynamic = 'force-static'

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SERPER_API_KEY = process.env.SERPER_API_KEY;

const SYSTEM_PROMPT = `You are TRoyGO AI, an expert AI travel planner for TRoy Travel Agency™. Help users plan amazing trips with personalized itineraries, local insights, hotel and flight recommendations, budget estimates, and travel tips. Be enthusiastic, knowledgeable, and helpful.

You have real web search and page-reading tools — use them. Never guess current prices, opening hours, or availability from memory; look them up. When you mention a specific price, hotel, restaurant, or attraction as a real current recommendation, it should come from an actual search result or page you read, not from training knowledge alone. If you're giving general travel advice (typical trip length, packing tips, visa basics), training knowledge is fine — but anything time-sensitive (prices, deals, "is this open," current events affecting travel) must be looked up.

When creating itineraries, use this structure for each day:
## Day N: [Theme/Title]

### Morning
- Activity details

### Afternoon
- Activity details

### Evening
- Activity details

**Estimated Cost:** $X - $Y

Include practical tips, local restaurant recommendations, and transportation advice throughout. Cite what you found real prices from when relevant (e.g. "current listed price via [source]").`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_web",
    description:
      "Search the web for current, real information — flight/hotel prices, current deals, opening hours, travel advisories, events. Returns a list of results with titles, snippets, and URLs.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "read_page",
    description:
      "Fetch and read the text content of a specific webpage URL (e.g. a hotel booking page, an attraction's official site) to get real current details.",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The full URL to read" },
      },
      required: ["url"],
    },
  },
];

async function searchWeb(query: string): Promise<string> {
  if (!SERPER_API_KEY) return "Search unavailable — no API key configured.";
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });
    if (!res.ok) return `Search failed: HTTP ${res.status}`;
    const data = await res.json();
    const organic = (data.organic || []).slice(0, 6);
    if (organic.length === 0) return "No results found.";
    return organic
      .map(
        (r: { title?: string; snippet?: string; link?: string }, i: number) =>
          `${i + 1}. ${r.title || ""}\n${r.snippet || ""}\n${r.link || ""}`
      )
      .join("\n\n");
  } catch (err) {
    return `Search error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function readPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TRoyGO-AI/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return `Could not fetch page: HTTP ${res.status}`;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 6000);
  } catch (err) {
    return `Fetch error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === "search_web") return searchWeb(String(input.query ?? ""));
  if (name === "read_page") return readPage(String(input.url ?? ""));
  return `Unknown tool: ${name}`;
}

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

    const messages: Anthropic.MessageParam[] = [];
    for (const msg of history) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
      }
    }

    let currentMessage = message;
    if (tripDetails && history.length === 0) {
      currentMessage = `Trip Details:\n${JSON.stringify(tripDetails, null, 2)}\n\nUser Request: ${message}`;
    }
    messages.push({ role: "user", content: currentMessage });

    const encoder = new TextEncoder();
    const MAX_TOOL_ROUNDS = 4;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
            const messageStream = client.messages.stream({
              model: "claude-sonnet-4-6",
              max_tokens: 4096,
              system: SYSTEM_PROMPT,
              tools: TOOLS,
              messages,
            });

            for await (const event of messageStream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }

            const finalMessage = await messageStream.finalMessage();
            const toolUseBlocks = finalMessage.content.filter(
              (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
            );

            if (toolUseBlocks.length === 0 || round === MAX_TOOL_ROUNDS) {
              break;
            }

            messages.push({ role: "assistant", content: finalMessage.content });

            const toolResults = await Promise.all(
              toolUseBlocks.map(async (block) => ({
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: await runTool(block.name, block.input as Record<string, unknown>),
              }))
            );

            messages.push({ role: "user", content: toolResults });
          }

          controller.close();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Streaming error";
          controller.enqueue(encoder.encode(`\n\nI encountered an error: ${errorMsg}. Please try again.`));
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
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
