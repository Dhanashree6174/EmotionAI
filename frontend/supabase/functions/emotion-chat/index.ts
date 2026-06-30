import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userMessage, personaId } = await req.json();

    // 🔹 Persona handling (optional context boost)
    const PERSONA_PROMPTS: Record<string, string> = {
      "angry-returner":
        "Customer is angry about a broken product and wants refund.",
      "nervous-first-timer":
        "Customer is nervous and unsure, needs reassurance.",
      "price-haggler": "Customer negotiates aggressively on price.",
      "disappointed-loyal":
        "Long-time customer disappointed with recent quality.",
      "impulse-buyer": "Excited buyer but needs guidance.",
    };

    const personaContext =
      personaId && PERSONA_PROMPTS[personaId] ? PERSONA_PROMPTS[personaId] : "";

    // call backend model
    const modelRes = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: userMessage }),
    });

    if (!modelRes.ok) {
      throw new Error("Model backend error");
    }

    const modelData = await modelRes.json();

    // call gemini api
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const scoringPrompt = `
You are a sales coach.

Customer emotion: ${modelData.detectedEmotion}
Customer response: ${modelData.response}
Salesperson message: ${userMessage}
${personaContext ? `Customer persona: ${personaContext}` : ""}

Evaluate the salesperson and return JSON:

{
  "salesScore": number (1-10),
  "salesFeedback": "short explanation",
  "idealResponse": "better response"
}
`;

    const geminiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: scoringPrompt }],
        }),
      },
    );

    if (!geminiRes.ok) {
      console.error("Gemini error:", await geminiRes.text());

      // fallback if Gemini fails
      return new Response(
        JSON.stringify({
          detectedEmotion: modelData.detectedEmotion,
          confidence: modelData.confidence,
          response: modelData.response,
          salesScore: 7,
          salesFeedback: "Could be improved with more empathy.",
          idealResponse: modelData.response,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const geminiDataRaw = await geminiRes.json();

    let geminiData;

    try {
      const content = geminiDataRaw.choices?.[0]?.message?.content || "{}";
      geminiData = JSON.parse(content);
    } catch {
      geminiData = {
        salesScore: 7,
        salesFeedback: "Could be improved with more empathy.",
        idealResponse: modelData.response,
      };
    }

    const result = {
      detectedEmotion: modelData.detectedEmotion,
      confidence: modelData.confidence,
      response: modelData.response,
      salesScore: geminiData.salesScore,
      salesFeedback: geminiData.salesFeedback,
      idealResponse: geminiData.idealResponse,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("emotion-chat error:", e);

    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
