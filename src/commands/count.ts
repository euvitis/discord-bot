import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { getOrgNameList } from '../lib/night-market-data.service';

module.exports = {
    async get_data() {
        const orgs = await getOrgNameList();

        return new SlashCommandBuilder()
            .setName('count')
            .setDescription('Add to the food count')
            .addStringOption((option) =>
                option
                    .setName('org')
                    .setDescription('Who gave us this food?')
                    .setRequired(true)
                    .addChoices(
                        ...orgs.map((org) => ({ name: org, value: org }))
                    )
            )
            .addNumberOption((option) =>
                option
                    .setName('amount')
                    .setDescription('How many pounds of food?')
                    .setRequired(true)
            );
    },

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.reply(
            `${interaction.options.getString(
                'org'
            )} gave us ${interaction.options.getNumber('amount')} ibs`
        );
    }
};
