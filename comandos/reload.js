const { botowner } = require('../config.json');

exports.run = async (client, message, args) => {
    if (message.author.id === botowner) {
        if (!args || args.length < 1) return message.reply("necesitas decirme que comando debo recargar!");

        let response = await client.unloadCommand(args[0]);
        if (response) return message.reply(`ha ocurrido un error descargando el comando: ${response}`);

        response = client.cargarComando(args[0]);
        if (response) return message.reply(`ha ocurrido un error cargando el comando: ${response}`);

        message.reply(`el comando \`${args[0]}\` ha sido recargado.`);

    } else {
        message.reply('no tienes permiso para ejecutar este comando.');
    }
};