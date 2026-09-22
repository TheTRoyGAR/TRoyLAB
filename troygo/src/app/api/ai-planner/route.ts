export const dynamic = 'force-static'

import Anthropic from "@anthropic-ai/sdk";
import { searchFlights } from "@/lib/duffel/search";
import { resolveIataCode } from "@/lib/duffel/airports";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SERPER_API_KEY = process.env.SERPER_API_KEY;

const SYSTEM_PROMPT = `You are TRoyGO AI, an expert AI travel planner for TRoy Travel Agency™. Help users plan amazing trips with personalized itineraries, local insights, hotel and flight recommendations, budget estimates, and travel tips. Be enthusiastic, knowledgeable, and helpful.

You have real web search and page-reading tools — use them. Never guess current prices, opening hours, or availability from memory; look them up. When you mention a specific price, hotel, restaurant, or attraction as a real current recommendation, it should come from an actual search result or page you read, not from training knowledge alone. If you're giving general travel advice (typical trip length, packing tips, visa basics), training knowledge is fine — but anything time-sensitive (prices, deals, "is this open," current events affecting travel) must be looked up.

You also have a search_flights tool that queries our real, live airline booking system (Duffel) directly — not a web search, the actual system this agency uses to sell real, bookable tickets. Whenever the trip involves flights and you know (or can infer from the conversation) the origin, destination, and a departure date, call search_flights instead of guessing or web-searching for flight prices. Its results are real bookable offers with real prices — present a few of the best ones in your reply (by airline, time, and price) and mention that the traveler can book any of them directly from this chat. Never invent a flight number, price, or airline — only ones this tool actually returned.

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
      "Search the web for current, real information — hotel prices, current deals, opening hours, travel advisories, events. Returns a list of results with titles, snippets, and URLs.",
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
  {
    name: "search_flights",
    description:
      "Search REAL, live, bookable flights through our own airline booking system (Duffel) — the same system this agency uses to actually issue tickets. Use this any time the trip involves flying and you know the origin, destination, and departure date. Origin/destination can be a city or airport name (e.g. \"Sydney\", \"Darwin\") — it resolves to the real airport automatically. Returns real flight offers with real airlines, times, and total prices in the local currency.",
    input_schema: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Departure city or airport, e.g. 'Sydney' or 'SYD'" },
        destination: { type: "string", description: "Arrival city or airport, e.g. 'Darwin' or 'DRW'" },
        departureDate: { type: "string", description: "Departure date, YYYY-MM-DD" },
        returnDate: { type: "string", description: "Return date, YYYY-MM-DD, for a round trip. Omit for one-way." },
        adults: { type: "number", description: "Number of adult (12+) passengers. Default 1." },
        childAges: { type: "array", items: { type: "number" }, description: "Age (2-11) of each child passenger, one entry per child." },
        infantAges: { type: "array", items: { type: "number" }, description: "Age in months (0-23) of each infant passenger, one entry per infant." },
        cabinClass: { type: "string", enum: ["economy", "business", "first"], description: "Default economy." },
      },
      required: ["origin", "destination", "departureDate"],
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

interface FlightSearchToolInput {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  childAges?: number[];
  infantAges?: number[];
  cabinClass?: string;
}

// Runs the real Duffel search for the AI tool call. Returns the text the
// model sees (a compact summary it can describe in its own words) plus,
// separately, the real flight objects and the exact route it searched —
// the route is re-sent later so a fresh search can reproduce this same
// request once the offer has expired (same pattern /flights uses).
async function runFlightSearchTool(input: FlightSearchToolInput): Promise<{
  toolResultText: string;
  cardsPayload: string | null;
}> {
  const [originCode, destinationCode] = await Promise.all([
    resolveIataCode(input.origin),
    resolveIataCode(input.destination),
  ]);

  if (!originCode || !destinationCode) {
    return {
      toolResultText: `Could not resolve a real airport for "${!originCode ? input.origin : input.destination}". Ask the traveler to clarify the city or airport name.`,
      cardsPayload: null,
    };
  }

  const adults = input.adults ?? 1;
  const children = input.childAges ?? [];
  const infants = input.infantAges ?? [];
  const cabinClass = input.cabinClass ?? "economy";

  const result = await searchFlights({
    origin: originCode,
    destination: destinationCode,
    departureDate: input.departureDate,
    returnDate: input.returnDate,
    adults,
    children,
    infants,
    cabinClass,
  });

  if ("error" in result) {
    return {
      toolResultText: `Flight search failed: ${result.error}${result.details ? ` — ${result.details}` : ""}`,
      cardsPayload: null,
    };
  }

  if (result.flights.length === 0) {
    return {
      toolResultText: `No real flights found for ${originCode}→${destinationCode} on ${input.departureDate}. This route/date may not have connected airline content in our booking system right now — say so honestly rather than suggesting a price.`,
      cardsPayload: null,
    };
  }

  const top = result.flights.slice(0, 6);
  const summary = top
    .map(
      (f) =>
        `- ${f.airline} ${f.flightNumber}: ${f.from.code}→${f.to.code}, dep ${f.departure}, ${f.stops === 0 ? "direct" : `${f.stops} stop(s)`}, ${f.duration}, ${f.currency} ${f.price.economy.toFixed(2)} total${f.returnLeg ? " (round trip)" : ""} [offer ${f.id}]`
    )
    .join("\n");

  const cardsPayload = JSON.stringify({
    flights: top,
    route: {
      origin: originCode,
      destination: destinationCode,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      adults,
      children,
      infants,
      cabinClass,
    },
  });

  return {
    toolResultText: `Real live flight offers found (already shown to the traveler as bookable cards — describe them briefly, don't repeat every detail):\n${summary}`,
    cardsPayload,
  };
}

async function runTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ toolResultText: string; cardsPayload: string | null }> {
  if (name === "search_web") return { toolResultText: await searchWeb(String(input.query ?? "")), cardsPayload: null };
  if (name === "read_page") return { toolResultText: await readPage(String(input.url ?? "")), cardsPayload: null };
  if (name === "search_flights") return runFlightSearchTool(input as unknown as FlightSearchToolInput);
  return { toolResultText: `Unknown tool: ${name}`, cardsPayload: null };
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
              toolUseBlocks.map(async (block) => {
                const { toolResultText, cardsPayload } = await runTool(block.name, block.input as Record<string, unknown>);
                if (cardsPayload) {
                  controller.enqueue(encoder.encode(`\n\n<<FLIGHTS_DATA>>${cardsPayload}<<END_FLIGHTS_DATA>>\n\n`));
                }
                return {
                  type: "tool_result" as const,
                  tool_use_id: block.id,
                  content: toolResultText,
                };
              })
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
