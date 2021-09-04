import { Client, Guild } from "discord.js";
import {supplyCommands} from "./deploy-commands"
import { supplyPermissions } from "./deploy-permissions";
import {openConfig, isGuildInConfig, IConfig, saveConfig, haveGuildsLeft, IGuildConfig} from "./config"

export function startUp(client:Client){

    let config:IConfig = openConfig();

    client.guilds.cache.forEach(guild => {
        isGuildInConfig(guild.id, config);
    })

    haveGuildsLeft(config, client);

    config.guilds.forEach(guild => {
        if (guild.joined){
            supplyCommands(guild, client);
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
        supplyCommands(element, client);
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

