module.exports = async (client) => {
    client.logger.log("info", `[READY] ${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");
    client.user.setActivity('PSw4 Beta 1.0.0');
};