import { NextRequest, NextResponse } from "next/server";
import { getHotel, getHotelReviews } from "@/lib/liteapi";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

/** Product knowledge: terms and codes used on Yes I Can Travel. Answer from this when users ask what they mean. */
const BOOKING_TERMS =
  "Booking and cancellation terms used on this site (use when users ask what a code or term means): " +
  "RFN = Refundable / free cancellation (you can cancel under the policy and get a refund). " +
  "NRFN = Non-refundable (the rate cannot be refunded if you cancel). " +
  "Board/meal plans: room rates may include breakfast, half board, or room only—shown as board name on each rate.";

/** Extract hotelId from pathname (/hotel/xyz) or from search params (?hotelId=xyz on checkout). */
function getHotelIdFromRequest(pathname: string, search: string): string | null {
  const fromPath = pathname.match(/^\/hotel\/([^/?#]+)/);
  if (fromPath) return fromPath[1];
  if (pathname === "/checkout" && search) {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    return params.get("hotelId");
  }
  return null;
}

/** Build a "what others say" block from sentiment/reviews data for the AI. */
function buildReviewsContext(sentiment: {
  pros?: string[];
  cons?: string[];
  categories?: Array<{ name?: string; rating?: number; description?: string }>;
}): string {
  const parts: string[] = [];
  if (sentiment.pros?.length)
    parts.push(`What guests liked: ${sentiment.pros.join(", ")}`);
  if (sentiment.cons?.length)
    parts.push(`What guests criticised: ${sentiment.cons.join(", ")}`);
  if (sentiment.categories?.length) {
    const catLines = sentiment.categories
      .filter((c) => c.name != null)
      .map((c) => `${c.name}: ${c.rating != null ? c.rating + "/10" : ""} ${c.description ?? ""}`.trim());
    if (catLines.length) parts.push(`Review scores: ${catLines.join("; ")}`);
  }
  return parts.length ? `Guest reviews / what others say:\n${parts.join("\n")}` : "";
}

/** Build a short, plain-text summary of hotel data for the AI. Strips HTML. Includes reviews/sentiment and location. */
function buildHotelContext(
  data: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    location?: { latitude?: number; longitude?: number };
    starRating?: number;
    hotelDescription?: string;
    hotelFacilities?: string[];
    facilities?: Array<{ name?: string }>;
    sentiment_analysis?: { pros?: string[]; cons?: string[]; categories?: Array<{ name?: string; rating?: number; description?: string }> };
  },
  reviewsSentiment?: { pros?: string[]; cons?: string[]; categories?: Array<{ name?: string; rating?: number; description?: string }> }
) {
  const parts: string[] = [];
  if (data.name) parts.push(`Name: ${data.name}`);
  if (data.address) parts.push(`Address: ${data.address}`);
  if (data.city) parts.push(`City: ${data.city}`);
  if (data.country) parts.push(`Country: ${data.country}`);
  if (data.location?.latitude != null && data.location?.longitude != null)
    parts.push(`Coordinates: ${data.location.latitude}, ${data.location.longitude}`);
  if (data.starRating != null) parts.push(`Star rating: ${data.starRating}`);
  const desc = data.hotelDescription
    ? data.hotelDescription.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800)
    : "";
  if (desc) parts.push(`Description: ${desc}`);
  const facilityNames =
    data.hotelFacilities?.length
      ? data.hotelFacilities
      : data.facilities?.map((f) => f.name).filter(Boolean) ?? [];
  if (facilityNames.length)
    parts.push(`Facilities/amenities: ${facilityNames.join(", ")}`);
  const sentiment = reviewsSentiment ?? data.sentiment_analysis;
  if (sentiment) {
    const reviewsBlock = buildReviewsContext(sentiment);
    if (reviewsBlock) parts.push(reviewsBlock);
  }
  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Chat is not configured. Missing XAI_API_KEY in the environment.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const {
      messages,
      pathname = "",
      search = "",
    } = body as {
      messages?: { role: "user" | "assistant" | "system"; content: string }[];
      pathname?: string;
      search?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty messages array." },
        { status: 400 },
      );
    }

    let messagesToSend = [...messages];

    const hotelId = getHotelIdFromRequest(pathname, search);
    let hasHotelContext = false;
    if (hotelId && process.env.LITEAPI_KEY) {
      try {
        const [hotelRes, reviewsRes] = await Promise.all([
          getHotel(hotelId),
          getHotelReviews(hotelId, { getSentiment: true, limit: 50 }).catch(() => null),
        ]);
        const hotelData = (hotelRes as { data?: Record<string, unknown> })?.data;
        if (hotelData) {
          let reviewsSentiment: Parameters<typeof buildReviewsContext>[0] | undefined;
          if (reviewsRes && typeof reviewsRes === "object") {
            const r = reviewsRes as Record<string, unknown>;
            const data = r.data as Record<string, unknown> | undefined;
            const sentiment = (data?.sentiment ?? data?.sentiment_analysis ?? r.sentiment_analysis) as Parameters<typeof buildReviewsContext>[0] | undefined;
            if (sentiment && (sentiment.pros?.length || sentiment.cons?.length || sentiment.categories?.length))
              reviewsSentiment = sentiment;
          }
          const hotelContext = buildHotelContext(
            hotelData as Parameters<typeof buildHotelContext>[0],
            reviewsSentiment
          );
          hasHotelContext = true;
          const hotelSystemMessage = {
            role: "system" as const,
            content: `The visitor is currently viewing this hotel. Use ONLY the following data to answer questions about it (e.g. "Is this good for a woman travelling alone?", "Do they have breakfast?", "What are the facilities?", "What do others say?", "Is it close to the city / centrum?"). The data includes address, city, country, coordinates, guest review summaries and sentiment (including a "Location" category when present). For "close to city/centrum?" use the address, city, and the description or the guest-review "Location" score/description; if no distance to center is in the data, say so and suggest checking the map or the hotel description. Do not invent details.\n\n${hotelContext}`,
          };
          messagesToSend = [hotelSystemMessage, ...messagesToSend];
        }
      } catch {
        // If hotel fetch fails, continue without hotel context
      }
    }

    const edgeCasesMessage = {
      role: "system" as const,
      content: `EDGE CASES – follow these rules:
- If the user asks about "this hotel", "this place", or "breakfast/safety here" but you have NO hotel data in this request: say briefly that you need them to open the specific hotel page (or checkout) so you can see which property they mean, then they can ask again.
- If they are on the results page (path /results): you don't know which listing they mean; suggest they open the hotel they're interested in and ask there.
- Off-topic (weather, visas, "what is 2+2", general travel tips): give a very short, friendly answer and offer to help with booking or safety on Yes I Can Travel.
- Ambiguous or very short ("breakfast?", "safe?", "good?"): interpret in the current page context and the data you have; if no hotel data, ask them to open a hotel page or clarify which hotel.
- Rude or inappropriate: stay professional and calm; offer to help with booking or safety.
- If they ask in another language: answer in that language if you can, but keep it short; for safety/booking details prefer English if the site is in English.
- Multiple questions in one message: answer the main one briefly or the first one; suggest they ask the rest in a follow-up.
- On confirmation page: if they ask about their booking, cancellation, or refund, say to use the details on the confirmation page or in their email, or contact the hotel/support; you don't have access to their booking.
- You have hotel context for this message: ${hasHotelContext}. Use that to decide whether you can answer about "this" hotel or not.`,
    };
    messagesToSend = [
      { role: "system" as const, content: BOOKING_TERMS },
      edgeCasesMessage,
      ...messagesToSend,
    ];

    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL ?? "grok-3-mini",
        messages: messagesToSend,
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: "Chat provider error",
          status: response.status,
          details: errorText.slice(0, 1000),
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error while handling chat request.",
      },
      { status: 500 },
    );
  }
}

