import { Subcommand } from "@sapphire/plugin-subcommands";
import { Command, container } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { MessageFlags, Message } from "discord.js";
import * as Music from "../../modules/music";
import * as Utils from "../../modules/utils";

export class MusicShuffleCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//options,
			name: "shuffle",
			description: "¡Pon la cola de reproduccion en aleatorio!",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		//const contexts: InteractionContextType[] = [InteractionContextType.Guild];

		registry.registerChatInputCommand((builder) => builder.setName("shuffle").setDescription("¡Pon la cola de reproduccion en aleatorio!"));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const shuffle = Music.shuffle();
		return await interaction.reply(shuffle);
	}
}
