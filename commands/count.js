const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    async get_data() {
        return new SlashCommandBuilder()
            .setName('count')
            .setDescription('Add to the food count')
            .addStringOption(option => option
                .setName("org")
                .setDescription("Who gave us this food?")
                .setRequired(true)
                .addChoices(
                    { name: "Chipotle", value: "Chipotle" },
                    { name: "Coop", value: "Coop" },
                )
            )
            .addNumberOption(option => option
                .setName("amount")
                .setDescription("How many pounds of food?")
                .setRequired(true)
            )
    },

    async execute(interaction) {
        await interaction.reply(`${interaction.options.getString("org")} gave us ${interaction.options.getNumber("amount")} ibs`);
    },
};