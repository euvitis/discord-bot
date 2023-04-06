"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountInputEvent = exports.TIME_UNTIL_UPDATE = exports.FoodCountInputCache = void 0;
const discord_js_1 = require("discord.js");
const index_1 = require("../service/index");
const uuid_1 = require("uuid");
const index_2 = require("../service/index");
const service_1 = require("../service");
const debug = (0, service_1.Dbg)('FoodCountInputEvent');
// this is a cache for food-count input so that we can
// give user a set period of time to cancel
// if the user cancels, this cache is deleted
// if not, it is inserted into the spreadsheet
exports.FoodCountInputCache = (0, index_2.CacheService)('food-count'), 
// after a set period of time, the input is inserted. this is that time:
exports.TIME_UNTIL_UPDATE = 60 * 1000; // one minute in milliseconds
/**
 *
 * @param message Discord message event
 * @returns void
 */
const FoodCountInputEvent = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel, author } = message;
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
    const [channelStatus, inputStatus, 
    // did we get the date from the content, from the channel name, or just today by default?
    dateStatus, date, parsedInputList, parsedInputErrorList] = yield index_1.NmFoodCountService.getParsedChannelAndContent(channel.name, content);
    console.log(channelStatus, inputStatus, 
    // did we get the date from the content, from the channel name, or just today by default?
    dateStatus, date, parsedInputList, parsedInputErrorList);
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
        const cacheId = (0, uuid_1.v4)();
        // now we create our insert event
        const insertTimeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // we need to make sure teh count has not been cancelled
            // todo: test this
            if (!exports.FoodCountInputCache.get(cacheId)) {
                return;
            }
            // todo: try/catch
            yield (0, index_1.appendFoodCount)({
                org,
                date,
                reporter,
                lbs,
                note
            });
            // we want to post to food-count, always, so folks know what's in the db
            const countChannel = (yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.find((channel) => index_1.NmFoodCountService.isFoodCountChannelName(channel.name))));
            // todo: we want to use handlebars or some template engine and keep these texts in a markdown file
            countChannel === null || countChannel === void 0 ? void 0 : countChannel.send(`*OK, posted to db:*
${lbs} lbs ${note ? `(${note})` : ''} from ${org} on  ${date}.`);
            try {
                exports.FoodCountInputCache.delete(cacheId);
                yield messageReply.delete();
            }
            catch (e) {
                console.log(e);
            }
        }), 
        // we give them a certain amount of time to hit cancel
        exports.TIME_UNTIL_UPDATE);
        // create our cache
        exports.FoodCountInputCache.add(cacheId, {
            status: 'INSERT_UNLESS_CANCEL',
            messageInputId: message.id,
            messageResponseId: '',
            messageCountId: '',
            stamp: Date.now() / 1000,
            insertTimeout
        });
        // our success message
        const reply = {
            content: `OK, we got:
${lbs} lbs  ${note ? `(${note})` : ''} from ${org} on ${date}.
You have ${exports.TIME_UNTIL_UPDATE / 1000} seconds to cancel this food count entry.
This message will self-destruct in ${exports.TIME_UNTIL_UPDATE / 1000} seconds.`,
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    // we keep the cacheId on the custom id so we can delete it on cancel event
                    .setCustomId(`food-count-cancel--${cacheId}`)
                    .setLabel('delete')
                    .setStyle(discord_js_1.ButtonStyle.Danger))
            ]
        };
        // we need a reference to the message
        const messageReply = yield message.reply(reply);
        // because we want to delete this message on cancel, or when the expiration passes
        // we save the reply id
        exports.FoodCountInputCache.update(cacheId, {
            messageResponseId: messageReply.id
        });
        // get our reporter email address
        const reporter = (yield index_2.NmPersonService.getEmailByDiscordId(author.id)) || '';
    }
    // loop over errors and post to channel
    for (const { status, lbs, org, orgFuzzy } of parsedInputErrorList) {
        let content = '';
        if (status === 'NO_LBS_OR_ORG') {
            content = index_1.NmFoodCountService.getMessageErrorNoLbsOrOrg({
                messageContent: message.content
            });
        }
        if (status === 'NO_LBS') {
            content = index_1.NmFoodCountService.getMessageErrorNoLbs({
                org
            });
        }
        if (status === 'NO_ORG') {
            content = index_1.NmFoodCountService.getMessageErrorNoOrg({
                orgFuzzy,
                lbs
            });
        }
        const responseMessage = yield message.reply({
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
        }, exports.TIME_UNTIL_UPDATE);
    }
});
exports.FoodCountInputEvent = FoodCountInputEvent;
