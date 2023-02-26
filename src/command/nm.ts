import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
// import { getValues } from './lib/sheets';

// how about we just use one command and switch depending on channel?


module.exports = {
	async get_data() {
		return new SlashCommandBuilder()
			.setName('nm')
			.setDescription('Night Market commands!')
	},

	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('helloo marketeer!');
	},
};
