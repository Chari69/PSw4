import { Subcommand } from "@sapphire/plugin-subcommands";
import { Command, container } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { MessageFlags, Message } from "discord.js";
import * as Music from "../../modules/music";
import * as Utils from "../../modules/utils";

export class MusicQueueCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//options,
			name: "queue",
			aliases: ["cola"],
			description: "Mira la lista actual de canciones en la lista de reproduccion.",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		//const contexts: InteractionContextType[] = [InteractionContextType.Guild];

		registry.registerChatInputCommand((builder) => builder.setName("queue").setDescription("Mira la lista actual de canciones en la lista de reproduccion."));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const queue = Music.getQueue();
		return await interaction.reply("# Cola de canciones:\n" + queue);
	}
}
