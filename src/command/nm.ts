import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

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
