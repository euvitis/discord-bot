import {
    // CacheType,
    // ChatInputCommandInteraction,
    // SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} from 'discord.js';
import {
    // appendFoodCount,
    getOrgNameList
} from '../lib/night-market-data.service';
import { ParseContentService } from '../lib';
import FuzzySearch from 'fuzzy-search'; // Or: var FuzzySearch = require('fuzzy-search');
import dateFormat from 'dateformat';
// OK, we need a refactor to make pretty.

// here we keep the initial call, and the response identifiers
// so we can delete them later if needed.
const ResponseCache: [number, number] = [0, 0],
    // we reset the ResponseCache after a set expiry
    RESPONSE_CACHE_EXPIRY = 1000 * 60, // one minute
    ResponseCacheTimeout = Date.now(),
    CHANNEL_NAME = 'bot-commands';
// ref: delete a message
//channel.fetchMessage(lastmsg).then(msg => msg.delete());
// ref: get a channel
//  let channel = message.guild.channels.find(
//     channel => channel.name.toLowerCase() === "information"
// )

let CountData: [number, string, string] = [
    // amount in lbs
    0,
    // org pickup
    '',
    // date MM/DD/YYYY
    ''
];

// TODO: we may want to allow any of the night cap "day" channels to receive count so that we automatically know the date

export const FoodCountEvent = async (message: any) => {
    const { channel, author, content } = message;

    // if we are not in the right channel exit
    if (CHANNEL_NAME !== channel.name) {
        // exit
        return;
    }

    // if we are a bot, we do not want to process the message, but
    // we might want to store the message id
    if (author.bot) {
        // todo: if we are a bot, we want to store the message and delete it later
        // if there is an existing message ...
        if (ResponseCache[0]) {
            // set the message id so we can delete it later?
            ResponseCache[1] = message.id;
            // todo: and reset the expiry?
        }
        return;
    }
    // in this case the message comes from the user
    // so we keep it, in case they "cancel", or in case it is invalid
    ResponseCache[0] = message.id;

    // get number of lbs and the remaining string
    const [lbsCount, filterLbsString] =
        ParseContentService.getLbsAndString(content);

    // get the date if it exists (defaults to today) and the remaining string
    const [dateString, filterString] =
        ParseContentService.getDateFromString(filterLbsString);

    const orgList = await getOrgNameList();

    const searcher = new FuzzySearch(orgList, [], {
        caseSensitive: false,
        sort: true
    });

    const orgDisplayList = searcher
        .search(filterString)
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

    CountData = [lbsCount, orgDisplayList[0].value, dateString];

    const rowOrg = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('count-select-org')
            .setPlaceholder(
                orgDisplayList.length ? '' + CountData[1] : 'No org selected'
            )
            .addOptions(
                ...orgList
                    .map((a) => ({
                        label: a,
                        description: `This is a ${a}`,
                        value: a
                    }))
                    .slice(0, 25)
            )
    );

    // todo: get user entered data, dynamic generate a lbs list
    const lbsList = [...Array(20 + 1).keys(), 25, 30, 35, 40, 45]
        .slice(1)
        .map((a) => ({
            label: a + 'lbs',
            description: `${a} in pounds (lbs)`,
            value: '' + a
        }));
    const rowLbs = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('count-select-lbs')
            .setPlaceholder(
                CountData[0] ? '' + CountData[0] : 'No lbs selected'
            )
            .addOptions(...lbsList)
    );

    // todo: get user entered date, dynamic generate a dates list of maybe two weeks past, relative to today
    const d = Date.now();
    const dateList = [...Array(14 + 1).keys()]
        .map((a) => {
            d - a * 24 * 1000;
            return dateFormat(
                new Date(d - a * 24 * 60 * 60 * 1000),
                'dd/mm/yyyy'
            );
        })
        .map((a) => ({
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

    await message.reply({
        content: `OK, we have ${CountData[0]} lbs from ${CountData[1]} on  ${CountData[2]}, is that correct?`,
        components: [rowLbs, rowOrg, rowDate]
    });
};

export const FoodCountConfirmEvent = async (interaction: any) => {
    if (interaction.customId === 'count-select-lbs') {
        CountData[0] = interaction.values[0];
    }

    if (interaction.customId === 'count-select-org') {
        CountData[1] = interaction.values[0];
    }

    if (interaction.customId === 'count-select-date') {
        CountData[2] = interaction.values[0];
    }
    console.log(CountData);
    // todo: send to db if interaction is a confirm, reset if it is a cancel
    if (CountData.map((a) => !!a).includes(false)) {
        await interaction.reply({
            // todo: tell them what we are missing?
            content: `OK, we are missing something ...`
        });
    } else {
        await interaction.reply({
            content: `OK, we have ${CountData[0]} lbs from ${CountData[1]} on  ${CountData[2]}, is that correct?`
        });
    }
};
