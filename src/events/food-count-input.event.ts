import {
    ActionRowBuilder,
    Message,
    ButtonBuilder,
    MessageReplyOptions,
    ButtonStyle,
    TextChannel
} from 'discord.js';
import { getOrgList } from '../service/nm-org.service';
import { appendFoodCount, NmParseContentService } from '../service/index';
import FuzzySearch from 'fuzzy-search'; // Or: var FuzzySearch = require('fuzzy-search');
import { DayNameType } from '../model/night-market.model';
import { v4 as uuidv4 } from 'uuid';
import { NmPersonService, CacheService } from '../service/index';
import { Dbg } from '../service';
const debug = Dbg('FoodCountInputEvent');

// this is a cache for food-count input so that we can
// give user a set period of time to cancel
// if the user cancels, this cache is deleted
// if not, it is inserted into the spreadsheet
export const FoodCountInputCache = CacheService<{
        messageInputId: string;
        messageResponseId: string;
        messageCountId: string;
        stamp: number;
    }>('food-count'),
    // after a set period of time, the input is inserted. this is that time:
    TIME_UNTIL_UPDATE = 60 * 1000, // one minute in milliseconds
    // we only allow food count in one channel
    COUNT_CHANNEL_NAME = 'food-count',
    // OR in a "night channel", which always corresponds to a day
    // this maps the night cap channel name to the day, so we can get a date from the channel name
    NIGHT_CHANNEL_NAMES_MAP: {
        [k in string]: DayNameType;
    } = {
        // property is the night-channel name, value is the name of a day
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
    // one of the following words aka "triggers"
    NIGHT_CHANNEL_TRIGGERS = [
        'thecount',
        'foodcount',
        'nightcount',
        'nightlycount',
        'daycount',
        'daylycount',
        'countfood'
    ];

// for ease of editing, we have our error messages and in arrow functions here
// todo: we should standardize these messages in central database, with maybe template engine
const contentErrorNoLbsOrOrg = ({
    messageContent,
    hasNightChannelTrigger
}: {
    messageContent: string;
    hasNightChannelTrigger: boolean;
}) => `We got "${messageContent}", which does not compute.
Please enter food count like this: 
    "${
        hasNightChannelTrigger ? 'foodcount ' : ''
    }<number of pounds> <pickup name>"
    Example: "8 Village Bakery"`;

const contentErrorNoOrg = ({
    orgFuzzy,
    hasNightChannelTrigger
}: {
    orgFuzzy: string;
    hasNightChannelTrigger: boolean;
}) => `We cannot find a pickup called "${orgFuzzy}". 
Please try again: "${
    hasNightChannelTrigger ? 'foodcount ' : ''
}<number of pounds> <pickup name>"
Example: "8 Village Bakery"`;

/**
 *
 * @param message Discord message event
 * @returns void
 */
export const FoodCountInputEvent = async (message: Message) => {
    const { channel, author } = message as Message<true>;

    // if we are a bot, we do not want to process the message
    if (author.bot) {
        return;
    }

    let { content } = message;
    // make sure there is some actual content
    // this is probably not needed since Discord does not send blanks
    // but it's cheap so leaving it
    if (!(content = content.trim())) {
        return;
    }

    // does this message originate in the night channel and
    // does it have the proper "trigger"? which means it starts with certain string

    const hasNightChannelTrigger = NIGHT_CHANNEL_TRIGGERS.includes(
        content
            .trim()
            .split(' ')[0]
            ?.replace(/[^a-z]/g, '')
            .toLowerCase()
    );

    // if we have a night channel trigger, remove it
    if (hasNightChannelTrigger) {
        content = content.trim().split(' ').slice(1).join(' ');
    }

    // if we are not in the food-count channel
    // and the night channel trigger is not being used, we exit
    if (
        COUNT_CHANNEL_NAME !== channel.name.toLowerCase() &&
        !hasNightChannelTrigger
    ) {
        debug('We are not food counting', channel.name.toLowerCase());
        return;
    }

    // by default the date is today
    let date = NmParseContentService.dateFormat(new Date());

    // if we are using a night channel, then we have the date:
    if (hasNightChannelTrigger) {
        // This gets the last date for whatever day name the channel uses
        date = NmParseContentService.getDateStringFromDay(
            NIGHT_CHANNEL_NAMES_MAP[channel.name.toLowerCase()]
        );
    }

    /* OK, loop over the food count input */

    const inputList = NmParseContentService.getFoodCountInputList(content);

    for (const { lbs, org, orgFuzzy, note } of inputList) {
        if (!lbs || !orgFuzzy) {
            // todo: put these messages into gdrive as templates
            const r = await message.reply({
                content: contentErrorNoLbsOrOrg({
                    messageContent: message.content,
                    hasNightChannelTrigger
                })
            });
            // we only delete their message if they are in food count channel
            if (!hasNightChannelTrigger) {
                await message.delete();
            }
            // we delete crabapple message after 10 seconds
            // the idea is that we want to flash an error message then delete it.
            setTimeout(() => {
                r.delete();
            }, 10000);
            return;
        }

        if (!org) {
            await message.reply({
                content: contentErrorNoOrg({
                    orgFuzzy,
                    hasNightChannelTrigger
                })
            });
            return;
        }

        // now we create our Input cache

        // it gets a unique id
        const cacheId = uuidv4();
        FoodCountInputCache.add(cacheId, {
            messageInputId: message.id,
            messageResponseId: '',
            messageCountId: '',
            stamp: Date.now() / 1000
        });
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

        FoodCountInputCache.update(cacheId, {
            messageResponseId: messageReply.id
        });
        // get our reporter email address
        const reporter =
            (await NmPersonService.getEmailByDiscordId(author.id)) || '';
        // after a set time, the cancel message disappears and the
        // input goes to database
        setTimeout(
            async () => {
                await appendFoodCount({
                    org,
                    date,
                    reporter,
                    lbs,
                    // todo: parse the note
                    note: ''
                });
                FoodCountInputCache.delete(cacheId);
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
                `We got ${lbs} lbs from ${org} on  ${date}.`
            );
            FoodCountInputCache.update(cacheId, {
                messageCountId: countMessage.id
            });
        }
    }
};
