const botCfg = require('../config.json');

module.exports = async (client, message) => {
    var prefix = botCfg.prefix;

    const escapedPrefix = client.regexEscape(prefix);
    const prefixRegex = new RegExp(`^(${escapedPrefix})`);
    const args = message.content.replace(prefixRegex, "").trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // verifica si el comando existe
    const cmd = client.commands.get(`${command}.js`);
    if (!cmd) return;

    // ejecutar comando
    try {
        cmd.run(client, message, args);
    } catch (error) {
        message.channel.send("Ha ocurrido un error inesperado, por favor notificalo al administrador del bot.");
        client.logger.log("error", "Ha ocurrido un error al ejecutar un comando.")
    }
}