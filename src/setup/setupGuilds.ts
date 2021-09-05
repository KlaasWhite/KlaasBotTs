import { Client, Guild } from "discord.js";
import {deployCommands} from "./deploy-commands"
import { deployPermissions } from "./deploy-permissions";
import {openConfig, isGuildInConfig, IConfig, saveConfig, haveGuildsLeft, IGuildConfig} from "./config"

export function startUp(client:Client){

    let config:IConfig = openConfig();

    client.guilds.cache.forEach(guild => {
        isGuildInConfig(guild.id, config);
    })

    haveGuildsLeft(config, client);

    config.guilds.forEach(guild => {
        if (guild.joined){
            deployCommands(guild, client);
        } else {
            console.log(`Not supplied to ${guild.guildId}, not joined`);
        }
    })
}

export function guildJoin(guild:Guild, client:Client){

    let config = openConfig();
    isGuildInConfig(guild.id, config);
    let foundGuilds:IGuildConfig[] = config.guilds.filter(element=> element.guildId == guild.id)
    foundGuilds.forEach(element => {
        deployCommands(element, client);
    });
    
}

export function guildLeave(guild:Guild){

    let config = openConfig();

    config.guilds.map(item => {
        if (item.guildId === guild.id){
            item.joined = false;
        }
    })

    saveConfig(config);
}

