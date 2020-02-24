'use strict';

const __filename = import.meta.url;
const __dirname = new URL(import.meta.url).pathname;

import io from 'socket.io-client';

import { SoSaConfig } from "./config.js";
import Bot from "./bot.js";

let bot = new Bot(io, SoSaConfig.chat.server, SoSaConfig.chat.api_key);

let onAuthenticated = (authData) => {
    bot.joinRoom('sosa','general', (room, userList) => {
        if(room){
            console.debug(`Joined room ${room.name}`);
            bot.sendMessage(room.community_id, room.name, 'hello');
        }
    });
};

bot.connect(onAuthenticated);


