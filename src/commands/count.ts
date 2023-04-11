import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { NmFoodCountDataService } from '../nm-service/nm-food-count-data.service';
import { NmOrgService } from '../nm-service/nm-org.service';

module.exports = {
    async get_data() {
        const orgs = await NmOrgService.getOrgList();

        return new SlashCommandBuilder()
            .setName('count')
            .setDescription('Add to the food count')
            .addStringOption((option) =>
                option
                    .setName('org')
                    .setDescription('Who gave us this food?')
                    .setRequired(true)
                    .addChoices(...orgs.map(({ name }) => ({ name, value: name })))
            )
            .addNumberOption((option) =>
                option
                    .setName('amount')
                    .setDescription('How many pounds of food?')
                    .setRequired(true)
            );
    },

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        // Get the params. They should be pre verfied by discord
        const org = interaction.options.getString('org');
        const amu = interaction.options.getNumber('amount');

        if (!org || !amu) {
            return;
        }

        // report back to the discord
        await interaction.reply(`${org} gave us ${amu} lbs`);

        const date = new Date();

        // update the spread sheet
        NmFoodCountDataService.appendFoodCount({
            org,
            lbs: amu,
            date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
            // todo: get this from data
            reporter: 'christianco@gmail.com',
            note: ''
        });
    }
};
