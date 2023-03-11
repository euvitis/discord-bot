import {
    ActionRowBuilder,
    Message,
    ButtonBuilder,
    MessageReplyOptions,
    ButtonStyle,
    ButtonInteraction,
    Interaction,
    TextChannel
} from 'discord.js';
import { getOrgNameList } from '../service/nm-org.service';
import { appendFoodCount, ParseContentService } from '../service/index';
import FuzzySearch from 'fuzzy-search'; // Or: var FuzzySearch = require('fuzzy-search');
import { DayNameType } from '../model/night-market.model';
import { v4 as uuidv4 } from 'uuid';

// here we keep the initial call, and the response identifiers
// so we can delete them later if needed.
const ResponseCache: {
        [k in string]: {
            messageInputId: string;
            messageResponseId: string;
            messageCountId: string;
            stamp: number;
        };
    } = {},
    // we reset the ResponseCache after a set expiry
    TIME_UNTIL_UPDATE = 60 * 1000, // one minute in milliseconds
    COUNT_CHANNEL_NAME = 'food-count',
    // this maps the night cap channel name to the day, so we can get a date from the channel name
    NIGHT_CHANNEL_NAMES_MAP: {
        [k in string]: DayNameType;
    } = {
        monday: 'monday',
        tuesday: 'tuesday',
        wednesday: 'wednesday',
        thursday: 'thursday',
        friday: 'friday',
        saturday: 'saturday',
        sunday: 'sunday',
        // ?? i guess saturday will work for weekends for now
        weekends: 'saturday'
    },
    NIGHT_CHANNEL_TRIGGERS = [
        'foodcount',
        'nightcount',
        'daycount',
        'countfood'
    ];

// ref: delete a message
//channel.fetchMessage(lastmsg).then(msg => msg.delete());
// ref: get a channel
//  let channel = message.guild.channels.find(
//     channel => channel.name.toLowerCase() === "information"
// )

// TODO: we may want to allow any of the night cap "day" channels to receive count so that we automatically know the date

