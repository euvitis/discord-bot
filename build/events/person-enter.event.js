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
exports.PersonEnterEvent = void 0;
const nm_person_service_1 = require("../nm-service/nm-person.service");
const message_service_1 = require("../service/message.service");
const parse_content_service_1 = require("../service/parse-content.service");
const MsgReply = message_service_1.MessageService.createMap({
    PERSON_REQUEST_EMAIL: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_AGAIN: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_FAIL: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_OK: {
        username: ''
    },
    PERSON_REQUEST_EMAIL_DECLINE: {
        username: ''
    }
});
const personEnterCache = {};
const PersonEnterEvent = (message) => __awaiter(void 0, void 0, void 0, function* () {
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
    // OK, we are all clear, find out if this is a new person
    const personList = yield nm_person_service_1.NmPersonService.getPersonList();
    if (personList.findIndex((a) => a.discordId === message.author.id) >= 0) {
        // this person is in our db
        // todo: find out if they have an email on file, or declined
        return;
    }
    // now we want to know who it is ...
    const { id, username } = message.author;
    // we check if they are in the cache
    if (!personEnterCache[id]) {
        // now we ask them for their email
        personEnterCache[id] = { discordId: id, name: username };
        // we do not want to save them to the db until we have an email address
        message.author.send(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        console.log(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        return;
    }
    const person = personEnterCache[id];
    if (!person.email) {
        console.log(MsgReply.PERSON_REQUEST_EMAIL({ username }));
        // now we find out if this is an email
        const email = parse_content_service_1.ParseContentService.getEmail(content);
        if (email) {
            person.email = email;
            // todo: now we update record and flush person list cache
            message.author.send(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
            console.log(MsgReply.PERSON_REQUEST_EMAIL_OK({ username }));
        }
        else if (content.toLowerCase() === 'decline') {
            // otherwise we let them know and send to db
            person.email = 'decline';
            message.author.send(MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username }));
            console.log(MsgReply.PERSON_REQUEST_EMAIL_DECLINE({ username }));
        }
        else {
            // try again ...
            message.author.send(MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username }));
            console.log(MsgReply.PERSON_REQUEST_EMAIL_FAIL({ username }));
        }
    }
    // now we ask for a phone
});
exports.PersonEnterEvent = PersonEnterEvent;
