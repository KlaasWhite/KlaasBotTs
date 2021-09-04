import { Client } from "discord.js";
import fs from "fs";

export interface IGuildConfig {
    guildId: string;
    pinChannel: string;
    roles: string[];
    joined: boolean;
}

export interface IConfig{
    guilds: IGuildConfig[];
}

export function openConfig():IConfig{
    let config:IConfig;
    if(!fs.existsSync(__dirname.slice(0,-6) + "/config.json")){
        let empty:IConfig = {guilds: []}
        fs.writeFileSync(__dirname.slice(0,-6) + "/config.json", JSON.stringify(empty));
        config = empty;
        console.log("Made config file");
    } else {
        let rawData:string = fs.readFileSync(__dirname.slice(0,-6) + "/config.json", "utf8");
        config= JSON.parse(rawData);
    }
    return config;
}

function returnConfig(guildId:string) : IGuildConfig{
    let returnObject:IGuildConfig = {
        guildId: guildId,
        pinChannel: "",
        roles: [],
        joined: true,
    }
    return returnObject
}

export function isGuildInConfig(guildId:string, config:IConfig):void{
    let foundGuilds:IGuildConfig[] = config.guilds.filter(item => item.guildId == guildId);
    if (foundGuilds.length === 0){
        config.guilds.push(returnConfig(guildId));
        console.log(`Guild ${guildId} has been added to the config`);

        saveConfig(config);
    } else if (!foundGuilds[0].joined){
        foundGuilds[0].joined = true;
        console.log(`${foundGuilds[0].guildId} has joined but was already in config`)
        saveConfig(config);
    }
}

export function haveGuildsLeft(config: IConfig, client: Client){
    
    let changed: boolean = false;

    config.guilds.forEach(guild => {
        if(client.guilds.cache.filter(element=> element.id == guild.guildId).size === 0){
            guild.joined = false;
            changed = true;
            console.log(`${guild.guildId} has left since offline`)
        }
    })

    if (changed){
        saveConfig(config);
    } 
}
export function getGuildConfig(guildId: string):IGuildConfig{
    let config = openConfig();
    let foundGuilds:IGuildConfig[] = config.guilds.filter(item => item.guildId == guildId);
    let foundGuild:IGuildConfig = foundGuilds[0];

    return foundGuild;
}

export function setGuildConfig(guildConfig: IGuildConfig):void{
    let config = openConfig();
    config.guilds.map(item => {
        if (item.guildId === guildConfig.guildId){
            item.pinChannel = guildConfig.pinChannel;
            item.roles = guildConfig.roles;
        }
    })
    saveConfig(config);
}

export function saveConfig(config:IConfig){
    fs.writeFileSync(__dirname.slice(0,-6) + "/config.json", JSON.stringify(config, null, 2));
}