export const FoodCountEvent = async (message: Message) => {
    const { channel, author } = message as Message<true>;
    let { content } = message;

    if (!content.trim()) {
        return;
    }
    const hasNightChannelTrigger =
        NIGHT_CHANNEL_NAMES_MAP[channel.name.toLowerCase()] &&
        NIGHT_CHANNEL_TRIGGERS.includes(
            content
                .trim()
                .split(' ')[0]
                ?.replace(/[^a-z]/g, '')
                .toLowerCase()
        );

    // if we are not in the count channel
    //  or if we are not in the night channels and not using the trigger
    if (
        COUNT_CHANNEL_NAME !== channel.name.toLowerCase() &&
        !hasNightChannelTrigger
    ) {
        console.log(COUNT_CHANNEL_NAME, 'is not', channel.name.toLowerCase());
        // exit
        return;
    }

    // if we are a bot, we do not want to process the message, but
    // we might want to store the message id
    if (author.bot) {
        return;
    }

    // by default the date is today
    let dateString = ParseContentService.dateFormat(new Date());
    // if we are using a night channel, then we have the date:

    if (hasNightChannelTrigger) {
        content = content.trim().split(' ').slice(1).join(' ');
        dateString = ParseContentService.getDateStringFromDay(
            NIGHT_CHANNEL_NAMES_MAP[channel.name.toLowerCase()]
        );
    }

    // get number of lbs and the remaining string
    const [lbsCount, filterString] =
        ParseContentService.getLbsAndString(content);

    if (!lbsCount || !filterString) {
        const r = await message.reply({
            content: `We got "${message.content}", which does not compute.
Please enter food count like this: 
    "${
        hasNightChannelTrigger ? 'foodcount ' : ''
    }<number of pounds> <pickup name>"
    Example: "8 Village Bakery"`
            //components: [rowLbs, rowOrg, rowDate]
        });
        await message.delete();
        setTimeout(() => {
            r.delete();
        }, 10000);
        return;
    }

    const orgList = await getOrgNameList({
        // we want ALL the orgs, not just active, because
        // this fuzzy search should provide the best options without
        // making user activate in the central spread
        active: false
    });

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

    console.log(filterString, orgDisplayList);
    // todo: logic for nothing found!
    if (!orgDisplayList.length) {
        await message.reply({
            content: `We cannot find a pickup called "${filterString}". 
    Please try again: "${
        hasNightChannelTrigger ? 'foodcount ' : ''
    }<number of pounds> <pickup name>"
    Example: "8 Village Bakery"`
        });
        return;
    }

    const org = orgDisplayList[0].value;

    // const rowOrg = new ActionRowBuilder().addComponents(
    //     new StringSelectMenuBuilder()
    //         .setCustomId('count-select-org')
    //         .setPlaceholder(
    //             orgDisplayList.length ? '' + CountData[1] : 'No org selected'
    //         )
    //         .addOptions(
    //             ...orgList
    //                 .map((a) => ({
    //                     label: a,
    //                     description: `This is a ${a}`,
    //                     value: a
    //                 }))
    //                 .slice(0, 25)
    //         )
    // );

    // // todo: get user entered data, dynamic generate a lbs list
    // const lbsList = [...Array(20 + 1).keys(), 25, 30, 35, 40, 45]
    //     .slice(1)
    //     .map((a) => ({
    //         label: a + 'lbs',
    //         description: `${a} in pounds (lbs)`,
    //         value: '' + a
    //     }));
    // const rowLbs = new ActionRowBuilder().addComponents(
    //     new StringSelectMenuBuilder()
    //         .setCustomId('count-select-lbs')
    //         .setPlaceholder(
    //             lbsCount ? '' + lbsCount : 'No lbs selected'
    //         )
    //         .addOptions(...lbsList)
    // );

    // // todo: get user entered date, dynamic generate a dates list of maybe two weeks past, relative to today
    // const d = Date.now();
    // const dateList = [...Array(14 + 1).keys()]
    //     .map((a) => {
    //         d - a * 24 * 1000;
    //         return ParseContentService.dateFormat(
    //             new Date(d - a * 24 * 60 * 60 * 1000)
    //         );
    //     })
    //     .map((a) => ({
    //         label: a,
    //         description: `On the date of ${a}`,
    //         value: a
    //     }));
    // const rowDate = new ActionRowBuilder().addComponents(
    //     new StringSelectMenuBuilder()
    //         .setCustomId('count-select-date')
    //         .setPlaceholder(
    //             orgDisplayList.length ? '' + CountData[2] : 'No date selected'
    //         )
    //         .addOptions(...dateList)
    // );

    const cacheId = uuidv4();
    ResponseCache[cacheId] = {
        messageInputId: message.id,
        messageResponseId: '',
        messageCountId: '',
        stamp: Date.now() / 1000
    };
    const reply: MessageReplyOptions = {
        content: `OK, we have ${lbsCount} lbs from ${org} on ${dateString}.`,
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    // todo: I guess we can cat the spreadsheet row to the custom id and delete it on cancel
                    .setCustomId(`food-count-cancel--${cacheId}`)
                    .setLabel('delete')
                    .setStyle(ButtonStyle.Danger)
            )
        ]
    };

    // if (!hasNightChannelTrigger) {
    //     const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    //         new ButtonBuilder()
    //             // todo: I guess we can cat the spreadsheet row to the custom id and delete it on cancel
    //             .setCustomId(`food-count-cancel--${cacheId}`)
    //             .setLabel('delete')
    //             .setStyle(ButtonStyle.Danger)
    //     );

    //     reply.components?.push(row);
    // }

    const messageReply = await message.reply(reply);

    // because we want to delete this message on cancel, or when the expiration passes
    ResponseCache[cacheId].messageResponseId = messageReply.id;
    setTimeout(
        async () => {
            await appendFoodCount({
                org,
                date: dateString,
                // todo: get from core
                reporter: 'christianco@gmail.com',
                lbs: lbsCount,
                note: ''
            });
            delete ResponseCache[cacheId];
            messageReply.delete();
        },
        // we give them a certain amount of time to hit cancel
        TIME_UNTIL_UPDATE
    );

    if (hasNightChannelTrigger) {
        // todo: do we want to post everything in food count?
        const countChannel = (await message.guild?.channels.cache.find(
            (channel) => channel.name === COUNT_CHANNEL_NAME
        )) as TextChannel;
        const countMessage = await countChannel?.send(
            `We got ${lbsCount} lbs from ${org} on  ${dateString}.`
        );
        ResponseCache[cacheId].messageCountId = countMessage.id;
    }
};

export const FoodCountCancelEvent = async (i: Interaction) => {
    const interaction = i as ButtonInteraction;
    const { customId } = interaction;
    const [idName, idCache] = customId.split('--');

    if (idName === 'food-count-cancel') {
        const m = interaction.channel?.messages;
        if (!ResponseCache[idCache]) {
            return;
        }
        m?.fetch(ResponseCache[idCache].messageInputId).then((msg: Message) =>
            msg.delete()
        );
        if (ResponseCache[idCache].messageResponseId) {
            m?.fetch(ResponseCache[idCache].messageResponseId).then(
                (msg: Message) => msg.delete()
            );
        }

        // delete any posting in the food count that came from the night channels
        if (ResponseCache[idCache].messageCountId) {
            const countChannel = (await interaction.guild?.channels.cache.find(
                (channel) => channel.name === COUNT_CHANNEL_NAME
            )) as TextChannel;

            countChannel.messages
                ?.fetch(ResponseCache[idCache].messageCountId)
                .then((msg: Message) => msg.delete());
        }

        // OK, we do not insert, we cache and delete from cache
        // the insert happens on a timeout and we delete the cancel button then

        delete ResponseCache[idCache];
        // deleteLastFoodCount();

        await interaction.deferUpdate();
    }

    // if (interaction.customId === 'count-select-org') {
    //     CountData[1] = interaction.values[0];
    // }

    // if (interaction.customId === 'count-select-date') {
    //     CountData[2] = interaction.values[0];
    // }
    // console.log(CountData);
    // // todo: send to db if interaction is a confirm, reset if it is a cancel
    // if (CountData.map((a) => !!a).includes(false)) {
    //     await interaction.reply({
    //         // todo: tell them what we are missing?
    //         content: `OK, we are missing something ...`
    //     });
    // } else {
    //     await interaction.reply({
    //         content: `OK, we have ${lbsCount} lbs from ${CountData[1]} on  ${CountData[2]}, is that correct?`
    //     });
    // }
};
