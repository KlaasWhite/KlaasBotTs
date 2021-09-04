import { CommandInteraction } from "discord.js";
import {getGuildConfig, IGuildConfig, setGuildConfig} from "../setup/config"


export async function pinSettings(interaction:CommandInteraction){
    let subcommand: string = interaction.options.getSubcommand();

    let config:IGuildConfig = getGuildConfig(interaction.guild.id);
    let changed:boolean = false;

    switch (subcommand){
        case "roles":
            let role:string = interaction.options.getRole("choice").id;
            let inConfig:boolean = config.roles.includes(role);
            switch (interaction.options.getString("action")){
                case "pin_role_add":
                    if(inConfig){
                        interaction.reply("Role already in config")
                    } else {
                        config.roles.push(role);
                        interaction.reply(`<@&${role}> was added to the config`)
                        changed = true;
                    } 
                    break;
                case "pin_role_remove":
                    if (!inConfig){
                        interaction.reply("Role not in config")
                    } else {
                        let index:number = config.roles.indexOf(role);
                        config.roles.splice(index, 1);
                        interaction.reply(`<@&${role}> was remove from the config`)
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
        setGuildConfig(config);
    }

    
}