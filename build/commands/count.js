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
const discord_js_1 = require("discord.js");
const nm_food_count_data_service_1 = require("../nm-service/nm-food-count-data.service");
const nm_org_service_1 = require("../nm-service/nm-org.service");
module.exports = {
    get_data() {
        return __awaiter(this, void 0, void 0, function* () {
            const orgs = yield nm_org_service_1.NmOrgService.getOrgList();
            return new discord_js_1.SlashCommandBuilder()
                .setName('count')
                .setDescription('Add to the food count')
                .addStringOption((option) => option
                .setName('org')
                .setDescription('Who gave us this food?')
                .setRequired(true)
                .addChoices(...orgs.map(({ name }) => ({ name, value: name }))))
                .addNumberOption((option) => option
                .setName('amount')
                .setDescription('How many pounds of food?')
                .setRequired(true));
        });
    },
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the params. They should be pre verfied by discord
            const org = interaction.options.getString('org');
            const amu = interaction.options.getNumber('amount');
            if (!org || !amu) {
                return;
            }
            // report back to the discord
            yield interaction.reply(`${org} gave us ${amu} lbs`);
            const date = new Date();
            // update the spread sheet
            nm_food_count_data_service_1.NmFoodCountDataService.appendFoodCount({
                org,
                lbs: amu,
                date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
                // todo: get this from data
                reporter: 'christianco@gmail.com',
                note: ''
            });
        });
    }
};
