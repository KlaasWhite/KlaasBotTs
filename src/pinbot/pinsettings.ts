import { Client, CommandInteraction } from "discord.js";
import {getGuildConfig, IGuildConfig, setGuildConfig} from "../setup/config"
import {deployPermissions} from "../setup/deploy-permissions"


export async function pinSettings(interaction:CommandInteraction, client: Client){
    let subcommand: string = interaction.options.getSubcommand();

    let config:IGuildConfig = getGuildConfig(interaction.guild.id);
    let changed:boolean = false;

    switch (subcommand){
        case "permissions":
            let role:string = interaction.options.getRole("choice").id;
            let perm:string = interaction.options.getString("permission")
            let inConfig:boolean
            let list:string[]
            if(perm === "pinner"){
                inConfig = config.roles.pinners.includes(role);
                list = config.roles.pinners;
            } else if (perm === "admin"){
                inConfig = config.roles.admins.includes(role);
                list = config.roles.admins;
            }
            switch (interaction.options.getString("action")){
                case "pin_role_add":
                    if(inConfig){
                        interaction.reply("Role already in config")
                    } else {
                        list.push(role);
                        interaction.reply(`<@&${role}> was added to the permission group ${perm}`)
                        changed = true;
                    } 
                    break;
                case "pin_role_remove":
                    if (!inConfig){
                        interaction.reply("Role not in config")
                    } else {
                        let index:number = list.indexOf(role);
                        list.splice(index, 1);
                        interaction.reply(`<@&${role}> was remove from the permission group ${perm}`)
                        changed = true;
                    }
                    break;
                default:
                    break;
            }
            break;
        case "channel": 
            let channel:string = interaction.options.getChannel("choice").id;
            let correctChannel: boolean = (await interaction.guild.channels.fetch(channel)).isText()
            switch (interaction.options.getString("action")){
                case "pin_channel_change":
                    if (!correctChannel){
                        interaction.reply("Channel is not a textchannel");
                    } else {
                        config.pinChannel = channel;
                        interaction.reply(`<#${channel}> was put as the pin channel`);
                        changed = true;
                    }
                    
                    
                default:
                    break;
            }
        default:
            break;
    }

    if (changed){
        deployPermissions(config, client);
        setGuildConfig(config);
    }

    
}