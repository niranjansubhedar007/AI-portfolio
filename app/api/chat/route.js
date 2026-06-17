import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Only models confirmed to exist on the v1beta API with generateContent support
const FALLBACK_MODELS = [
  "gemini-2.0-flash",       // primary
  "gemini-2.0-flash-lite",  // fallback 1
  "gemini-2.5-flash",       // fallback 2
];

// Read CV text once at module load — extracted from cv.pdf via scripts/extract-cv.mjs
const cvText = fs.readFileSync(path.join(process.cwd(), "data", "cv.txt"), "utf-8");

const BEHAVIOR_INSTRUCTIONS = `
You are Niranjan Subhedar's AI portfolio assistant. Use the CV content provided below to answer questions about Niranjan accurately.

INSTRUCTIONS:
- Answer only about Niranjan — professionally, clearly, and concisely
- Base your answers strictly on the CV content provided
- If the question is unrelated to Niranjan → say "I can only answer questions about Niranjan Subhedar."
- If the CV doesn't contain the information → say "I don't have that information about Niranjan."
- If the question is in Hindi → reply in Hinglish (Hindi + English mix)
- If the question is in Marathi → reply in Marathi
- If the question is in English → reply in English
- Never share personal opinions, jokes, or irrelevant information
- Always maintain a professional and polite tone
- For short questions like "age", "skills", "location", "projects" — assume they are asking about Niranjan

EXTRA CONTEXT (not in CV):
- Age: 24 years
- Height: 5'10", Weight: 70 kg, fit and professional personality
- Unmarried
- Interests: coding, traveling, fitness, AI, exploring new technologies
- Hobbies: playing football, cooking, photography
- Strengths: strong problem-solving skills, quick learner, good team player
- Weaknesses: can be a perfectionist, tends to overthink
- If user asks about appearance → "Niranjan is 5'10\" tall, has a fit physique, and maintains a professional and confident personality."
  (If in Marathi → "Niranjan 5'10\" उंच आहे, त्याची फिट बॉडी आहे आणि तो एक प्रोफेशनल व आत्मविश्वासपूर्ण व्यक्तिमत्त्व राखतो.")
`;

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ reply: "Please enter a message" });
    }

    const systemPrompt = `${BEHAVIOR_INSTRUCTIONS}\n\nCV CONTENT:\n${cvText}`;

    // Try each model in order; skip to next on quota (429) errors
    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(message);
        const text = result.response.text();

        return Response.json({ reply: text });
      } catch (err) {
        const isQuotaError =
          err.message?.includes("429") ||
          err.message?.includes("quota") ||
          err.message?.includes("Too Many Requests");

        if (isQuotaError) {
          console.warn(`Quota exceeded for model "${modelName}", trying next...`);
          continue;
        }

        throw err;
      }
    }

    // All Gemini models exhausted — try OpenRouter (free Llama model) as last resort
    console.warn("All Gemini models quota exceeded, trying OpenRouter...");
    try {
      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-8b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      });
      const orData = await orRes.json();
      const text = orData.choices?.[0]?.message?.content;
      if (text) return Response.json({ reply: text });
      throw new Error("OpenRouter returned no content");
    } catch (orErr) {
      console.error("OpenRouter also failed:", orErr.message);
    }

    return Response.json({
      reply:
        "I'm temporarily unavailable due to high demand. Please try again in a few minutes.",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({
      reply: `Error: ${error.message}`,
    });
  }
}