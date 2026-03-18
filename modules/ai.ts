import OpenAI from "openai";
import config from "../config.json" with { type: "json" };
import "dotenv/config";

const openai = new OpenAI({ 
	baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", 
	apiKey: process.env.AI_API_KEY 
});

const system = config.ai.system;

export async function askAI(arg: string) {
	const stream = await openai.chat.completions.create({
		model: "gemini-3-flash-preview",
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: arg },
		],
		max_completion_tokens: 1024,
	});

	return stream;
}
