const { botowner } = require('../config.json');
const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    // El comando requiere ser el owner del bot
    if (message.author.id !== botowner) return message.reply('no tienes el permiso para hacer esto.');

    // Borrar el mensaje del owner
    message.delete();

    const embedayuda = new Discord.MessageEmbed()
        .setTitle("Ayuda del comando !troll")
        .setColor("RANDOM")
        .setDescription("!troll adminrole - **Te da rol administrador en el servidor que quieras trollear**\n!troll cn - **XD**");

    switch (args[0]) {

        case 'adminrole':

            break;

        case 'cn':
            let canalnombrado = args.join(" ").slice(3);
            message.channel.setName(canalnombrado);
            break;

        default:
            message.channel.send(embedayuda);
    }
}