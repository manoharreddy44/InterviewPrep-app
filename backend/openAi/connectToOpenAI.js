import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract retry delay (in ms) from a 429 error message.
 * Falls back to defaultMs if not found.
 */
function parse429Delay(errMessage, defaultMs = 15000) {
  const match = errMessage?.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 1000; // add 1s buffer
  return defaultMs;
}

/**
 * Calls Gemini with apiVersion "v1" and automatic retry for:
 *  - 503 Service Unavailable (2s → 4s → 8s)
 *  - 429 Rate Limit (uses retryDelay from error message, up to 2 retries)
 */
export async function generateContent(prompt) {
  const model = genAI.getGenerativeModel(
    { model: MODEL },
    { apiVersion: "v1" }
  );

  let lastError;
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      const msg = err?.message || "";

      const is503 =
        msg.includes("503") || msg.toLowerCase().includes("service unavailable") || msg.toLowerCase().includes("high demand");

      const is429 =
        msg.includes("429") || msg.toLowerCase().includes("too many requests") || msg.toLowerCase().includes("quota");

      if (attempt < maxAttempts) {
        if (is503) {
          const delay = [2000, 4000, 8000][attempt - 1] || 8000;
          console.warn(`[Gemini] 503 overload — retrying in ${delay / 1000}s (attempt ${attempt}/${maxAttempts})...`);
          await sleep(delay);
          continue;
        }
        if (is429) {
          const delay = parse429Delay(msg, 15000);
          console.warn(`[Gemini] 429 rate limit — retrying in ${delay / 1000}s (attempt ${attempt}/${maxAttempts})...`);
          await sleep(delay);
          continue;
        }
      }

      throw err;
    }
  }
  throw lastError;
}