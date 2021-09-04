import { ContextMenuInteraction, GuildMember, Message, MessageEmbed, TextChannel} from "discord.js";
import {PinObject} from "./pinObject"
import { getGuildConfig, IGuildConfig} from "../setup/config";

export async function pin(interaction:ContextMenuInteraction){
    let config :IGuildConfig = getGuildConfig(interaction.guild.id);
    if(config.pinChannel === ""){
        interaction.reply("There was no pin channel put in");
        return;
    } 

    let message:Message;
    message = await interaction.channel.messages.fetch(interaction.targetId)
    let author:GuildMember = await interaction.guild.members.fetch(message.author.id);
    let pinner:GuildMember = await interaction.guild.members.fetch(interaction.user.id);

    let pin:PinObject = new PinObject(author, pinner, message, interaction);

    let pinChannel:TextChannel = await interaction.guild.channels.fetch(config.pinChannel) as TextChannel

    let embed:MessageEmbed = pin.createEmbed();
    let attachmentString:string = pin.createAttachmentString();


    pinChannel.send({embeds: [embed]})
    attachmentString ? pinChannel.send(attachmentString) : null;
    interaction.reply({embeds: [pin.returnConfirmEmbed()]})
}
