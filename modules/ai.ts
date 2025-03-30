import OpenAI from "openai";
import config from "../config.json";
import "dotenv/config";

const openai = new OpenAI({ baseURL: "http://127.0.0.1:1234/v1/", apiKey: process.env.AI_API_KEY });

const system = config.ai.system;

export async function askAI(arg: string) {
	const stream = await openai.chat.completions.create({
		model: "gemma-3-4b-it",
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: arg },
		],
		max_completion_tokens: 256,
	});

	return stream;
}
