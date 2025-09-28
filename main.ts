import "dotenv/config";
import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { execSync } from "child_process";
import * as Utils from "./modules/utils";

const version = execSync("git rev-parse HEAD").toString().trim().slice(0, 7);

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
	loadMessageCommandListeners: true,
});

client.on("ready", () => {
	client.logger.info("Sesion Iniciada Correctamente.");
	Utils.rollQuote(30, client);
	client.logger.info("Version: " + version);
});

Utils.deleteAllFilesInSongsFolder(client);

client.login(process.env.BOT_TOKEN);
