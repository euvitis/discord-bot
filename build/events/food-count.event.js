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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCountCancelEvent = exports.FoodCountEvent = void 0;
const discord_js_1 = require("discord.js");
const nm_org_service_1 = require("../service/nm-org.service");
const index_1 = require("../service/index");
const fuzzy_search_1 = __importDefault(require("fuzzy-search")); // Or: var FuzzySearch = require('fuzzy-search');
const uuid_1 = require("uuid");
// here we keep the initial call, and the response identifiers
// so we can delete them later if needed.
const ResponseCache = {}, 
// we reset the ResponseCache after a set expiry
RESPONSE_CACHE_EXPIRY = 60 * 60 * 24 * 7, // one week in seconds
COUNT_CHANNEL_NAME = 'bot-commands', 
// this maps the night cap channel name to the day, so we can get a date from the channel name
NIGHT_CHANNEL_NAMES_MAP = {
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
    sunday: 'sunday',
    // ?? i guess saturday will work for weekends for now
    weekends: 'saturday'
}, NIGHT_CHANNEL_TRIGGERS = [
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
const FoodCountEvent = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { channel, author } = message;
    let { content } = message;
    if (!content.trim()) {
        return;
    }
    const hasNightChannelTrigger = NIGHT_CHANNEL_NAMES_MAP[channel.name.toLowerCase()] &&
        NIGHT_CHANNEL_TRIGGERS.includes((_a = content
            .trim()
            .split(' ')[0]) === null || _a === void 0 ? void 0 : _a.replace(/[^a-z]/g, '').toLowerCase());
    // if we are not in the count channel
    //  or if we are not in the night channels and not using the trigger
    if (COUNT_CHANNEL_NAME !== channel.name.toLowerCase() &&
        !hasNightChannelTrigger) {
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
    let dateString = index_1.ParseContentService.dateFormat(new Date());
    // if we are using a night channel, then we have the date:
    if (hasNightChannelTrigger) {
        content = content.trim().split(' ').slice(1).join(' ');
        dateString = index_1.ParseContentService.getDateStringFromDay(NIGHT_CHANNEL_NAMES_MAP[channel.name.toLowerCase()]);
    }
    // get number of lbs and the remaining string
    const [lbsCount, filterString] = index_1.ParseContentService.getLbsAndString(content);
    if (!lbsCount || !filterString) {
        const r = yield message.reply({
            content: `We got "${message.content}", which does not compute.
Please enter food count like this: 
    "${hasNightChannelTrigger ? 'foodcount ' : ''}<number of pounds> <pickup name>"
    Example: "8 Village Bakery"`
            //components: [rowLbs, rowOrg, rowDate]
        });
        yield message.delete();
        setTimeout(() => {
            r.delete();
        }, 10000);
        return;
    }
    const orgList = yield (0, nm_org_service_1.getOrgNameList)({
        // we want ALL the orgs, not just active, because
        // this fuzzy search should provide the best options without
        // making user activate in the central spread
        active: false
    });
    const searcher = new fuzzy_search_1.default(orgList, [], {
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
        yield message.reply({
            content: `We cannot find a pickup called "${filterString}". 
    Please try again: "${hasNightChannelTrigger ? 'foodcount ' : ''}<number of pounds> <pickup name>"
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
    const cacheId = (0, uuid_1.v4)();
    ResponseCache[cacheId] = {
        messageInputId: message.id,
        messageResponseId: '',
        messageCountId: '',
        stamp: Date.now() / 1000
    };
    const reply = {
        content: `OK, we have ${lbsCount} lbs from ${org} on ${dateString}.`,
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                // todo: I guess we can cat the spreadsheet row to the custom id and delete it on cancel
                .setCustomId(`food-count-cancel--${cacheId}`)
                .setLabel('delete')
                .setStyle(discord_js_1.ButtonStyle.Danger))
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
    const messageReply = yield message.reply(reply);
    // because we want to delete this message on cancel, or when the expiration passes
    ResponseCache[cacheId].messageResponseId = messageReply.id;
    const theCount = {
        org,
        date: dateString,
        // todo: get from core
        reporter: 'christianco@gmail.com',
        lbs: lbsCount,
        note: ''
    };
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(theCount);
        yield (0, index_1.appendFoodCount)(theCount);
        delete ResponseCache[cacheId];
        messageReply.delete();
    }), 
    // we give them one minute to cancel
    10000);
    if (hasNightChannelTrigger) {
        // todo: do we want to post everything in food count?
        const countChannel = (yield ((_b = message.guild) === null || _b === void 0 ? void 0 : _b.channels.cache.find((channel) => channel.name === COUNT_CHANNEL_NAME)));
        const countMessage = yield (countChannel === null || countChannel === void 0 ? void 0 : countChannel.send(`We got ${lbsCount} lbs from ${org} on  ${dateString}.`));
        ResponseCache[cacheId].messageCountId = countMessage.id;
    }
});
exports.FoodCountEvent = FoodCountEvent;
const FoodCountCancelEvent = (i) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    const interaction = i;
    const { customId } = interaction;
    const [idName, idCache] = customId.split('--');
    if (idName === 'food-count-cancel') {
        const m = (_c = interaction.channel) === null || _c === void 0 ? void 0 : _c.messages;
        if (!ResponseCache[idCache]) {
            return;
        }
        m === null || m === void 0 ? void 0 : m.fetch(ResponseCache[idCache].messageInputId).then((msg) => msg.delete());
        if (ResponseCache[idCache].messageResponseId) {
            m === null || m === void 0 ? void 0 : m.fetch(ResponseCache[idCache].messageResponseId).then((msg) => msg.delete());
        }
        // delete any posting in the food count that came from the night channels
        if (ResponseCache[idCache].messageCountId) {
            const countChannel = (yield ((_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.channels.cache.find((channel) => channel.name === COUNT_CHANNEL_NAME)));
            (_e = countChannel.messages) === null || _e === void 0 ? void 0 : _e.fetch(ResponseCache[idCache].messageCountId).then((msg) => msg.delete());
        }
        // OK, we do not insert, we cache and delete from cache
        // the insert happens on a timeout and we delete the cancel button then
        delete ResponseCache[idCache];
        // deleteLastFoodCount();
        yield interaction.deferUpdate();
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
});
exports.FoodCountCancelEvent = FoodCountCancelEvent;
