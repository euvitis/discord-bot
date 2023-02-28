import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} from 'discord.js';
import {
    appendFoodCount,
    getOrgNameList
} from '../lib/night-market-data.service';
import FuzzySearch from 'fuzzy-search'; // Or: var FuzzySearch = require('fuzzy-search');

let CountData = [0, '', ''],
    CountDataTimestamp = Date.now();

export const FoodCountEvent = async (message: any) => {
    const { channel, author, content } = message;
    if (channel.name !== 'bot-commands' || author.bot) {
        //For a single channel listener.
        return;
    }
    const orgList = await getOrgNameList();
    console.log(orgList);
    const searcher = new FuzzySearch(orgList, [], {
        caseSensitive: false,
        sort: true
    });

    const orgDisplayList = searcher
        .search(content)
        .slice(0, 30)
        .map((a) => ({
            label: a,
            description: `This is a ${a}`,
            value: a
        }));

    console.log(orgDisplayList);

    // todo: logic for nothing found!
    if (!orgDisplayList.length) {
        CountData = [0, '', ''];
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('count-select-org')
                .setPlaceholder(
                    orgDisplayList.length
                        ? orgDisplayList[0].label
                        : 'Nothing selected'
                )
                .addOptions(...orgDisplayList)
        );
    }

    CountData = [0, orgDisplayList[0].value, Date.now()];

    const rowOrg = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('count-select-org')
            .setPlaceholder(
                orgDisplayList.length ? CountData[1] : 'No org selected'
            )
            .addOptions(...orgDisplayList)

        //     ,
        // new StringSelectMenuBuilder()
        //     .setCustomId('count-select-lbs')
        //     .setPlaceholder(
        //         orgDisplayList.length
        //             ? '' + CountData[0]
        //             : 'No total pounds selected'
        //     )
        //     .addOptions(...orgDisplayList)
    );

    // todo: get user entered data, dynamic generate a lbs list
    const lbsList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) => ({
        label: a + 'lbs',
        description: `${a} in pounds (lbs)`,
        value: '' + a
    }));
    const rowLbs = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('count-select-lbs')
            .setPlaceholder(
                orgDisplayList.length ? '' + CountData[0] : 'No lbs selected'
            )
            .addOptions(...lbsList)
    );

    // todo: get user entered date, dynamic generate a dates list
    const dateList = [
        '02/12/2023',
        '02/13/2023',
        '02/14/2023',
        '02/15/2023',
        '02/16/2023',
        '02/17/2023'
    ].map((a) => ({
        label: a,
        description: `On the date of ${a}`,
        value: a
    }));
    const rowDate = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('count-select-date')
            .setPlaceholder(
                orgDisplayList.length ? '' + CountData[2] : 'No date selected'
            )
            .addOptions(...dateList)
    );
    // .addComponents(
    //     new StringSelectMenuBuilder()
    //         .setCustomId('count-select-date')
    //         .setPlaceholder(
    //             orgDisplayList.length
    //                 ? orgDisplayList[0].label
    //                 : '' + CountData[2]
    //         )
    //         .addOptions(...orgDisplayList)
    // );

    await message.reply({
        content: 'OK, we have !',
        components: [rowLbs, rowOrg, rowDate]
    });
};

export const FoodCountConfirmEvent = async (interaction: any) => {
    console.log(interaction);
};
