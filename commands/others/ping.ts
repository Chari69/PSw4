import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

export class PingCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//options,
			name: "ping",
			aliases: ["pong"],
			description: "ping pong",
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => builder.setName("ping").setDescription("Muestra tu ping con el bot (y el tiempo de respuesta interno)"));
	}

	async chatInputRun(interaction) {
		await interaction.reply({ content: `Ping?`, flags: MessageFlags.Ephemeral });
		const msg = await interaction.fetchReply();

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);
			return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
		}

		return interaction.editReply("Failed to retrieve ping :(");
	}
}
