import { Command, container } from "@sapphire/framework";
import * as Music from "../../modules/music";

export class MusicLeaveCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//options,
			name: "leave",
			description: "Desconecta a PSw4 al canal de voz donde estes.",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		//const contexts: InteractionContextType[] = [InteractionContextType.Guild];

		registry.registerChatInputCommand((builder) => builder.setName("leave").setDescription("desconecta a PSw4 al canal de voz donde estes. (Musica)"));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = container.client.guilds.cache.get(interaction.guildId!);

		if (!guild) {
			throw new Error("No estas en un canal de voz.");
		}

		Music.cleanupConnection(guild.id);

		return await interaction.reply("# Desconectando de canal de voz...\n");
	}
}
