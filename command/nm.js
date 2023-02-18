const { SlashCommandBuilder } = require('discord.js');

// how about we just use one command and switch depending on channel

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nm')
		.setDescription('Night Market commands!'),
	async execute(interaction) {
		await interaction.reply('helloo marketeer!');
	},
};