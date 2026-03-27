import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  const models = await genAI.models;
  // wait, the googe generative-ai npm doesn't have list models easily, let me just fetch it via REST.
}

async function fetchModels() {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
  const data = await response.json();
  console.log(data.models.map(m => m.name));
}

fetchModels();
