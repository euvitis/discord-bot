import { Message, TextChannel, ButtonInteraction } from 'discord.js';
import {
    FoodCountInputCache,
    COUNT_CHANNEL_NAME
} from './food-count-input.event';

import Debug from 'debug';

const debug = Debug('FoodCountCancelEvent');

/**
 *
 * @param i Discord interaction event
 * @returns
 */
export const FoodCountCancelEvent = async (interaction: ButtonInteraction) => {
    const { customId } = interaction;
    const [idName, idCache] = customId.split('--');

    if (idName === 'food-count-cancel') {
        const m = interaction.channel?.messages;
        const cache = FoodCountInputCache.get(idCache);

        if (!cache) {
            debug('no cache found!');
            return;
        }

        // delete the original input message on cancel
        // todo: consider leaving it?
        m?.fetch(cache.messageInputId).then((msg: Message) => msg.delete());

        // if the bot response has not been deleted, delete it
        // (this is the cancel button)
        if (cache.messageResponseId) {
            m?.fetch(cache.messageResponseId).then((msg: Message) =>
                msg.delete()
            );
        } else {
            debug('no messageResponseId found!');
        }

        // delete any posting in the food count that came from the night channels
        if (cache.messageCountId) {
            const countChannel = (await interaction.guild?.channels.cache.find(
                (channel) => channel.name === COUNT_CHANNEL_NAME
            )) as TextChannel;

            countChannel.messages
                ?.fetch(cache.messageCountId)
                .then((msg: Message) => msg.delete());
        } else {
            debug('no messageCountId found!');
        }

        // delete the cache
        FoodCountInputCache.delete(idCache);

        // this kills the interaction so it doesn't report a failure
        await interaction.deferUpdate();
    }
};
