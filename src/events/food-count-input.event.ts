import {
    ActionRowBuilder,
    Message,
    ButtonBuilder,
    MessageReplyOptions,
    ButtonStyle,
    TextChannel
} from 'discord.js';
import {
    NmFoodCountDataService,
    NmFoodCountInputService,
    NmPersonService
} from '../nm-service';
import { v4 as uuidv4 } from 'uuid';
import { CacheService, MessageService } from '../service/index';
import { Dbg } from '../service';
const debug = Dbg('FoodCountInputEvent');

// status for each cached input: does it get inserted unless cancel? or does it require a confirmation?
type CacheStatusType = 'INSERT_UNLESS_CANCEL' | 'DELETE_UNLESS_CONFIRM';

const MsgReply = MessageService.createMap({
    FOODCOUNT_INSERT: {
        lbs: '',
        note: '',
        org: '',
        date: ''
    },
    FOODCOUNT_INPUT_OK: {
        lbs: '',
        note: '',
        org: '',
        date: '',
        seconds: ''
    }
});

// this is a cache for food-count input so that we can
// give user a set period of time to cancel
// if the user cancels, this cache is deleted
// if not, it is inserted into the spreadsheet
export const FoodCountInputCache = CacheService<{
        status: CacheStatusType;
        messageInputId: string;
        messageResponseId: string;
        messageCountId: string;
        stamp: number;
        insertTimeout: null | NodeJS.Timeout;
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
    const [
        channelStatus,
        inputStatus,
        // did we get the date from the content, from the channel name, or just today by default?
        dateStatus,
        date,
        parsedInputList,
        parsedInputErrorList
    ] = await NmFoodCountInputService.getParsedChannelAndContent(
        channel.name,
        content
    );

    console.log(
        channelStatus,
        inputStatus,
        // did we get the date from the content, from the channel name, or just today by default?
        dateStatus,
        date,
        parsedInputList,
        parsedInputErrorList
    );
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

    // because when we have an invalid input, and we are in the night channel ...
    if (inputStatus === 'INVALID' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to nothing, because this is probably not a count
        return;
    }
    // because when we have only errors, and we are in the night channel ...
    if (inputStatus === 'ONLY_ERRORS' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to ask them nicely if they meant to do a count at all
        // ? perhaps we want a a separate cache for this case and let them confirm?
        return;
    }

    // because when we have some errors, and we are in the night channel ...
    if (inputStatus === 'OK_WITH_ERRORS' && channelStatus === 'NIGHT_CHANNEL') {
        // we want to ask them nicely if they meant to do a count
        // because we do not assume that we are doing a count in this case ?
        // ? perhaps we want a a separate cache for this case and let them confirm?
        // ? we might also want to check what kind of errors? because if they do not have lbs, maybe we assume they did not mean to count
        return;
    }

    // because when we have only errors, and we are in the count channel ...
    if (inputStatus === 'ONLY_ERRORS' && channelStatus === 'COUNT_CHANNEL') {
        // we want to show them their errors, ask if they meant to do it
        return;
    }

    /* OK, loop over the food count input */
    // ? we can do two loops, one for successful input, one for unsuccessful
    for (const { lbs, org, note } of parsedInputList) {
        // we need a unique id for our cache
        const cacheId = uuidv4();

        // now we create our insert event
        const insertTimeout = setTimeout(
            async () => {
                // we need to make sure teh count has not been cancelled
                // todo: test this
                if (!FoodCountInputCache.get(cacheId)) {
                    return;
                }
                // todo: try/catch
                await NmFoodCountDataService.appendFoodCount({
                    org,
                    date,
                    reporter,
                    lbs,
                    note
                });

                // we want to post to food-count, always, so folks know what's in the db
                const countChannel = (await message.guild?.channels.cache.find(
                    (channel) =>
                        NmFoodCountInputService.isFoodCountChannelName(
                            channel.name
                        )
                )) as TextChannel;

                // todo: we want to use handlebars or some template engine and keep these texts in a markdown file
                countChannel?.send(
                    MsgReply.FOODCOUNT_INSERT({
                        lbs: lbs + '',
                        note,
                        org,
                        date
                    })
                    //                     `*OK, posted to db:*
                    // ${lbs} lbs ${note ? `(${note})` : ''} from ${org} on  ${date}.`
                );
                try {
                    FoodCountInputCache.delete(cacheId);
                    await messageReply.delete();
                } catch (e) {
                    console.log(e);
                }
            },
            // we give them a certain amount of time to hit cancel
            TIME_UNTIL_UPDATE
        );

        // create our cache
        FoodCountInputCache.add(cacheId, {
            status: 'INSERT_UNLESS_CANCEL',
            messageInputId: message.id,
            messageResponseId: '',
            messageCountId: '',
            stamp: Date.now() / 1000,
            insertTimeout
        });

        // our success message
        const reply: MessageReplyOptions = {
            content: MsgReply.FOODCOUNT_INPUT_OK({
                lbs: '',
                note: '',
                org: '',
                date: '',
                seconds: '' + TIME_UNTIL_UPDATE / 1000
            }),
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        // we keep the cacheId on the custom id so we can delete it on cancel event
                        .setCustomId(`food-count-cancel--${cacheId}`)
                        .setLabel('delete')
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        };

        // we need a reference to the message
        const messageReply = await message.reply(reply);

        // because we want to delete this message on cancel, or when the expiration passes
        // we save the reply id

        FoodCountInputCache.update(cacheId, {
            messageResponseId: messageReply.id
        });

        // get our reporter email address
        const reporter =
            (await NmPersonService.getEmailByDiscordId(author.id)) || '';
    }

    // loop over errors and post to channel
    for (const { status, lbs, org, orgFuzzy } of parsedInputErrorList) {
        let content = '';
        if (status === 'NO_LBS_OR_ORG') {
            content = NmFoodCountInputService.getMessageErrorNoLbsOrOrg({
                messageContent: message.content
            });
        }
        if (status === 'NO_LBS') {
            content = NmFoodCountInputService.getMessageErrorNoLbs({
                org
            });
        }
        if (status === 'NO_ORG') {
            content = NmFoodCountInputService.getMessageErrorNoOrg({
                orgFuzzy,
                lbs
            });
        }
        const responseMessage = await message.reply({
            content
        });

        //we delete crabapple message after 1 minute
        //  todo: make this better
        setTimeout(() => {
            // ? we only delete their message if they are in food count channel??
            if ('COUNT_CHANNEL' === channelStatus) {
                message.delete();
            }
            // always delete our own message
            responseMessage.delete();
        }, TIME_UNTIL_UPDATE);
    }
};
