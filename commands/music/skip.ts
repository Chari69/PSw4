import { Subcommand } from "@sapphire/plugin-subcommands";
import { Command, container } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { MessageFlags, Message } from "discord.js";
import * as Music from "../../modules/music";
import * as Utils from "../../modules/utils";

export class MusicSkipCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//options,
			name: "skip",
			description: "Salta la cancion actual.",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		//const contexts: InteractionContextType[] = [InteractionContextType.Guild];

		registry.registerChatInputCommand((builder) => builder.setName("skip").setDescription("Salta la cancion actual."));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const skip = Music.skipSong();
		return await interaction.reply(skip);
	}
}
