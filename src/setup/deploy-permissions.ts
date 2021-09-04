import { Client } from "discord.js";
import { IGuildConfig } from "./config";

export async function supplyPermissions(guild:IGuildConfig, client:Client){
    console.log(await client.guilds.cache.get(guild.guildId)?.commands.permissions);
}