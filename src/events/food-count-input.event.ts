import {
    ActionRowBuilder,
    Message,
    ButtonBuilder,
    MessageReplyOptions,
    ButtonStyle,
    TextChannel
} from 'discord.js';
import { appendFoodCount, NmFoodCountService } from '../service/index';
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
    TIME_UNTIL_UPDATE = 60 * 1000; // one minute in milliseconds

/**
 *
 * @param message Discord message event
 * @returns void
 */
export const FoodCountInputEvent = async (message: Message) => {
    const { channel, author } = message as Message<true>;

    /* STAGE 1: skip the message entirely in some cases */

    // if we are a bot, we do not want to process the message
    if (author.bot) {
        return;
    }

    let { content } = message;
    // make sure there is some actual content
    // this is probably not needed since Discord does not send blanks but it's cheap so leaving it
    if (!(content = content.trim())) {
        return;
    }

    /* STAGE 2: figure out our input status */
    const [channelStatus, inputStatus, date, parsedInputList] =
        NmFoodCountService.getParsedChannelAndContent(channel.name, content);

    // if we are not in a night or count channel
    // we do not send a message, we simply get out
    if ('INVALID_CHANNEL' === channelStatus) {
        return;
    }

    // because when we have an invalid input, and we are in the count channel ...
    if (inputStatus === 'INVALID' && channelStatus === 'COUNT_CHANNEL') {
        // we want to tell them that they cannot put invalid content in the count channel

        return;
    }
    // because when we have only errors, and we are in the count channel ...
    if (inputStatus === 'ONLY_ERRORS' && channelStatus === 'COUNT_CHANNEL') {
        // we want to tell them that they cannot put invalid content in the count channel
        return;
    }

    // because when we have an invalid input, and we are in the night channel ...
    if (inputStatus === 'INVALID' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to nothing, because this is probably not a count
        return;
    }

    // because when we have only errors, and we are in the night channel ...
    if (inputStatus === 'ONLY_ERRORS' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to ask them nicely if they meant to do a count
        return;
    }

    // because when we have some errors, and we are in the night channel ...
    if (inputStatus === 'OK_WITH_ERRORS' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to ask them nicely if they meant to do a count
        // because we do not assume that we are doing a count in this case ?
        return;
    }

    /* OK, loop over the food count input */
    // TODO: we can do two loops, one for successful input, one for unsuccessful
    for (const { lbs, org, orgFuzzy, note } of parsedInputList) {
        if (!lbs || !orgFuzzy) {
            let content = '';
            if (!lbs && !orgFuzzy) {
                content = NmFoodCountService.getMessageErrorNoLbsOrOrg({
                    messageContent: message.content
                });
            }
            if (!lbs) {
                content = NmFoodCountService.getMessageErrorNoLbs({
                    org
                });
            }
            if (!org) {
                content = NmFoodCountService.getMessageErrorNoOrg({
                    orgFuzzy,
                    lbs
                });
            }
            const r = await message.reply({
                content
            });

            // we delete crabapple message after 10 seconds
            // the idea is that we want to flash an error message then delete it.
            setTimeout(() => {
                // ? we only delete their message if they are in food count channel??
                if ('COUNT_CHANNEL' === channelStatus) {
                    message.delete();
                }
                // always delete our own message
                r.delete();
            }, 10000);

            // in this case we are done since we cannot Cache and invalid input
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
                // TODO: we need to make sure teh count has not been cancelled

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

        if (channelStatus === 'NIGHT_CHANNEL') {
            const countChannelName =
                NmFoodCountService.getFoodCountChannelName().toLowerCase();
            // todo: do we want to post everything in food count?
            const countChannel = (await message.guild?.channels.cache.find(
                (channel) => channel.name.toLowerCase() === countChannelName
            )) as TextChannel;
            const countMessage = await countChannel?.send(
                `We got ${lbs} lbs (${note}) from ${org} on  ${date}.`
            );
            FoodCountInputCache.update(cacheId, {
                messageCountId: countMessage.id
            });
        }
    }
};
