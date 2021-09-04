import { Client, Collection, Intents, Interaction } from "discord.js";
import {pin} from "./pinbot/pinbot";
import {pinSettings} from "./pinbot/pinsettings"
import {startUp, guildJoin, guildLeave} from "./setup/setupGuilds"
require('dotenv').config()


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
	console.log(`${client.user?.tag} has logged in`);
	startUp(client);
});

client.on("guildCreate", (guild) =>{
	guildJoin(guild, client);
})

client.on("guildDelete", (guild) => {
	guildLeave(guild);
})

client.on("interactionCreate", async interaction => {

	if (interaction.isCommand()){
		const {commandName} = interaction;

		if (commandName === 'ping') {
			let text:string = interaction.options.getString("text");
			await interaction.reply(`Pong! ${text}`);
		} else if (commandName === "pin"){
			pinSettings(interaction)
		}

	} else if(interaction.isContextMenu()){
		const {commandName} = interaction;

		if (commandName === "pin"){
			await pin(interaction);
		}
	}else {
		return;
	}
})

client.login(process.env.BOT_TOKEN);