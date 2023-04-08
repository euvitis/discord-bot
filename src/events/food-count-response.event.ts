import {
    Message,
    TextChannel,
    ButtonInteraction,
    Interaction
} from 'discord.js';
import { FoodCountInputCache } from './food-count-input.event';

import { NmFoodCountInputService } from '../nm-service';
import { Dbg } from '../service';
const debug = Dbg('FoodCountCancelEvent');

/**
 *
 * @param interaction Discord interaction event
 * @returns
 */
export const FoodCountResponseEvent = async (interaction: Interaction) => {
    // discord event listener does not like ButtonInteraction, but
    // it makes like easier below
    interaction = interaction as ButtonInteraction;
    // we set the customId of the button
    const { customId } = interaction;
    // we gave it an action name, and a cache id
    const [idName, idCache] = customId.split('--');

    // this kills the interaction so it doesn't report a failure
    await interaction.deferUpdate();
    // here we can use that first action name to do different stuff
    // depending on what button it is
    if (idName === 'food-count-cancel') {
        const m = (interaction.channel as TextChannel)?.messages;
        const cache = FoodCountInputCache.get(idCache);

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
        m?.fetch(cache.messageInputId).then(async (msg: Message) => {
            FoodCountInputCache.update(idCache, {
                messageInputId: ''
            });
            try {
                await msg.delete();
            } catch (e) {
                console.log(e);
            }
            debug('deleted user input message!');
        });

        // if the bot response has not been deleted, delete it
        // (this is the cancel button)
        if (cache.messageResponseId) {
            FoodCountInputCache.update(idCache, {
                messageResponseId: ''
            });
            m?.fetch(cache.messageResponseId).then(async (msg: Message) => {
                debug('deleted bot response message!');
                try {
                    await msg.delete();
                } catch (e) {
                    console.log(e);
                }
            });
        } else {
            debug('no messageResponseId found!');
        }

        // delete any posting in the food count that came from the night channels
        if (cache.messageCountId) {
            debug('found a count channel user message');
            const countChannel = (await interaction.guild?.channels.cache.find(
                (channel) =>
                    NmFoodCountInputService.isFoodCountChannelName(channel.name)
            )) as TextChannel;

            countChannel.messages
                ?.fetch(cache.messageCountId)
                .then(async (msg: Message) => {
                    try {
                        await msg.delete();
                    } catch (e) {
                        console.log(e);
                    }

                    debug('deleted the count channel user message');
                });
        } else {
            debug('no messageCountId found!');
        }

        // delete the cache
        FoodCountInputCache.delete(idCache);
    }
};
