import { MessageEmbed, ContextMenuInteraction, Message, GuildMember, TextBasedChannels } from "discord.js";
import {checkImageURL} from "./utils"

export class PinObject{

    private author: GuildMember;
    private message: Message;
    private images: string[] = [];
    private pinner: GuildMember;
    private channel: TextBasedChannels;
    private attachments: string[] = [];
    private attachmentString: string;

    constructor(author: GuildMember, pinner: GuildMember, message: Message, interaction:ContextMenuInteraction) {
        this.author = author;
        this.message = message;
        this.channel = message.channel;
        this.pinner = pinner;

        if (message.attachments.size != 0){
            message.attachments.map(element => {
                if (checkImageURL(element.url)) {
                    this.images.push(element.url);
                } else {
                    this.attachments.push(element.url);
                }
            });
        }
    }

    createEmbed():MessageEmbed{

        let embed = new MessageEmbed().setFooter("PinBot | KlaasWhite#5807")

        
        if (this.author.nickname != null){
            embed.setTitle(`${this.author.nickname} (${this.author.user.username}#${this.author.user.discriminator})`);
        } else {
            embed.setTitle(`${this.author.user.username}#${this.author.user.discriminator}`);
        }
        if (this.message.content) {embed.setDescription(this.message.content);}
        if (this.images) {embed.setImage(this.images[0]);}
        embed.setThumbnail(`https://cdn.discordapp.com/avatars/${this.author.id}/${this.author.user.avatar}.png?size=256`);

        embed.addFields(
            { name: "Posted by", value: `<@${this.author.id}>`, inline: true},
            { name: "Pinned by", value: `<@${this.pinner.id}>`, inline: true},
            { name: "From Channel", value: `<#${this.channel.id}> | [Jump to message](${this.message.url})`}
        )
        return embed;
    }

    createAttachmentString():string{
        if (this.images.length > 1 || this.attachments.length > 0) {this.attachmentString += `Attachments: \n`;}
        if (this.images.length > 1){
            for(let i = 1; i < this.images.length; i++){
                this.attachmentString += `${this.images[i]} \n`
            }
        }
        if (this.attachments.length > 0){
            for(let i = 0; i < this.attachments.length; i++){
                this.attachmentString += `${this.attachments[i]} \n`
            }
        }
        return this.attachmentString;
    }

    returnConfirmEmbed():MessageEmbed{
        let embed = new MessageEmbed().setFooter("PinBot | KlaasWhite#5807")
        
        embed.setTitle("Pinned");
        embed.setDescription("Message has been pinned, congratulations!");
        
        return embed;
    }
}