const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription('Add to the food count'),

    async execute(interaction) {
        await interaction.reply('helloo marketeer!');
    },
};