const Discord = require('discord.js');
const json = require('../media/json/juegos.json');

exports.run = async (client, message, args) => {

    var juego = args.join(' ');

    if (juego === "") {
        message.channel.send("No has introducido el nombre del juego. Comprueba que juegos tengo con el comando `!link list`")
        return;

    } else if (args[0] === 'list') {
        var name = [];

        for (let i = 0; i < json.length; i++) {
            name.push(json[i].nombre)
        }

        const embed = new Discord.MessageEmbed()
            .setTitle("Juegos Disponibles")
            .setDescription("Para buscar alguno usa `!link <nombre>`. El nombre del juego tiene que ser exacto (mayusculas incluidas).")
            .addFooter("Juegos Disponibles", name.map(name => `${name}`).join("\n"))
        message.channel.send(embed);
        return;
    }

    try {
        // parametros
        let nombre = json.find(object => object.nombre === juego).nombre;
        let id = json.find(object => object.nombre === juego).id;
        let version = json.find(object => object.nombre === juego).version;
        let descarga = json.find(object => object.nombre === juego).descarga;

        // embed del mensaje
        const embed = new Discord.MessageEmbed()
            .setTitle(`${nombre} - Descarga`)
            .setColor("RANDOM")
            .addField("Version:", version)
            .addField("Link", "[Descargalo Aqui](" + descarga + "/)")
            .setFooter(`ID: ${id}`);

        // enviar mensaje al servidor
        message.channel.send(embed);

    } catch (error) {
        // Cualquier error sera respondido con este mensaje
        message.channel.send("Este juego no esta en mi base de datos. Comprueba que juegos tengo con el comando `!link list`")
        return;
    };
}