import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import * as Utils from "../../modules/utils";

export class MusicShuffleCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			name: "booru",
			description: "Busca una imagen aleatoria (comando NSFW)",
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("booru")
				.setDescription("Busca una imagen aleatoria (comando NSFW)")
				.setNSFW(true)
				.addStringOption((option) =>
					option.setName("type").setDescription("Elige el booru donde buscar").setRequired(true).addChoices({ name: "r34", value: "r34" }, { name: "safebooru", value: "safebooru" })
				)
				.addStringOption((option) => option.setName("tags").setDescription("Tags de la busqueda").setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const type = interaction.options.getString("type");
		const tags = interaction.options.getString("tags");

		const result = await Utils.booruSearch(type!, tags!.split(" "));

		if (result == "no posts found") {
			return await interaction.reply({ content: "No se encontraron resultados", ephemeral: true });
		}

		const embed = await new EmbedBuilder()
			.setColor(0xa32249)
			.setTitle(result.title)
			.setURL(result.url)
			.addFields({ name: "Tags", value: result.tags }, { name: "Rating", value: result.rating })
			.setImage(result.image)
			.setTimestamp();

		return await interaction.reply({ embeds: [embed] });
	}
}
