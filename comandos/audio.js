const { botowner } = require('../config.json');

exports.run = async (client, message, args) => {
    const voz = message.member.voice.channel;

    switch (args[0]) {

        // Aca se pondran todos los audios que reproduzca el bot.
        case 'sousa':
            client.playAudio('./media/audio/sousa.mpeg', message);
            break;

        case 'mesiencara':
            client.playAudio('./media/audio/messi.ogg', message);
            break;

        // Solo el dueño del bot puede detener un audio
        case 'stop':
            if (message.author.id !== botowner) return message.reply('no tienes el permiso para hacer esto.');
            voz.leave();
            break;

        // Cuando no se ponga el argumento, saltar este mensaje (proximamente con mas informacion)
        default:
            message.reply('especifica que audio quieres que reproduzca.');
    }


}