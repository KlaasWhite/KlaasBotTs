import { ApplicationCommand, ApplicationCommandPermissionData, Client, Collection, Guild } from "discord.js";
import { IGuildConfig } from "./config";

interface IPermission {
    id: string;
    type: string;
    permission: boolean;
}

export async function deployPermissions(guildConfig:IGuildConfig, client: Client){

    let guild:Guild = client.guilds.cache.get(guildConfig.guildId)
    let owner:string = guild.ownerId;
    let commands:Collection<string, ApplicationCommand<{}>> = await guild.commands.fetch();

    deployPinner(guildConfig.roles.pinners, commands, owner);
    deployAdmin(guildConfig.roles.admins, commands, owner);

    console.log(`Successfully registered permissions for ${guildConfig.guildId}.`);
}

async function deployPinner(pinners:string[], commands:Collection<string, ApplicationCommand<{}>>, owner: string){
    
    let permissions:ApplicationCommandPermissionData[] = [];
    let pinCommand: ApplicationCommand = commands.find(cmd => cmd.name === "pin");
    pinners.forEach(role => {
        permissions.push({
            id: role,
            type: 'ROLE',
            permission: true,
        })
    })
    permissions.push({
        id: owner,
        type: "USER",
        permission: true,
    })
    
    await pinCommand.permissions.set({ permissions });
}

async function deployAdmin(admins:string[], commands:Collection<string, ApplicationCommand<{}>>, owner: string){
    let permissions:ApplicationCommandPermissionData[] = [];
    let adminCommand: ApplicationCommand = commands.find(cmd => cmd.name === "pinsettings");
    admins.forEach(role => {
        permissions.push({
            id: role,
            type: 'ROLE',
            permission: true,
        })
    })
    permissions.push({
        id: owner,
        type: "USER",
        permission: true,
    })
    await adminCommand.permissions.set({ permissions });
}