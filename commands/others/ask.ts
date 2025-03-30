import { Command } from "@sapphire/framework";
import { askAI } from "../../modules/ai";

export class PingCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			//...options,
			name: "ask",
			aliases: ["ai"],
			description: "Pregunta algo a la IA.",
		});
	}

	async messageRun(message, args) {
		var arg = await args.rest("string");

		const msg = await message.channel.send("Estoy pensando...");
		try {
			console.log(arg);
			const stream = await askAI(arg);
			return msg.edit(stream.choices[0].message.content);
		} catch (error) {
			return message.channel.send("Hubo un error con la respuesta");
		}
	}
}
