import { Command, container } from "@sapphire/framework";
import * as Music from "../../modules/music";

export class MusicJoinCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//options,
			name: "join",
			description: "Conecta a PSw4 al canal de voz donde estes.",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		//const contexts: InteractionContextType[] = [InteractionContextType.Guild];

		registry.registerChatInputCommand((builder) => builder.setName("join").setDescription("Conecta a PSw4 al canal de voz donde estes. (Musica)"));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = container.client.guilds.cache.get(interaction.guildId!);
		const member = guild?.members.cache.get(interaction.user.id);

		if (!interaction.member || !member?.voice.channelId || !guild) {
			return interaction.editReply("No estas en un canal de voz.");
		}

		var voiceChannelId: string = member.voice.channelId;
		Music.join(voiceChannelId, guild.id, guild.voiceAdapterCreator);

		return await interaction.reply("# Conectando a canal de voz...\n" + member.voice.channel?.name);
	}
}
