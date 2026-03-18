import "dotenv/config";
import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { execSync } from "child_process";
import * as Utils from "./modules/utils";

//const version = execSync("git rev-parse HEAD").toString().trim().slice(0, 7);
execSync(`openssl aes-256-cbc -d -salt -pbkdf2 -iter 100000 -md sha256 -in enc/c.enc -out enc/cookies.txt -pass env:YOUTUBE_COOKIE`);

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
	loadMessageCommandListeners: true,
});

client.on("ready", () => {
	client.logger.info("Sesion Iniciada Correctamente.");
	Utils.rollQuote(30, client);
	//client.logger.info("Version: " + version);
});

client.login(process.env.BOT_TOKEN);
