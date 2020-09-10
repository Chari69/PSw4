const fs = require("fs");
const Discord = require("discord.js")

exports.run = async (client, message) => {
    client.playAudio('./media/audio/mus_house1.ogg', message);
}