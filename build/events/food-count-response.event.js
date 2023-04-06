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
exports.FoodCountResponseEvent = void 0;
const food_count_input_event_1 = require("./food-count-input.event");
const service_1 = require("../service");
const debug = (0, service_1.Dbg)('FoodCountCancelEvent');
/**
 *
 * @param interaction Discord interaction event
 * @returns
 */
const FoodCountResponseEvent = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // discord event listener does not like ButtonInteraction, but
    // it makes like easier below
    interaction = interaction;
    // we set the customId of the button
    const { customId } = interaction;
    // we gave it an action name, and a cache id
    const [idName, idCache] = customId.split('--');
    // this kills the interaction so it doesn't report a failure
    yield interaction.deferUpdate();
    // here we can use that first action name to do different stuff
    // depending on what button it is
    if (idName === 'food-count-cancel') {
        const m = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.messages;
        const cache = food_count_input_event_1.FoodCountInputCache.get(idCache);
        if (!cache) {
            debug('no cache found!');
            return;
        }
        if (cache.insertTimeout) {
            debug('cleared insert timeout!');
            clearTimeout(cache.insertTimeout);
        }
        // delete the original input message on cancel
        // todo: consider leaving it?
        m === null || m === void 0 ? void 0 : m.fetch(cache.messageInputId).then((msg) => __awaiter(void 0, void 0, void 0, function* () {
            food_count_input_event_1.FoodCountInputCache.update(idCache, {
                messageInputId: ''
            });
            try {
                yield msg.delete();
            }
            catch (e) {
                console.log(e);
            }
            debug('deleted user input message!');
        }));
        // if the bot response has not been deleted, delete it
        // (this is the cancel button)
        if (cache.messageResponseId) {
            food_count_input_event_1.FoodCountInputCache.update(idCache, {
                messageResponseId: ''
            });
            m === null || m === void 0 ? void 0 : m.fetch(cache.messageResponseId).then((msg) => __awaiter(void 0, void 0, void 0, function* () {
                debug('deleted bot response message!');
                try {
                    yield msg.delete();
                }
                catch (e) {
                    console.log(e);
                }
            }));
        }
        else {
            debug('no messageResponseId found!');
        }
        // delete any posting in the food count that came from the night channels
        if (cache.messageCountId) {
            debug('found a count channel user message');
            const countChannel = (yield ((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.channels.cache.find((channel) => service_1.NmFoodCountService.isFoodCountChannelName(channel.name))));
            (_c = countChannel.messages) === null || _c === void 0 ? void 0 : _c.fetch(cache.messageCountId).then((msg) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield msg.delete();
                }
                catch (e) {
                    console.log(e);
                }
                debug('deleted the count channel user message');
            }));
        }
        else {
            debug('no messageCountId found!');
        }
        // delete the cache
        food_count_input_event_1.FoodCountInputCache.delete(idCache);
    }
});
exports.FoodCountResponseEvent = FoodCountResponseEvent;
