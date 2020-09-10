/* 
 *      PSw4 Main File 
 *      (c) 2020 Chari
 */
if (process.version.slice(1).split(".")[0] < 10) throw new Error("Node 10.0.0 es requerido para que funcione correctamente el bot, actualiza Node en tu PC.");

// cargar modulos principales de node.js
const Discord = require('discord.js');
const { token } = require('./config.json');
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

// cargar cliente de discord
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.logger = require("./modulos/logger");

require('./modulos/funciones')(client);

const psw4 = async () => {
    // cargar comandos
    const cmdFiles = await readdir('./comandos/');
    client.logger.log("info", `Cargando un total de ${cmdFiles.length} comandos.`);
    cmdFiles.forEach(f => {
        if (!f.endsWith('.js')) return;
        const response = client.cargarComando(f);
        if (response) console.log(response);
    });

    // cargar eventos
    const evtFiles = await readdir('./eventos/');
    client.logger.log("info", `Cargando un total de ${evtFiles.length} eventos.`);
    evtFiles.forEach(file => {
        const evtName = file.split('.')[0];
        const evt = require(`./eventos/${file}`);
        client.on(evtName, evt.bind(null, client));
    });

    // login
    client.login(token);
};

// iniciar PSw4
psw4().catch(error => { throw new Error(error); });