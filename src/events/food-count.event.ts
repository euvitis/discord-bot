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
import { PersonService } from '../service/nm-person.service';
import Debug from 'debug';

const debug = Debug('FoodCountEvent');

// this is a cache for food-count input so that we can
// give user a set period of time to cancel
// if the user cancels, this cache is deleted
// if not, it is inserted into the spreadsheet
const InputCache: {
        [k in string]: {
            messageInputId: string;
            messageResponseId: string;
            messageCountId: string;
            stamp: number;
        };
    } = {},
    // after a set period of time, the input is inserted. this is that time:
    TIME_UNTIL_UPDATE = 60 * 1000, // one minute in milliseconds
    // we only allow food count in one channel
    COUNT_CHANNEL_NAME = 'food-count',
    // OR in a "night channel", which always corresponds to a day
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
    // within the night channels, you trigger a count by starting with
    // one of the following words "triggers"
    NIGHT_CHANNEL_TRIGGERS = [
        COUNT_CHANNEL_NAME,
        'foodcount',
        'nightcount',
        'daycount',
        'countfood'
    ];

/**
 *
 * @param message Discord message event
 * @returns void
 */
export const FoodCountEvent = async (message: Message) => {
    const { channel, author } = message as Message<true>;

    // if we are a bot, we do not want to process the message
    if (author.bot) {
        return;
    }

    let { content } = message;
    // make sure there is some actual content
    if (!(content = content.trim())) {
        return;
    }

    // does this message originate in the night channel and
    // does it have the proper "trigger"?
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
        debug(COUNT_CHANNEL_NAME, 'is not', channel.name.toLowerCase());
        // exit
        return;
    }

    // by default the date is today
    let date = ParseContentService.dateFormat(new Date());

    // if we are using a night channel, then we have the date:
    if (hasNightChannelTrigger) {
        content = content.trim().split(' ').slice(1).join(' ');
        // This gets the last date for whatever day name the channel uses
        date = ParseContentService.getDateStringFromDay(
            NIGHT_CHANNEL_NAMES_MAP[channel.name.toLowerCase()]
        );
    }

    // get number of lbs and the remaining string
    const [lbs, filterString] = ParseContentService.getLbsAndString(content);

    // if we do not get a lbs and a filter string (for pick-up  name),
    // we complain
    if (!lbs || !filterString) {
        const r = await message.reply({
            content: `We got "${message.content}", which does not compute.
Please enter food count like this: 
    "${
        hasNightChannelTrigger ? 'foodcount ' : ''
    }<number of pounds> <pickup name>"
    Example: "8 Village Bakery"`
        });
        // we only delete their message if they are in food count channel
        if (!hasNightChannelTrigger) {
            await message.delete();
        }
        // we delete crabapple message after 10 seconds
        // TODO: not sure if this makes sense
        setTimeout(() => {
            r.delete();
        }, 10000);
        return;
    }

    // we need to search the orgs
    const orgList = await getOrgNameList({
        // we want ALL the orgs, not just active, because
        // this fuzzy search should provide the best options without
        // making user activate in the central spread
        active: false
    });

    // TODO: we should have a "nick names" field
    // so for example FRN is a short name for "food recovery network"
    // but currently pulls something else
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
    // todo: we should standardize these messages at teh top of this
    // script
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

    // we successfully got a pickup name
    const org = orgDisplayList[0].value;

    // todo: this is reference, because we may want to allow
    // todo: selection, ie of date entered

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

    // now we create our Input cache

    // it gets a unique id
    const cacheId = uuidv4();
    InputCache[cacheId] = {
        messageInputId: message.id,
        messageResponseId: '',
        messageCountId: '',
        stamp: Date.now() / 1000
    };
    // our success message
    const reply: MessageReplyOptions = {
        content: `OK, we have ${lbs} lbs from ${org} on ${date}.`,
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

    const messageReply = await message.reply(reply);

    // because we want to delete this message on cancel, or when the expiration passes
    // we save the reply id
    InputCache[cacheId].messageResponseId = messageReply.id;

    // get our reporter email address
    const reporter = await PersonService.getEmailByDiscordId(author.id);
    // after a set time, the cancel message disappears and the
    // input goes to database
    setTimeout(
        async () => {
            await appendFoodCount({
                org,
                date,
                // todo: get from core
                reporter,
                lbs,
                note: ''
            });
            delete InputCache[cacheId];
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
            `We got ${lbs} lbs from ${org} on  ${dateString}.`
        );
        InputCache[cacheId].messageCountId = countMessage.id;
    }
};

// Cancel event deletes a cached input
export const FoodCountCancelEvent = async (i: Interaction) => {
    const interaction = i as ButtonInteraction;
    const { customId } = interaction;
    const [idName, idCache] = customId.split('--');

    if (idName === 'food-count-cancel') {
        const m = interaction.channel?.messages;
        if (!InputCache[idCache]) {
            return;
        }
        m?.fetch(InputCache[idCache].messageInputId).then((msg: Message) =>
            msg.delete()
        );
        if (InputCache[idCache].messageResponseId) {
            m?.fetch(InputCache[idCache].messageResponseId).then(
                (msg: Message) => msg.delete()
            );
        }

        // delete any posting in the food count that came from the night channels
        if (InputCache[idCache].messageCountId) {
            const countChannel = (await interaction.guild?.channels.cache.find(
                (channel) => channel.name === COUNT_CHANNEL_NAME
            )) as TextChannel;

            countChannel.messages
                ?.fetch(InputCache[idCache].messageCountId)
                .then((msg: Message) => msg.delete());
        }

        // OK, we do not insert, we cache and delete from cache
        // the insert happens on a timeout and we delete the cancel button then

        delete InputCache[idCache];

        await interaction.deferUpdate();
    }
};
