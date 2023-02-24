const { SlashCommandBuilder } = require('discord.js');
const { getValues } = require('./lib/sheets')

// how about we just use one command and switch depending on channel?


module.exports = {
	data: new SlashCommandBuilder()
		.setName('nm')
		.setDescription('Night Market commands!'),

	async execute(interaction) {
		await interaction.reply('helloo marketeer!');
	},
};
