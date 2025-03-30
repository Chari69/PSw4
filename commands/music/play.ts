import { Subcommand } from "@sapphire/plugin-subcommands";
import { container } from "@sapphire/framework";
import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { MessageFlags, Message, TextChannel } from "discord.js";
import * as Music from "../../modules/music";
import * as Utils from "../../modules/utils";

export class MusicPlayCommand extends Subcommand {
	public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			//options,
			name: "play",
			aliases: ["pong"],
			description: "ping pong",
			subcommands: [
				{ name: "playlist", chatInputRun: "playPlaylist" },
				{ name: "song", chatInputRun: "playSong" },
			],
		});
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		//const contexts: InteractionContextType[] = [InteractionContextType.Guild];

		registry.registerChatInputCommand((builder) =>
			builder
				.setName("play")
				.setDescription("Reproduce una canción, una lista de reproducción o busca una cancion.")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("playlist")
						.setDescription("Reproduce una lista de reproduccion.")
						.addStringOption((option) => option.setName("url").setDescription("La URL a la que quieres hacer ping").setRequired(true))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("song")
						.setDescription("Reproduce una cancion a partir de una URL.")
						.addStringOption((option) => option.setName("url").setDescription("URL de la cancion.").setRequired(true))
				)
		);
	}

	public async playSong(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.reply({ content: `Trabajando en ello. Voy a tardar un poco...`, flags: MessageFlags.Ephemeral });
		const msg = await interaction.fetchReply();

		let url = interaction.options.getString("url", true);

		const guild = container.client.guilds.cache.get(interaction.guildId!);
		const member = guild?.members.cache.get(interaction.user.id);

		if (!interaction.member || !member?.voice.channelId || !guild) {
			return interaction.editReply("No estas en un canal de voz.");
		}

		url = Utils.ytLinkParse(url, "video");
		if (url === "#invalid") return msg.edit("URL invalida.");

		// Fetch the channel and ensure it's a text-based channel
		const channelId = interaction.channelId;

		var voiceChannelId: string = member.voice.channelId;
		console.log(voiceChannelId);

		const queueAdd = await Music.addToQueue(url);
		interaction.editReply(queueAdd);

		const music = await Music.play(voiceChannelId, guild.id, guild.voiceAdapterCreator, channelId);

		return interaction.editReply({ content: music });
	}

	public async playPlaylist(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.reply({ content: `Trabajando en ello. Voy a tardar un poco...`, flags: MessageFlags.Ephemeral });
		const msg = await interaction.fetchReply();

		let url = interaction.options.getString("url", true);

		const guild = container.client.guilds.cache.get(interaction.guildId!);
		const member = guild?.members.cache.get(interaction.user.id);

		if (!interaction.member || !member?.voice.channelId || !guild) {
			return interaction.editReply("No estas en un canal de voz.");
		}

		url = Utils.ytLinkParse(url, "playlist");
		if (url === "#invalid") return msg.edit("URL invalida.");

		// Fetch the channel and ensure it's a text-based channel
		const channelId = interaction.channelId;

		var voiceChannelId: string = member.voice.channelId;
		console.log(voiceChannelId);

		const queueAdd = await Music.playlistAddToQueue(url, voiceChannelId, guild.id, guild.voiceAdapterCreator, channelId);

		return interaction.editReply(queueAdd);
	}
}
