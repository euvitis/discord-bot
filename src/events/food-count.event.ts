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
import FuzzySearch from 'fuzzy-search'; // Or: var FuzzySearch = require('fuzzy-search');

let CountData = [0, '', ''],
    // todo: expire our count event data?
    CountDataTimestamp = Date.now();

export const FoodCountEvent = async (message: any) => {
    const { channel, author, content } = message;
    if (channel.name !== 'bot-commands' || author.bot) {
        //For a single channel listener.
        return;
    }

    // get count
    const [lbsCount, filterString] = ParseLbsFromContent(content);
    console.log(lbsCount, filterString);

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

    CountData = [lbsCount, orgDisplayList[0].value, Date.now()];

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

// utils
const ParseLbsFromContent = (content: string): [number, string] => {
    const contentList = content.split(' ').filter((a: string) => a.trim());
    let lbsCount = ParseLbsFromCountString(contentList[0]);
    // in this case the number was first
    if (lbsCount) {
        // get rid of the number
        contentList.shift();
        // get rid of any lbs or pounds text
        if (
            contentList[0].toLowerCase() === 'lbs' ||
            contentList[0].toLowerCase() === 'pounds'
        ) {
            contentList.shift();
        }
        return [lbsCount, contentList.join(' ')];
    }

    // in this case the number was last
    lbsCount = ParseLbsFromCountString(contentList[contentList.length - 1]);
    if (lbsCount) {
        // get rid of the number
        contentList.shift();
        return [lbsCount, contentList.join(' ')];
    }

    // in this case the number was second to last, and it needs to be followed by a lbs or pounds
    lbsCount = ParseLbsFromCountString(contentList[contentList.length - 2]);
    if (lbsCount) {
        if (
            contentList[0].toLowerCase() === 'lbs' ||
            contentList[0].toLowerCase() === 'pounds'
        ) {
            // get rid of the pounds or lbs
            contentList.shift();
            // get rid of the number
            contentList.shift();
            return [lbsCount, contentList.join(' ')];
        }
    }
    // in this case there was no number, so we return a falsy zero and let them pick one
    return [lbsCount || 0, contentList.join(' ')];
};

// todo:test this
const ParseLbsFromCountString = (countString: string): number => {
    let countNumber = 0;
    for (let a = 0; a < countString.length; a++) {
        // if the first char is not a number, return zero
        const b = +countString[a];
        if (!a && isNaN(b)) {
            a = countString.length;
        } else {
            if (!isNaN(b)) {
                countNumber = +(countNumber + '' + b);
            }
        }
    }
    return countNumber;
};
