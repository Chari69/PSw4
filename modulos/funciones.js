// Funciones de PSw4 (c) 2020 Chari
const fs = require('fs');

module.exports = (client) => {
    // Funcion para Cargar Comandos
    client.cargarComando = (cmd) => {
        try {
            client.logger.log("info", `Cargando Comando: ${cmd}.`);
            const props = require(`../comandos/${cmd}`);

            if (props.init) {
                props.init(client);
            }

            client.commands.set(cmd, props);

            return false;
        } catch (e) {
            return `No se ha podido cargar el comando ${cmd}: ${e}`;
        }
    }

    // Funcion para descargar un comando.
    client.unloadCommand = async (cmd) => {
        let command;
        if (client.commands.has(cmd)) {
            command = client.commands.get(cmd);
        }
        if (!command) return `El comando \`${cmd}\` parece que no existe. Intentalo de nuevo!`;
        if (command.shutdown) {
            await command.shutdown(client);
        }
        const mod = require.cache[require.resolve(`../comandos/${cmd}`)];
        delete require.cache[require.resolve(`../comandos/${cmd}`)];
        for (let i = 0; i < mod.parent.children.length; i++) {
            if (mod.parent.children[i] === mod) {
                mod.parent.children.splice(i, 1);
                break;
            }
        }
        return false;
    };

    // Funciones Regex
    client.regexEscape = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Reproducir audio facilmente
    client.playAudio = async (audio, message) => {
        if (message.member.voice.channel) {
            if (!message.guild.me.permissions.has("CONNECT")) return message.reply("No puedo unirme a este canal de voz!");

            const voz = message.member.voice.channel;

            message.reply("🔊 Reproduciendo audio...");

            const conexion = await voz.join();
            const reproductor = conexion.play(fs.createReadStream(audio));

            reproductor.on('finish', () => {
                reproductor.destroy();
                voz.leave();
            });

            reproductor.on('error', () => {
                voz.leave();
                console.error;
            });

        } else {
            message.reply("necesitas estar en un canal de voz!");
        }
    }

    // Errores
    process.on("uncaughtException", (err) => {
        const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
        client.logger.log("error", `Uncaught Exception: ${errorMsg}`);
        process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
        client.logger.log("error", `Unhandled rejection: ${err}`);
    });
}