import "dotenv/config";
import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import * as Utils from "./modules/utils";

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
	loadMessageCommandListeners: true,
});

client.on("ready", () => {
	client.logger.info("Sesion Iniciada Correctamente.");
	Utils.rollQuote(30, client);
});

Utils.deleteAllFilesInSongsFolder(client);

client.login(process.env.BOT_TOKEN);
