import { SlashCommandBuilder } from "@discordjs/builders";
import { Client} from "discord.js";


const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()
import { IGuildConfig } from "./config";
import { deployPermissions } from "./deploy-permissions";

export function deployCommands(guildConfig:IGuildConfig, client: Client){
	let commands = [];

	// let registeredcommands = [
	// 	new SlashCommandBuilder()
	// 	.setName('test')
	// 	.setDescription('Change settings for pinbot')
	// 	.setDefaultPermission(false)
	// 	.addStringOption(option =>
	// 		option.setName('settings')
	// 			.setDescription('What setting to change')
	// 			.setRequired(true)
	// 			.addChoice('Change pin channel', 'pin_channel')
	// 			.addChoice('Add role', 'pin_add_role')
	// 			.addChoice('Delete role', 'pin_delete_role'))
	// ]
	// 	.map(command => command.toJSON());

	commands.push({
		"default_permission": false,
		"name": "pin",
		"type": 3
	});

	commands.push({
		"default_permission": true,
		"name": "ping",
		"description": "Pings the bot",
		"options": [{
			"name": "text",
			"description": "what to ping with",
			"type": 3,
			"required": true
		}	
		],
	})

	commands.push(
		{
			"name": "pinsettings",
			"default_permission": false,
			"description": "Change the settings for pinbot",
			"options": [
				{
					"name": "permissions",
					"description": "Get or edit permissions for a user",
					"type": 1,
					"options": [
						{
							"name": "permission",
							"description": "What permission to change",
							"type": 3,
							"required": true,
							"choices": [
								{
									"name": "Pinner",
									"value": "pin_role_Pinner"
								},
								{
									"name": "Admin",
									"value": "pin_role_Admin"
								}
							]
						},
						{
							"name": "action",
							"description": "The type of animal",
							"type": 3,
							"required": true,
							"choices": [
								{
									"name": "Add",
									"value": "pin_role_add"
								},
								{
									"name": "Remove",
									"value": "pin_role_remove"
								}
							]
						},
						{
							"name": "choice",
							"description": "What to add/remove",
							"type": 8,
							"required": true
						}
					]
				},
				{
					"name": "channel",
					"description": "Get or edit permissions for a user",
					"type": 1,
					"options": [
						{
							"name": "action",
							"description": "The type of animal",
							"type": 3,
							"required": true,
							"choices": [
								{
									"name": "Change",
									"value": "pin_channel_change"
								}
							]
						},
						{
							"name": "choice",
							"description": "To what will it be changed",
							"type": 7,
							"required": true
						}
					]
				},
			]
		}
	)

	const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
	(async () => {
		try {
			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENTID, guildConfig.guildId),
				{ body: commands },
			);

			console.log(`Successfully registered application commands to ${guildConfig.guildId}.`);
			
		} catch (error) {
			console.error(error);
		}
	})().then(() => deployPermissions(guildConfig, client));

	

	
}